"use client";

import type {
  TaobaoDeductDetail,
  TaobaoSuccessState,
} from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1";
import { CheckboxField, FileField, NumberField, TextField } from "../shared/fields";
import { OrderStatusDropdown } from "./OrderStatusDropdown";

/**
 * 「订单信息」editor panel for the Taobao generator — 33 controls, growing to 38 when
 * 展示扣减详情 is ticked.
 *
 * Spec: docs/research/.../mock-order-taobao-success2025-html-172e23a1/PAGE_TOPOLOGY.md
 */
export function TaobaoOrderFields({
  state,
  onChange,
  onEditTopbar,
  hidden,
}: {
  state: TaobaoSuccessState;
  onChange: (patch: Partial<TaobaoSuccessState>) => void;
  onEditTopbar: () => void;
  hidden: boolean;
}) {
  const patchDeduct = (patch: Partial<TaobaoDeductDetail>) =>
    onChange({ deductDetail: { ...state.deductDetail, ...patch } });

  return (
    <div className={`p-6 pt-0 space-y-4${hidden ? " hidden" : ""}`}>
      {/* `hasExtention` resolves to false on the target, so this is the branch it shows. */}
      <div className="mb-4">
        <p className="text-gray-500 text-base">
          {/* The target wraps the link on its own line, so a space renders on each
              side; JSX would strip both. */}
          更新{" "}
          <a
            href="https://order.hereserver.com/mockhelper.html"
            target="_blank"
            rel="noreferrer"
            className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400"
          >
            生成器助手
          </a>{" "}
          输入淘宝京东详情页链接后自动填写,如已安装完成请刷新本页
        </p>
      </div>

      <CheckboxField
        label="安卓状态栏"
        checked={state.showAndroidBar}
        onChange={(showAndroidBar) => onChange({ showAndroidBar })}
      />

      <OrderStatusDropdown />

      <TextField label="状态" value={state.headTitle} onChange={(headTitle) => onChange({ headTitle })} />
      <TextField label="物流状态" value={state.data3_1} onChange={(data3_1) => onChange({ data3_1 })} />
      <TextField
        label="收货信息1"
        value={state.headerAddress}
        onChange={(headerAddress) => onChange({ headerAddress })}
      />
      <TextField
        label="店铺名"
        value={state.selectedShopName}
        onChange={(selectedShopName) => onChange({ selectedShopName })}
      />
      <TextField label="店铺描述" value={state.shopTag} onChange={(shopTag) => onChange({ shopTag })} />
      <FileField label="商品图" onPick={(selectedPic) => onChange({ selectedPic })} />
      <FileField label="店铺标识" onPick={(selectedShopLogoSrc) => onChange({ selectedShopLogoSrc })} />
      <TextField
        label="商品名"
        value={state.selectedProductTitle}
        onChange={(selectedProductTitle) => onChange({ selectedProductTitle })}
      />
      <TextField
        label="款式"
        value={state.selectedSkuItemText}
        onChange={(selectedSkuItemText) => onChange({ selectedSkuItemText })}
      />
      <TextField
        label="7 天无理由退货"
        value={state.data10}
        onChange={(data10) => onChange({ data10 })}
      />
      <TextField
        label="共减总额"
        value={state.deductTotal}
        onChange={(deductTotal) => onChange({ deductTotal })}
      />

      <CheckboxField
        label="展示扣减详情"
        checked={state.showDeductDetail}
        onChange={(showDeductDetail) => onChange({ showDeductDetail })}
      />
      {state.showDeductDetail ? (
        <>
          <TextField
            label="扣减详情-商品总价"
            value={state.deductDetail.total}
            onChange={(total) => patchDeduct({ total })}
          />
          <TextField
            label="扣减详情-运费"
            value={state.deductDetail.deliveryFee}
            onChange={(deliveryFee) => patchDeduct({ deliveryFee })}
          />
          <TextField
            label="扣减详情-店铺优惠"
            value={state.deductDetail.shopDiscount}
            onChange={(shopDiscount) => patchDeduct({ shopDiscount })}
          />
          <TextField
            label="扣减详情-淘金币抵扣"
            value={state.deductDetail.taocoin}
            onChange={(taocoin) => patchDeduct({ taocoin })}
          />
          <TextField
            label="扣减详情-红包"
            value={state.deductDetail.coupon}
            onChange={(coupon) => patchDeduct({ coupon })}
          />
        </>
      ) : null}

      <TextField
        label="价格"
        value={state.selectedPrice}
        onChange={(selectedPrice) => onChange({ selectedPrice })}
      />
      <TextField
        label="原价"
        value={state.productPrice2}
        onChange={(productPrice2) => onChange({ productPrice2 })}
      />
      <NumberField
        label="数量"
        value={state.data19}
        min={1}
        max={1000}
        onChange={(data19) => onChange({ data19 })}
      />
      <TextField label="实付款" value={state.data12} onChange={(data12) => onChange({ data12 })} />
      <TextField label="订单编号" value={state.data13} onChange={(data13) => onChange({ data13 })} />
      <TextField label="收货信息2" value={state.data1} onChange={(data1) => onChange({ data1 })} />
      <TextField label="支付宝交易号" value={state.data14} onChange={(data14) => onChange({ data14 })} />
      <TextField label="订单日期" value={state.orderDate} onChange={(orderDate) => onChange({ orderDate })} />
      <TextField label="创建时间" value={state.data15} onChange={(data15) => onChange({ data15 })} />
      <TextField label="付款时间" value={state.data16} onChange={(data16) => onChange({ data16 })} />
      <TextField label="发货时间" value={state.data17} onChange={(data17) => onChange({ data17 })} />
      <TextField label="成交时间" value={state.data17_1} onChange={(data17_1) => onChange({ data17_1 })} />
      <TextField
        label="延长收货|评价"
        value={state.bottomBtns1}
        onChange={(bottomBtns1) => onChange({ bottomBtns1 })}
      />
      <TextField
        label="查看物流|加入购物车"
        value={state.bottomBtns2}
        onChange={(bottomBtns2) => onChange({ bottomBtns2 })}
      />
      <TextField
        label="确认收货|再买一单"
        value={state.bottomBtns3}
        onChange={(bottomBtns3) => onChange({ bottomBtns3 })}
      />

      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={onEditTopbar}
          className="bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 text-white font-medium py-2.5 px-5 rounded-[8px] transition-colors"
        >
          编辑信号与时间 &rarr;
        </button>
      </div>
    </div>
  );
}
