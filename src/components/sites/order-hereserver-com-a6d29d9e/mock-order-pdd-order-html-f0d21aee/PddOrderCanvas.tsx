import type { PddOrderState } from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee";
import { SHARED_ASSETS, PDD_ASSETS } from "../shared/assets";
import { CanvasStatusBar } from "../shared/CanvasStatusBar";
import { EyeOffIcon, LocationPinIcon } from "../shared/icons";
import { splitPrice } from "../shared/split-price";
import {
  PddBottomBarTextPatches,
  PddGreyBandPatch,
  PddGreyBandReplacement,
  PddHatPatch,
} from "./canvas-patches";

/**
 * 拼多多订单详情预览画布。
 *
 * ⚠️ 背景图是承重结构。`pdd-bg.compressed.png` 是一张 1179×2556 的 iPhone 原生截图,
 * 以 `cover` 精确铺满 589.5×1278(正好 1:2),里面烤进了全部行标签、三个操作按钮、
 * 两枚绿色标签、「共优惠」「(免运费)」、两个「复制」、底部操作栏和 Home 指示条。
 * 本组件只渲染**数值**,靠 `<span className="invisible">…</span>` 占位把数值推到与
 * 图中标签水平对齐的位置。
 *
 * 所以:任何 w-[354px] / w-[448px] / ml-[60px] / mt-[101px] / pr-[72px] / pl-[39px]
 * / pl-[65px] 都不能改,invisible 的占位文案也必须逐字照抄 —— 它决定占位宽度。
 *
 * Spec: docs/research/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/components/PddOrderCanvas.spec.md
 */
export function PddOrderCanvas({ state }: { state: PddOrderState }) {
  const paid = splitPrice(state.data12);

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
        backgroundImage: `url(${PDD_ASSETS.canvasBackground})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "0 0",
      }}
    >
      {/* Erase the baked divider/hat/chevron before the flow content paints, so an
          uploaded userAvatar (which lands on the hat's exact spot) stays on top. */}
      <PddHatPatch />
      {/* Erase the original 30px grey separator to make room for the 成交时间 row. */}
      <PddGreyBandPatch />

      <div className="flex flex-col text-sm w-[589.5px] relative top-[-15px]">
        {/* [1] 状态标题行 */}
        <div className="text-[#25b514] flex items-center justify-center px-[24px] pb-[30px] relative space-x-2">
          {/* `h8` is the target's own typo for `h-8`; it generates nothing, so the
              height comes from w-8 plus the image's 1:1 ratio. Kept verbatim. */}
          {/* eslint-disable-next-line @next/next/no-img-element -- 1:1 with the target's plain <img> */}
          <img className="w-8 h8" src={PDD_ASSETS.deliveryTruck} alt="店铺图标" />
          <div className="font-medium text-[26px]">{state.headTitle}</div>
        </div>

        {/* [2] 物流行 */}
        <div className="px-[24px] pl-[65px] py-5 flex items-center justify-between relative">
          {state.logisticsLogo ? (
            // `[35px]` is the target's truncated `w-[35px]` — it generates nothing.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.logisticsLogo}
              alt="物流图标"
              className="bg-white rounded-[2px] [35px] h-[35px] rounded absolute top-[14px] left-[19px]"
            />
          ) : null}
          <div className="flex items-center space-x-2">
            <span className="text-[22px] flex items-center space-x-2">
              <span className="border-r-[1px] border-[#e5e7eb] pr-[9px]">{state.data3_1}</span>
            </span>
            <span className="text-black text-[22px] truncate w-[404px]">{state.headerAddress}</span>
          </div>
        </div>

        {/* [3] 收货地址块 —— bg-white 是功能性的,用来盖掉背景图里原有的地址文字 */}
        <div className="px-[24px] py-[15px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-white">
              <span className="bg-white text-[#ff6306] text-[22px] font-medium flex items-center space-x-2 relative top-[13px] left-[-6px]">
                <LocationPinIcon className="icon" />
              </span>
              {/* `bg-whiteml-1` is the target's `bg-white ml-1` with the space dropped;
                  neither rule applies. Kept verbatim. */}
              <span className="bg-whiteml-1 text-black text-[22px] truncate w-[454px] flex items-center space-x-2">
                <span>{state.address}</span>
                <span>
                  <EyeOffIcon className="icon" />
                </span>
                <span>{state.city}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-start text-[22px] pl-[39px] mt-1 space-x-2 bg-white">
            <span className="truncate max-w-[400px]">{state.headerPhone}</span>
          </div>
        </div>

        {/* [4] section 店铺 + 商品 + 实付 */}
        <section className="mt-3 px-[24px] pb-[10px]">
          <div className="py-[22px] pb-[0] flex items-center justify-start">
            <div className="flex items-center space-x-2">
              <span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={state.selectedShopLogoSrc}
                  alt="品牌图标"
                  className="w-[26px] h-[26px] object-cover rounded-[2px]"
                />
              </span>
              <span className="text-[22px]">{state.selectedShopName}</span>
            </div>
            <a href="#" className="text-[18px] text-[#7b889d] flex items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="w-4 h-4 ml-1" src={SHARED_ASSETS.chevronRight} alt="箭头" />
            </a>
          </div>

          <div className="pt-3 pb-5">
            <div className="flex space-x-4">
              <div className="w-[122px] h-[122px] bg-gray-200 rounded-[8px] shrink-0 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  id="imagePreview"
                  src={state.selectedPic}
                  alt="商品图片"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 space-y-5">
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-2 text-[20px] h-[88px] overflow-hidden space-y-3">
                    <div className="leading-7 h-[56px] overflow-hidden">{state.selectedProductTitle}</div>
                    <div className="text-[19px] h-[19px] overflow-hidden text-gray-400">
                      {state.selectedSkuItemText}
                    </div>
                  </div>
                  <div className="font-medium text-[20px] tracking-tighter text-gray-400 text-right space-y-1 mt-1">
                    <div>
                      <span className="text-sm">¥</span>
                      {state.selectedPrice}
                    </div>
                    <div className="text-[17px]">x{state.data19}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 抵扣款 —— mt-[101px] 把这行推到背景图的「共优惠」处 */}
          <div className="py-4 flex justify-between items-end mt-[101px]">
            <span className="text-gray-700 text-[22px] flex items-center">
              <span className="text-[20px] tracking-tighter ml-[60px] text-[#d81e06]">
                ¥{state.deductTotal}
              </span>
            </span>
            <span className="text-[19px]">
              {/* The target's markup puts a newline between 实付: and the amount span,
                  which collapses to a rendered space. JSX would strip it, so it is
                  explicit here — without it the row is 5.3px narrow. */}
              实付:{" "}
              <span className="text-[#d81e06] tracking-tighter pr-[72px]">
                <span className="text-sm">¥</span>
                <span className="text-[22px] font-[200]">{paid.yuan}</span>
                <span className="text-[16px]">{paid.fen}</span>
              </span>
            </span>
          </div>
        </section>

        {/* [5] section 明细 —— 左侧 invisible span 只负责占宽,文案照抄原站 */}
        <section className="mb-3 px-[19px] pt-[8px] space-y-3 text-[20px] text-[#232222]">
          <div className="flex justify-between">
            <span className="invisible">拼单价</span>
            <span className="w-[354px] text-right text-[#5f5e5e]">¥{state.pinDanJia}</span>
          </div>
          <div className="flex justify-between">
            <span className="invisible">平台优惠</span>
            <span className="w-[354px] text-right text-[#5f5e5e]">-¥{state.pingTaiYouHui}</span>
          </div>
          <div className="flex justify-between">
            <span className="invisible">多多支付立减优惠</span>
            <span className="w-[354px] text-right text-[#5f5e5e]">-¥{state.duoduoLiJian}</span>
          </div>
          <div className="flex justify-between pt-[18px]">
            <span className="invisible">订单编号</span>
            <span className="w-[448px] text-[#888888]">{state.data13}</span>
          </div>
          <div className="flex justify-between">
            <span className="invisible">支付方式</span>
            <div className="w-[448px] text-[#888888]">
              <div>{state.payMethod}</div>
              <div className="mt-[10px]">{state.payCard}</div>
            </div>
          </div>
          <div className="flex justify-between">
            <span className="invisible">商品快照</span>
            <span className="w-[448px] text-[#888888]">核对交易细节时，可作为判断依据</span>
          </div>
          <div className="flex justify-between pt-[1px]">
            <span className="invisible">物流公司</span>
            <span className="w-[448px] text-[#888888]">{state.logisticsName}</span>
          </div>
          <div className="flex justify-between pt-[1px]">
            {/* The target's placeholder here reads 物流公司, not 快递单号. Only its width
                matters (the label is baked into the background PNG), so it is kept
                verbatim — "fixing" it would shift the value column. */}
            <span className="invisible">物流公司</span>
            <span className="w-[448px] text-[#888888]">{state.logisticsNo}</span>
          </div>
          <div className="flex justify-between pt-[1px]">
            <span className="invisible">下单时间</span>
            <span className="w-[448px] text-[#888888]">{state.data15}</span>
          </div>
          <div className="flex justify-between pt-[1px]">
            <span className="invisible">拼单时间</span>
            <span className="w-[448px] text-[#888888] relative">
              {state.userAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={state.userAvatar}
                  alt="用户头像"
                  className="bg-white absolute top-[-4px] left-[211px] w-[28px] h-[28px] rounded-full"
                />
              ) : null}
              {state.data16}
            </span>
          </div>
          <div className="flex justify-between pt-[1px]">
            <span className="invisible">发货时间</span>
            <span className="w-[448px] text-[#888888]">{state.data17}</span>
          </div>
          {/* 成交时间 — a local addition. The background PNG has no label for this row,
              so unlike its neighbours the label is visible DOM text matched to the baked
              ones: 20px at rgb(156,156,156). The row lands on the 33px pitch the baked
              labels use, which is why the grey separator below had to be redrawn. */}
          <div className="flex justify-between pt-[1px]">
            <span className="text-[#9c9c9c]">成交时间:</span>
            <span className="w-[448px] text-[#888888]">{state.data17_1}</span>
          </div>
        </section>
      </div>

      <PddGreyBandReplacement />
      <PddBottomBarTextPatches invoiceLabel="再次拼单" confirmLabel="立即评价" />

      <CanvasStatusBar state={state} />
    </div>
  );
}
