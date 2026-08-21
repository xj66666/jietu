// Integrity sweep for node_modules after an interrupted / flaky install.
//
// The npmmirror mirror truncated several tarballs during setup (a 106 MB SWC binary
// arrived as 84 KB, lightningcss's 9.5 MB .node as 313 KB, and a couple of JS files
// were cut mid-statement). This walks every package's entry points, parses the CJS/ESM
// files, and reports anything that fails to compile — far cheaper than rediscovering
// each one through a build failure.
//
// Usage: node scripts/clone-tools/verify-node-modules.mjs [--fix]
import { readdir, readFile, stat, writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const ROOT = 'node_modules';
const FIX = process.argv.includes('--fix');
const REGISTRY = process.env.NPM_REGISTRY ?? 'https://registry.npmmirror.com';

/** Every package directory, including scoped ones. */
async function listPackages() {
  const out = [];
  for (const entry of await readdir(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    if (entry.name.startsWith('@')) {
      for (const sub of await readdir(join(ROOT, entry.name), { withFileTypes: true })) {
        if (sub.isDirectory()) out.push(`${entry.name}/${sub.name}`);
      }
    } else {
      out.push(entry.name);
    }
  }
  return out;
}

/**
 * Candidate entry files declared by a package manifest.
 * `required` entries come from an explicit main/module/browser field — if one of those
 * is missing the package is damaged. Entries derived from `exports` maps or the implicit
 * `index.js` fallback may legitimately be absent (conditional/optional subpaths).
 */
function entryFiles(pkgDir, manifest) {
  const required = new Set();
  const optional = new Set();
  const add = (set, p) => {
    if (typeof p === 'string' && /\.(c|m)?js$/.test(p)) set.add(join(pkgDir, p));
  };
  // When a package ships an `exports` map, Node resolves "." through it and ignores
  // `main` entirely — several packages (e.g. @humanfs/core) publish a `main` that points
  // at a file they never ship. Only treat main/module as load-bearing without `exports`.
  if (!manifest.exports) {
    add(required, manifest.main);
    add(required, manifest.module);
    if (typeof manifest.browser === 'string') add(required, manifest.browser);
  } else {
    add(optional, manifest.main);
    add(optional, manifest.module);
  }
  const walkExports = (node) => {
    if (typeof node === 'string') return add(optional, node);
    if (node && typeof node === 'object') for (const v of Object.values(node)) walkExports(v);
  };
  walkExports(manifest.exports);
  if (!required.size && !optional.size) optional.add(join(pkgDir, 'index.js'));
  return { required: [...required], optional: [...optional] };
}

const broken = [];
const packages = await listPackages();

/**
 * Only two signals actually mean "the download was cut off":
 *   - the parser runs out of input mid-statement
 *   - the file is zero bytes when it should have content
 * An `Unexpected token 'export'` just means the file is ESM and we tried CJS, which
 * says nothing about integrity — the earlier version of this script drowned in those.
 */
const TRUNCATION_ERRORS = [/Unexpected end of input/, /Unexpected end of JSON input/];

/** Packages that legitimately ship an empty entry file (verified against the registry tarball). */
const EMPTY_BY_DESIGN = new Set(['client-only', 'server-only', 'hono']);

for (const name of packages) {
  const pkgDir = join(ROOT, name);
  let manifest;
  try {
    manifest = JSON.parse(await readFile(join(pkgDir, 'package.json'), 'utf8'));
  } catch (e) {
    // Stale staging directories left behind by an interrupted npm run start with a dot.
    const stale = name.split('/').pop()?.startsWith('.');
    broken.push({
      name,
      reason: stale ? 'stale install staging directory (safe to delete)' : `unreadable package.json: ${e.message}`,
      stale,
    });
    continue;
  }

  const { required, optional } = entryFiles(pkgDir, manifest);
  let damaged = false;

  for (const [file, isRequired] of [
    ...required.map((f) => [f, true]),
    ...optional.map((f) => [f, false]),
  ]) {
    let src;
    try {
      src = await readFile(file, 'utf8');
    } catch {
      if (isRequired) {
        broken.push({ name, reason: `declared entry missing: ${file}`, version: manifest.version });
        damaged = true;
        break;
      }
      continue; // conditional/optional subpath that was never published
    }
    if (src.length === 0) {
      if (EMPTY_BY_DESIGN.has(name)) continue;
      broken.push({ name, reason: `empty file: ${file}`, version: manifest.version });
      damaged = true;
      break;
    }
    let err = null;
    try {
      new vm.Script(src, { filename: file });
    } catch (e) {
      err = e;
    }
    if (err && !TRUNCATION_ERRORS.some((re) => re.test(err.message))) continue; // ESM or other syntax dialect
    if (err) {
      broken.push({ name, reason: `truncated: ${file} — ${err.message.split('\n')[0]}`, version: manifest.version });
      damaged = true;
      break;
    }
  }
  if (damaged) continue;

  // A half-written package can end up as nothing but a package.json — the manifest's
  // own `files` list is the cheapest way to notice.
  if (Array.isArray(manifest.files) && manifest.files.length) {
    const concrete = manifest.files.filter((f) => !/[*?{}[\]]/.test(f));
    const absent = [];
    for (const f of concrete) {
      try {
        await stat(join(pkgDir, f));
      } catch {
        absent.push(f);
      }
    }
    if (absent.length === concrete.length && concrete.length > 0) {
      broken.push({
        name,
        reason: `package.json present but none of its declared files exist (${absent.join(', ')})`,
        version: manifest.version,
      });
    }
  }
}

// Native addons are the other failure mode: a .node file far smaller than the
// registry's unpackedSize means a truncated download.
const nativeSuspects = [];
for (const name of packages) {
  const pkgDir = join(ROOT, name);
  let files;
  try {
    files = await readdir(pkgDir);
  } catch {
    continue;
  }
  for (const f of files.filter((f) => f.endsWith('.node'))) {
    const s = await stat(join(pkgDir, f));
    if (s.size < 1_000_000) nativeSuspects.push({ name, file: f, bytes: s.size });
  }
}

console.log(`scanned ${packages.length} packages`);
console.log(`\nbroken JS entries: ${broken.length}`);
for (const b of broken) console.log(`  ${b.name}@${b.version ?? '?'} — ${b.reason}`);
console.log(`\nsuspiciously small native addons (<1 MB): ${nativeSuspects.length}`);
for (const n of nativeSuspects) console.log(`  ${n.name}/${n.file} — ${n.bytes} bytes`);

if (!FIX) {
  if (broken.length) console.log('\nre-run with --fix to reinstall the broken packages');
  process.exitCode = broken.length ? 1 : 0;
} else {
  for (const b of broken) {
    // Staging directories have no registry entry — npm left them behind, so just remove them.
    if (b.stale) {
      console.log(`\nremoving stale staging dir ${b.name} ...`);
      await rm(join(ROOT, b.name), { recursive: true, force: true });
      console.log('  removed');
      continue;
    }
    const spec = `${b.name}@${b.version}`;
    console.log(`\nreinstalling ${spec} ...`);
    const tmp = '.tmp-repair';
    await rm(tmp, { recursive: true, force: true });
    await mkdir(tmp, { recursive: true });
    try {
      const meta = await (await fetch(`${REGISTRY}/${b.name}/${b.version}`)).json();
      const res = await fetch(meta.dist.tarball);
      const buf = Buffer.from(await res.arrayBuffer());
      const tgz = join(tmp, 'pkg.tgz');
      await writeFile(tgz, buf);
      // MinGW tar/cp treat backslashes as escapes, so hand them POSIX paths.
      const posix = (p) => p.split('\\').join('/');
      execFileSync('tar', ['-xzf', posix(tgz), '-C', posix(tmp)], { stdio: 'inherit' });
      execFileSync('cp', ['-rf', posix(join(tmp, 'package')) + '/.', posix(join(ROOT, b.name)) + '/'], {
        stdio: 'inherit',
      });
      console.log(`  ok (${buf.length} bytes downloaded, ${spec})`);
    } catch (e) {
      console.log(`  FAILED: ${e.message}`);
      process.exitCode = 1;
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  }
}
