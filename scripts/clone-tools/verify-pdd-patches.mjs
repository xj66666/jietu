// Screenshot the pdd canvas after the local edits and measure the changed regions, so
// the patch geometry can be checked against the baked art it sits on.
// Usage: node scripts/clone-tools/verify-pdd-patches.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { LAUNCH, GOTO, screenshotRoot } from './config.mjs';

const ORIGIN = process.env.QA_ORIGIN ?? 'http://localhost:3111';
const PAGE_KEY = 'mock-order-pdd-order-html-f0d21aee';
const out = `${screenshotRoot(PAGE_KEY)}/edits`;
await mkdir(out, { recursive: true });

const browser = await chromium.launch(LAUNCH);
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(45000);
await page.goto(`${ORIGIN}/mock-order/pdd/order.html`, GOTO);
await page.waitForTimeout(2000);

const screen = page.locator('#screen');
await screen.screenshot({ path: `${out}/canvas-after-edits.png` });

// Crop the two edited bands so the seams are inspectable at 2x.
const buf = await screen.screenshot();
const b64 = buf.toString('base64');
const probe = await page.evaluate(async ([b64]) => {
  const img = await new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = 'data:image/png;base64,' + b64;
  });
  const cw = 590;
  const cv = document.createElement('canvas');
  cv.width = cw;
  cv.height = img.height;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, cw, img.height);
  const d = ctx.getImageData(0, 0, cw, img.height).data;
  const px = (x, y) => {
    const i = (y * cw + x) * 4;
    return [d[i], d[i + 1], d[i + 2]];
  };
  const isWhite = (x, y) => {
    const [r, g, b] = px(x, y);
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
  const runs = (y0, y1, minGap = 8) => {
    const cols = [];
    for (let x = 0; x < cw; x++) {
      let hit = false;
      for (let y = y0; y < y1; y++)
        if (!isWhite(x, y)) {
          hit = true;
          break;
        }
      cols.push(hit);
    }
    const r = [];
    let start = -1,
      gap = 0;
    for (let x = 0; x <= cw; x++) {
      if (cols[x]) {
        if (start < 0) start = x;
        gap = 0;
      } else if (start >= 0) {
        gap++;
        if (gap >= minGap || x === cw) {
          r.push({ x: start, w: x - gap - start + 1 });
          start = -1;
          gap = 0;
        }
      }
    }
    return r;
  };
  return {
    imgHeight: img.height,
    // 拼单时间 row: the trailing divider/hat/chevron must be gone (nothing past x~325).
    pinRowTail: bbox(320, 1040, cw, 1076),
    // 发货时间 then the new 成交时间 row.
    shipRow: bbox(0, 1078, cw, 1104),
    settleRow: bbox(0, 1105, cw, 1140),
    settleLabel: bbox(0, 1105, 130, 1140),
    // Replacement grey separator.
    greyBand: (() => {
      const rows = [];
      for (let y = 1125; y < 1152; y++) {
        const [r, g, b] = px(300, y);
        if (r > 235 && r < 250 && Math.abs(r - b) < 4) rows.push(y);
      }
      return rows.length ? { from: rows[0], to: rows[rows.length - 1], h: rows.length, colour: px(300, rows[0]) } : null;
    })(),
    // Bottom bar: four items, and the ink of the two relabelled ones.
    bottomRuns: runs(1160, 1216),
    invoiceText: bbox(212, 1168, 314, 1210),
    confirmText: (() => {
      // White glyphs on red: find the lightest-pixel extent instead.
      let minX = 1e9,
        minY = 1e9,
        maxX = -1,
        maxY = -1;
      for (let y = 1168; y < 1210; y++)
        for (let x = 464; x < 566; x++) {
          const [r, g, b] = px(x, y);
          if (r > 200 && g > 200 && b > 200) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      return maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
    })(),
    homeIndicator: bbox(150, 1250, 450, img.height),
  };
}, [b64]);

console.log(JSON.stringify(probe, null, 2));
console.log(`\nsaved ${out}/canvas-after-edits.png`);
await browser.close();
