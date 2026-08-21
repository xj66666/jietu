// One-off inspection helper: crop the regions of pdd-bg.compressed.png that carry the
// baked-in labels we've been asked to change, so the exact source pixels are visible.
// Usage: node scripts/clone-tools/inspect-pdd-bg.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { LAUNCH } from './config.mjs';

const SRC =
  'public/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/images/pdd-bg.compressed.png';

// The PNG is 1179x2556 and renders into a 589.5x1278 box, so source = CSS * 2.
const REGIONS = [
  { label: 'A) hat + chevron at 拼单时间 (2x)', sx: 900, sy: 2060, sw: 340, sh: 90, scale: 2 },
  { label: 'B) bottom action bar (1:1)', sx: 0, sy: 2330, sw: 1179, sh: 180, scale: 1 },
  { label: 'C) below 发货时间 (1:1)', sx: 0, sy: 2140, sw: 1179, sh: 200, scale: 1 },
];

const browser = await chromium.launch(LAUNCH);
const page = await browser.newPage({ viewport: { width: 1250, height: 760 } });
const png = readFileSync(SRC).toString('base64');

await page.setContent('<html><body style="margin:0"><canvas id="cv" width="1240" height="740"></canvas></body></html>');
await page.evaluate(
  async ([png, regions]) => {
    const img = await new Promise((r) => {
      const i = new Image();
      i.onload = () => r(i);
      i.src = 'data:image/png;base64,' + png;
    });
    const ctx = document.getElementById('cv').getContext('2d');
    ctx.fillStyle = '#dddddd';
    ctx.fillRect(0, 0, 1240, 740);
    ctx.imageSmoothingEnabled = false;
    let y = 0;
    for (const r of regions) {
      y += 18;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`${r.label}  src x${r.sx}-${r.sx + r.sw} y${r.sy}-${r.sy + r.sh}`, 5, y - 4);
      ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, y, r.sw * r.scale, r.sh * r.scale);
      y += r.sh * r.scale + 10;
    }
  },
  [png, REGIONS],
);

const data = await page.evaluate(() => document.getElementById('cv').toDataURL('image/png'));
const out = 'docs/research/order-hereserver-com-a6d29d9e/bg-regions.png';
writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
console.log('saved ' + out);
await browser.close();
