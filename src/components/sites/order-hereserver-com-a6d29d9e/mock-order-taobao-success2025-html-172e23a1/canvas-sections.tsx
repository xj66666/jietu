import type {
  TaobaoSuccessState,
} from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1";
import { TAOBAO_PRODUCT_BUTTONS } from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1";
import { cn } from "@/lib/utils";
import { SHARED_ASSETS, TAOBAO_ASSETS } from "../shared/assets";
import { ThinChevronRightIcon } from "../shared/icons";
import { splitPrice } from "../shared/split-price";

/**
 * 淘宝交易成功画布的各个区块。
 *
 * 与拼多多页不同,本页 #screen 没有背景图(原站已注释掉 success.png),所有文字都是
 * 真实 DOM;灰底来自内容根的 bg-[#f2f4f6],每个 section 显式 bg-white,靠 mt-3/mb-3
 * 露出灰底形成分组。
 *
 * 画布内的 <button> 是被截图的手机 UI 复刻,原站没有 hover 态 —— 不要加。
 *
 * Spec: docs/research/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/components/TaobaoOrderCanvas.spec.md
 */

/**
 * 标题栏。原站 DOM 里三点「•••」在前、返回箭头「<」在后,但 justify-between 让第一个
 * 贴左 —— 与参考截图(左为返回箭头)不符。已逐张核对导出的 PNG,这里按视觉正确顺序渲染。
 */
export function TaobaoCanvasHeader({ headTitle }: { headTitle: string }) {
  return (
    <div className="bg-white flex items-center justify-between px-[24px] pb-5 relative">
      {/* eslint-disable-next-line @next/next/no-img-element -- 1:1 with the target's plain <img> */}
      <img className="w-8 h-8" src={TAOBAO_ASSETS.headerBack} alt="图标" />
      <div className="font-medium text-3xl">{headTitle}</div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-8 h-8" src={TAOBAO_ASSETS.headerMore} alt="图标" />
    </div>
  );
}

export function TaobaoCanvasLogisticsRow({
  data3_1,
  headerAddress,
}: {
  data3_1: string;
  headerAddress: string;
}) {
  return (
    <div className="bg-white px-[24px] py-5 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <span className="text-[#ff6306] text-[22px] font-medium flex items-center space-x-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="w-[22px] h-[22px]" src={TAOBAO_ASSETS.logisticsBox} alt="位置图标" />
          <span className="border-r-[2px] border-[#e5e7eb] pr-[9px]">{data3_1}</span>
        </span>
        <span className="text-black text-[22px] truncate w-[404px]">{headerAddress}</span>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="w-4 h-4" src={SHARED_ASSETS.chevronRight} alt="箭头" />
    </div>
  );
}

export function TaobaoShopRow({
  selectedShopLogoSrc,
  selectedShopName,
  shopTag,
}: {
  selectedShopLogoSrc: string;
  selectedShopName: string;
  shopTag: string;
}) {
  return (
    <div className="py-[22px] flex items-center justify-between border-b border-[#e7e9ef]">
      <div className="flex items-center space-x-4">
        <div className="w-[54px] h-[54px] bg-white flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedShopLogoSrc}
            alt="店铺Logo"
            className="w-full h-full object-cover rounded-[8px]"
          />
        </div>
        <div className="leading-[26px]">
          <div className="font-medium text-[20px] max-w-[360px] max-h-[26px] overflow-hidden">
            {selectedShopName}
          </div>
          <div className="text-[18px] text-gray-500 mt-0.5">{shopTag}</div>
        </div>
      </div>
      <a href="#" className="text-[18px] text-[#7b889d] flex items-center">
        进店逛逛
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="w-4 h-4 ml-1" src={SHARED_ASSETS.chevronRight} alt="箭头" />
      </a>
    </div>
  );
}

export function TaobaoProductRow({ state }: { state: TaobaoSuccessState }) {
  const unit = splitPrice(state.selectedPrice);
  const [btn1, btn2, btn3] = TAOBAO_PRODUCT_BUTTONS;

  return (
    <div className="pt-5 pb-5">
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

        <div className="flex-1 space-y-5 pt-3">
          <div className="flex justify-between items-start">
            <div className="leading-5 flex-1 pr-2 text-[20px] h-[20px] overflow-hidden">
              {state.selectedProductTitle}
            </div>
            <div className="font-medium text-[20px] tracking-tighter">
              <span className="text-[20px]">¥</span>
              {unit.yuan}
              <span className="text-[16px]">{unit.fen}</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="leading-5 text-[19px] h-[19px] overflow-hidden">{state.selectedSkuItemText}</div>
            <div className="text-[17px] text-gray-400 tracking-tighter">¥{state.productPrice2}</div>
          </div>
          <div className="flex justify-between items-center text-xs text-gray-500">
            {/* `item-center` is the target's typo for `items-center`; it generates
                nothing. Kept verbatim. */}
            <div className="text-[#009966] text-[17px] flex item-center">
              <span>{state.data10}</span>
              <ThinChevronRightIcon className="w-[10px] h-[10px] text-[#009966] relative top-[4px] ml-1" />
            </div>
            <div className="text-[17px]">x{state.data19}</div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-2">
        <button
          type="button"
          className="bg-[#f2f4f5] rounded-[8px] text-gray-700 w-[122px] h-[48px] text-[19px]"
        >
          {btn1}
        </button>
        <button
          type="button"
          className="bg-[#f2f4f5] rounded-[8px] text-gray-700 w-[122px] h-[48px] text-[19px]"
        >
          {btn2}
        </button>
        <button
          type="button"
          className="bg-[#feeee5] text-[#fe3b00] rounded-[8px] font-medium w-[122px] h-[48px] text-[19px]"
        >
          {btn3}
        </button>
      </div>
    </div>
  );
}

/** 5 行扣减明细,仅 showDeductDetail 为真时渲染。 */
export function TaobaoDeductDetail({ state }: { state: TaobaoSuccessState }) {
  const d = state.deductDetail;
  return (
    <div className="space-y-6 py-3 text-[19px] text-[#232222] leading-[28px]">
      <div className="flex justify-between">
        <span>商品总价</span>
        <span className="w-[354px] text-right font-semibold tracking-tighter">¥{d.total}</span>
      </div>
      <div className="flex justify-between">
        <span>
          运费<span className="ml-2 text-[17px] text-[#888888]">运费(快递)</span>
        </span>
        <span className="w-[354px] text-right font-semibold tracking-tighter">¥{d.deliveryFee}</span>
      </div>
      <div className="flex justify-between">
        <span>店铺优惠</span>
        <span className="w-[354px] text-right text-[#fb7730] font-semibold tracking-tighter">
          -¥{d.shopDiscount}
        </span>
      </div>
      <div className="flex justify-between">
        <span>淘金币抵扣</span>
        <span className="w-[354px] text-right text-[#fb7730] font-semibold tracking-tighter">
          -¥{d.taocoin}
        </span>
      </div>
      <div className="flex justify-between">
        <span>红包</span>
        <span className="w-[354px] text-right text-[#fb7730] font-semibold tracking-tighter">
          <span>-¥{d.coupon}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-4 h-4 ml-1 inline-block relative top-[-1px]"
            src={SHARED_ASSETS.chevronRight}
            alt="红包图标"
          />
        </span>
      </div>
    </div>
  );
}

/**
 * 实付款行。唯一的视觉状态指示器:箭头方向随 showDeductDetail 翻转。
 * 原站是瞬时切换,没有 transition —— 不要加动画。
 */
export function TaobaoPaidRow({ state }: { state: TaobaoSuccessState }) {
  const paid = splitPrice(state.data12);
  return (
    <div className="py-4 flex justify-between items-end">
      <span className="text-gray-700 text-[22px] flex items-center">
        <div className="flex items-center">
          <span className="font-medium mr-2">实付款</span>
          <span className="text-[#fb7730]">共减¥</span>
          <span className="text-[#fb7730] font-bold text-[28px] tracking-tighter">{state.deductTotal}</span>
        </div>
      </span>
      <span className="text-[19px] font-medium">
        <span className="text-[30px] font-semibold tracking-tighter flex flex-row">
          <span>
            <span className="text-[25px]">¥</span>
            {paid.yuan}
          </span>
          <span className="text-[22px] relative top-[2px]">{paid.fen}</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className={cn(
              "w-4 h-4 ml-2 relative top-[1px] origin-center",
              state.showDeductDetail ? "-rotate-90" : "rotate-90",
            )}
            src={SHARED_ASSETS.chevronRight}
            alt="箭头"
          />
        </span>
      </span>
    </div>
  );
}

export function TaobaoOrderInfoSection({ state }: { state: TaobaoSuccessState }) {
  return (
    <section className="bg-white mt-3 mb-3 px-[24px] py-5 space-y-[23px] text-[20px] text-[#232222] leading-[28px]">
      <div className="flex justify-between items-center pt-1">
        <span className="text-gray-700 font-medium text-[24px] flex items-center">
          <span>订单信息</span>
          <span className="ml-[10px] text-[#888888] text-xl font-normal">{state.orderDate}</span>
        </span>
        <span className="text-[#888888] flex justify-between items-center">
          <span className="text-[#888888] pl-[5px]">收起</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="w-4 h-4 ml-1 relative top-[1px] origin-center -rotate-90"
            src={SHARED_ASSETS.chevronRight}
            alt="订单信息图标"
          />
        </span>
      </div>
      <div className="flex justify-between">
        <span>订单编号</span>
        <span className="text-[#888888]">
          {state.data13}{" "}
          <span className="text-black border-l-[2px] border-[#e5e7eb] pl-[5px]">复制</span>
        </span>
      </div>
      <div className="flex justify-between">
        <span>交易快照</span>
        <span className="w-[354px] text-right text-[#888888]">发生交易争议时，可作为判断依据</span>
      </div>
      <div className="flex justify-between">
        <span>成交时间</span>
        <span className="w-[354px] text-right text-[#888888] time-h">{state.data17_1}</span>
      </div>
      <div className="flex justify-between">
        <span>发货时间</span>
        <span className="w-[354px] text-right text-[#888888] time-h">{state.data17}</span>
      </div>
      <div className="flex justify-between">
        <span>付款时间</span>
        <span className="w-[354px] text-right text-[#888888] time-h">{state.data16}</span>
      </div>
      <div className="flex justify-between">
        <span>创建时间</span>
        <span className="w-[354px] text-right text-[#888888] time-h">{state.data15}</span>
      </div>
      <div className="flex justify-between">
        <span>支付宝交易号</span>
        <span className="text-[#888888]">{state.data14}</span>
      </div>
      <div className="flex justify-between">
        <span className="flex items-center">
          <span>收货信息</span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="w-4 h-4 ml-1" src={TAOBAO_ASSETS.eyeOff} alt="收货信息图标" />
        </span>
        <span className="w-[354px] text-right text-[#888888]">{state.data1}</span>
      </div>
    </section>
  );
}

/** 底部操作栏。absolute bottom-0,贴在 #screen 的 1278px 底边。 */
export function TaobaoCanvasFooter({ state }: { state: TaobaoSuccessState }) {
  return (
    <footer className="bg-white flex items-center px-[24px] py-[10px] pb-[64px] absolute bottom-0 left-0 right-0 border-t border-[#e7e9ef]">
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button type="button" className="flex flex-col items-center text-gray-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-7 h-7" src={TAOBAO_ASSETS.wangwang} alt="旺旺客服" />
            <span className="text-[16px] mt-1">客服</span>
          </button>
          <button type="button" className="flex flex-col items-center text-gray-500">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-7 h-7" src={TAOBAO_ASSETS.moreDots} alt="更多" />
            <span className="text-[16px] mt-1">更多</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="py-2 bg-[#f2f4f5] rounded-[8px] text-gray-700 w-[133px] h-[52px] text-[19px]"
          >
            {state.bottomBtns1}
          </button>
          <button
            type="button"
            className="py-2 bg-[#f2f4f5] rounded-[8px] text-gray-700 w-[133px] h-[52px] text-[19px]"
          >
            {state.bottomBtns2}
          </button>
          <button
            type="button"
            className="py-2 bg-[#ff6303] text-white rounded-[8px] font-medium w-[133px] h-[52px] text-[19px]"
          >
            {state.bottomBtns3}
          </button>
        </div>
      </div>
      {/* iOS Home 指示条 */}
      <div className="absolute bottom-[10px] left-0 right-0 flex items-center justify-center">
        <div className="h-[7px] w-[205px] bg-[#000] rounded-[7.5px]" />
      </div>
    </footer>
  );
}
