// Phase 5 interaction QA: drive every state the target has and assert the clone reacts
// the same way. Covers the mandatory sweep items — status-bar variants, panel swap,
// mobile nav, taobao's deduct detail + status dropdown, and the screenshot export.
// Usage: node scripts/clone-tools/qa-interactions.mjs [pdd|taobao]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { TARGETS, LAUNCH, GOTO, screenshotRoot } from './config.mjs';

const LOCAL_ORIGIN = process.env.QA_ORIGIN ?? 'http://localhost:3111';
const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.id === only) : TARGETS;

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) {
    pass++;
    console.log(`    PASS  ${name}${detail ? '  ' + detail : ''}`);
  } else {
    fail++;
    console.log(`    FAIL  ${name}${detail ? '  ' + detail : ''}`);
  }
};

async function setField(page, label, value) {
  const row = page.locator('#editor-ct .mb-4', { has: page.locator(`label:text-is("${label}")`) }).first();
  const input = row.locator('input').first();
  if ((await input.getAttribute('type')) === 'checkbox') {
    if ((await input.isChecked()) !== value) await input.setChecked(value);
  } else {
    await input.fill(String(value));
  }
  await page.waitForTimeout(300);
}

const visible = (page, sel) =>
  page.evaluate((s) => {
    const el = document.querySelector(s);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(el).display !== 'none';
  }, sel);

const browser = await chromium.launch(LAUNCH);

for (const t of targets) {
  const sRoot = `${screenshotRoot(t.pageKey)}/qa/interactions`;
  await mkdir(sRoot, { recursive: true });
  console.log(`\n=== interactions ${t.id} ===`);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto(LOCAL_ORIGIN + t.route, GOTO);
  await page.waitForTimeout(1500);

  console.log('  [A] default state');
  check('iOS bar visible', await visible(page, '#screen .ios-bar'));
  check('Android bar hidden', !(await visible(page, '#screen .material-top-bar')));
  check('order panel visible', await visible(page, '#editor-ct .p-6.pt-0'));
  check(
    'canvas is 589.5 x 1278',
    await page.evaluate(() => {
      const cs = getComputedStyle(document.querySelector('#screen'));
      return cs.width === '589.5px' && cs.height === '1278px';
    }),
  );

  console.log('  [B] android status bar');
  await setField(page, '安卓状态栏', true);
  check('Android bar visible', await visible(page, '#screen .material-top-bar'));
  check('iOS bar hidden', !(await visible(page, '#screen .ios-bar')));
  await page.locator('#screen').screenshot({ path: `${sRoot}/B-android.png` });
  await setField(page, '安卓状态栏', false);
  check('iOS bar restored', await visible(page, '#screen .ios-bar'));

  console.log('  [C] status-bar editor panel');
  await page.locator('#editor-ct button:has-text("编辑信号与时间")').click();
  await page.waitForTimeout(400);
  const panelLabels = await page.evaluate(() =>
    [...document.querySelectorAll('#editor-ct label')]
      .filter((l) => l.offsetParent !== null)
      .map((l) => l.textContent.trim()),
  );
  check('panel shows 6 status fields', panelLabels.length === 6, JSON.stringify(panelLabels));

  console.log('  [D/E/F/G] status-bar variants');
  await setField(page, '定位', true);
  check('location icon shown', await visible(page, '#screen .ios-location'));
  await setField(page, '定位', false);
  check('location icon hidden', !(await visible(page, '#screen .ios-location')));

  await setField(page, '充电', true);
  check(
    'battery fill turns iOS green',
    (await page.evaluate(() => getComputedStyle(document.querySelector('#screen .battery-value')).backgroundColor)) ===
      'rgb(52, 199, 89)',
  );
  check('charging bolt shown', await visible(page, '#screen .ios-battery-charging-icon-v2'));
  await setField(page, '充电', false);
  check(
    'battery fill back to #191919',
    (await page.evaluate(() => getComputedStyle(document.querySelector('#screen .battery-value')).backgroundColor)) ===
      'rgb(25, 25, 25)',
  );

  await setField(page, '电池百分比', false);
  check(
    'battery number hidden',
    (await page.evaluate(() => document.querySelector('#screen .battery-value-number').textContent.trim())) === '',
  );
  await setField(page, '电池百分比', true);

  for (const [sig, expected] of [
    [4, 0],
    [3, 1],
    [2, 2],
  ]) {
    await setField(page, '蜂窝信号', sig);
    const n = await page.evaluate(() => document.querySelectorAll('#screen .ios_single i').length);
    check(`signal ${sig} -> ${expected} mask bar(s)`, n === expected, `got ${n}`);
  }
  await setField(page, '蜂窝信号', 3);

  await setField(page, '电量', 77);
  check(
    'battery width follows 电量',
    (await page.evaluate(() => document.querySelector('#screen .battery-value').style.width)) === '77%',
  );
  await setField(page, '手机时间', '13:05');
  check(
    'clock follows 手机时间',
    (await page.evaluate(() => document.querySelector('#screen .ios-time').textContent.trim())) === '13:05',
  );

  await page.locator('#editor-ct button:has-text("编辑订单信息")').click();
  await page.waitForTimeout(400);
  check('order panel restored', await visible(page, '#editor-ct .p-6.pt-0'));

  console.log('  [live binding] editing a field updates the canvas');
  const probeLabel = t.id === 'pdd' ? '店铺名' : '店铺名';
  await setField(page, probeLabel, 'QA 店铺名称');
  check(
    'canvas reflects edited shop name',
    (await page.locator('#screen').textContent()).includes('QA 店铺名称'),
  );

  if (t.id === 'taobao') {
    console.log('  [K] deduct detail');
    await setField(page, '展示扣减详情', true);
    const txt = await page.locator('#screen').textContent();
    check('5 deduct rows rendered', ['商品总价', '运费', '店铺优惠', '淘金币抵扣', '红包'].every((s) => txt.includes(s)));
    check(
      'paid-row chevron flips to -rotate-90',
      await page.evaluate(() => {
        const imgs = [...document.querySelectorAll('#screen img')];
        return imgs.some((i) => i.className.includes('-rotate-90') && i.className.includes('ml-2'));
      }),
    );
    const editorLabels = await page.evaluate(() =>
      [...document.querySelectorAll('#editor-ct label')].filter((l) => l.offsetParent !== null).map((l) => l.textContent.trim()),
    );
    check(
      '5 deduct editor fields appear',
      ['扣减详情-商品总价', '扣减详情-运费', '扣减详情-店铺优惠', '扣减详情-淘金币抵扣', '扣减详情-红包'].every((s) =>
        editorLabels.includes(s),
      ),
    );
    await page.locator('#screen').screenshot({ path: `${sRoot}/K-deduct-on.png` });
    await setField(page, '展示扣减详情', false);
    check('deduct rows removed', !(await page.locator('#screen').textContent()).includes('淘金币抵扣'));

    console.log('  [L] order-status dropdown');
    check('dropdown hidden initially', !(await visible(page, '#dropdown')));
    await page.locator('#dropdownDefaultButton').click();
    await page.waitForTimeout(300);
    check('dropdown opens', await visible(page, '#dropdown'));
    const links = await page.locator('#dropdown a').allTextContents();
    check('7 status links', links.length === 7, JSON.stringify(links));
    await page.locator('#dropdownDefaultButton').click();
    await page.waitForTimeout(250);
    check('dropdown closes', !(await visible(page, '#dropdown')));
  }

  console.log('  [J] screenshot export');
  check('download anchor hidden before capture', !(await visible(page, '#downdloadPic')));
  await page.locator('#generatePic').click();
  // html2canvas-pro rasterises off the main thread's critical path; give it room.
  await page.waitForTimeout(9000);
  const mirrorShown = await visible(page, '#screen ~ .screen-mirror, .screen-mirror');
  check('screen-mirror overlay appears', mirrorShown);
  const href = await page.getAttribute('#downdloadPic', 'href');
  check('download anchor has a PNG data URL', !!href && href.startsWith('data:image/png;base64,'), `len=${href?.length ?? 0}`);
  await page.screenshot({ path: `${sRoot}/J-after-capture.png` });

  console.log('  [H] mobile nav toggle @390px');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(600);
  check('tool nav hidden on mobile', !(await visible(page, '#separator-sidebar')));
  const toggle = page.locator('.md\\:hidden button').first();
  check('toggle label is 打开导航', (await toggle.textContent())?.trim() === '打开导航');
  await toggle.click();
  await page.waitForTimeout(400);
  check('tool nav opens', await visible(page, '#separator-sidebar'));
  check('toggle label is 关闭导航', (await toggle.textContent())?.trim() === '关闭导航');
  await page.screenshot({ path: `${sRoot}/H-mobile-nav-open.png` });
  await toggle.click();
  await page.waitForTimeout(300);
  check('tool nav closes', !(await visible(page, '#separator-sidebar')));

  console.log('  [responsive] breakpoint at 768px');
  for (const [w, navVisible] of [
    [767, false],
    [768, true],
  ]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(500);
    check(`@${w}px tool nav ${navVisible ? 'visible' : 'hidden'}`, (await visible(page, '#separator-sidebar')) === navVisible);
  }

  check('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await ctx.close();
}

await browser.close();
console.log(`\ninteractions: ${pass} passed, ${fail} failed`);
if (fail) process.exitCode = 1;
