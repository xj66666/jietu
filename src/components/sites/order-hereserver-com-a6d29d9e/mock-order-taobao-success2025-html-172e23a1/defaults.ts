import type {
  TaobaoSuccessState,
} from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1";
import { SHARED_ASSETS } from "../shared/assets";
import { STATUS_BAR_DEFAULTS } from "../shared/status-bar-defaults";

/**
 * Defaults read off the live page with Playwright. `data13` and `data14` are randomised
 * per load upstream and are pinned here to observed values so server and client markup
 * agree; the editor still lets you change them.
 *
 * See docs/research/.../mock-order-taobao-success2025-html-172e23a1/editor-fields.json
 * and states/K-deduct-editor-fields.json.
 */
export const TAOBAO_SUCCESS_DEFAULTS: TaobaoSuccessState = {
  ...STATUS_BAR_DEFAULTS,

  headTitle: "交易成功",
  data3_1: "已签收",
  headerAddress: "王小花 86-189****3501 送至 华阳...",
  selectedShopName: "苹果官方旗舰店",
  shopTag: "88VIP好评率97%，客服平均16秒回复",
  selectedProductTitle: "苹果 iPhone 14 Pro 128GB 星夜黑 移动联通电信5G手机 双卡双待",
  // The target's default keeps a trailing space here.
  selectedSkuItemText: "黑色 128G ",
  data10: "极速退款 7天无理由退换",
  deductTotal: "10.01",
  showDeductDetail: false,
  deductDetail: {
    total: "100.00",
    deliveryFee: "0",
    shopDiscount: "0",
    taocoin: "2.82",
    coupon: "2.01",
  },
  selectedPrice: "2999.01",
  productPrice2: "6.93",
  data19: 1,
  data12: "1998.01",
  data13: "3223856491885473883",
  data1: "王**, 86-181****3509, 浙江省 杭州市 余杭区 万科园区 **********",
  data14: "9722569586423222846428517492",
  orderDate: "2025-11-13",
  data15: "2025-11-13 01:13:40",
  data16: "2025-11-13 01:13:47",
  data17: "2025-11-13 08:37:38",
  data17_1: "2025-11-23 08:37:47",
  bottomBtns1: "闲鱼转卖",
  bottomBtns2: "加入购物车",
  bottomBtns3: "再买一单",

  selectedPic: SHARED_ASSETS.productDefault,
  selectedShopLogoSrc: SHARED_ASSETS.shopLogoDefault,
};
