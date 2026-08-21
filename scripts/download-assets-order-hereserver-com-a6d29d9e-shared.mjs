// Downloads the assets shared by every order.hereserver.com clone page:
// self-hosted fonts, the site logo, the default product photo, the login-strip avatar,
// and the iOS status-bar icon set that f.css inlines as base64.
//
// Usage: node scripts/download-assets-order-hereserver-com-a6d29d9e-shared.mjs
import { download, batched, indexDataUris, writeDataUri, report } from './clone-tools/download-lib.mjs';

const SHARED = 'public/sites/order-hereserver-com-a6d29d9e/shared';
const FONT_BASE = 'https://order.hereserver.com/mock-order/font';

const remote = [
  // Self-hosted faces declared in mock-order/font/f.css.
  [`${FONT_BASE}/sf-pro-text_regular.07bdfc6e.woff2`, `${SHARED}/fonts/sf-pro-text-regular.woff2`],
  [`${FONT_BASE}/sf-pro-text_medium.dcc28d6a.woff2`, `${SHARED}/fonts/sf-pro-text-medium.woff2`],
  [`${FONT_BASE}/sf-pro-text_semibold.a0c74f8f.woff2`, `${SHARED}/fonts/sf-pro-text-semibold.woff2`],
  [`${FONT_BASE}/WeChatNum.04b083e1.ttf`, `${SHARED}/fonts/WeChatNum.ttf`],
  // Site chrome + canvas defaults.
  ['https://order.hereserver.com/favicon.png', `${SHARED}/images/site-logo.png`],
  [
    'https://img.alicdn.com/img/i2/2215675276008/O1CN01EuOonx1uFiXH7Tn4k_!!2215675276008-2-alimamacc.png_.webp',
    `${SHARED}/images/product-default.webp`,
  ],
  [
    'https://gw.alicdn.com/imgextra/i1/O1CN01uLBB2V1kF7sKTyIQ6_!!6000000004653-2-tps-48-48.png',
    `${SHARED}/images/login-avatar.png`,
  ],
];

report(
  'remote shared assets',
  await batched(
    remote.map(([url, dest]) => () => download(url, dest)),
    4,
  ),
);

// The status-bar icons only exist as base64 inside f.css; pull them out by content hash.
const index = await indexDataUris(['.tmp-src/common/f.css']);

const statusBarIcons = [
  ['4832103cfc5e', `${SHARED}/status-bar/ios-location.png`], // 40x40 dark
  ['e8641702a9e5', `${SHARED}/status-bar/ios-location-white.png`], // 40x40 white variant
  ['79e7f466fccf', `${SHARED}/status-bar/ios-signal.png`], // 54x36 four-bar signal
  ['7a0d256d862c', `${SHARED}/status-bar/ios-signal-white.png`],
  ['8d6ccd9e1056', `${SHARED}/status-bar/ios-wifi.png`], // 63x45
  ['61ea0e82a955', `${SHARED}/status-bar/ios-wifi-white.png`],
  ['7138a3f39c47', `${SHARED}/status-bar/ios-battery.png`], // 83x41 empty shell
  ['6fa605be9fbf', `${SHARED}/status-bar/ios-battery-white.png`],
  ['dbaa911885a1', `${SHARED}/status-bar/ios-battery-charging.png`], // 19x26 bolt
];

report(
  'iOS status-bar icons (from f.css base64)',
  await batched(
    statusBarIcons.map(([hash, dest]) => () => writeDataUri(index, hash, dest)),
    9,
  ),
);

// Two canvas icons appear on both pages, so they belong in the shared namespace.
const RESEARCH = 'docs/research/order-hereserver-com-a6d29d9e';
const screenIndex = await indexDataUris([
  `${RESEARCH}/mock-order-pdd-order-html-f0d21aee/rendered-screen.html`,
  `${RESEARCH}/mock-order-taobao-success2025-html-172e23a1/rendered-screen.html`,
]);

const crossPageIcons = [
  ['c0216c1ff912', `${SHARED}/icons/shop-logo-default.png`], // 120x119 店铺 Logo / 品牌图标
  ['1100465f915c', `${SHARED}/icons/chevron-right.png`], // 36x36 灰色右箭头
];

report(
  'cross-page canvas icons',
  await batched(
    crossPageIcons.map(([hash, dest]) => () => writeDataUri(screenIndex, hash, dest)),
    2,
  ),
);
