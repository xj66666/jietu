import type { PddOrderState } from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee";
import { SHARED_ASSETS } from "../shared/assets";
import { STATUS_BAR_DEFAULTS } from "../shared/status-bar-defaults";

/**
 * Defaults read straight off the live page with Playwright (input values + rendered
 * text). See docs/research/.../mock-order-pdd-order-html-f0d21aee/editor-fields.json.
 *
 * `data13` is randomised per load upstream. It is pinned to one observed value so the
 * server and client render the same markup; the editor still lets you change it.
 */
export const PDD_ORDER_DEFAULTS: PddOrderState = {
  ...STATUS_BAR_DEFAULTS,

  headTitle: "已签收 已按承诺时间送达",
  data3_1: "已签收",
  headerAddress: "5天前［菜鸟驿站］海口市万科园区三幢四区",
  address: "张三丰 188****3123",
  city: "海口市三亚区",
  headerPhone: "万科园区 86-189****3501",
  selectedShopName: "苹果官方旗舰店",
  selectedProductTitle: "苹果 iPhone 14 Pro 128GB 星夜黑 移动联通电信5G手机 双卡双待",
  // The target's default keeps a trailing space here.
  selectedSkuItemText: "黑色 128G ",
  deductTotal: "10.01",
  pinDanJia: "9.9",
  pingTaiYouHui: "10.01",
  duoduoLiJian: "8.01",
  selectedPrice: "2999.01",
  data19: 1,
  data12: "1998.01",
  data13: "429231-3427912734114563867",
  data15: "2025-11-13 01:13:40",
  data16: "2025-11-13 01:13:47",
  data17: "2025-11-13 08:37:38",
  // 成交时间 — not present on the target; seeded from the Taobao page's same-named field.
  data17_1: "2025-11-23 08:37:47",
  payMethod: "多多支付",
  payCard: "工商银行储蓄卡(2023)支付¥3.12",
  logisticsName: "圆通快递",
  logisticsNo: "YT9917335767750",

  selectedPic: SHARED_ASSETS.productDefault,
  selectedShopLogoSrc: SHARED_ASSETS.shopLogoDefault,
  // Empty on load — the target skips rendering both <img> elements entirely, letting
  // the baked-in background art show through.
  userAvatar: null,
  logisticsLogo: null,
};
