# TaobaoOrderCanvas Specification

## Overview

- **Target file:** `src/components/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/TaobaoOrderCanvas.tsx`(+ 6 个子组件同目录)
- **Screenshot:** `docs/design-references/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/screen-canvas.png`
- **展开态截图:** `.../states/K-deduct-detail-screen.png`
- **Interaction model:** static — 唯一的状态是 `showDeductDetail`(受控 prop),它增删 5 行明细并翻转一个箭头。无 hover、无过渡、无动画。

## 与拼多多页的根本差异

本页 `#screen` **没有背景图** —— 原站把 `background-image: url(./img/success.png)` 整段注释掉了。所有文字都是真实 DOM,灰底由内容根的 `bg-[#f2f4f6]` 提供,各 `section` 显式 `bg-white`,靠 `mt-3` / `mb-3` 露出灰底分组。

## DOM Structure

```
div#screen (无背景图, padding-top 120px, overflow hidden)
├─ div.bg-[#f2f4f6].flex.flex-col.text-sm.w-[589.5px]
│  ├─ TaobaoCanvasHeader          div.bg-white…
│  ├─ TaobaoCanvasLogisticsRow    div.bg-white…
│  ├─ section.bg-white.mt-3.px-[24px].pb-[10px]
│  │  ├─ TaobaoShopRow
│  │  ├─ TaobaoProductRow
│  │  ├─ TaobaoDeductDetail       (v-if showDeductDetail)
│  │  └─ TaobaoPaidRow
│  ├─ TaobaoOrderInfoSection      section.bg-white.mt-3.mb-3…
│  └─ TaobaoCanvasFooter          footer.absolute.bottom-0
└─ CanvasStatusBar
```

## Computed Styles

### `#screen`
- `width: 589.5px`;`min-height: 1278px`;`max-height: 1278px`;`padding-top: 120px`
- `position: relative`;`overflow: hidden`;`background-color: rgb(255,255,255)`
- **无 `background-image`**
- 类:`mo-screen use-ios-bar-v2 max-h-[1278px]`

### 内容根
- `background-color: rgb(242,244,246)`;`display: flex`;`flex-direction: column`;`font-size: 14px`;`line-height: 20px`;`width: 589.5px`
- 类:`bg-[#f2f4f6] flex flex-col text-sm w-[589.5px]`

---

## 子组件 1:`TaobaoCanvasHeader`

- 容器:`background-color: #fff`;`display: flex`;`align-items: center`;`justify-content: space-between`;`padding: 0 24px 20px`;`position: relative`
  类:`bg-white flex items-center justify-between px-[24px] pb-5 relative`
- 左 `img`:32×32;类 `w-8 h-8`;`src` = `TAOBAO_ASSETS.headerBack`;`alt="图标"`
- 中 `div`:`font-size: 30px`;`line-height: 36px`;`font-weight: 500`;类 `font-medium text-3xl`;内容 `{headTitle}`
- 右 `img`:32×32;类 `w-8 h-8`;`src` = `TAOBAO_ASSETS.headerMore`;`alt="图标"`

> **已记录的偏差**:原站 DOM 里第一个 `<img>` 是三点「•••」、第二个是返回箭头「<」,但 `justify-between` 让第一个贴左、第二个贴右 —— 视觉上左边显示的是「•••」还是「<」取决于哪个在前。已导出两张 PNG 逐一核对:`45b853fa6918` = 三点,`b1109c32d8c3` = 返回箭头。参考截图里**左边是返回箭头**。因此本实现按视觉正确顺序渲染:左 `headerBack`、右 `headerMore`。

## 子组件 2:`TaobaoCanvasLogisticsRow`

- 容器:`background-color: #fff`;`padding: 20px 24px`;`display: flex`;`align-items: center`;`justify-content: space-between`
  类:`bg-white px-[24px] py-5 flex items-center justify-between`
- `div.flex.items-center.space-x-2`
  - `span`:`color: rgb(255,99,6)`;`font-size: 22px`;`font-weight: 500`;类 `text-[#ff6306] text-[22px] font-medium flex items-center space-x-2`
    - `img`:22×22;类 `w-[22px] h-[22px]`;`src` = `TAOBAO_ASSETS.logisticsBox`;`alt="位置图标"`
    - `span`:`border-right: 2px solid rgb(229,231,235)`;`padding-right: 9px`;类 `border-r-[2px] border-[#e5e7eb] pr-[9px]`;内容 `{data3_1}`
  - `span`:`color: #000`;`font-size: 22px`;`width: 404px`;`truncate`;类 `text-black text-[22px] truncate w-[404px]`;内容 `{headerAddress}`
- 右 `img`:16×16;类 `w-4 h-4`;`src` = `SHARED_ASSETS.chevronRight`;`alt="箭头"`

## 子组件 3:`TaobaoShopRow`

- 容器:`padding: 22px 0`;`display: flex`;`align-items: center`;`justify-content: space-between`;`border-bottom: 1px solid rgb(231,233,239)`
  类:`py-[22px] flex items-center justify-between border-b border-[#e7e9ef]`
- `div.flex.items-center.space-x-4`
  - 图容器:54×54;`background-color: #fff`;类 `w-[54px] h-[54px] bg-white flex items-center justify-center`
    - `img`:`w-full h-full object-cover rounded-[8px]`;`src` = `{selectedShopLogoSrc}`;`alt="店铺Logo"`
  - `div.leading-[26px]`
    - `div`:`font-size: 20px`;`font-weight: 500`;`max-width: 360px`;`max-height: 26px`;`overflow: hidden`
      类 `font-medium text-[20px] max-w-[360px] max-h-[26px] overflow-hidden`;内容 `{selectedShopName}`
    - `div`:`font-size: 18px`;`color: rgb(107,114,128)`;`margin-top: 2px`;类 `text-[18px] text-gray-500 mt-0.5`;内容 `{shopTag}`
- `a[href="#"]`:`font-size: 18px`;`color: rgb(123,136,157)`;类 `text-[18px] text-[#7b889d] flex items-center`
  - 文本 `进店逛逛` + `img.w-4.h-4.ml-1`(`chevronRight`,`alt="箭头"`)

## 子组件 4:`TaobaoProductRow`

- 容器:`padding: 20px 0`;类 `pt-5 pb-5`
- `div.flex.space-x-4`
  - 图容器:122×122;`background-color: rgb(229,231,235)`;`border-radius: 8px`;`flex-shrink: 0`;`overflow: hidden`
    类 `w-[122px] h-[122px] bg-gray-200 rounded-[8px] shrink-0 overflow-hidden`
    - `img#imagePreview.w-full.h-full.object-cover`;`src` = `{selectedPic}`;`alt="商品图片"`
  - `div`:类 `flex-1 space-y-5 pt-3`
    - **第 1 行** `div.flex.justify-between.items-start`
      - `div`:`line-height: 20px`;`font-size: 20px`;`height: 20px`;`overflow: hidden`;`padding-right: 8px`
        类 `leading-5 flex-1 pr-2 text-[20px] h-[20px] overflow-hidden`;内容 `{selectedProductTitle}`
      - `div`:`font-weight: 500`;`font-size: 20px`;`letter-spacing: -0.05em`;类 `font-medium text-[20px] tracking-tighter`
        - `span.text-[20px]`「¥」+ `{splitPrice(selectedPrice).yuan}` + `span.text-[16px]{fen}`
    - **第 2 行** `div.flex.justify-between.items-center.text-xs.text-gray-500`
      - `div`:`line-height: 20px`;`font-size: 19px`;`height: 19px`;`overflow: hidden`;类 `leading-5 text-[19px] h-[19px] overflow-hidden`;内容 `{selectedSkuItemText}`
      - `div`:`font-size: 17px`;`color: rgb(156,163,175)`;`letter-spacing: -0.05em`;类 `text-[17px] text-gray-400 tracking-tighter`;内容 `¥{productPrice2}`
    - **第 3 行** `div.flex.justify-between.items-center.text-xs.text-gray-500`
      - `div`:`color: rgb(0,153,102)`;`font-size: 17px`;类 `text-[#009966] text-[17px] flex item-center`
        > `item-center` 是原站笔误(应为 `items-center`),不生成规则。照抄。
        - `span` → `{data10}`
        - `ThinChevronRightIcon`:类 `w-[10px] h-[10px] text-[#009966] relative top-[4px] ml-1`;`viewBox="0 0 8 14"`;`stroke="currentColor"`;`stroke-width="2"`
      - `div.text-[17px]` → `x{data19}`
- **按钮行** `div.flex.justify-end.space-x-2.mt-2`
  - 前两个 `button`:`background-color: rgb(242,244,245)`;`border-radius: 8px`;`color: rgb(55,65,81)`;`width: 122px`;`height: 48px`;`font-size: 19px`
    类 `bg-[#f2f4f5] rounded-[8px] text-gray-700 w-[122px] h-[48px] text-[19px]`
  - 第三个 `button`:`background-color: rgb(254,238,229)`;`color: rgb(254,59,0)`;`font-weight: 500`
    类 `bg-[#feeee5] text-[#fe3b00] rounded-[8px] font-medium w-[122px] h-[48px] text-[19px]`
  - 文案固定:`闲鱼转卖` / `申请售后` / `加入购物车`(`TAOBAO_PRODUCT_BUTTONS`,原站无对应编辑框)

> 画布内所有 `button` 在原站**没有 hover 态** —— 它们是被截图的手机 UI 复刻,不是可交互控件。不要加 hover。

## 子组件 5:`TaobaoDeductDetail`(`showDeductDetail` 为真时渲染)

- 容器:`padding: 12px 0`;子间距 24px;`font-size: 19px`;`color: rgb(35,34,34)`;`line-height: 28px`
  类:`space-y-6 py-3 text-[19px] text-[#232222] leading-[28px]`

| 行 | 左 | 右 | 右侧类 |
| --- | --- | --- | --- |
| 1 | `span`「商品总价」 | `¥{deductDetail.total}` | `w-[354px] text-right font-semibold tracking-tighter` |
| 2 | `span`「运费」+ `span.ml-2.text-[17px].text-[#888888]`「运费(快递)」 | `¥{deductDetail.deliveryFee}` | 同上 |
| 3 | `span`「店铺优惠」 | `-¥{deductDetail.shopDiscount}` | `w-[354px] text-right text-[#fb7730] font-semibold tracking-tighter` |
| 4 | `span`「淘金币抵扣」 | `-¥{deductDetail.taocoin}` | 同上 |
| 5 | `span`「红包」 | `span` → `-¥{deductDetail.coupon}` + `img.w-4.h-4.ml-1.inline-block.relative.top-[-1px]`(`chevronRight`,`alt="红包图标"`) | `w-[354px] text-right text-[#fb7730] font-semibold tracking-tighter` |

## 子组件 6:`TaobaoPaidRow`

- 容器:`padding: 16px 0`;`display: flex`;`justify-content: space-between`;`align-items: flex-end`
  类:`py-4 flex justify-between items-end`
- 左 `span`:`color: rgb(55,65,81)`;`font-size: 22px`;类 `text-gray-700 text-[22px] flex items-center`
  - `div.flex.items-center`
    - `span.font-medium.mr-2`「实付款」
    - `span.text-[#fb7730]`「共减¥」
    - `span`:`color: rgb(251,119,48)`;`font-weight: 700`;`font-size: 28px`;`letter-spacing: -0.05em`
      类 `text-[#fb7730] font-bold text-[28px] tracking-tighter`;内容 `{deductTotal}`
- 右 `span.text-[19px].font-medium`
  - `span`:`font-size: 30px`;`font-weight: 600`;`letter-spacing: -0.05em`;`display: flex`;`flex-direction: row`
    类 `text-[30px] font-semibold tracking-tighter flex flex-row`
    - `span` > `span.text-[25px]`「¥」+ `{splitPrice(data12).yuan}`
    - `span.text-[22px].relative.top-[2px]` → `{splitPrice(data12).fen}`
    - `img`:16×16;类 `w-4 h-4 ml-2 relative top-[1px] origin-center` + 条件 `-rotate-90` / `rotate-90`;`src` = `chevronRight`;`alt="箭头"`

### States & Behaviors —— 箭头旋转

- **触发**:`showDeductDetail`
- **State A**(false):`class="… rotate-90"` → `transform: rotate(90deg)`
- **State B**(true):`class="… -rotate-90"` → `transform: rotate(-90deg)`
- **Transition**:**无**。原站是瞬时切换,不要加动画。
- **实现方式**:条件类名

## 子组件 7:`TaobaoOrderInfoSection`

- `section`:`background-color: #fff`;`margin: 12px 0`;`padding: 20px 24px`;子间距 23px;`font-size: 20px`;`color: rgb(35,34,34)`;`line-height: 28px`
  类:`bg-white mt-3 mb-3 px-[24px] py-5 space-y-[23px] text-[20px] text-[#232222] leading-[28px]`

**标题行**:类 `flex justify-between items-center pt-1`
- 左 `span`:`color: rgb(55,65,81)`;`font-weight: 500`;`font-size: 24px`;类 `text-gray-700 font-medium text-[24px] flex items-center`
  - `span`「订单信息」
  - `span`:`margin-left: 10px`;`color: rgb(136,136,136)`;`font-size: 20px`;`font-weight: 400`;类 `ml-[10px] text-[#888888] text-xl font-normal`;内容 `{orderDate}`
- 右 `span`:类 `text-[#888888] flex justify-between items-center`
  - `span.text-[#888888].pl-[5px]`「收起」
  - `img`:16×16;类 `w-4 h-4 ml-1 relative top-[1px] origin-center -rotate-90`;`src` = `chevronRight`;`alt="订单信息图标"`

**8 个数据行**(全部 `div.flex.justify-between`,部分带附加类):

| # | 左 | 右容器类 | 右内容 |
| --- | --- | --- | --- |
| 1 | `span`「订单编号」 | `span.text-[#888888]` | `{data13}` + ` ` + `span.text-black.border-l-[2px].border-[#e5e7eb].pl-[5px]`「复制」 |
| 2 | `span`「交易快照」 | `span.w-[354px].text-right.text-[#888888]` | 字面量 `发生交易争议时，可作为判断依据` |
| 3 | `span`「成交时间」 | `span.w-[354px].text-right.text-[#888888].time-h` | `{data17_1}` |
| 4 | `span`「发货时间」 | 同上 | `{data17}` |
| 5 | `span`「付款时间」 | 同上 | `{data16}` |
| 6 | `span`「创建时间」 | 同上 | `{data15}` |
| 7 | `span`「支付宝交易号」 | `span.text-[#888888]` | `{data14}` |
| 8 | `span.flex.items-center` → 「收货信息」+ `img.w-4.h-4.ml-1`(`TAOBAO_ASSETS.eyeOff`,`alt="收货信息图标"`) | `span.w-[354px].text-right.text-[#888888]` | `{data1}` |

`.time-h` → `font-variant-numeric: tabular-nums`;`letter-spacing: -0.03em`(时间列等宽对齐)。

第 1 行的 `{data13}` 与「复制」之间原站有一个**空格文本节点**,影响间距,需保留。
第 2 行的逗号是**全角**「，」。

## 子组件 8:`TaobaoCanvasFooter`

- `footer`:`background-color: #fff`;`display: flex`;`align-items: center`;`padding: 10px 24px 64px`;`position: absolute`;`bottom: 0`;`left: 0`;`right: 0`;`border-top: 1px solid rgb(231,233,239)`
  类:`bg-white flex items-center px-[24px] py-[10px] pb-[64px] absolute bottom-0 left-0 right-0 border-t border-[#e7e9ef]`
- `div.flex-1.flex.items-center.justify-between`
  - 左 `div.flex.items-center.space-x-3`
    - `button.flex.flex-col.items-center.text-gray-500`
      - `img.w-7.h-7`(28×28)`TAOBAO_ASSETS.wangwang`,`alt="旺旺客服"`
      - `span.text-[16px].mt-1`「客服」
    - `button.flex.flex-col.items-center.text-gray-500`
      - `img.w-7.h-7` `TAOBAO_ASSETS.moreDots`,`alt="更多"`
      - `span.text-[16px].mt-1`「更多」
  - 右 `div.flex.items-center.space-x-3`
    - 前两个 `button`:类 `py-2 bg-[#f2f4f5] rounded-[8px] text-gray-700 w-[133px] h-[52px] text-[19px]` → `{bottomBtns1}` / `{bottomBtns2}`
    - 第三个 `button`:类 `py-2 bg-[#ff6303] text-white rounded-[8px] font-medium w-[133px] h-[52px] text-[19px]` → `{bottomBtns3}`
- iOS Home 指示条:`div.absolute.bottom-[10px].left-0.right-0.flex.items-center.justify-center`
  - `div`:`height: 7px`;`width: 205px`;`background-color: #000`;`border-radius: 7.5px`;类 `h-[7px] w-[205px] bg-[#000] rounded-[7.5px]`

> `footer` 是 `absolute bottom-0`,脱离流,贴在 `#screen` 的 1278px 底部。`pb-[64px]` 给 Home 指示条留空间。

## Assets

| 用途 | 路径 | 原始 → 渲染 |
| --- | --- | --- |
| 标题栏返回箭头 | `TAOBAO_ASSETS.headerBack` | 66×66 → 32×32 |
| 标题栏三点 | `TAOBAO_ASSETS.headerMore` | 66×66 → 32×32 |
| 橙色包裹 | `TAOBAO_ASSETS.logisticsBox` | 46×45 → 22×22 |
| 旺旺客服 | `TAOBAO_ASSETS.wangwang` | 66×66 → 28×28 |
| 底栏三点 | `TAOBAO_ASSETS.moreDots` | 66×66 → 28×28 |
| 收货信息眼睛 | `TAOBAO_ASSETS.eyeOff` | 36×36 → 16×16 |
| 灰色右箭头(6 处复用) | `SHARED_ASSETS.chevronRight` | 36×36 → 16×16 |
| 默认商品图 | `SHARED_ASSETS.productDefault` | 800×800 → 122×122 |
| 默认店铺 Logo | `SHARED_ASSETS.shopLogoDefault` | 120×119 → 54×54 |
| 绿色细箭头 | `ThinChevronRightIcon`(内联) | 10×10 |

## Text Content(逐字,实测默认值)

```
headTitle            交易成功
data3_1              已签收
headerAddress        王小花 86-189****3501 送至 华阳...
selectedShopName     苹果官方旗舰店
shopTag              88VIP好评率97%，客服平均16秒回复
selectedProductTitle 苹果 iPhone 14 Pro 128GB 星夜黑 移动联通电信5G手机 双卡双待
selectedSkuItemText  黑色 128G          ← 末尾有一个半角空格
data10               极速退款 7天无理由退换
deductTotal          10.01
deductDetail.total        100.00
deductDetail.deliveryFee  0
deductDetail.shopDiscount 0
deductDetail.taocoin      2.82
deductDetail.coupon       2.01
selectedPrice        2999.01
productPrice2        6.93
data19               1
data12               1998.01
data13               3223856491885473883
data1                王**, 86-181****3509, 浙江省 杭州市 余杭区 万科园区 **********
data14               9722569586423222846428517492
orderDate            2025-11-13
data15               2025-11-13 01:13:40
data16               2025-11-13 01:13:47
data17               2025-11-13 08:37:38
data17_1             2025-11-23 08:37:47
bottomBtns1          闲鱼转卖
bottomBtns2          加入购物车
bottomBtns3          再买一单
```

字面量:`进店逛逛`、`闲鱼转卖`、`申请售后`、`加入购物车`、`商品总价`、`运费`、`运费(快递)`、`店铺优惠`、`淘金币抵扣`、`红包`、`实付款`、`共减¥`、`订单信息`、`收起`、`订单编号`、`复制`、`交易快照`、`发生交易争议时，可作为判断依据`、`成交时间`、`发货时间`、`付款时间`、`创建时间`、`支付宝交易号`、`收货信息`、`客服`、`更多`

`shopTag` 与「发生交易争议时」的逗号是**全角**「，」。

## Responsive Behavior

- **Desktop (1440px) / Tablet (768px)**:589.5×1278 完整可见
- **Mobile (390px)**:`.screen-ct` 降为 390px,`#screen` 仍 589.5px,父级 `overflow-x-hidden` → 右侧裁切,不缩放
- **Breakpoint**:768px。画布自身无响应式规则。
