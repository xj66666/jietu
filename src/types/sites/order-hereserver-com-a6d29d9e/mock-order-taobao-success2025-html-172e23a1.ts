/**
 * State for the 淘宝交易成功订单生成器(2025 新版)clone.
 * Source: https://order.hereserver.com/mock-order/taobao/success2025.html
 *
 * Key names are the target's Vue data keys verbatim.
 */
import type { CanvasUploads, StatusBarState } from "./shared";

/** The five rows revealed by 展示扣减详情. */
export interface TaobaoDeductDetail {
  /** 扣减详情-商品总价 */
  total: string;
  /** 扣减详情-运费 */
  deliveryFee: string;
  /** 扣减详情-店铺优惠 */
  shopDiscount: string;
  /** 扣减详情-淘金币抵扣 */
  taocoin: string;
  /** 扣减详情-红包 */
  coupon: string;
}

export interface TaobaoSuccessContent {
  /** 状态 — 30px headline in the canvas title bar. */
  headTitle: string;
  /** 物流状态 — orange badge next to the parcel icon. */
  data3_1: string;
  /** 收货信息1 — truncated at 404px. */
  headerAddress: string;
  /** 店铺名 */
  selectedShopName: string;
  /** 店铺描述 */
  shopTag: string;
  /** 商品名 — clamped to a single 20px line. */
  selectedProductTitle: string;
  /** 款式 — note the target's default keeps a trailing space. */
  selectedSkuItemText: string;
  /** 7 天无理由退货 — green after-sales blurb. */
  data10: string;
  /** 共减总额 */
  deductTotal: string;
  /** 展示扣减详情 — also flips the chevron beside 实付款 from rotate-90 to -rotate-90. */
  showDeductDetail: boolean;
  deductDetail: TaobaoDeductDetail;
  /** 价格 — split into yuan/fen. */
  selectedPrice: string;
  /** 原价 — grey secondary price. */
  productPrice2: string;
  /** 数量 */
  data19: number;
  /** 实付款 — split into yuan/fen. */
  data12: string;
  /** 订单编号 — randomised per load upstream; pinned here for hydration stability. */
  data13: string;
  /** 收货信息2 — masked full address in the order-info block. */
  data1: string;
  /** 支付宝交易号 — randomised per load upstream; pinned here. */
  data14: string;
  /** 订单日期 — grey date beside the 订单信息 heading. */
  orderDate: string;
  /** 创建时间 */
  data15: string;
  /** 付款时间 */
  data16: string;
  /** 发货时间 */
  data17: string;
  /** 成交时间 */
  data17_1: string;
  /** 延长收货|评价 — leftmost footer button. */
  bottomBtns1: string;
  /** 查看物流|加入购物车 — middle footer button. */
  bottomBtns2: string;
  /** 确认收货|再买一单 — orange primary footer button. */
  bottomBtns3: string;
}

/**
 * The three buttons under the product row. The target has no editor fields for
 * these, so they are fixed content rather than state.
 */
export const TAOBAO_PRODUCT_BUTTONS = ["闲鱼转卖", "申请售后", "加入购物车"] as const;

export interface TaobaoSuccessState extends TaobaoSuccessContent, StatusBarState, CanvasUploads {}
