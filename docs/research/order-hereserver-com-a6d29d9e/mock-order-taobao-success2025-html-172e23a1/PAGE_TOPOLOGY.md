# 页面拓扑(PAGE_TOPOLOGY) — 淘宝交易成功订单生成器(2025 新版)

源 URL:`https://order.hereserver.com/mock-order/taobao/success2025.html`
目标路由:`/mock-order/taobao/success2025.html`
路由文件:`src/app/mock-order/taobao/success2025.html/page.tsx`
组件根:`src/components/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/`
同站共享组件根:`src/components/sites/order-hereserver-com-a6d29d9e/shared/`

## 页面级布局

外壳(S1/S2/S3/S5/S6.0/S6.1/S6.3/S7)与拼多多页**完全相同**,见 [`../SHARED_SHELL.md`](../SHARED_SHELL.md) 与拼多多页 `PAGE_TOPOLOGY.md`。本文件只展开本页特有的部分。

```
div#screen.use-ios-bar-v2.max-h-[1278px]        589.5 × 1278,padding-top 120px,无背景图
├─ div.bg-[#f2f4f6].flex.flex-col.text-sm.w-[589.5px]
│  ├─ [T1] 标题栏          div.bg-white.flex.items-center.justify-between.px-[24px].pb-5.relative
│  ├─ [T2] 物流行          div.bg-white.px-[24px].py-5.flex.items-center.justify-between
│  ├─ [T3] section 店铺+商品+按钮+扣减+实付款   section.bg-white.mt-3.px-[24px].pb-[10px]
│  ├─ [T4] section 订单信息 9 行                section.bg-white.mt-3.mb-3.px-[24px].py-5…
│  └─ [T5] footer 底部固定操作栏                footer.bg-white…absolute.bottom-0
├─ [S5a] div.ios-bar…ios-bar-v2
└─ [S5b] div.material-top-bar
```

关键结构差异:本页 `#screen` **没有背景图**(原站把 `url(./img/success.png)` 整段注释掉了),画布底色由内容根的 `bg-[#f2f4f6]` 提供,各 `section` 显式 `bg-white`,靠 `mt-3` / `mb-3` 的间隙露出灰底形成分组。所有文字都是真实 DOM。

## 区块清单

| ID | 名称 | 交互模型 | 复杂度 | 归属 |
| --- | --- | --- | --- | --- |
| T1 | `TaobaoCanvasHeader` | 静态 | 低 | 本页 |
| T2 | `TaobaoCanvasLogisticsRow` | 静态 | 低 | 本页 |
| T3 | `TaobaoCanvasProductSection` | 静态 + `showDeductDetail` 两态 | **高** → 拆 3 个子组件 | 本页 |
| T3a | `TaobaoShopRow` | 静态 | 低 | 本页 |
| T3b | `TaobaoProductRow` | 静态 | 中 | 本页 |
| T3c | `TaobaoDeductDetail` | `v-if` 两态 | 中 | 本页 |
| T3d | `TaobaoPaidRow` | 受 `showDeductDetail` 影响箭头方向 | 低 | 本页 |
| T4 | `TaobaoOrderInfoSection` | 静态 | 中(9 行) | 本页 |
| T5 | `TaobaoCanvasFooter` | 静态 | 中 | 本页 |
| L | `OrderStatusDropdown` | 点击 toggle | 低 | 本页 |
| — | `TaobaoOrderFields` | 输入驱动 | 中(33/38 控件) | 本页 |

## T1 标题栏

```
div.bg-white.flex.items-center.justify-between.px-[24px].pb-5.relative
├─ img.w-8.h-8      icons/header-more.png (66×66)   alt="图标"    ← DOM 第一个,但 justify-between 把它推到左
├─ div.font-medium.text-3xl   {{headTitle}}   「交易成功」  30px/36px w500
└─ img.w-8.h-8      icons/header-back.png (66×66)   alt="图标"
```

> ⚠️ 原站两张图的 DOM 顺序与视觉位置**不一致**:第一个 `<img>` 是三点「•••」,第二个是返回箭头「<」,但 `justify-between` 让第一个贴左、第二个贴右。已核对导出的 PNG 确认。视觉上左边是返回箭头 —— 若要与截图一致,渲染顺序必须是 `back`(左)、`title`、`more`(右)。**本仓库按视觉正确顺序实现:左 back、右 more**,并在组件里注释说明与原站 DOM 顺序的差异。

`px-[24px] pb-5` = 左右 24px、下 20px,无上内边距(靠 `#screen` 的 `padding-top: 120px`)。

## T2 物流行

```
div.bg-white.px-[24px].py-5.flex.items-center.justify-between
├─ div.flex.items-center.space-x-2
│  ├─ span.text-[#ff6306].text-[22px].font-medium.flex.items-center.space-x-2
│  │  ├─ img.w-[22px].h-[22px]   icons/logistics-box.png (46×45)   alt="位置图标"
│  │  └─ span.border-r-[2px].border-[#e5e7eb].pr-[9px]   {{data3_1}}   「已签收」
│  └─ span.text-black.text-[22px].truncate.w-[404px]     {{headerAddress}}
└─ img.w-4.h-4   shared/icons/chevron-right.png   alt="箭头"
```

`data3_1` 在编辑器里有对应字段(label「物流状态」),默认「已签收」。

## T3 section — 店铺 + 商品 + 扣减 + 实付款

```
section.bg-white.mt-3.px-[24px].pb-[10px]
```

### T3a 店铺行

```
div.py-[22px].flex.items-center.justify-between.border-b.border-[#e7e9ef]
├─ div.flex.items-center.space-x-4
│  ├─ div.w-[54px].h-[54px].bg-white.flex.items-center.justify-center
│  │  └─ img.w-full.h-full.object-cover.rounded-[8px]   {{selectedShopLogoSrc}}
│  └─ div.leading-[26px]
│     ├─ div.font-medium.text-[20px].max-w-[360px].max-h-[26px].overflow-hidden   {{selectedShopName}}
│     └─ div.text-[18px].text-gray-500.mt-0.5                                     {{shopTag}}
└─ a[href="#"].text-[18px].text-[#7b889d].flex.items-center
   「进店逛逛」+ img.w-4.h-4.ml-1  chevron-right.png
```

`border-b border-[#e7e9ef]` = 底部 1px `#e7e9ef`。

### T3b 商品行

```
div.pt-5.pb-5
├─ div.flex.space-x-4
│  ├─ div.w-[122px].h-[122px].bg-gray-200.rounded-[8px].shrink-0.overflow-hidden
│  │  └─ img#imagePreview.w-full.h-full.object-cover   {{selectedPic}}
│  └─ div.flex-1.space-y-5.pt-3
│     ├─ div.flex.justify-between.items-start
│     │  ├─ div.leading-5.flex-1.pr-2.text-[20px].h-[20px].overflow-hidden   {{selectedProductTitle}}
│     │  └─ div.font-medium.text-[20px].tracking-tighter
│     │     span.text-[20px]「¥」+ {{splitPrice(selectedPrice).yuan}} + span.text-[16px]{{…fen}}
│     ├─ div.flex.justify-between.items-center.text-xs.text-gray-500
│     │  ├─ div.leading-5.text-[19px].h-[19px].overflow-hidden   {{selectedSkuItemText}}
│     │  └─ div.text-[17px].text-gray-400.tracking-tighter       ¥{{productPrice2}}
│     └─ div.flex.justify-between.items-center.text-xs.text-gray-500
│        ├─ div.text-[#009966].text-[17px].flex.item-center      ← 原站类名 "item-center" 拼错,不生效
│        │  ├─ span   {{data10}}   「极速退款 7天无理由退换」
│        │  └─ svg.w-[10px].h-[10px].text-[#009966].relative.top-[4px].ml-1
│        │       viewBox="0 0 8 14"  stroke="currentColor" stroke-width="2"
│        │       d="m1 13 5.7-5.326a.909.909 0 0 0 0-1.348L1 1"
│        └─ div.text-[17px]   x{{data19}}
└─ div.flex.justify-end.space-x-2.mt-2
   ├─ button.bg-[#f2f4f5].rounded-[8px].text-gray-700.w-[122px].h-[48px].text-[19px]   {{productBtn1}}「闲鱼转卖」
   ├─ button 同上                                                                       {{productBtn2}}「申请售后」
   └─ button.bg-[#feeee5].text-[#fe3b00].rounded-[8px].font-medium.w-[122px].h-[48px].text-[19px]  {{productBtn3}}「加入购物车」
```

`productBtn1/2/3` 在编辑器里**没有**对应字段,是固定值。

### T3c 扣减明细(`v-if="showDeductDetail"`,默认不渲染)

```
div.space-y-6.py-3.text-[19px].text-[#232222].leading-[28px]
```

5 行,结构与实测值见 [`BEHAVIORS.md`](./BEHAVIORS.md#状态-k-细节)。

### T3d 实付款行

```
div.py-4.flex.justify-between.items-end
├─ span.text-gray-700.text-[22px].flex.items-center
│  └─ div.flex.items-center
│     ├─ span.font-medium.mr-2「实付款」
│     ├─ span.text-[#fb7730]「共减¥」
│     └─ span.text-[#fb7730].font-bold.text-[28px].tracking-tighter   {{deductTotal}}
└─ span.text-[19px].font-medium
   └─ span.text-[30px].font-semibold.tracking-tighter.flex.flex-row
      ├─ span > span.text-[25px]「¥」+ {{splitPrice(data12).yuan}}
      ├─ span.text-[22px].relative.top-[2px]   {{splitPrice(data12).fen}}
      └─ img.w-4.h-4.ml-2.relative.top-[1px].origin-center
          :class="showDeductDetail ? '-rotate-90' : 'rotate-90'"
          chevron-right.png
```

## T4 section — 订单信息(9 行)

```
section.bg-white.mt-3.mb-3.px-[24px].py-5.space-y-[23px].text-[20px].text-[#232222].leading-[28px]
```

| 行 | 左 | 右 |
| --- | --- | --- |
| 标题行 `div.flex.justify-between.items-center.pt-1` | `span.text-gray-700.font-medium.text-[24px].flex.items-center` → 「订单信息」+ `span.ml-[10px].text-[#888888].text-xl.font-normal{{orderDate}}` | `span.text-[#888888].flex.justify-between.items-center` → `span.text-[#888888].pl-[5px]`「收起」+ `img.w-4.h-4.ml-1.relative.top-[1px].origin-center.-rotate-90` |
| 订单编号 | `span`「订单编号」 | `span.text-[#888888]` → `{{data13}}` + `span.text-black.border-l-[2px].border-[#e5e7eb].pl-[5px]`「复制」 |
| 交易快照 | 「交易快照」 | `span.w-[354px].text-right.text-[#888888]` → 字面量「发生交易争议时，可作为判断依据」 |
| 成交时间 | 「成交时间」 | `span.w-[354px].text-right.text-[#888888].time-h` → `{{data17_1}}` |
| 发货时间 | 「发货时间」 | 同上 → `{{data17}}` |
| 付款时间 | 「付款时间」 | 同上 → `{{data16}}` |
| 创建时间 | 「创建时间」 | 同上 → `{{data15}}` |
| 支付宝交易号 | 「支付宝交易号」 | `span.text-[#888888]` → `{{data14}}` |
| 收货信息 | `span.flex.items-center` → 「收货信息」+ `img.w-4.h-4.ml-1` `icons/eye-off.png` | `span.w-[354px].text-right.text-[#888888]` → `{{data1}}` |

`space-y-[23px]` = 行间 23px。`.time-h` = `font-variant-numeric: tabular-nums; letter-spacing: -0.03em`(等宽数字,时间列对齐用)。

## T5 footer 底部固定操作栏

```
footer.bg-white.flex.items-center.px-[24px].py-[10px].pb-[64px].absolute.bottom-0.left-0.right-0.border-t.border-[#e7e9ef]
├─ div.flex-1.flex.items-center.justify-between
│  ├─ div.flex.items-center.space-x-3
│  │  ├─ button.flex.flex-col.items-center.text-gray-500
│  │  │  ├─ img.w-7.h-7   icons/wangwang.png (66×66)   alt="旺旺客服"
│  │  │  └─ span.text-[16px].mt-1「客服」
│  │  └─ button.flex.flex-col.items-center.text-gray-500
│  │     ├─ img.w-7.h-7   icons/more-dots.png (66×66)   alt="更多"
│  │     └─ span.text-[16px].mt-1「更多」
│  └─ div.flex.items-center.space-x-3
│     ├─ button.py-2.bg-[#f2f4f5].rounded-[8px].text-gray-700.w-[133px].h-[52px].text-[19px]   {{bottomBtns1}}
│     ├─ button 同上                                                                            {{bottomBtns2}}
│     └─ button.py-2.bg-[#ff6303].text-white.rounded-[8px].font-medium.w-[133px].h-[52px].text-[19px]  {{bottomBtns3}}
└─ div.absolute.bottom-[10px].left-0.right-0.flex.items-center.justify-center      ← iOS Home 指示条
   └─ div.h-[7px].w-[205px].bg-[#000].rounded-[7.5px]
```

`footer` 是 `absolute bottom-0`,所以它脱离流,贴在 `#screen` 底部(1278px 处)。`pb-[64px]` 给 Home 指示条留空间。

## 编辑器字段(默认 33 个控件 / 展开扣减详情 38 个)

| # | label | v-model | type | 默认值 |
| --- | --- | --- | --- | --- |
| 1 | (助手提示段落) | — | — | `hasExtention === false` 分支 |
| 2 | 安卓状态栏 | `showAndroidBar` | checkbox | `false` |
| 3 | (按钮)订单状态 + 下拉 | — | button | 原生 `classList.toggle('hidden')` |
| 4 | 状态 | `headTitle` | text | `交易成功` |
| 5 | 物流状态 | `data3_1` | text | `已签收` |
| 6 | 收货信息1 | `headerAddress` | text | `王小花 86-189****3501 送至 华阳...` |
| 7 | 店铺名 | `selectedShopName` | text | `苹果官方旗舰店` |
| 8 | 店铺描述 | `shopTag` | text | `88VIP好评率97%，客服平均16秒回复` |
| 9 | 商品图 | `onFileSelected` | file | — |
| 10 | 店铺标识 | `onFileSelectedShopLogo` | file | — |
| 11 | 商品名 | `selectedProductTitle` | text | `苹果 iPhone 14 Pro 128GB 星夜黑 移动联通电信5G手机 双卡双待` |
| 12 | 款式 | `selectedSkuItemText` | text | `黑色 128G `(末尾空格) |
| 13 | 7 天无理由退货 | `data10` | text | `极速退款 7天无理由退换` |
| 14 | 共减总额 | `deductTotal` | text | `10.01` |
| 15 | 展示扣减详情 | `showDeductDetail` | checkbox | `false` |
| 16–20 | 扣减详情-商品总价 / 运费 / 店铺优惠 / 淘金币抵扣 / 红包 | `deductDetail.*` | text | `100.00` / `0` / `0` / `2.82` / `2.01`(仅 15 勾选时出现) |
| 21 | 价格 | `selectedPrice` | text | `2999.01` |
| 22 | 原价 | `productPrice2` | text | `6.93` |
| 23 | 数量 | `data19` | number | `1` |
| 24 | 实付款 | `data12` | text | `1998.01` |
| 25 | 订单编号 | `data13` | text | 随机,形如 `4146218899498929838` |
| 26 | 收货信息2 | `data1` | text | `王**, 86-181****3509, 浙江省 杭州市 余杭区 万科园区 **********` |
| 27 | 支付宝交易号 | `data14` | text | 随机,形如 `7582948447678261996699521772` |
| 28 | 订单日期 | `orderDate` | text | `2025-11-13` |
| 29 | 创建时间 | `data15` | text | `2025-11-13 01:13:40` |
| 30 | 付款时间 | `data16` | text | `2025-11-13 01:13:47` |
| 31 | 发货时间 | `data17` | text | `2025-11-13 08:37:38` |
| 32 | 成交时间 | `data17_1` | text | `2025-11-23 08:37:47` |
| 33 | 延长收货\|评价 | `bottomBtns1` | text | `闲鱼转卖` |
| 34 | 查看物流\|加入购物车 | `bottomBtns2` | text | `加入购物车` |
| 35 | 确认收货\|再买一单 | `bottomBtns3` | text | `再买一单` |
| 36 | (隐私马赛克开关,原站已注释) | — | — | 不实现 |
| 37 | (按钮)编辑信号与时间 → | — | button | — |

非编辑项固定值:`productBtn1` = `闲鱼转卖`、`productBtn2` = `申请售后`、`productBtn3` = `加入购物车`;`selectedPic` = `shared/images/product-default.webp`;`selectedShopLogoSrc` = `shared/icons/shop-logo-default.png`。

**随机字段处理**:`data13` 与 `data14` 原站每次加载随机。本仓库固定为实测值(`3223856491885473883` / `9722569586423222846428517492`),避免 SSR/CSR 水合不一致;随机化改为用户显式触发。

## 构建顺序与依赖

1. 基础层(与拼多多页共用,已完成)
2. shared 组件(与拼多多页共用)
3. 本页组件:`TaobaoCanvasHeader` → `TaobaoCanvasLogisticsRow` → `TaobaoShopRow` → `TaobaoProductRow` → `TaobaoDeductDetail` → `TaobaoPaidRow` → `TaobaoOrderInfoSection` → `TaobaoCanvasFooter` → `TaobaoOrderCanvas`(装配) → `OrderStatusDropdown` → `TaobaoOrderFields`
4. 页面装配:`page.tsx`
