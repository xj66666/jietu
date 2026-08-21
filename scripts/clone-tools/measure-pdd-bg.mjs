// Measure the exact geometry of the baked-in elements in pdd-bg.compressed.png.
//
// The PNG is 1179x2556 and renders into a 589.5x1278 box via `background-size: cover`,
// i.e. exactly 1:2. This draws it at final size and scans pixels so the overlay/DOM
// replacements can use measured coordinates instead of eyeballed ones.
//
// Usage: node scripts/clone-tools/measure-pdd-bg.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';

const SRC =
  'public/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/images/pdd-bg.compressed.png';
const W = 589.5;
const H = 1278;

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 700, height: 400 } });
page.setDefaultTimeout(30000);

const png = readFileSync(SRC).toString('base64');
await page.setContent('<canvas id="cv"></canvas>');

const result = await page.evaluate(
  async ([png, W, H]) => {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = 'data:image/png;base64,' + png;
    });
    const cw = Math.round(W);
    const cv = document.getElementById('cv');
    cv.width = cw;
    cv.height = H;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, cw, H);
    const data = ctx.getImageData(0, 0, cw, H).data;

    const at = (x, y) => {
      const i = (y * cw + x) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    };
    const isWhite = (x, y) => {
      const [r, g, b] = at(x, y);
      return r > 246 && g > 246 && b > 246;
    };
    /** Grey separator bands are the flat #f...ish rows that span the full width. */
    const rowProfile = [];
    for (let y = 0; y < H; y++) {
      let nonWhite = 0;
      let sumR = 0;
      let sumG = 0;
      let sumB = 0;
      for (let x = 0; x < cw; x++) {
        if (!isWhite(x, y)) nonWhite++;
        const [r, g, b] = at(x, y);
        sumR += r;
        sumG += g;
        sumB += b;
      }
      rowProfile.push({
        y,
        nonWhite,
        avg: [Math.round(sumR / cw), Math.round(sumG / cw), Math.round(sumB / cw)],
      });
    }

    // Full-width flat bands: nearly every pixel non-white AND low colour variance.
    const bands = [];
    let run = null;
    for (const r of rowProfile) {
      const flat = r.nonWhite > cw * 0.95 && Math.abs(r.avg[0] - r.avg[2]) < 6 && r.avg[0] < 250 && r.avg[0] > 225;
      if (flat) {
        run ??= { from: r.y, avg: r.avg };
        run.to = r.y;
      } else if (run) {
        if (run.to - run.from >= 3) bands.push(run);
        run = null;
      }
    }
    if (run && run.to - run.from >= 3) bands.push(run);

    /** Bounding box of non-white content inside a region. */
    const bbox = (x0, y0, x1, y1) => {
      let minX = 1e9;
      let minY = 1e9;
      let maxX = -1;
      let maxY = -1;
      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          if (!isWhite(x, y)) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }
      return maxX < 0 ? null : { x: minX, y: minY, w: maxX - minX + 1, h: maxY - minY + 1 };
    };

    /** Column runs of non-white content in a horizontal strip — isolates buttons. */
    const columnRuns = (y0, y1, minGap = 6) => {
      const cols = [];
      for (let x = 0; x < cw; x++) {
        let hit = false;
        for (let y = y0; y < y1; y++) {
          if (!isWhite(x, y)) {
            hit = true;
            break;
          }
        }
        cols.push(hit);
      }
      const runs = [];
      let start = -1;
      let gap = 0;
      for (let x = 0; x <= cw; x++) {
        if (cols[x]) {
          if (start < 0) start = x;
          gap = 0;
        } else if (start >= 0) {
          gap++;
          if (gap >= minGap || x === cw) {
            runs.push({ x: start, w: x - gap - start + 1 });
            start = -1;
            gap = 0;
          }
        }
      }
      return runs;
    };

    // The bottom action bar sits between the last grey band and the home indicator.
    const lastBand = bands[bands.length - 1];
    const barTop = lastBand ? lastBand.to + 1 : 1140;

    return {
      canvas: { w: cw, h: H },
      greyBands: bands.map((b) => ({ from: b.from, to: b.to, height: b.to - b.from + 1, avg: b.avg })),
      // 拼单时间 row decorations live to the right of the value text.
      hatRegion: bbox(300, 1040, 420, 1075),
      hatColumnRuns: columnRuns(1040, 1075, 4).filter((r) => r.x > 290),
      bottomBar: {
        top: barTop,
        contentBox: bbox(0, barTop, cw, H),
        columnRuns: columnRuns(barTop, barTop + 60, 8),
      },
      homeIndicator: bbox(150, 1220, 450, H),
      // Sample colours for reproducing the chrome.
      samples: {
        greyBand: lastBand ? at(10, lastBand.from + 2) : null,
        redButton: at(520, barTop + 25),
        pageWhite: at(5, 900),
      },
    };
  },
  [png, W, H],
);

writeFileSync(
  'docs/research/order-hereserver-com-a6d29d9e/pdd-bg-measurements.json',
  JSON.stringify(result, null, 2),
);
console.log(JSON.stringify(result, null, 2));
await browser.close();
