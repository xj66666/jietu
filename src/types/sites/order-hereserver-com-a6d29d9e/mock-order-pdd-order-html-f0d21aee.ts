/**
 * State for the 拼多多订单生成器 clone.
 * Source: https://order.hereserver.com/mock-order/pdd/order.html
 *
 * Key names are the target's Vue data keys verbatim — including the opaque
 * `dataNN` ones — so每个字段都能直接对回 docs/research 里的 spec。
 */
import type { CanvasUploads, StatusBarState } from "./shared";

export interface PddOrderContent {
  /** 状态 — green headline above the logistics row. */
  headTitle: string;
  /** 物流状态 — no editor field on the target; pinned to 已签收. */
  data3_1: string;
  /** 收货信息1 — logistics summary line. Truncated at 404px. */
  headerAddress: string;
  /** 收货信息2 — recipient name + masked phone. */
  address: string;
  /** 收货信息2城市 */
  city: string;
  /** 收货信息3 — estate + masked phone. */
  headerPhone: string;
  /** 店铺名 */
  selectedShopName: string;
  /** 商品名 — clamped to a 56px two-line box. */
  selectedProductTitle: string;
  /** 款式 — note the target's default keeps a trailing space. */
  selectedSkuItemText: string;
  /** 共减总额 */
  deductTotal: string;
  /** 拼单价 */
  pinDanJia: string;
  /** 平台优惠 */
  pingTaiYouHui: string;
  /** 多多支付立减优惠 */
  duoduoLiJian: string;
  /** 价格 — unit price shown struck-through-grey on the right of the product row. */
  selectedPrice: string;
  /** 数量 — 1–1000. */
  data19: number;
  /** 实付款 — split into yuan/fen by `splitPrice()`. */
  data12: string;
  /** 订单编号 — randomised per load upstream; pinned here for hydration stability. */
  data13: string;
  /** 下单时间 */
  data15: string;
  /** 拼单时间 — the uploaded avatar overlaps this row at left 211px. */
  data16: string;
  /** 发货时间 */
  data17: string;
  /**
   * 成交时间 — added on top of the target, which has no such row.
   * Its label has no counterpart in the background PNG, so unlike the other rows it is
   * rendered as visible DOM text styled to match the baked labels.
   */
  data17_1: string;
  /** 支付方式 */
  payMethod: string;
  /** 支付卡 */
  payCard: string;
  /** 物流公司 */
  logisticsName: string;
  /** 物流单号 */
  logisticsNo: string;
}

export interface PddOrderState extends PddOrderContent, StatusBarState, CanvasUploads {}
