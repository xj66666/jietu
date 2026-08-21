"use client";

import type { PddOrderState } from "@/types/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee";
import { CheckboxField, FileField, NumberField, TextField } from "../shared/fields";

/**
 * 「订单信息」editor panel for the pdd generator — 28 controls in the target's own order.
 *
 * The target toggles this against the status-bar panel with `v-show`, so it stays
 * mounted and only `display` flips; the `hidden` class reproduces that.
 *
 * Spec: docs/research/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/PAGE_TOPOLOGY.md
 */
export function PddOrderFields({
  state,
  onChange,
  onEditTopbar,
  hidden,
}: {
  state: PddOrderState;
  onChange: (patch: Partial<PddOrderState>) => void;
  onEditTopbar: () => void;
  hidden: boolean;
}) {
  return (
    <div className={`p-6 pt-0 space-y-4${hidden ? " hidden" : ""}`}>
      {/* The target renders this branch because `hasExtention` resolves to false —
          the browser-extension variant is never reached without the add-on. */}
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
      <TextField label="状态" value={state.headTitle} onChange={(headTitle) => onChange({ headTitle })} />
      <TextField
        label="收货信息1"
        value={state.headerAddress}
        onChange={(headerAddress) => onChange({ headerAddress })}
      />
      <TextField label="收货信息2" value={state.address} onChange={(address) => onChange({ address })} />
      <TextField label="收货信息2城市" value={state.city} onChange={(city) => onChange({ city })} />
      <TextField
        label="收货信息3"
        value={state.headerPhone}
        onChange={(headerPhone) => onChange({ headerPhone })}
      />
      <TextField
        label="店铺名"
        value={state.selectedShopName}
        onChange={(selectedShopName) => onChange({ selectedShopName })}
      />
      <FileField label="商品图" onPick={(selectedPic) => onChange({ selectedPic })} />
      <FileField label="店铺标识" onPick={(selectedShopLogoSrc) => onChange({ selectedShopLogoSrc })} />
      <FileField label="用户头像" onPick={(userAvatar) => onChange({ userAvatar })} />
      <FileField label="物流公司商标" onPick={(logisticsLogo) => onChange({ logisticsLogo })} />
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
        label="共减总额"
        value={state.deductTotal}
        onChange={(deductTotal) => onChange({ deductTotal })}
      />
      <TextField label="拼单价" value={state.pinDanJia} onChange={(pinDanJia) => onChange({ pinDanJia })} />
      <TextField
        label="平台优惠"
        value={state.pingTaiYouHui}
        onChange={(pingTaiYouHui) => onChange({ pingTaiYouHui })}
      />
      <TextField
        label="多多支付立减优惠"
        value={state.duoduoLiJian}
        onChange={(duoduoLiJian) => onChange({ duoduoLiJian })}
      />
      <TextField
        label="价格"
        value={state.selectedPrice}
        onChange={(selectedPrice) => onChange({ selectedPrice })}
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
      <TextField label="下单时间" value={state.data15} onChange={(data15) => onChange({ data15 })} />
      <TextField label="拼单时间" value={state.data16} onChange={(data16) => onChange({ data16 })} />
      <TextField label="发货时间" value={state.data17} onChange={(data17) => onChange({ data17 })} />
      {/* 成交时间 — a local addition, not present on the target. */}
      <TextField label="成交时间" value={state.data17_1} onChange={(data17_1) => onChange({ data17_1 })} />
      <TextField label="支付方式" value={state.payMethod} onChange={(payMethod) => onChange({ payMethod })} />
      <TextField label="支付卡" value={state.payCard} onChange={(payCard) => onChange({ payCard })} />
      <TextField
        label="物流公司"
        value={state.logisticsName}
        onChange={(logisticsName) => onChange({ logisticsName })}
      />
      <TextField
        label="物流单号"
        value={state.logisticsNo}
        onChange={(logisticsNo) => onChange({ logisticsNo })}
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
