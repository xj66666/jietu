// Page-scoped assets for https://order.hereserver.com/mock-order/pdd/order.html
//
// The pdd canvas composites Vue-rendered text over a static background PNG that bakes in
// every row label (拼单价 / 平台优惠 / 订单编号 / …), the action buttons and the bottom bar.
// That PNG is therefore load-bearing, not decoration.
//
// Usage: node scripts/download-assets-order-hereserver-com-a6d29d9e-mock-order-pdd-order-html-f0d21aee.mjs
import { download, batched, indexDataUris, writeDataUri, report } from './clone-tools/download-lib.mjs';

const PAGE = 'public/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee';
const RESEARCH = 'docs/research/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee';

report(
  'pdd remote assets',
  await batched(
    [
      [
        'https://order.hereserver.com/mock-order/pdd/img/pdd-bg.compressed.png',
        `${PAGE}/images/pdd-bg.compressed.png`,
      ],
    ].map(([url, dest]) => () => download(url, dest)),
    4,
  ),
);

const index = await indexDataUris([`${RESEARCH}/rendered-screen.html`]);

report(
  'pdd canvas icons (from inline base64)',
  await batched(
    [
      ['48b95d8886d5', `${PAGE}/icons/delivery-truck.png`], // 66x66 绿色货车 —— 「已签收」状态图标
    ].map(([hash, dest]) => () => writeDataUri(index, hash, dest)),
    4,
  ),
);
