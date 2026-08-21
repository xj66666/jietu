// Phase 5 visual QA: shoot the original and the clone at the same viewports, then
// report per-section pixel deltas so discrepancies are measured rather than eyeballed.
// Usage: node scripts/clone-tools/qa-diff.mjs [pdd|taobao]
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { TARGETS, LAUNCH, GOTO, screenshotRoot } from './config.mjs';

const LOCAL_ORIGIN = process.env.QA_ORIGIN ?? 'http://localhost:3111';
const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.id === only) : TARGETS;

const VIEWPORTS = [
  { name: '1440', width: 1440, height: 900 },
  { name: '390', width: 390, height: 844 },
];

/**
 * Compare two PNG buffers by decoding both in the browser and counting pixels whose
 * per-channel delta exceeds `tolerance`. Runs in-page so we need no image deps.
 */
const DIFF_IN_PAGE = async ([aB64, bB64, tolerance]) => {
  const load = (b64) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = 'data:image/png;base64,' + b64;
    });
  const [a, b] = await Promise.all([load(aB64), load(bB64)]);
  const w = Math.min(a.width, b.width);
  const h = Math.min(a.height, b.height);
  const draw = (img) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    c.getContext('2d').drawImage(img, 0, 0);
    return c.getContext('2d').getImageData(0, 0, w, h).data;
  };
  const da = draw(a);
  const db = draw(b);
  let diff = 0;
  // Row-level tally makes it obvious *where* a mismatch lives.
  const rows = new Array(h).fill(0);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (
        Math.abs(da[i] - db[i]) > tolerance ||
        Math.abs(da[i + 1] - db[i + 1]) > tolerance ||
        Math.abs(da[i + 2] - db[i + 2]) > tolerance
      ) {
        diff++;
        rows[y]++;
      }
    }
  }
  const worst = rows
    .map((count, y) => ({ y, count }))
    .filter((r) => r.count > w * 0.02)
    .sort((p, q) => q.count - p.count)
    .slice(0, 12);
  return {
    comparedSize: { w, h },
    sizeA: { w: a.width, h: a.height },
    sizeB: { w: b.width, h: b.height },
    diffPixels: diff,
    totalPixels: w * h,
    diffRatio: +(diff / (w * h)).toFixed(5),
    worstRows: worst,
  };
};

/**
 * Values the target randomises on every load: the clock, the battery level, and the
 * long order / Alipay reference numbers. They are neutralised by rewriting the rendered
 * text directly rather than by driving the editor — clicking around in the editor
 * dismisses the origin's always-on Tippy tooltips, which would then show up as a
 * 260x30 phantom diff band.
 */
const PIN_RANDOM_FIELDS = () => {
  const screen = document.querySelector('#screen');
  if (!screen) return;

  const clock = screen.querySelector('.ios-time');
  if (clock) clock.textContent = '08:41';

  const androidClock = screen.querySelector('.material-top-bar .font-semibold');
  if (androidClock) androidClock.textContent = '08:41';

  const fill = screen.querySelector('.battery-value');
  if (fill) fill.style.width = '26%';

  const pct = screen.querySelector('.battery-value-number');
  if (pct) {
    for (const node of pct.childNodes) {
      if (node.nodeType === 3 && node.textContent.trim()) node.textContent = '26';
    }
  }

  // Any bare run of >=15 digits in the canvas is one of the randomised reference
  // numbers; replace it with a fixed digit so both sides render identical glyphs.
  const walker = document.createTreeWalker(screen, NodeFilter.SHOW_TEXT);
  const hits = [];
  while (walker.nextNode()) {
    const raw = walker.currentNode.textContent;
    if (/\d{15,}/.test(raw.replace(/[^\d]/g, '')) && /\d{15,}/.test(raw)) hits.push(walker.currentNode);
  }
  for (const node of hits) {
    node.textContent = node.textContent.replace(/\d{15,}/g, (m) => '7'.repeat(m.length));
  }
};

/**
 * The two always-on tooltips are overlays that paint across the canvas, and they are
 * positioned by Popper upstream vs. static offsets here — at narrow viewports the two
 * land in different places and swamp the canvas comparison. Their geometry is verified
 * separately (see SharedShell.spec.md#9-pinnedtooltip), so suppress them here to get a
 * clean read on the canvas itself.
 */
const HIDE_OVERLAYS = () => {
  for (const el of document.querySelectorAll('[data-tippy-root]')) el.style.display = 'none';
  // The clone's equivalents: absolutely positioned boxes at z-9999 with pointer-events none.
  for (const el of document.querySelectorAll('.z-\\[9999\\]')) el.style.display = 'none';
};

const browser = await chromium.launch(LAUNCH);
const report = [];

for (const t of targets) {
  const sRoot = `${screenshotRoot(t.pageKey)}/qa`;
  await mkdir(sRoot, { recursive: true });
  console.log(`\n=== QA ${t.id} ===`);

  for (const vp of VIEWPORTS) {
    const shots = {};
    for (const [side, url] of [
      ['original', t.url],
      ['clone', LOCAL_ORIGIN + t.route],
    ]) {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
      const page = await ctx.newPage();
      await page.goto(url, GOTO);
      // Give Tippy time to mount its always-on tooltips before we freeze the page.
      await page.waitForTimeout(4000);
      await page.evaluate(PIN_RANDOM_FIELDS);
      await page.evaluate(HIDE_OVERLAYS);
      await page.waitForTimeout(400);

      await page.screenshot({ path: `${sRoot}/${vp.name}-${side}-full.png`, fullPage: true });
      const screen = page.locator('#screen').first();
      const buf = await screen.screenshot({ path: `${sRoot}/${vp.name}-${side}-screen.png` });
      shots[side] = buf.toString('base64');
      await ctx.close();
    }

    // Diff the preview canvas — that is the pixel-critical artefact.
    const ctx = await browser.newContext({ viewport: { width: 800, height: 600 } });
    const page = await ctx.newPage();
    await page.setContent('<html><body></body></html>');
    const result = await page.evaluate(DIFF_IN_PAGE, [shots.original, shots.clone, 12]);
    await ctx.close();

    console.log(
      `  ${vp.name}px canvas: ${result.diffPixels}/${result.totalPixels} px differ (${(result.diffRatio * 100).toFixed(2)}%)` +
        `  original ${result.sizeA.w}x${result.sizeA.h} vs clone ${result.sizeB.w}x${result.sizeB.h}`,
    );
    if (result.worstRows.length) {
      console.log(`    worst rows (y:count): ${result.worstRows.map((r) => `${r.y}:${r.count}`).join(', ')}`);
    }
    report.push({ target: t.id, viewport: vp.name, ...result });
  }
}

await writeFile('docs/research/order-hereserver-com-a6d29d9e/qa-diff-report.json', JSON.stringify(report, null, 2));
await browser.close();
console.log('\nqa-diff done');
