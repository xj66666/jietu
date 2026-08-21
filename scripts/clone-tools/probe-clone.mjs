// Quick sanity probe: confirm the clone's CSS actually applied before trusting a QA run.
// Usage: node scripts/clone-tools/probe-clone.mjs [pdd|taobao]
import { chromium } from 'playwright';
import { TARGETS, LAUNCH, GOTO } from './config.mjs';

const LOCAL_ORIGIN = process.env.QA_ORIGIN ?? 'http://localhost:3111';
const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.id === only) : TARGETS;

const browser = await chromium.launch(LAUNCH);

for (const t of targets) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(LOCAL_ORIGIN + t.route, GOTO);
  await page.waitForTimeout(1500);

  const r = await page.evaluate(() => {
    const screen = document.querySelector('#screen');
    const root = screen?.firstElementChild;
    const pick = (sel) => {
      const el = document.querySelector(sel);
      return el ? getComputedStyle(el).lineHeight : 'n/a';
    };
    return {
      screen: screen ? { w: getComputedStyle(screen).width, h: getComputedStyle(screen).height, pt: getComputedStyle(screen).paddingTop } : null,
      rootFontSize: root ? getComputedStyle(root).fontSize : 'n/a',
      rootLineHeight: root ? getComputedStyle(root).lineHeight : 'n/a',
      // These are the utilities the v3->v4 line-height fix targets.
      lh_text22: pick('[class*="text-[22px]"]'),
      lh_text19: pick('[class*="text-[19px]"]'),
      lh_text17: pick('[class*="text-[17px]"]'),
      stylesheets: document.styleSheets.length,
      fontFamily: root ? getComputedStyle(root).fontFamily.slice(0, 80) : 'n/a',
    };
  });

  console.log(`${t.id}:`, JSON.stringify(r, null, 2));
  await ctx.close();
}

await browser.close();
