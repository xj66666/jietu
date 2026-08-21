// Shared helpers for the per-page asset download scripts.
import { mkdir, writeFile, readFile, stat } from 'node:fs/promises';
import { dirname } from 'node:path';
import { createHash } from 'node:crypto';

/** Download `url` to `dest`, skipping work when the file already matches in size. */
export async function download(url, dest, { force = false } = {}) {
  await mkdir(dirname(dest), { recursive: true });
  if (!force) {
    try {
      const s = await stat(dest);
      if (s.size > 0) return { dest, url, bytes: s.size, skipped: true };
    } catch {
      /* not cached yet */
    }
  }
  const res = await fetch(url, {
    headers: {
      // The alicdn hosts 403 requests without a browser-ish UA / referer.
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      referer: 'https://order.hereserver.com/',
      accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length === 0) throw new Error(`empty body for ${url}`);
  await writeFile(dest, buf);
  return { dest, url, bytes: buf.length, skipped: false };
}

/** Run `jobs` with a small concurrency window so we stay polite to the origin. */
export async function batched(jobs, size = 4) {
  const results = [];
  for (let i = 0; i < jobs.length; i += size) {
    const slice = jobs.slice(i, i + size);
    const settled = await Promise.allSettled(slice.map((j) => j()));
    for (const s of settled) {
      if (s.status === 'fulfilled') results.push(s.value);
      else results.push({ error: s.reason?.message ?? String(s.reason) });
    }
  }
  return results;
}

const URI_RE = /data:image\/([a-z+]+);base64,([A-Za-z0-9+/=]+)/g;

/**
 * Index every base64 image found in `sourceFiles` by the first 12 hex chars of its
 * sha256, so callers can pull a specific icon out by hash without pasting megabytes
 * of base64 into the repo.
 */
export async function indexDataUris(sourceFiles) {
  const map = new Map();
  for (const f of sourceFiles) {
    const text = await readFile(f, 'utf8');
    URI_RE.lastIndex = 0;
    let m;
    while ((m = URI_RE.exec(text))) {
      const buf = Buffer.from(m[2], 'base64');
      const hash = createHash('sha256').update(buf).digest('hex').slice(0, 12);
      if (!map.has(hash)) map.set(hash, { buf, mime: m[1] });
    }
  }
  return map;
}

/** Write one indexed data URI out as a real file. */
export async function writeDataUri(index, hash, dest) {
  const rec = index.get(hash);
  if (!rec) throw new Error(`data URI ${hash} not found in the indexed sources`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, rec.buf);
  return { dest, bytes: rec.buf.length, hash };
}

export function report(label, results) {
  const ok = results.filter((r) => !r.error);
  const bad = results.filter((r) => r.error);
  const skipped = ok.filter((r) => r.skipped).length;
  console.log(`\n${label}: ${ok.length} ok (${skipped} cached), ${bad.length} failed`);
  for (const r of ok) console.log(`  ${r.skipped ? 'cached ' : 'saved  '} ${String(r.bytes).padStart(7)}B  ${r.dest}`);
  for (const r of bad) console.log(`  FAILED  ${r.error}`);
  if (bad.length) process.exitCode = 1;
}
