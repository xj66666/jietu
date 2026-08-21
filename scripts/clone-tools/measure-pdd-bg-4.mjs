// Fourth pass: the baked row labels' colour and metrics, needed because the new
// 成交时间 row has no counterpart in the PNG and must be drawn in DOM to match.
// Usage: node scripts/clone-tools/measure-pdd-bg-4.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const SRC =
  'public/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/images/pdd-bg.compressed.png';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 700, height: 400 } });
page.setDefaultTimeout(30000);
const png = readFileSync(SRC).toString('base64');
await page.setContent('<canvas id="cv"></canvas>');

const out = await page.evaluate(async (png) => {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = 'data:image/png;base64,' + png;
  });
  const cw = 590,
    ch = 1278;
  const cv = document.getElementById('cv');
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, cw, ch);
  const d = ctx.getImageData(0, 0, cw, ch).data;
  const px = (x, y) => {
    const i = (y * cw + x) * 4;
    return [d[i], d[i + 1], d[i + 2]];
  };
  const isWhite = (x, y) => {
    const [r, g, b] = px(x, y);
    return r > 246 && g > 246 && b > 246;
  };
  const darkest = (x0, y0, x1, y1) => {
    let best = null,
      bestSum = 1e9;
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const [r, g, b] = px(x, y);
        if (r + g + b < bestSum) {
          bestSum = r + g + b;
          best = [r, g, b];
        }
      }
    return best;
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
    // Each baked label in the detail block: bbox + darkest pixel (its ink colour).
    labels: [
      ['下单时间', 1014, 1040],
      ['拼单时间', 1047, 1073],
      ['发货时间', 1078, 1104],
    ].map(([name, y0, y1]) => ({ name, box: bbox(0, y0, 130, y1), ink: darkest(0, y0, 130, y1) })),
    // Confirm nothing but the hat/divider/chevron lives in the strip we plan to mask.
    hatStripContent: bbox(320, 1040, 400, 1076),
    hatStripAfter: bbox(382, 1040, cw, 1076),
    // Value column ink, for reference.
    valueInk: darkest(140, 1078, 330, 1104),
    valueBox: bbox(140, 1078, 330, 1104),
  };
}, png);

console.log(JSON.stringify(out, null, 2));
await browser.close();
