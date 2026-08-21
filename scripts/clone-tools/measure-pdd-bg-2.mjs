// Second measurement pass over pdd-bg.compressed.png: the exact vertical bounds and
// colours of the bottom action bar, so the DOM replacement can be positioned from
// measured values rather than guesses.
//
// Usage: node scripts/clone-tools/measure-pdd-bg-2.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const SRC =
  'public/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/images/pdd-bg.compressed.png';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 700, height: 400 } });
page.setDefaultTimeout(30000);
const png = readFileSync(SRC).toString('base64');
await page.setContent('<canvas id="cv"></canvas>');

const result = await page.evaluate(async (png) => {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = 'data:image/png;base64,' + png;
  });
  const cw = 590;
  const ch = 1278;
  const cv = document.getElementById('cv');
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, cw, ch);
  const d = ctx.getImageData(0, 0, cw, ch).data;
  const at = (x, y) => {
    const i = (y * cw + x) * 4;
    return [d[i], d[i + 1], d[i + 2]];
  };
  const isWhite = (x, y) => {
    const [r, g, b] = at(x, y);
    return r > 246 && g > 246 && b > 246;
  };
  const bbox = (x0, y0, x1, y1) => {
    let minX = 1e9,
      minY = 1e9,
      maxX = -1,
      maxY = -1;
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++)
        if (!isWhite(x, y)) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
    return maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1, right: maxX + 1, bottom: maxY + 1 };
  };

  return {
    // Last baked label row (发货时间) — the mask must start below this.
    shipRow: bbox(0, 1075, cw, 1119),
    // Each bottom-bar item, isolated by the column runs found in pass 1.
    moreText: bbox(110, 1150, 175, 1240),
    invoiceBtn: bbox(200, 1150, 326, 1240),
    logisticsBtn: bbox(326, 1150, 452, 1240),
    confirmBtn: bbox(452, 1150, 578, 1240),
    // Border colour of an outlined button: sample just inside its left edge.
    outlineBorderColor: at(207, 1185),
    outlineFill: at(260, 1185),
    redFill: at(515, 1185),
    // Corner probing to estimate the radius of the outlined button.
    cornerProbe: (() => {
      const b = bbox(200, 1150, 326, 1240);
      if (!b) return null;
      const out = [];
      for (let dy = 0; dy < 12; dy++) {
        let firstX = null;
        for (let dx = 0; dx < 20; dx++) {
          if (!isWhite(b.x + dx, b.y + dy)) {
            firstX = dx;
            break;
          }
        }
        out.push({ dy, firstX });
      }
      return out;
    })(),
  };
}, png);

writeFileSync(
  'docs/research/order-hereserver-com-a6d29d9e/pdd-bg-measurements-2.json',
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
