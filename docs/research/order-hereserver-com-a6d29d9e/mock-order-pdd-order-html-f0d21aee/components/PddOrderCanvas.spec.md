# PddOrderCanvas Specification

## Overview

- **Target file:** `src/components/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/PddOrderCanvas.tsx`
- **Screenshot:** `docs/design-references/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/screen-canvas.png`
- **Background art:** `public/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/images/pdd-bg.compressed.png`
- **Interaction model:** static — every value is a prop. No hover, no scroll, no click behaviour anywhere inside the canvas.

## ⚠️ 架构前提:背景图承重

`#screen` 用 `background-size: cover` 铺一张 **1179×2556** 的 iPhone 原生截图,恰好是 589.5×1278 的 2 倍,所以是精确贴合(两者宽高比都是 0.4613)。

**这张 PNG 里烤进了以下全部内容**(DOM 中不存在):

- 返回箭头 `<`、YTO 物流 logo(被上传的 `logisticsLogo` 覆盖)、红色定位图钉的外框
- 两枚绿色标签:`月卡专享·退货包运费保障中 >`、`7天无理由退货 >`
- 三个按钮:`分享商品`、`联系商家`、`申请退款`
- `共优惠` 与 `(免运费)`
- 全部行标签:`拼单价`、`平台优惠`、`多多支付立减优惠`、`订单编号:`、`支付方式:`、`商品快照:`、`物流公司:`、`快递单号:`、`下单时间:`、`拼单时间:`、`发货时间:`
- 两个 `复制` 按钮、拼单时间处的礼帽 emoji
- 底部操作栏:`更多`、`申请发票`、`查看物流`、`确认收货`
- iOS Home 指示条

DOM 只渲染**数值**,靠 `<span className="invisible">…</span>` 占位把数值推到与图中标签水平对齐的位置。

**因此:任何 `w-[354px]` / `w-[448px]` / `ml-[60px]` / `mt-[101px]` / `pr-[72px]` / `pl-[39px]` / `pl-[65px]` 都不可改动。** `invisible` 占位文案也必须逐字照抄(它决定占位宽度),包括第 8 行原站把「快递单号」误写成「物流公司」这一处。

## DOM Structure

```
div.screen-ct.relative
├─ ScreenMirror overlay          (仅出图后)
└─ div#screen  ← ref,html2canvas 取图目标
   ├─ div (内容根, top-[-15px])
   │  ├─ [1] 状态标题行
   │  ├─ [2] 物流行
   │  ├─ [3] 收货地址块
   │  ├─ [4] section 店铺+商品+实付
   │  └─ [5] section 明细 11 行
   └─ CanvasStatusBar
```

## Computed Styles(全部来自 getComputedStyle)

### `.screen-ct`
- `width: 589.5px`;`height: 1278px`;`position: relative`
- 类:`screen-ct relative`

### `#screen`
- `width: 589.5px`;`min-height: 1278px`;`max-height: 1278px`;`height: 1278px`
- `padding-top: 120px`;`position: relative`;`overflow: hidden`
- `background-color: rgb(255,255,255)`
- `background-image: url(pdd-bg.compressed.png)`;`background-size: cover`;`background-repeat: no-repeat`;`background-position: 0px 0px`
- `user-select: none`(经 `.mo-screen`)
- 类:`mo-screen use-ios-bar-v2 max-h-[1278px]`,内联 style 提供尺寸/内边距/背景

### 内容根 div
- `display: flex`;`flex-direction: column`;`font-size: 14px`;`line-height: 20px`
- `width: 589.5px`;`height: 1007px`;`position: relative`;`top: -15px`
- 类:`flex flex-col text-sm w-[589.5px] relative top-[-15px]`

### [1] 状态标题行
- 容器:`color: rgb(37,181,20)`;`display: flex`;`align-items: center`;`justify-content: center`;`padding: 0 24px 30px`;`position: relative`;子间距 8px
  类:`text-[#25b514] flex items-center justify-center px-[24px] pb-[30px] relative space-x-2`
- `img`:类 `w-8 h8`(原站 `h8` 是笔误,不产生高度;实际 32×32 由 `w-8` + 图片比例得出)。`src` = `PDD_ASSETS.deliveryTruck`,`alt="店铺图标"`
- `div`:`font-size: 26px`;`font-weight: 500`;类 `font-medium text-[26px]`;内容 `{headTitle}`

### [2] 物流行
- 容器:`padding: 20px 24px 20px 65px`;`display: flex`;`align-items: center`;`justify-content: space-between`;`position: relative`
  类:`px-[24px] pl-[65px] py-5 flex items-center justify-between relative`
- `img`(仅 `logisticsLogo` 非空时渲染):类 `bg-white rounded-[2px] [35px] h-[35px] rounded absolute top-[14px] left-[19px]`
  > 原站类里的 `[35px]` 是漏写 `w-` 的残缺 arbitrary value,不生成规则;`rounded-[2px]` 与后面的 `rounded` 同时存在,后者(4px)在 CSS 顺序上不一定胜出。**照抄类名**,实际圆角由 Tailwind 生成顺序决定,与原站一致。
- `div`:类 `flex items-center space-x-2`
  - `span`:`font-size: 22px`;类 `text-[22px] flex items-center space-x-2`
    - `span`:`border-right: 1px solid rgb(229,231,235)`;`padding-right: 9px`;类 `border-r-[1px] border-[#e5e7eb] pr-[9px]`;内容 `{data3_1}`
  - `span`:`color: rgb(0,0,0)`;`font-size: 22px`;`width: 404px`;`overflow: hidden`;`text-overflow: ellipsis`;`white-space: nowrap`
    类 `text-black text-[22px] truncate w-[404px]`;内容 `{headerAddress}`

### [3] 收货地址块
- 容器:`padding: 15px 24px`;类 `px-[24px] py-[15px]`
- 第一行 `div.flex.items-center.justify-between` > `div.flex.items-center.bg-white`
  - `span`:`background-color: #fff`;`color: rgb(255,99,6)`;`font-size: 22px`;`font-weight: 500`;`position: relative`;`top: 13px`;`left: -6px`
    类 `bg-white text-[#ff6306] text-[22px] font-medium flex items-center space-x-2 relative top-[13px] left-[-6px]`
    - `LocationPinIcon`(38×38,`fill #d81e06`,类 `icon`)
  - `span`:`color: #000`;`font-size: 22px`;`width: 454px`;`truncate`
    类 `bg-whiteml-1 text-black text-[22px] truncate w-[454px] flex items-center space-x-2`
    > `bg-whiteml-1` 是原站 `bg-white ml-1` 漏空格的产物,**两条规则都不生效**。照抄类名。
    - `span` → `{address}`
    - `span` > `EyeOffIcon`(21×21,`fill #8a8a8a`,类 `icon`)
    - `span` → `{city}`
- 第二行:`font-size: 22px`;`padding-left: 39px`;`margin-top: 4px`;`background-color: #fff`
  类 `flex items-center justify-start text-[22px] pl-[39px] mt-1 space-x-2 bg-white`
  - `span`:`max-width: 400px`;`truncate`;类 `truncate max-w-[400px]`;内容 `{headerPhone}`

> 这两行的 `bg-white` 是**功能性的** —— 用白底盖掉背景 PNG 里原有的地址文字。

### [4] section 店铺 + 商品 + 实付
- `section`:`margin-top: 12px`;`padding: 0 24px 10px`;类 `mt-3 px-[24px] pb-[10px]`

**店铺行**:`padding: 22px 0 0`;类 `py-[22px] pb-[0] flex items-center justify-start`
- `div.flex.items-center.space-x-2`
  - `span > img`:`width/height: 26px`;`object-fit: cover`;`border-radius: 2px`;类 `w-[26px] h-[26px] object-cover rounded-[2px]`;`src` = `{selectedShopLogoSrc}`;`alt="品牌图标"`
  - `span`:`font-size: 22px`;类 `text-[22px]`;内容 `{selectedShopName}`
- `a[href="#"]`:`font-size: 18px`;`color: rgb(123,136,157)`;类 `text-[18px] text-[#7b889d] flex items-center`
  - `img`:16×16;类 `w-4 h-4 ml-1`;`src` = `SHARED_ASSETS.chevronRight`;`alt="箭头"`

**商品行**:`padding: 12px 0 20px`;类 `pt-3 pb-5`
- `div.flex.space-x-4`
  - 图容器:`width/height: 122px`;`background-color: rgb(229,231,235)`;`border-radius: 8px`;`flex-shrink: 0`;`overflow: hidden`
    类 `w-[122px] h-[122px] bg-gray-200 rounded-[8px] shrink-0 overflow-hidden`
    - `img#imagePreview`:`w-full h-full object-cover`;`src` = `{selectedPic}`;`alt="商品图片"`
  - `div`:类 `flex-1 space-y-5`
    - `div.flex.justify-between.items-start`
      - `div`:`font-size: 20px`;`height: 88px`;`overflow: hidden`;`padding-right: 8px`;子间距 12px
        类 `flex-1 pr-2 text-[20px] h-[88px] overflow-hidden space-y-3`
        - `div`:`line-height: 28px`;`height: 56px`;`overflow: hidden`;类 `leading-7 h-[56px] overflow-hidden`;内容 `{selectedProductTitle}`
        - `div`:`font-size: 19px`;`height: 19px`;`overflow: hidden`;`color: rgb(156,163,175)`;类 `text-[19px] h-[19px] overflow-hidden text-gray-400`;内容 `{selectedSkuItemText}`
      - `div`:`font-weight: 500`;`font-size: 20px`;`letter-spacing: -0.05em`;`color: rgb(156,163,175)`;`text-align: right`;`margin-top: 4px`;子间距 4px
        类 `font-medium text-[20px] tracking-tighter text-gray-400 text-right space-y-1 mt-1`
        - `div` > `span.text-sm`「¥」+ `{selectedPrice}`
        - `div.text-[17px]` → `x{data19}`

**抵扣款行**:`padding: 16px 0`;`margin-top: 101px`;`align-items: flex-end`
类 `py-4 flex justify-between items-end mt-[101px]`
- 左 `span`:`color: rgb(55,65,81)`;`font-size: 22px`;类 `text-gray-700 text-[22px] flex items-center`
  - `span`:`font-size: 20px`;`letter-spacing: -0.05em`;`margin-left: 60px`;`color: rgb(216,30,6)`
    类 `text-[20px] tracking-tighter ml-[60px] text-[#d81e06]`;内容 `¥{deductTotal}`
- 右 `span.text-[19px]`:字面量 `实付:` +
  - `span`:`color: rgb(216,30,6)`;`letter-spacing: -0.05em`;`padding-right: 72px`
    类 `text-[#d81e06] tracking-tighter pr-[72px]`(原站该类串尾部带一个制表符,无影响)
    - `span.text-sm`「¥」
    - `span.text-[22px].font-[200]` → `{splitPrice(data12).yuan}`
    - `span.text-[16px]` → `{splitPrice(data12).fen}`

### [5] section 明细 11 行
- `section`:`margin-bottom: 12px`;`padding: 8px 19px 0`;子间距 12px;`font-size: 20px`;`color: rgb(35,34,34)`
  类 `mb-3 px-[19px] pt-[8px] space-y-3 text-[20px] text-[#232222]`

逐行(左侧一律 `span.invisible`,只占宽度):

| # | 行容器附加类 | invisible 文案 | 值容器类 | 内容 |
| --- | --- | --- | --- | --- |
| 1 | — | `拼单价` | `w-[354px] text-right text-[#5f5e5e]` | `¥{pinDanJia}` |
| 2 | — | `平台优惠` | 同上 | `-¥{pingTaiYouHui}` |
| 3 | — | `多多支付立减优惠` | 同上 | `-¥{duoduoLiJian}` |
| 4 | `pt-[18px]` | `订单编号` | `w-[448px] text-[#888888]` | `{data13}` |
| 5 | — | `支付方式` | `div.w-[448px].text-[#888888]` | `div{payMethod}` + `div.mt-[10px]{payCard}` |
| 6 | — | `商品快照` | `w-[448px] text-[#888888]` | 字面量 `核对交易细节时，可作为判断依据` |
| 7 | `pt-[1px]` | `物流公司` | 同上 | `{logisticsName}` |
| 8 | `pt-[1px]` | `物流公司` ← **原站如此,勿改** | 同上 | `{logisticsNo}` |
| 9 | `pt-[1px]` | `下单时间` | 同上 | `{data15}` |
| 10 | `pt-[1px]` | `拼单时间` | `w-[448px] text-[#888888] relative` | `img` v-if=`userAvatar` + `{data16}` |
| 11 | `pt-[1px]` | `发货时间` | `w-[448px] text-[#888888]` | `{data17}` |

第 10 行的头像 `img`(仅 `userAvatar` 非空时渲染):
`background-color: #fff`;`position: absolute`;`top: -4px`;`left: 211px`;`width/height: 28px`;`border-radius: 50%`
类 `bg-white absolute top-[-4px] left-[211px] w-[28px] h-[28px] rounded-full`;`alt="用户头像"`

第 6 行文案中的逗号是**全角**「，」,原站如此。

## States & Behaviors

### 画布自身
**N/A** —— 完全静态,所有内容由 props 决定。无 hover、无过渡、无动画。

### 受 props 驱动的条件渲染
| 条件 | 效果 |
| --- | --- |
| `logisticsLogo` 为空 | [2] 的物流商标 `<img>` **整体不渲染**(原站 `v-if`),露出背景图里的 YTO logo |
| `userAvatar` 为空 | [5] 第 10 行的头像 `<img>` **整体不渲染**,露出背景图里的礼帽 emoji |
| `showAndroidBar` | 由 `CanvasStatusBar` 处理,见共享规格 |

## Assets

| 用途 | 路径 | 原始尺寸 → 渲染尺寸 |
| --- | --- | --- |
| 画布背景 | `PDD_ASSETS.canvasBackground` | 1179×2556 → 589.5×1278(cover) |
| 已签收货车 | `PDD_ASSETS.deliveryTruck` | 66×66 → 32×32 |
| 默认商品图 | `SHARED_ASSETS.productDefault` | 800×800 → 122×122 |
| 默认店铺 Logo | `SHARED_ASSETS.shopLogoDefault` | 120×119 → 26×26 |
| 右箭头 | `SHARED_ASSETS.chevronRight` | 36×36 → 16×16 |
| 定位图钉 | `LocationPinIcon`(内联 SVG) | 38×38 |
| 隐藏眼睛 | `EyeOffIcon`(内联 SVG) | 21×21 |

## Text Content(逐字,来自实测默认值)

```
headTitle           已签收 已按承诺时间送达
data3_1             已签收
headerAddress       5天前［菜鸟驿站］海口市万科园区三幢四区
address             张三丰 188****3123
city                海口市三亚区
headerPhone         万科园区 86-189****3501
selectedShopName    苹果官方旗舰店
selectedProductTitle 苹果 iPhone 14 Pro 128GB 星夜黑 移动联通电信5G手机 双卡双待
selectedSkuItemText 黑色 128G          ← 末尾有一个半角空格
deductTotal         10.01
pinDanJia           9.9
pingTaiYouHui       10.01
duoduoLiJian        8.01
selectedPrice       2999.01
data19              1
data12              1998.01
data13              429231-3427912734114563867
data15              2025-11-13 01:13:40
data16              2025-11-13 01:13:47
data17              2025-11-13 08:37:38
payMethod           多多支付
payCard             工商银行储蓄卡(2023)支付¥3.12
logisticsName       圆通快递
logisticsNo         YT9917335767750
```

字面量:`实付:`、`核对交易细节时，可作为判断依据`

`headerAddress` 里的 `［］` 是**全角方括号**,原站如此。

## Responsive Behavior

- **Desktop (1440px)**:画布 589.5×1278 完整可见
- **Tablet (768px)**:同上;页面整体横向溢出到 1294px
- **Mobile (390px)**:`.screen-ct` 宽度降为 390px,但 `#screen` 仍固定 589.5px,父级 `overflow-x-hidden` 生效 → **画布右侧被裁切,不缩放**
- **Breakpoint**:768px。画布本身没有任何响应式规则 —— 它模拟固定宽度的手机截图。
