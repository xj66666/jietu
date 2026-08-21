// Interaction + multi-state sweep. Captures every state's DOM/styles/screenshot so the
// component specs can record before/after pairs instead of guesses.
// Usage: node scripts/clone-tools/sweep.mjs [pdd|taobao]
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { TARGETS, LAUNCH, GOTO, artifactRoot, screenshotRoot } from './config.mjs';

const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.id === only) : TARGETS;

const PROPS = [
  'fontSize', 'fontWeight', 'fontFamily', 'lineHeight', 'letterSpacing', 'color',
  'textTransform', 'textDecorationLine', 'backgroundColor', 'backgroundImage', 'backgroundSize',
  'backgroundPosition', 'backgroundRepeat',
  'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'width', 'height', 'maxWidth', 'minWidth', 'maxHeight', 'minHeight',
  'display', 'flexDirection', 'flexGrow', 'flexShrink', 'flexBasis', 'justifyContent', 'alignItems', 'gap',
  'gridTemplateColumns', 'gridTemplateRows',
  'borderRadius', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor', 'borderStyle',
  'boxShadow', 'overflow', 'overflowX', 'overflowY',
  'position', 'top', 'right', 'bottom', 'left', 'zIndex',
  'opacity', 'transform', 'transition', 'cursor', 'visibility',
  'objectFit', 'objectPosition', 'mixBlendMode', 'filter', 'backdropFilter',
  'whiteSpace', 'textOverflow', 'webkitLineClamp', 'textAlign', 'verticalAlign',
  'fontVariantNumeric', 'userSelect', 'flex',
];

/** Deep style + text + geometry snapshot of one subtree. */
const WALK = (selector, maxDepth, propList) => {
  const root = document.querySelector(selector);
  if (!root) return { error: 'not found: ' + selector };
  const styles = (el) => {
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of propList) {
      const v = cs[p];
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') o[p] = v;
    }
    return o;
  };
  const walk = (el, depth) => {
    if (depth > maxDepth) return null;
    const r = el.getBoundingClientRect();
    const kids = [...el.children];
    const onlyText = el.childNodes.length && [...el.childNodes].every((n) => n.nodeType === 3);
    return {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      classes: el.className?.toString() || undefined,
      text: onlyText ? el.textContent.replace(/\s+/g, ' ').trim().slice(0, 300) : undefined,
      box: { w: +r.width.toFixed(2), h: +r.height.toFixed(2), x: +r.x.toFixed(2), y: +r.y.toFixed(2) },
      styles: styles(el),
      img: el.tagName === 'IMG'
        ? { src: el.src?.startsWith('data:') ? `data:[${el.src.length}]` : el.src, alt: el.alt, nw: el.naturalWidth, nh: el.naturalHeight }
        : undefined,
      svg: el.tagName === 'svg' ? { viewBox: el.getAttribute('viewBox'), outerHTML: el.outerHTML } : undefined,
      childCount: kids.length,
      children: kids.map((c) => walk(c, depth + 1)).filter(Boolean),
    };
  };
  return walk(root, 0);
};

/** Set a Vue-bound control and let the reactive update flush. */
async function setControl(page, label, value) {
  const row = page.locator('#editor-ct .mb-4', { has: page.locator(`label:text-is("${label}")`) }).first();
  const input = row.locator('input').first();
  const type = await input.getAttribute('type');
  if (type === 'checkbox') {
    const checked = await input.isChecked();
    if (checked !== value) await input.setChecked(value);
  } else {
    await input.fill(String(value));
    await input.dispatchEvent('input');
  }
  await page.waitForTimeout(450);
}

const browser = await chromium.launch(LAUNCH);

for (const t of targets) {
  const aRoot = artifactRoot(t.pageKey);
  const sRoot = screenshotRoot(t.pageKey);
  await mkdir(`${aRoot}/states`, { recursive: true });
  await mkdir(`${sRoot}/states`, { recursive: true });
  console.log(`\n=== sweep ${t.id} ===`);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(t.url, GOTO);
  await page.waitForTimeout(3000);

  const snap = async (name, selectors) => {
    const out = {};
    for (const [key, sel] of Object.entries(selectors)) {
      out[key] = await page.evaluate(([s, d, p]) => WALK_FN(s, d, p), [sel, 4, PROPS]).catch((e) => ({ error: e.message }));
    }
    await writeFile(`${aRoot}/states/${name}.json`, JSON.stringify(out, null, 2));
    console.log(`  state: ${name}`);
  };

  // Expose WALK inside the page once so each snapshot is a cheap call.
  await page.addInitScript(`window.WALK_FN = ${WALK.toString()}`);
  await page.evaluate(`window.WALK_FN = ${WALK.toString()}`);

  const STATUS_BAR = { iosBar: '#screen .ios-bar', androidBar: '#screen .material-top-bar' };

  // --- State A: as loaded -------------------------------------------------
  await snap('A-default-statusbar', STATUS_BAR);
  await page.locator('#screen').screenshot({ path: `${sRoot}/states/A-default-screen.png` });

  // --- State B: Android status bar ----------------------------------------
  await setControl(page, '安卓状态栏', true);
  await snap('B-android-statusbar', STATUS_BAR);
  await page.locator('#screen').screenshot({ path: `${sRoot}/states/B-android-screen.png` });
  await setControl(page, '安卓状态栏', false);

  // --- State C: signal/time editor panel ---------------------------------
  await page.locator('#editor-ct button:has-text("编辑信号与时间")').click();
  await page.waitForTimeout(500);
  await page.locator('#editor-ct').screenshot({ path: `${sRoot}/states/C-editor-topbar-panel.png` });
  const panelFields = await page.evaluate(() =>
    [...document.querySelectorAll('#editor-ct .mb-4')]
      .filter((d) => d.offsetParent !== null)
      .map((d) => ({
        label: d.querySelector('label')?.textContent?.trim(),
        type: d.querySelector('input')?.type,
        value: d.querySelector('input')?.type === 'checkbox' ? d.querySelector('input').checked : d.querySelector('input')?.value,
        min: d.querySelector('input')?.getAttribute('min'),
        max: d.querySelector('input')?.getAttribute('max'),
      })),
  );
  await writeFile(`${aRoot}/states/C-topbar-panel-fields.json`, JSON.stringify(panelFields, null, 2));
  console.log(`  state: C-editor-topbar-panel (${panelFields.length} fields)`);

  // --- States D/E/F/G: status bar variants --------------------------------
  await setControl(page, '定位', true);
  await snap('D-location-on', STATUS_BAR);
  await setControl(page, '定位', false);

  await setControl(page, '充电', true);
  await snap('E-charging-on', STATUS_BAR);
  await setControl(page, '充电', false);

  await setControl(page, '电池百分比', false);
  await snap('F-battery-pct-off', STATUS_BAR);
  await setControl(page, '电池百分比', true);

  for (const s of [2, 4]) {
    await setControl(page, '蜂窝信号', s);
    await snap(`G-signal-${s}`, STATUS_BAR);
  }
  await setControl(page, '蜂窝信号', 3);

  // back to the order-info panel
  await page.locator('#editor-ct button:has-text("编辑订单信息")').click();
  await page.waitForTimeout(400);

  // --- Taobao-only states -------------------------------------------------
  if (t.id === 'taobao') {
    await setControl(page, '展示扣减详情', true);
    await snap('K-deduct-detail-on', { screen: '#screen' });
    await page.locator('#screen').screenshot({ path: `${sRoot}/states/K-deduct-detail-screen.png` });
    const dFields = await page.evaluate(() =>
      [...document.querySelectorAll('#editor-ct .mb-4')]
        .filter((d) => d.offsetParent !== null)
        .map((d) => ({ label: d.querySelector('label')?.textContent?.trim(), value: d.querySelector('input')?.value })),
    );
    await writeFile(`${aRoot}/states/K-deduct-editor-fields.json`, JSON.stringify(dFields, null, 2));
    await page.locator('#editor-ct').screenshot({ path: `${sRoot}/states/K-deduct-editor.png` });
    console.log(`  state: K-deduct-detail-on (${dFields.length} editor fields)`);
    await setControl(page, '展示扣减详情', false);

    await page.locator('#dropdownDefaultButton').click();
    await page.waitForTimeout(400);
    await page.locator('#dropdown').screenshot({ path: `${sRoot}/states/L-order-status-dropdown.png` });
    await snap('L-order-status-dropdown', { dropdown: '#dropdown' });
    await page.locator('#dropdownDefaultButton').click();
    await page.waitForTimeout(300);
  }

  // --- Hover sweep --------------------------------------------------------
  const hoverTargets = [
    ['nav-link', '#separator-sidebar ul:nth-of-type(2) li:first-child a'],
    ['generate-btn', '#generatePic'],
    ['topbar-toggle-btn', '#editor-ct button:has-text("编辑信号与时间")'],
  ];
  const hovers = {};
  for (const [name, sel] of hoverTargets) {
    const loc = page.locator(sel).first();
    if (!(await loc.count())) continue;
    const before = await loc.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { backgroundColor: cs.backgroundColor, color: cs.color, boxShadow: cs.boxShadow, transition: cs.transition, transform: cs.transform, opacity: cs.opacity };
    });
    await loc.hover();
    await page.waitForTimeout(400);
    const after = await loc.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { backgroundColor: cs.backgroundColor, color: cs.color, boxShadow: cs.boxShadow, transition: cs.transition, transform: cs.transform, opacity: cs.opacity };
    });
    hovers[name] = { selector: sel, before, after, changed: Object.keys(before).filter((k) => before[k] !== after[k]) };
  }
  await writeFile(`${aRoot}/states/hover-states.json`, JSON.stringify(hovers, null, 2));
  console.log(`  hover: ${Object.keys(hovers).join(', ')}`);

  // --- Scroll sweep: does anything change on scroll? ----------------------
  const scrollProbe = async (y) => {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(500);
    return page.evaluate(() => {
      const pick = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { position: cs.position, top: cs.top, boxShadow: cs.boxShadow, backgroundColor: cs.backgroundColor, height: cs.height, zIndex: cs.zIndex, rectTop: +r.top.toFixed(1) };
      };
      return { scrollY: window.scrollY, nav: pick('body > nav'), navSidebar: pick('#separator-sidebar'), editor: pick('#editor-ct') };
    });
  };
  const scrollStates = [];
  for (const y of [0, 200, 600, 1200, 99999]) scrollStates.push(await scrollProbe(y));
  await writeFile(`${aRoot}/states/scroll-states.json`, JSON.stringify(scrollStates, null, 2));
  console.log(`  scroll probes: ${scrollStates.map((s) => s.scrollY).join(', ')}`);
  await page.evaluate(() => window.scrollTo(0, 0));

  // --- Responsive sweep ---------------------------------------------------
  const responsive = {};
  for (const w of [1440, 1024, 900, 768, 767, 640, 390]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(500);
    responsive[w] = await page.evaluate(() => {
      const pick = (sel) => {
        const el = document.querySelector(sel);
        if (!el) return null;
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return { display: cs.display, position: cs.position, width: cs.width, w: +r.width.toFixed(1), visible: r.width > 0 && r.height > 0, overflowY: cs.overflowY, height: cs.height };
      };
      const flexRow = document.querySelector('.max-w-\\[1440px\\] > .flex');
      return {
        nav: pick('body > nav'),
        navSidebar: pick('#separator-sidebar'),
        screenCt: pick('.screen-ct'),
        editor: pick('#editor-ct'),
        mobileToggleVisible: (() => {
          const b = document.querySelector('.md\\:hidden button');
          if (!b) return false;
          const r = b.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        })(),
        rowFlexDirection: flexRow ? getComputedStyle(flexRow).flexDirection : null,
        bodyScrollWidth: document.body.scrollWidth,
      };
    });
  }
  await writeFile(`${aRoot}/states/responsive-states.json`, JSON.stringify(responsive, null, 2));
  console.log(`  responsive widths: ${Object.keys(responsive).join(', ')}`);

  // --- Mobile nav toggle --------------------------------------------------
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${sRoot}/states/M-mobile-nav-closed.png`, fullPage: false });
  const toggle = page.locator('.md\\:hidden button').first();
  if (await toggle.count()) {
    console.log(`  mobile toggle text (closed): ${(await toggle.textContent())?.trim()}`);
    await toggle.click();
    await page.waitForTimeout(500);
    console.log(`  mobile toggle text (open):   ${(await toggle.textContent())?.trim()}`);
    await page.screenshot({ path: `${sRoot}/states/M-mobile-nav-open.png`, fullPage: false });
    await toggle.click();
    await page.waitForTimeout(300);
  }

  await ctx.close();
}

await browser.close();
console.log('\nsweep done');
