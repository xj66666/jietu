import type {
  TaobaoSuccessState,
} from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1";
import { CanvasStatusBar } from "../shared/CanvasStatusBar";
import {
  TaobaoCanvasFooter,
  TaobaoCanvasHeader,
  TaobaoCanvasLogisticsRow,
  TaobaoDeductDetail,
  TaobaoOrderInfoSection,
  TaobaoPaidRow,
  TaobaoProductRow,
  TaobaoShopRow,
} from "./canvas-sections";

/**
 * 淘宝交易成功订单详情预览画布。
 *
 * 没有背景图 —— 原站把 `background-image: url(./img/success.png)` 整段注释掉了。灰底
 * 来自内容根的 bg-[#f2f4f6],每个 section 显式 bg-white,section 间的 mt-3/mb-3 露出
 * 灰底形成分组。
 *
 * Spec: docs/research/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/components/TaobaoOrderCanvas.spec.md
 */
export function TaobaoOrderCanvas({ state }: { state: TaobaoSuccessState }) {
  return (
    <div
      id="screen"
      className="mo-screen use-ios-bar-v2 max-h-[1278px]"
      style={{
        width: "589.5px",
        minHeight: "1278px",
        paddingTop: "120px",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#fff",
      }}
    >
      <div className="bg-[#f2f4f6] flex flex-col text-sm w-[589.5px]">
        <TaobaoCanvasHeader headTitle={state.headTitle} />
        <TaobaoCanvasLogisticsRow data3_1={state.data3_1} headerAddress={state.headerAddress} />

        <section className="bg-white mt-3 px-[24px] pb-[10px]">
          <TaobaoShopRow
            selectedShopLogoSrc={state.selectedShopLogoSrc}
            selectedShopName={state.selectedShopName}
            shopTag={state.shopTag}
          />
          <TaobaoProductRow state={state} />
          {state.showDeductDetail ? <TaobaoDeductDetail state={state} /> : null}
          <TaobaoPaidRow state={state} />
        </section>

        <TaobaoOrderInfoSection state={state} />
        <TaobaoCanvasFooter state={state} />
      </div>

      <CanvasStatusBar state={state} />
    </div>
  );
}
