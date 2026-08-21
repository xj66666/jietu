// Phase 1 reconnaissance: screenshots, global tokens, Vue default data, asset inventory.
// Usage: node scripts/clone-tools/recon.mjs [pdd|taobao]
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { TARGETS, VIEWPORTS, LAUNCH, GOTO, artifactRoot, screenshotRoot } from './config.mjs';

const only = process.argv[2];
const targets = only ? TARGETS.filter((t) => t.id === only) : TARGETS;

/** Read the mounted Vue 3 app's reactive data straight off the root element. */
const READ_VUE_DATA = () => {
  const el = document.getElementById('app');
  const app = el && el.__vue_app__;
  if (!app) return { error: 'no __vue_app__ on #app' };
  const proxy = app._instance && app._instance.proxy;
  if (!proxy) return { error: 'no root instance proxy' };
  const raw = {};
  // $data holds everything returned by data(); JSON round-trip strips reactivity.
  for (const [k, v] of Object.entries(proxy.$data || {})) {
    try {
      raw[k] = JSON.parse(JSON.stringify(v));
    } catch {
      raw[k] = `<<unserializable ${typeof v}>>`;
    }
  }
  return {
    data: raw,
    computedKeys: Object.keys(app._instance.type.computed || {}),
    methodKeys: Object.keys(app._instance.type.methods || {}),
    propKeys: Object.keys(app._instance.type.props || {}),
  };
};

const READ_GLOBALS = () => {
  const uniq = (a) => [...new Set(a.filter(Boolean))];
  const sample = [...document.querySelectorAll('body *')].slice(0, 600);
  return {
    title: document.title,
    lang: document.documentElement.lang,
    metaDescription: document.querySelector('meta[name="description"]')?.content ?? null,
    metaViewport: document.querySelector('meta[name="viewport"]')?.content ?? null,
    canonical: document.querySelector('link[rel="canonical"]')?.href ?? null,
    jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent.trim()),
    favicons: [...document.querySelectorAll('link[rel*="icon"]')].map((l) => ({ rel: l.rel, href: l.href })),
    stylesheets: [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.href),
    scripts: [...document.querySelectorAll('script[src]')].map((s) => s.src),
    bodyClass: document.body.className,
    bodyId: document.body.id,
    htmlBg: getComputedStyle(document.documentElement).backgroundColor,
    bodyStyles: (() => {
      const cs = getComputedStyle(document.body);
      return {
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        color: cs.color,
        backgroundColor: cs.backgroundColor,
        webkitFontSmoothing: cs.webkitFontSmoothing,
        minHeight: cs.minHeight,
      };
    })(),
    fontFamiliesInUse: uniq(sample.map((el) => getComputedStyle(el).fontFamily)),
    // Every distinct declared @font-face family, from all reachable stylesheets.
    fontFaces: (() => {
      const out = [];
      for (const sheet of document.styleSheets) {
        let rules;
        try {
          rules = sheet.cssRules;
        } catch {
          out.push({ href: sheet.href, error: 'CORS-blocked' });
          continue;
        }
        for (const r of rules) {
          if (r.constructor.name === 'CSSFontFaceRule' || r.type === 5) {
            out.push({
              href: sheet.href,
              family: r.style.getPropertyValue('font-family'),
              src: r.style.getPropertyValue('src'),
              weight: r.style.getPropertyValue('font-weight'),
              style: r.style.getPropertyValue('font-style'),
              display: r.style.getPropertyValue('font-display'),
            });
          }
        }
      }
      return out;
    })(),
    colorsInUse: (() => {
      const tally = {};
      const bump = (k, v) => {
        if (!v || v === 'rgba(0, 0, 0, 0)' || v === 'transparent') return;
        tally[k] ??= {};
        tally[k][v] = (tally[k][v] || 0) + 1;
      };
      for (const el of sample) {
        const cs = getComputedStyle(el);
        bump('color', cs.color);
        bump('backgroundColor', cs.backgroundColor);
        bump('borderTopColor', cs.borderTopWidth !== '0px' ? cs.borderTopColor : null);
      }
      const top = (o) =>
        Object.entries(o || {})
          .sort((a, b) => b[1] - a[1])
          .slice(0, 30);
      return { color: top(tally.color), backgroundColor: top(tally.backgroundColor), borderColor: top(tally.borderTopColor) };
    })(),
    // Anything that could indicate a smooth-scroll library or global scroll behaviour.
    scrollSignals: {
      lenis: !!document.querySelector('.lenis, [data-lenis], html.lenis'),
      locomotive: !!document.querySelector('[data-scroll-container], .has-scroll-smooth'),
      htmlScrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      bodyScrollSnapType: getComputedStyle(document.body).scrollSnapType,
      knownLibs: ['Lenis', 'LocomotiveScroll', 'ScrollMagic', 'gsap', 'AOS', 'html2canvas', 'Vue'].filter((k) => k in window),
    },
  };
};

const READ_ASSETS = () => ({
  images: [...document.querySelectorAll('img')].map((img) => {
    const cs = getComputedStyle(img);
    return {
      src: img.src?.startsWith('data:') ? `data:${img.src.length}chars` : img.src || img.currentSrc,
      isDataUri: !!img.src?.startsWith('data:'),
      dataUriPrefix: img.src?.startsWith('data:') ? img.src.slice(0, 40) : null,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      renderedWidth: Math.round(img.getBoundingClientRect().width),
      renderedHeight: Math.round(img.getBoundingClientRect().height),
      classes: img.className?.toString(),
      parentClasses: img.parentElement?.className?.toString()?.slice(0, 120),
      siblingImgCount: img.parentElement ? img.parentElement.querySelectorAll('img').length : 0,
      position: cs.position,
      zIndex: cs.zIndex,
    };
  }),
  videos: [...document.querySelectorAll('video')].map((v) => ({
    src: v.src || v.querySelector('source')?.src,
    poster: v.poster,
    autoplay: v.autoplay,
    loop: v.loop,
    muted: v.muted,
  })),
  backgroundImages: [...document.querySelectorAll('*')]
    .filter((el) => {
      const bg = getComputedStyle(el).backgroundImage;
      return bg && bg !== 'none';
    })
    .map((el) => ({
      selector: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + (el.className?.toString()?.split(' ')[0] || ''),
      url: getComputedStyle(el).backgroundImage.slice(0, 200),
      size: getComputedStyle(el).backgroundSize,
      repeat: getComputedStyle(el).backgroundRepeat,
      position: getComputedStyle(el).backgroundPosition,
      color: getComputedStyle(el).backgroundColor,
    })),
  inlineSvgs: [...document.querySelectorAll('svg')].map((svg, i) => ({
    index: i,
    viewBox: svg.getAttribute('viewBox'),
    width: svg.getAttribute('width'),
    height: svg.getAttribute('height'),
    classes: svg.getAttribute('class'),
    renderedWidth: Math.round(svg.getBoundingClientRect().width),
    renderedHeight: Math.round(svg.getBoundingClientRect().height),
    pathCount: svg.querySelectorAll('path').length,
    fills: [...new Set([...svg.querySelectorAll('[fill]')].map((p) => p.getAttribute('fill')))],
    parentText: svg.parentElement?.parentElement?.textContent?.trim().slice(0, 40) || null,
    outerHTML: svg.outerHTML,
  })),
});

await mkdir('docs/research', { recursive: true });

const browser = await chromium.launch(LAUNCH);

for (const t of targets) {
  const aRoot = artifactRoot(t.pageKey);
  const sRoot = screenshotRoot(t.pageKey);
  await mkdir(aRoot, { recursive: true });
  await mkdir(`${aRoot}/components`, { recursive: true });
  await mkdir(sRoot, { recursive: true });

  console.log(`\n=== ${t.id} :: ${t.url} ===`);
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const failed = [];
  page.on('requestfailed', (r) => failed.push({ url: r.url(), err: r.failure()?.errorText }));
  await page.goto(t.url, GOTO);
  await page.waitForTimeout(2500);

  const globals = await page.evaluate(READ_GLOBALS);
  const vue = await page.evaluate(READ_VUE_DATA);
  const assets = await page.evaluate(READ_ASSETS);

  await writeFile(`${aRoot}/raw-globals.json`, JSON.stringify(globals, null, 2));
  await writeFile(`${aRoot}/raw-vue-data.json`, JSON.stringify(vue, null, 2));
  await writeFile(`${aRoot}/raw-assets.json`, JSON.stringify(assets, null, 2));
  await writeFile(`${aRoot}/raw-failed-requests.json`, JSON.stringify(failed, null, 2));

  console.log(`  vue keys: ${vue.data ? Object.keys(vue.data).length : 'ERR ' + vue.error}`);
  console.log(`  computed: ${(vue.computedKeys || []).length}, methods: ${(vue.methodKeys || []).length}`);
  console.log(`  imgs: ${assets.images.length}, bgImgs: ${assets.backgroundImages.length}, svgs: ${assets.inlineSvgs.length}`);
  console.log(`  fontFaces: ${globals.fontFaces.length}, failedReqs: ${failed.length}`);

  for (const vp of VIEWPORTS) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${sRoot}/full-${vp.name}.png`, fullPage: true });
    console.log(`  shot: full-${vp.name}.png`);
  }

  // The preview canvas is the pixel-critical artefact — capture it on its own at 1:1.
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.waitForTimeout(800);
  const screen = page.locator('#screen');
  if (await screen.count()) {
    await screen.screenshot({ path: `${sRoot}/screen-canvas.png` });
    console.log('  shot: screen-canvas.png');
  }
  const editor = page.locator('#editor-ct');
  if (await editor.count()) {
    await editor.screenshot({ path: `${sRoot}/editor-panel.png` });
    console.log('  shot: editor-panel.png');
  }
  const nav = page.locator('#separator-sidebar');
  if (await nav.count()) {
    await nav.screenshot({ path: `${sRoot}/nav-sidebar.png` });
    console.log('  shot: nav-sidebar.png');
  }

  await ctx.close();
}

await browser.close();
console.log('\nrecon done');
