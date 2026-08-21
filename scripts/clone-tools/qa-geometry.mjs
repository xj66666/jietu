// Phase 5 geometry QA: compare the bounding box of every element inside #screen
// between the original and the clone. Pixel counts tell you *that* something moved;
// this tells you *what* moved and by how much.
// Usage: node scripts/clone-tools/qa-geometry.mjs [pdd|taobao]
import { chromium } from 'playwright';
import { writeFile } from 'node:fs/promises';
import { TARGETS, LAUNCH, GOTO } from './config.mjs';

const LOCAL_ORIGIN = process.env.QA_ORIGIN ?? 'http://localhost:3111';
const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.id === only) : TARGETS;

/**
 * Flatten #screen into a list of {path, box, text}. `path` is a structural signature
 * (tag + child index chain) so the two trees line up even though class strings and
 * randomised text differ.
 */
const FLATTEN = () => {
  const root = document.querySelector('#screen');
  if (!root) return { error: 'no #screen' };
  const origin = root.getBoundingClientRect();
  const out = [];
  const walk = (el, path) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    out.push({
      path,
      tag: el.tagName.toLowerCase(),
      cls: (el.className || '').toString().slice(0, 90),
      x: +(r.x - origin.x).toFixed(1),
      y: +(r.y - origin.y).toFixed(1),
      w: +r.width.toFixed(1),
      h: +r.height.toFixed(1),
      fontSize: cs.fontSize,
      fontWeight: cs.fontWeight,
      lineHeight: cs.lineHeight,
      text:
        el.childNodes.length && [...el.childNodes].every((n) => n.nodeType === 3)
          ? el.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)
          : null,
    });
    [...el.children].forEach((c, i) => walk(c, `${path}/${c.tagName.toLowerCase()}[${i}]`));
  };
  walk(root, '#screen');
  return out;
};

const browser = await chromium.launch(LAUNCH);
const findings = [];

for (const t of targets) {
  console.log(`\n=== geometry QA ${t.id} ===`);
  const sides = {};
  for (const [side, url] of [
    ['original', t.url],
    ['clone', LOCAL_ORIGIN + t.route],
  ]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(url, GOTO);
    await page.waitForTimeout(2600);
    sides[side] = await page.evaluate(FLATTEN);
    await ctx.close();
  }

  const a = sides.original;
  const b = sides.clone;
  if (a.error || b.error) {
    console.log(`  ERROR ${a.error ?? ''} ${b.error ?? ''}`);
    continue;
  }

  const byPath = new Map(b.map((n) => [n.path, n]));
  const diffs = [];
  const missing = [];

  for (const n of a) {
    const m = byPath.get(n.path);
    if (!m) {
      missing.push(n);
      continue;
    }
    const dx = +(m.x - n.x).toFixed(1);
    const dy = +(m.y - n.y).toFixed(1);
    const dw = +(m.w - n.w).toFixed(1);
    const dh = +(m.h - n.h).toFixed(1);
    const styleDiff = [];
    if (m.fontSize !== n.fontSize) styleDiff.push(`fontSize ${n.fontSize}->${m.fontSize}`);
    if (m.fontWeight !== n.fontWeight) styleDiff.push(`fontWeight ${n.fontWeight}->${m.fontWeight}`);
    if (m.lineHeight !== n.lineHeight) styleDiff.push(`lineHeight ${n.lineHeight}->${m.lineHeight}`);
    // 1px is float-rounding noise; anything above that is a real shift.
    if (Math.abs(dx) > 1 || Math.abs(dy) > 1 || Math.abs(dw) > 1 || Math.abs(dh) > 1 || styleDiff.length) {
      diffs.push({
        path: n.path,
        tag: n.tag,
        cls: n.cls,
        text: n.text,
        dx,
        dy,
        dw,
        dh,
        styleDiff,
        orig: { x: n.x, y: n.y, w: n.w, h: n.h },
      });
    }
  }

  const extra = b.filter((n) => !a.some((m) => m.path === n.path));

  console.log(`  nodes: original ${a.length}, clone ${b.length}`);
  console.log(`  geometry/style mismatches: ${diffs.length}`);
  console.log(`  missing in clone: ${missing.length}, extra in clone: ${extra.length}`);

  // Report the shallowest mismatches first — a parent shift explains its children.
  const ranked = diffs
    .slice()
    .sort((p, q) => p.path.split('/').length - q.path.split('/').length || Math.abs(q.dy) - Math.abs(p.dy));
  for (const d of ranked.slice(0, 25)) {
    console.log(
      `    ${d.path}\n      <${d.tag} "${d.cls}">${d.text ? ` "${d.text}"` : ''}` +
        `\n      dx=${d.dx} dy=${d.dy} dw=${d.dw} dh=${d.dh}` +
        (d.styleDiff.length ? ` | ${d.styleDiff.join('; ')}` : '') +
        `  (orig ${d.orig.w}x${d.orig.h} @ ${d.orig.x},${d.orig.y})`,
    );
  }
  if (missing.length) {
    console.log('  --- missing in clone ---');
    for (const m of missing.slice(0, 12)) {
      console.log(`    ${m.path} <${m.tag} "${m.cls}">${m.text ? ` "${m.text}"` : ''}`);
    }
  }
  if (extra.length) {
    console.log('  --- extra in clone ---');
    for (const m of extra.slice(0, 12)) {
      console.log(`    ${m.path} <${m.tag} "${m.cls}">${m.text ? ` "${m.text}"` : ''}`);
    }
  }

  findings.push({
    target: t.id,
    counts: { original: a.length, clone: b.length, diffs: diffs.length, missing: missing.length, extra: extra.length },
    diffs: ranked,
    missing,
    extra,
  });
}

await writeFile('docs/research/order-hereserver-com-a6d29d9e/qa-geometry-report.json', JSON.stringify(findings, null, 2));
await browser.close();
console.log('\nqa-geometry done');
