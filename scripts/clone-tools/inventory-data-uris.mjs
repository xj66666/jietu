// Inventory every base64 data URI used by the two targets (inline <img>, CSS backgrounds),
// dedupe by content hash, and report where each one is used so assets can be named by function.
// Usage: node scripts/clone-tools/inventory-data-uris.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { TARGETS, artifactRoot, SITE_KEY } from './config.mjs';

const RE = /data:image\/([a-z+]+);base64,([A-Za-z0-9+/=]+)/g;

/** Minimal PNG/GIF/JPEG header parse — enough to report intrinsic size. */
function dimensions(buf) {
  if (buf.length > 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), fmt: 'png' };
  }
  if (buf.slice(0, 3).toString('latin1') === 'GIF') {
    return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8), fmt: 'gif' };
  }
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) { i++; continue; }
      const m = buf[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7), fmt: 'jpeg' };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  }
  return { w: null, h: null, fmt: 'unknown' };
}

const byHash = new Map();

function collect(text, source) {
  RE.lastIndex = 0;
  let m;
  while ((m = RE.exec(text))) {
    const [, mime, b64] = m;
    const buf = Buffer.from(b64, 'base64');
    const hash = createHash('sha256').update(buf).digest('hex').slice(0, 12);
    let rec = byHash.get(hash);
    if (!rec) {
      rec = { hash, mime, bytes: buf.length, ...dimensions(buf), sources: [], contexts: [] };
      byHash.set(hash, rec);
    }
    if (!rec.sources.includes(source)) rec.sources.push(source);
    // 220 chars of surrounding markup identifies what the icon is for.
    const start = Math.max(0, m.index - 260);
    const before = text.slice(start, m.index);
    const alt = /alt="([^"]*)"[^>]*$/.exec(before)?.[1];
    const cls = /class="([^"]*)"[^>]*$/.exec(before)?.[1];
    const sel = /([.#][A-Za-z0-9_.\-]+[^{]*)\{[^}]*$/.exec(before)?.[1]?.trim();
    const after = text.slice(m.index + m[0].length, m.index + m[0].length + 120);
    const altAfter = /alt="([^"]*)"/.exec(after)?.[1];
    const ctx = [sel && `css:${sel}`, cls && `class:${cls}`, (alt || altAfter) && `alt:${alt || altAfter}`].filter(Boolean).join(' | ');
    if (ctx && !rec.contexts.includes(ctx)) rec.contexts.push(ctx);
  }
}

collect(await readFile('.tmp-src/common/f.css', 'utf8'), 'f.css');
for (const t of TARGETS) {
  const root = artifactRoot(t.pageKey);
  collect(await readFile(`${root}/rendered-screen.html`, 'utf8'), `${t.id}:screen`);
  collect(await readFile(`${root}/rendered-editor.html`, 'utf8'), `${t.id}:editor`);
  collect(await readFile(`${root}/rendered-nav.html`, 'utf8'), `${t.id}:nav`);
  const sb = JSON.parse(await readFile(`${root}/states/status-bar-html.json`, 'utf8'));
  collect(JSON.stringify(sb), `${t.id}:statusbar`);
}

const list = [...byHash.values()].sort((a, b) => b.bytes - a.bytes);
await mkdir(`docs/research/${SITE_KEY}`, { recursive: true });
await writeFile(`docs/research/${SITE_KEY}/data-uri-inventory.json`, JSON.stringify(list, null, 2));

console.log(`unique data URIs: ${list.length}\n`);
for (const r of list) {
  console.log(
    `${r.hash}  ${String(r.bytes).padStart(6)}B  ${String(r.w ?? '?').padStart(4)}x${String(r.h ?? '?').padEnd(4)} ${r.fmt.padEnd(5)} [${r.sources.join(',')}]`,
  );
  for (const c of r.contexts) console.log(`            ${c}`);
}
