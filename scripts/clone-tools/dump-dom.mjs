// Dump the post-hydration DOM plus every editor field's default value.
// The bundle is obfuscated, so the rendered DOM is the only reliable source of truth
// for injected chrome (iOS status bar, watermark, login strip) and for Vue's default data.
// Usage: node scripts/clone-tools/dump-dom.mjs [pdd|taobao]
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { TARGETS, LAUNCH, GOTO, artifactRoot } from './config.mjs';

const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.id === only) : TARGETS;

/** Walk the editor sidebar pairing each control with the label that precedes it. */
const READ_EDITOR_FIELDS = () => {
  const root = document.getElementById('editor-ct');
  if (!root) return { error: 'no #editor-ct' };
  const controls = [...root.querySelectorAll('input, select, textarea, button, a')];
  return controls.map((el, i) => {
    // The label is either an ancestor's <label> or the nearest preceding label text.
    const wrapper = el.closest('.mb-4, .p-6, div');
    const label = wrapper?.querySelector('label')?.textContent?.trim().replace(/\s+/g, ' ') ?? null;
    return {
      index: i,
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('type'),
      label,
      id: el.id || null,
      value: el.tagName === 'INPUT' && el.type === 'checkbox' ? el.checked : (el.value ?? null),
      min: el.getAttribute('min'),
      max: el.getAttribute('max'),
      text: el.tagName === 'BUTTON' || el.tagName === 'A' ? el.textContent.trim().replace(/\s+/g, ' ') : null,
      href: el.tagName === 'A' ? el.getAttribute('href') : null,
      visible: !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length),
      classes: el.className?.toString(),
    };
  });
};

/** Everything the target renders inside the preview canvas, as text, in document order. */
const READ_SCREEN_TEXT = () => {
  const root = document.getElementById('screen');
  if (!root) return { error: 'no #screen' };
  const out = [];
  const walk = (el, depth) => {
    for (const node of el.childNodes) {
      if (node.nodeType === 3) {
        const t = node.textContent.replace(/\s+/g, ' ').trim();
        if (t) out.push({ depth, text: t, parentTag: el.tagName.toLowerCase(), parentClass: el.className?.toString()?.slice(0, 140) });
      } else if (node.nodeType === 1) {
        walk(node, depth + 1);
      }
    }
  };
  walk(root, 0);
  return out;
};

await mkdir('docs/research', { recursive: true });
const browser = await chromium.launch(LAUNCH);

for (const t of targets) {
  const aRoot = artifactRoot(t.pageKey);
  await mkdir(aRoot, { recursive: true });
  console.log(`\n=== ${t.id} ===`);

  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(t.url, GOTO);
  await page.waitForTimeout(3000);

  const screenHtml = await page.locator('#screen').evaluate((el) => el.outerHTML);
  const editorHtml = await page.locator('#editor-ct').evaluate((el) => el.outerHTML);
  const navHtml = await page.locator('#separator-sidebar').evaluate((el) => el.outerHTML);
  const topbarHtml = await page.locator('body > nav').first().evaluate((el) => el.outerHTML);
  const bodyOpen = await page.evaluate(() => ({
    bodyClass: document.body.className,
    // Anything the bundle appended directly to <body> that is not in the static HTML.
    directChildren: [...document.body.children].map((c) => ({
      tag: c.tagName.toLowerCase(),
      id: c.id,
      cls: c.className?.toString()?.slice(0, 120),
      text: c.textContent?.replace(/\s+/g, ' ').trim().slice(0, 80),
    })),
  }));

  const fields = await page.evaluate(READ_EDITOR_FIELDS);
  const screenText = await page.evaluate(READ_SCREEN_TEXT);

  await writeFile(`${aRoot}/rendered-screen.html`, screenHtml);
  await writeFile(`${aRoot}/rendered-editor.html`, editorHtml);
  await writeFile(`${aRoot}/rendered-nav.html`, navHtml);
  await writeFile(`${aRoot}/rendered-topbar.html`, topbarHtml);
  await writeFile(`${aRoot}/rendered-body-shell.json`, JSON.stringify(bodyOpen, null, 2));
  await writeFile(`${aRoot}/editor-fields.json`, JSON.stringify(fields, null, 2));
  await writeFile(`${aRoot}/screen-text.json`, JSON.stringify(screenText, null, 2));

  console.log(`  screen html: ${screenHtml.length} chars`);
  console.log(`  editor fields: ${Array.isArray(fields) ? fields.length : 'ERR'}`);
  console.log(`  screen text nodes: ${Array.isArray(screenText) ? screenText.length : 'ERR'}`);
  console.log(`  body direct children: ${bodyOpen.directChildren.map((c) => c.tag + (c.id ? '#' + c.id : '')).join(', ')}`);

  await ctx.close();
}

await browser.close();
console.log('\ndump-dom done');
