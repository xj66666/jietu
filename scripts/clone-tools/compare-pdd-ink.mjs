// Compare the ink of the patched pdd elements against the baked ones they sit beside.
// Reports darkest-pixel colour and glyph bbox so weight/size/colour drift is measured
// rather than eyeballed off an upscaled crop.
// Usage: node scripts/clone-tools/compare-pdd-ink.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { LAUNCH, screenshotRoot } from './config.mjs';

const dir = `${screenshotRoot('mock-order-pdd-order-html-f0d21aee')}/edits`;
const png = readFileSync(`${dir}/canvas-after-edits.png`).toString('base64');

const browser = await chromium.launch(LAUNCH);
const page = await browser.newPage({ viewport: { width: 700, height: 300 } });
page.setDefaultTimeout(30000);
await page.setContent('<canvas id="cv"></canvas>');

const out = await page.evaluate(async (png) => {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = 'data:image/png;base64,' + png;
  });
  const cw = 590;
  const cv = document.getElementById('cv');
  cv.width = cw;
  cv.height = img.height;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, cw, img.height);
  const d = ctx.getImageData(0, 0, cw, img.height).data;
  const px = (x, y) => {
    const i = (y * cw + x) * 4;
    return [d[i], d[i + 1], d[i + 2]];
  };

  /** Ink statistics for a text region: darkest pixel, plus how many pixels are "dark"
   *  (a proxy for stroke weight) and the glyph bounding box. */
  const ink = (x0, y0, x1, y1, bgLight = true) => {
    let darkest = [255, 255, 255];
    let darkSum = 1e9;
    let darkCount = 0;
    let minX = 1e9,
      minY = 1e9,
      maxX = -1,
      maxY = -1;
    for (let y = y0; y < y1; y++)
      for (let x = x0; x < x1; x++) {
        const [r, g, b] = px(x, y);
        const s = r + g + b;
        if (s < darkSum) {
          darkSum = s;
          darkest = [r, g, b];
        }
        const isInk = bgLight ? s < 690 : s > 600;
        if (isInk) {
          darkCount++;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    return {
      darkest,
      inkPixels: darkCount,
      box: maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 },
    };
  };

  return {
    // Labels: three baked rows vs the added one. Label column is x19..112.
    label_下单时间: ink(15, 1012, 115, 1038),
    label_拼单时间: ink(15, 1045, 115, 1071),
    label_发货时间: ink(15, 1078, 115, 1104),
    label_成交时间_DOM: ink(15, 1111, 115, 1137),
    // Values: same three baked rows are DOM already, so these should match exactly.
    value_发货时间: ink(120, 1078, 330, 1104),
    value_成交时间_DOM: ink(120, 1111, 330, 1137),
    // Bottom bar: baked 查看物流 vs patched 再次拼单.
    btn_查看物流_baked: ink(338, 1170, 442, 1208),
    btn_再次拼单_DOM: ink(212, 1170, 316, 1208),
    btn_更多_baked: ink(115, 1172, 170, 1202),
  };
}, png);

for (const [k, v] of Object.entries(out)) {
  console.log(
    `${k.padEnd(24)} darkest=${v.darkest.join(',').padEnd(12)} inkPx=${String(v.inkPixels).padStart(5)}  box=${v.box ? `${v.box.x},${v.box.y} ${v.box.w}x${v.box.h}` : 'null'}`,
  );
}
await browser.close();
