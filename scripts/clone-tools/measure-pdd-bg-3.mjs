// Third pass: sample the exact border / text colours of the bottom-bar buttons.
// Usage: node scripts/clone-tools/measure-pdd-bg-3.mjs
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
  const at = (x, y) => {
    const i = (y * cw + x) * 4;
    return `${d[i]},${d[i + 1]},${d[i + 2]}`;
  };
  const scanX = (y, x0, x1) => {
    const row = [];
    for (let x = x0; x <= x1; x++) row.push(`${x}:${at(x, y)}`);
    return row;
  };
  return {
    // Across the left border of 申请发票 at its vertical midpoint (button y1164-1213).
    invoiceLeftEdge: scanX(1188, 203, 216),
    // Across the top border.
    invoiceTopEdge: (() => {
      const col = [];
      for (let y = 1161; y <= 1172; y++) col.push(`${y}:${at(260, y)}`);
      return col;
    })(),
    // Darkest pixel inside each label = text colour.
    darkestIn: (x0, y0, x1, y1) => null,
    textColours: (() => {
      const pick = (x0, y0, x1, y1) => {
        let best = null;
        let bestSum = 1e9;
        for (let y = y0; y < y1; y++)
          for (let x = x0; x < x1; x++) {
            const i = (y * cw + x) * 4;
            const s = d[i] + d[i + 1] + d[i + 2];
            if (s < bestSum) {
              bestSum = s;
              best = `${d[i]},${d[i + 1]},${d[i + 2]}`;
            }
          }
        return best;
      };
      return {
        more: pick(119, 1176, 165, 1199),
        invoice: pick(215, 1170, 312, 1208),
        logistics: pick(341, 1170, 438, 1208),
        confirmOnRed: (() => {
          // Lightest pixel on the red button = its white label.
          let best = null;
          let bestSum = -1;
          for (let y = 1170; y < 1208; y++)
            for (let x = 467; x < 563; x++) {
              const i = (y * cw + x) * 4;
              const s = d[i] + d[i + 1] + d[i + 2];
              if (s > bestSum) {
                bestSum = s;
                best = `${d[i]},${d[i + 1]},${d[i + 2]}`;
              }
            }
          return best;
        })(),
      };
    })(),
    greyBandColour: at(300, 1130),
    homeIndicatorColour: at(295, 1262),
  };
}, png);

delete out.darkestIn;
console.log(JSON.stringify(out, null, 2));
await browser.close();
