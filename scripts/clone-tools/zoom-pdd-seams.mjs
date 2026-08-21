// Zoom into the seams created by the pdd canvas patches so they can be eyeballed:
// the added 成交时间 label against the baked ones, and the two relabelled buttons
// against the untouched 查看物流 between them.
// Usage: node scripts/clone-tools/zoom-pdd-seams.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { LAUNCH, screenshotRoot } from './config.mjs';

const PAGE_KEY = 'mock-order-pdd-order-html-f0d21aee';
const dir = `${screenshotRoot(PAGE_KEY)}/edits`;
const png = readFileSync(`${dir}/canvas-after-edits.png`).toString('base64');

const REGIONS = [
  { label: 'labels: 下单/拼单/发货 (baked) + 成交 (DOM)', sx: 0, sy: 1008, sw: 380, sh: 140, scale: 2 },
  { label: 'bottom bar: 再次拼单 / 查看物流 (baked) / 立即评价', sx: 100, sy: 1155, sw: 490, sh: 65, scale: 2 },
];

const browser = await chromium.launch(LAUNCH);
const page = await browser.newPage({ viewport: { width: 1100, height: 480 } });
page.setDefaultTimeout(30000);
await page.setContent('<canvas id="cv" width="1000" height="460"></canvas>');
await page.evaluate(
  async ([png, regions]) => {
    const img = await new Promise((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = 'data:image/png;base64,' + png;
    });
    const ctx = document.getElementById('cv').getContext('2d');
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(0, 0, 1000, 460);
    ctx.imageSmoothingEnabled = false;
    let y = 0;
    for (const r of regions) {
      y += 16;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(r.label, 4, y - 3);
      ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, y, r.sw * r.scale, r.sh * r.scale);
      y += r.sh * r.scale + 8;
    }
  },
  [png, REGIONS],
);
const data = await page.evaluate(() => document.getElementById('cv').toDataURL('image/png'));
writeFileSync(`${dir}/seams-2x.png`, Buffer.from(data.split(',')[1], 'base64'));
console.log(`saved ${dir}/seams-2x.png`);
await browser.close();
