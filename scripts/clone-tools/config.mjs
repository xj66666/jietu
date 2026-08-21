// Shared config for the clone-website reconnaissance / QA tooling.
// Values mirror docs/research/OUTPUT_PLAN.md — keep both in sync.

export const SITE_KEY = 'order-hereserver-com-a6d29d9e';

export const TARGETS = [
  {
    id: 'pdd',
    url: 'https://order.hereserver.com/mock-order/pdd/order.html',
    pageKey: 'mock-order-pdd-order-html-f0d21aee',
    route: '/mock-order/pdd/order.html',
  },
  {
    id: 'taobao',
    url: 'https://order.hereserver.com/mock-order/taobao/success2025.html',
    pageKey: 'mock-order-taobao-success2025-html-172e23a1',
    route: '/mock-order/taobao/success2025.html',
  },
];

export const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
];

export const artifactRoot = (pageKey) => `docs/research/${SITE_KEY}/${pageKey}`;
export const screenshotRoot = (pageKey) => `docs/design-references/${SITE_KEY}/${pageKey}`;
export const assetRoot = (pageKey) => `public/sites/${SITE_KEY}/${pageKey}`;

export const LAUNCH = { channel: 'chrome', headless: true };
export const GOTO = { waitUntil: 'networkidle', timeout: 120000 };
