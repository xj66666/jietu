/**
 * Public paths for assets downloaded from order.hereserver.com.
 * Kept in one place so the download scripts and the components can't drift apart.
 *
 * Populated by:
 *   scripts/download-assets-order-hereserver-com-a6d29d9e-shared.mjs
 *   scripts/download-assets-order-hereserver-com-a6d29d9e-mock-order-pdd-order-html-f0d21aee.mjs
 *   scripts/download-assets-order-hereserver-com-a6d29d9e-mock-order-taobao-success2025-html-172e23a1.mjs
 */

const SITE = "/sites/order-hereserver-com-a6d29d9e";

export const SHARED_ASSETS = {
  /** 顶栏 logo,原图 120×120,渲染 32×32。 */
  siteLogo: `${SITE}/shared/images/site-logo.png`,
  /** 画布默认商品图,原图 800×800,渲染 122×122。 */
  productDefault: `${SITE}/shared/images/product-default.webp`,
  /** 编辑器登录条头像,原图 48×48,渲染 20×20。 */
  loginAvatar: `${SITE}/shared/images/login-avatar.png`,
  /** 默认店铺 Logo,原图 120×119。两页共用。 */
  shopLogoDefault: `${SITE}/shared/icons/shop-logo-default.png`,
  /** 灰色右箭头,原图 36×36。两页多处复用。 */
  chevronRight: `${SITE}/shared/icons/chevron-right.png`,
} as const;

export const PDD_ASSETS = {
  /**
   * 画布背景图,原图 1179×2556(iPhone 原生分辨率),以 `cover` 渲染为 589.5×1278。
   * 这张图烤进了全部行标签、按钮与底栏 —— 是承重结构,不是装饰。
   */
  canvasBackground: `${SITE}/mock-order-pdd-order-html-f0d21aee/images/pdd-bg.compressed.png`,
  /** 「已签收」绿色货车,原图 66×66,渲染 32×32。 */
  deliveryTruck: `${SITE}/mock-order-pdd-order-html-f0d21aee/icons/delivery-truck.png`,
} as const;

export const TAOBAO_ASSETS = {
  /** 标题栏返回箭头,原图 66×66,渲染 32×32。 */
  headerBack: `${SITE}/mock-order-taobao-success2025-html-172e23a1/icons/header-back.png`,
  /** 标题栏「•••」,原图 66×66,渲染 32×32。 */
  headerMore: `${SITE}/mock-order-taobao-success2025-html-172e23a1/icons/header-more.png`,
  /** 「已签收」橙色包裹,原图 46×45,渲染 22×22。 */
  logisticsBox: `${SITE}/mock-order-taobao-success2025-html-172e23a1/icons/logistics-box.png`,
  /** 底栏旺旺客服,原图 66×66,渲染 28×28。 */
  wangwang: `${SITE}/mock-order-taobao-success2025-html-172e23a1/icons/wangwang.png`,
  /** 底栏「更多」三点,原图 66×66,渲染 28×28。 */
  moreDots: `${SITE}/mock-order-taobao-success2025-html-172e23a1/icons/more-dots.png`,
  /** 收货信息行的划掉眼睛,原图 36×36,渲染 16×16。 */
  eyeOff: `${SITE}/mock-order-taobao-success2025-html-172e23a1/icons/eye-off.png`,
} as const;
