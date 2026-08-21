// Deep per-section computed-style walk + rendered HTML for every state that changes layout.
// Output feeds the component spec files directly.
// Usage: node scripts/clone-tools/deep-extract.mjs [pdd|taobao]
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { TARGETS, LAUNCH, GOTO, artifactRoot } from './config.mjs';

const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.id === only) : TARGETS;

const PROPS = [
  'fontSize', 'fontWeight', 'fontFamily', 'lineHeight', 'letterSpacing', 'color', 'fontStyle',
  'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'backgroundRepeat',
  'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft',
  'width', 'height', 'maxWidth', 'minWidth', 'maxHeight', 'minHeight',
  'display', 'flexDirection', 'flexGrow', 'flexShrink', 'flexBasis', 'justifyContent', 'alignItems', 'gap', 'columnGap', 'rowGap',
  'borderRadius', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
  'borderTopColor', 'borderBottomColor', 'borderLeftColor', 'borderRightColor',
  'boxShadow', 'overflow', 'overflowX', 'overflowY', 'visibility',
  'position', 'top', 'right', 'bottom', 'left', 'zIndex',
  'opacity', 'transform', 'transition', 'cursor',
  'objectFit', 'whiteSpace', 'textOverflow', 'textAlign', 'verticalAlign',
  'fontVariantNumeric', 'flex', 'textIndent', 'borderStyle',
];

const WALK_SRC = (selector, maxDepth, propList) => {
  const root = document.querySelector(selector);
  if (!root) return { error: 'not found: ' + selector };
  const styleOf = (el) => {
    const cs = getComputedStyle(el);
    const o = {};
    for (const p of propList) {
      const v = cs[p];
      if (v === undefined || v === null) continue;
      if (v === 'none' || v === 'normal' || v === 'auto' || v === '0px' || v === 'rgba(0, 0, 0, 0)' || v === '' || v === 'static' || v === 'visible') continue;
      o[p] = typeof v === 'string' && v.startsWith('url("data:') ? `url(data:[${v.length}])` : v;
    }
    return o;
  };
  const walk = (el, depth) => {
    const r = el.getBoundingClientRect();
    const kids = [...el.children];
    const textOnly = el.childNodes.length > 0 && [...el.childNodes].every((n) => n.nodeType === 3);
    const node = {
      tag: el.tagName.toLowerCase(),
      id: el.id || undefined,
      cls: el.className?.toString() || undefined,
      text: textOnly ? el.textContent.replace(/\s+/g, ' ').trim() : undefined,
      box: { w: +r.width.toFixed(2), h: +r.height.toFixed(2), x: +(r.x - (document.querySelector('#screen')?.getBoundingClientRect().x ?? 0)).toFixed(2), y: +(r.y - (document.querySelector('#screen')?.getBoundingClientRect().y ?? 0)).toFixed(2) },
      css: styleOf(el),
    };
    if (el.tagName === 'IMG') {
      node.img = {
        src: el.src?.startsWith('data:') ? `data:[${el.src.length}]` : el.src,
        isDataUri: !!el.src?.startsWith('data:'),
        alt: el.alt,
        nw: el.naturalWidth,
        nh: el.naturalHeight,
      };
    }
    if (el.tagName.toLowerCase() === 'svg') node.svgOuter = el.outerHTML;
    if (depth < maxDepth && el.tagName.toLowerCase() !== 'svg') {
      node.children = kids.map((c) => walk(c, depth + 1));
    } else if (kids.length) {
      node.truncatedChildren = kids.length;
    }
    return node;
  };
  return walk(root, 0);
};

async function setControl(page, label, value) {
  const row = page.locator('#editor-ct .mb-4', { has: page.locator(`label:text-is("${label}")`) }).first();
  const input = row.locator('input').first();
  const type = await input.getAttribute('type');
  if (type === 'checkbox') {
    if ((await input.isChecked()) !== value) await input.setChecked(value);
  } else {
    await input.fill(String(value));
  }
  await page.waitForTimeout(450);
}

const browser = await chromium.launch(LAUNCH);

for (const t of targets) {
  const aRoot = artifactRoot(t.pageKey);
  await mkdir(`${aRoot}/styles`, { recursive: true });
  await mkdir(`${aRoot}/states`, { recursive: true });
  console.log(`\n=== deep-extract ${t.id} ===`);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(t.url, GOTO);
  await page.waitForTimeout(3000);
  await page.evaluate(`window.__WALK = ${WALK_SRC.toString()}`);

  const walk = (sel, depth = 8) => page.evaluate(([s, d, p]) => window.__WALK(s, d, p), [sel, depth, PROPS]);

  const SECTIONS = {
    'topbar': 'body > nav',
    'nav-sidebar': '#separator-sidebar',
    'mobile-toggle-row': '.max-w-\\[1440px\\] .md\\:hidden',
    'screen-container': '.screen-ct',
    'screen': '#screen',
    'ios-bar': '#screen .ios-bar',
    'android-bar': '#screen .material-top-bar',
    'editor': '#editor-ct',
  };

  for (const [name, sel] of Object.entries(SECTIONS)) {
    const data = await walk(sel, name === 'screen' || name === 'editor' ? 10 : 8);
    await writeFile(`${aRoot}/styles/${name}.json`, JSON.stringify(data, null, 2));
    console.log(`  styles: ${name}${data.error ? ' -> ' + data.error : ''}`);
  }

  // Rendered HTML of state-dependent chrome, both variants.
  const grab = async (sel) => page.locator(sel).first().evaluate((el) => el.outerHTML).catch(() => null);
  const iosHtml = await grab('#screen .ios-bar');
  const androidHtmlDefault = await grab('#screen .material-top-bar');

  await setControl(page, '安卓状态栏', true);
  const androidHtmlOn = await grab('#screen .material-top-bar');
  const androidStyles = await walk('#screen .material-top-bar', 8);
  await writeFile(`${aRoot}/styles/android-bar-active.json`, JSON.stringify(androidStyles, null, 2));
  await setControl(page, '安卓状态栏', false);

  // iOS bar variants that add/remove nodes.
  const iosVariants = {};
  for (const [key, ops] of Object.entries({
    'signal-2': [['蜂窝信号', 2]],
    'signal-3': [['蜂窝信号', 3]],
    'signal-4': [['蜂窝信号', 4]],
    'location-on': [['定位', true]],
    'charging-on': [['充电', true]],
    'battery-pct-off': [['电池百分比', false]],
  })) {
    await page.locator('#editor-ct button:has-text("编辑信号与时间")').click().catch(() => {});
    await page.waitForTimeout(300);
    for (const [l, v] of ops) await setControl(page, l, v);
    iosVariants[key] = await grab('#screen .ios-bar');
    for (const [l, v] of ops) await setControl(page, l, typeof v === 'boolean' ? !v : 3);
    await page.locator('#editor-ct button:has-text("编辑订单信息")').click().catch(() => {});
    await page.waitForTimeout(250);
  }

  await writeFile(
    `${aRoot}/states/status-bar-html.json`,
    JSON.stringify({ iosDefault: iosHtml, androidDefault: androidHtmlDefault, androidActive: androidHtmlOn, iosVariants }, null, 2),
  );
  console.log(`  status-bar html variants: ${Object.keys(iosVariants).join(', ')}`);

  // Injected overlays outside #screen: paywall + tippy tooltips.
  const overlays = await page.evaluate(() => {
    const out = {};
    for (const id of ['pwall', 'tippy-1', 'tippy-2']) {
      const el = document.getElementById(id);
      if (!el) continue;
      const cs = getComputedStyle(el);
      out[id] = {
        outerHTML: el.outerHTML.slice(0, 4000),
        text: el.textContent?.replace(/\s+/g, ' ').trim(),
        css: { position: cs.position, top: cs.top, left: cs.left, zIndex: cs.zIndex, display: cs.display, visibility: cs.visibility, transform: cs.transform, width: cs.width, height: cs.height, backgroundColor: cs.backgroundColor, color: cs.color, fontSize: cs.fontSize, borderRadius: cs.borderRadius, padding: cs.padding },
        rect: el.getBoundingClientRect().toJSON(),
      };
    }
    // Tippy reference elements — what they are attached to.
    out._tippyRefs = [...document.querySelectorAll('[data-tippy-root], [aria-describedby^="tippy"]')].map((el) => ({
      tag: el.tagName.toLowerCase(),
      cls: el.className?.toString()?.slice(0, 160),
      describedBy: el.getAttribute('aria-describedby'),
      text: el.textContent?.replace(/\s+/g, ' ').trim().slice(0, 60),
    }));
    return out;
  });
  await writeFile(`${aRoot}/states/overlays.json`, JSON.stringify(overlays, null, 2));
  console.log(`  overlays: ${Object.keys(overlays).filter((k) => !k.startsWith('_')).join(', ')}`);

  // Taobao: the deduct-detail expansion changes both the canvas and the editor.
  if (t.id === 'taobao') {
    await setControl(page, '展示扣减详情', true);
    const dScreen = await walk('#screen', 10);
    await writeFile(`${aRoot}/styles/screen-deduct-detail-on.json`, JSON.stringify(dScreen, null, 2));
    await writeFile(`${aRoot}/states/screen-deduct-detail-on.html`, await grab('#screen'));
    await writeFile(`${aRoot}/states/editor-deduct-detail-on.html`, await grab('#editor-ct'));
    console.log('  styles: screen-deduct-detail-on');
    await setControl(page, '展示扣减详情', false);

    await page.locator('#dropdownDefaultButton').click();
    await page.waitForTimeout(350);
    await writeFile(`${aRoot}/states/order-status-dropdown.html`, await grab('#dropdown'));
    await writeFile(`${aRoot}/styles/order-status-dropdown.json`, JSON.stringify(await walk('#dropdown', 6), null, 2));
    console.log('  styles: order-status-dropdown');
  }

  await ctx.close();
}

await browser.close();
console.log('\ndeep-extract done');
