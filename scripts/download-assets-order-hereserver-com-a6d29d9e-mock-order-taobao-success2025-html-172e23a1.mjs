// Page-scoped assets for https://order.hereserver.com/mock-order/taobao/success2025.html
//
// This canvas renders entirely from the DOM (its #screen background-image is commented out
// upstream), so every glyph is either text or one of the inline base64 icons pulled below.
//
// Usage: node scripts/download-assets-order-hereserver-com-a6d29d9e-mock-order-taobao-success2025-html-172e23a1.mjs
import { batched, indexDataUris, writeDataUri, report } from './clone-tools/download-lib.mjs';

const PAGE = 'public/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1';
const RESEARCH = 'docs/research/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1';

const index = await indexDataUris([`${RESEARCH}/rendered-screen.html`]);

report(
  'taobao canvas icons (from inline base64)',
  await batched(
    [
      // Note: in the source markup the ••• blob is the FIRST <img> and the chevron the
      // second, but they render right/left respectively via justify-between. Named by
      // what they actually are, verified against the rendered PNGs.
      ['45b853fa6918', `${PAGE}/icons/header-more.png`], // 66x66 三点「•••」—— 标题栏右侧
      ['b1109c32d8c3', `${PAGE}/icons/header-back.png`], // 66x66 返回箭头「<」—— 标题栏左侧
      ['5f24f93eddfc', `${PAGE}/icons/logistics-box.png`], // 46x45 橙色包裹图标 —— 「已签收」
      ['4da9604221ee', `${PAGE}/icons/wangwang.png`], // 66x66 旺旺客服
      ['f7e95b14bcd9', `${PAGE}/icons/more-dots.png`], // 66x66 底部「更多」
      ['89e7029c9f58', `${PAGE}/icons/eye-off.png`], // 36x36 收货信息「隐藏」图标
    ].map(([hash, dest]) => () => writeDataUri(index, hash, dest)),
    4,
  ),
);
