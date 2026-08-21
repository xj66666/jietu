# 页面拓扑(PAGE_TOPOLOGY) — 拼多多订单生成器

源 URL:`https://order.hereserver.com/mock-order/pdd/order.html`
目标路由:`/mock-order/pdd/order.html`
路由文件:`src/app/mock-order/pdd/order.html/page.tsx`
组件根:`src/components/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/`
同站共享组件根:`src/components/sites/order-hereserver-com-a6d29d9e/shared/`

## 页面级布局

```
<body class="bg-gray-100 text-gray-900 min-h-screen" id="app">      ← Vue 挂载点
│
├─ [S1] nav                          fixed 层级 z-50,md:sticky md:top-0
│
└─ div.max-w-[1440px].mx-auto
   └─ div.flex.flex-col.md:flex-row.md:gap-6.md:px-4.overflow-x-hidden.md:overflow-visible
      │
      ├─ [S2] div.flex.justify-center.gap-4.py-4.md:hidden      仅 <768px
      │
      ├─ [S3] aside#separator-sidebar                            256px,md:sticky md:top-[60px]
      │
      ├─ [S4] div.screen-ct.relative                            589.5 × 1278
      │        ├─ [S4.0] div.screen-mirror                       z-50 覆盖层,v-if=screenMirrorData
      │        └─ div#screen.use-ios-bar-v2.max-h-[1278px]       背景图 pdd-bg,padding-top 120px
      │           ├─ div.flex.flex-col.text-sm.w-[589.5px].relative.top-[-15px]
      │           │   ├─ [S4.1] 状态标题行
      │           │   ├─ [S4.2] 物流行
      │           │   ├─ [S4.3] 收货地址块
      │           │   ├─ [S4.4] section — 店铺 + 商品 + 实付
      │           │   └─ [S4.5] section — 明细/订单信息行组
      │           ├─ [S5a] div.ios-bar…ios-bar-v2                absolute top-0,74.5px 高
      │           └─ [S5b] div.material-top-bar                  absolute top-0,默认 hidden
      │
      └─ [S6] div#editor-ct.sidebar                              384px,md:sticky md:top-[60px]
         ├─ [S6.0] div.user-container   登录条
         ├─ [S6.1] div.p-6              生成截图 / 导出
         ├─ [S6.2] div.p-6.pt-0         订单信息面板   v-show=!enableEditTopbar
         └─ [S6.3] div.p-6.pt-0         信号与时间面板 v-show=enableEditTopbar
│
└─ [S7] 两个常显 Tippy 浮层(渲染到 body 末尾,z-9999)
```

`z-index` 分层:`nav` = 50;`.screen-mirror` = 50;`#pwall` = 100(不移植);Tippy = 9999;`.ios-bar` 无 z-index,靠 DOM 顺序压在内容之上;`em.battery-value` = 1,`i.battery-value-number` = 10。

## 区块清单

| ID | 名称 | 交互模型 | 复杂度 | 归属 |
| --- | --- | --- | --- | --- |
| S1 | `SiteTopbar` | 静态 | 低 | shared |
| S2 | `MobileNavToggleRow` | 点击 | 低 | shared |
| S3 | `ToolNavSidebar` | 静态 + hover | 低(18 项数据驱动) | shared |
| S4 | `PddOrderCanvas` | 静态(受 props 驱动) | **高** | 本页 |
| S4.1–S4.5 | 画布 5 个子区 | 静态 | 中 | 本页(拆子组件) |
| S5a | `IosStatusBar` | 受 props 驱动多状态 | 中 | shared |
| S5b | `AndroidStatusBar` | 受 props 驱动 | 中 | shared |
| S6.0 | `EditorLoginStrip` | 静态(不可点通) | 低 | shared |
| S6.1 | `EditorActionBar` | 点击(截图导出) | 中 | shared |
| S6.2 | `PddOrderFields` | 输入驱动 | 中(28 控件) | 本页 |
| S6.3 | `StatusBarFields` | 输入驱动 | 低(7 控件) | shared |
| S7 | `PinnedTooltip` | 静态 | 低 | shared |

## S4 画布逐区细节

`#screen` 关键实测值:

```
width: 589.5px;  min-height: 1278px;  max-height: 1278px;  height: 1278px;
padding-top: 120px;  position: relative;  overflow: hidden;
background-color: #fff;
background-image: url(pdd-bg.compressed.png);   /* 原图 1179×2556,恰为 589.5×1278 的 2 倍 */
background-size: cover;  background-repeat: no-repeat;  background-position: 0 0;
user-select: none;
```

内容根 `div.flex.flex-col.text-sm.w-[589.5px].relative.top-[-15px]` 实测 589.5×1007。

> **背景图是承重结构,不是装饰。** PNG 里烤进了:iOS 状态栏(被 `.ios-bar` 盖住)、返回箭头、YTO 物流 logo、红色定位图钉、两枚绿色标签(月卡专享·退货包运费保障中 / 7天无理由退货)、三个按钮(分享商品 / 联系商家 / 申请退款)、`共优惠` 与 `(免运费)`、全部行标签(拼单价 / 平台优惠 / 多多支付立减优惠 / 订单编号: / 支付方式: / 商品快照: / 物流公司: / 快递单号: / 下单时间: / 拼单时间: / 发货时间:)、两个「复制」按钮、拼单时间处的礼帽 emoji、底部操作栏(更多 / 申请发票 / 查看物流 / 确认收货)、iOS Home 指示条。
>
> DOM 只渲染**数值**,靠 `<span class="invisible">…</span>` 占位把数值推到与图中标签对齐的位置。任何一处宽度改动都会错位。

### S4.1 状态标题行

```
div.text-[#25b514].flex.items-center.justify-center.px-[24px].pb-[30px].relative.space-x-2
├─ img.w-8.h8        ← 注意原站类名是 "h8"(拼写错误,不产生高度),实际靠 w-8 与图片比例得 32×32
│                       资源:icons/delivery-truck.png (66×66)  alt="店铺图标"
└─ div.font-medium.text-[26px]   {{headTitle}}   26px w500 色 #25b514(继承)
```

`space-x-2` = 子元素间 8px。默认文案「已签收 已按承诺时间送达」。

### S4.2 物流行

```
div.px-[24px].pl-[65px].py-5.flex.items-center.justify-between.relative
├─ img  v-if="logisticsLogo"   物流商标(用户上传;为空则整个 img 不渲染)
│   class="bg-white rounded-[2px] [35px] h-[35px] rounded absolute top-[14px] left-[19px]"
│   ← 原站类里 "[35px]" 是残缺写法(缺 w-),不生效;实际宽度由图片比例 + h-[35px] 决定
├─ div.flex.items-center.space-x-2
│  ├─ span.text-[22px].flex.items-center.space-x-2
│  │  └─ span.border-r-[1px].border-[#e5e7eb].pr-[9px]   {{data3_1}}  「已签收」
│  └─ span.text-black.text-[22px].truncate.w-[404px]     {{headerAddress}}
```

`data3_1`(物流状态)在本页**没有对应编辑框**(原站已注释掉),固定为「已签收」。

### S4.3 收货地址块

```
div.px-[24px].py-[15px]
├─ div.flex.items-center.justify-between
│  └─ div.flex.items-center.bg-white
│     ├─ span.bg-white.text-[#ff6306].text-[22px].font-medium.flex.items-center.space-x-2.relative.top-[13px].left-[-6px]
│     │  └─ svg 38×38  viewBox="0 0 1024 1024"  fill="#d81e06"   定位图钉
│     └─ span."bg-whiteml-1".text-black.text-[22px].truncate.w-[454px].flex.items-center.space-x-2
│        │   ← 原站类名 "bg-whiteml-1" 是 "bg-white ml-1" 漏空格的产物,两者都不生效
│        ├─ span   {{address}}          「张三丰 188****3123」
│        ├─ span > svg 21×21  viewBox="0 0 1024 1024"  fill="#8a8a8a"   眼睛(隐藏)图标
│        └─ span   {{city}}             「海口市三亚区」
└─ div.flex.items-center.justify-start.text-[22px].pl-[39px].mt-1.space-x-2.bg-white
   └─ span.truncate.max-w-[400px]   {{headerPhone}}   「万科园区 86-189****3501」
```

`bg-white` 在这里是**功能性的** —— 用白底盖住背景 PNG 中原有的地址文字。

### S4.4 section — 店铺 + 商品 + 实付

```
section.mt-3.px-[24px].pb-[10px]
├─ div.py-[22px].pb-[0].flex.items-center.justify-start
│  ├─ div.flex.items-center.space-x-2
│  │  ├─ span > img.w-[26px].h-[26px].object-cover.rounded-[2px]   {{selectedShopLogoSrc}}
│  │  └─ span.text-[22px]   {{selectedShopName}}   「苹果官方旗舰店」
│  └─ a[href="#"].text-[18px].text-[#7b889d].flex.items-center
│     └─ img.w-4.h-4.ml-1   chevron-right.png
├─ div.pt-3.pb-5
│  └─ div.flex.space-x-4
│     ├─ div.w-[122px].h-[122px].bg-gray-200.rounded-[8px].shrink-0.overflow-hidden
│     │  └─ img#imagePreview.w-full.h-full.object-cover   {{selectedPic}}
│     └─ div.flex-1.space-y-5
│        └─ div.flex.justify-between.items-start
│           ├─ div.flex-1.pr-2.text-[20px].h-[88px].overflow-hidden.space-y-3
│           │  ├─ div.leading-7.h-[56px].overflow-hidden   {{selectedProductTitle}}
│           │  └─ div.text-[19px].h-[19px].overflow-hidden.text-gray-400   {{selectedSkuItemText}}
│           └─ div.font-medium.text-[20px].tracking-tighter.text-gray-400.text-right.space-y-1.mt-1
│              ├─ div > span.text-sm「¥」+ {{selectedPrice}}
│              └─ div.text-[17px]   x{{data19}}
└─ div.py-4.flex.justify-between.items-end.mt-[101px]        ← mt-[101px] 把这行推到背景图的「共优惠」行
   ├─ span.text-gray-700.text-[22px].flex.items-center
   │  └─ span.text-[20px].tracking-tighter.ml-[60px].text-[#d81e06]   ¥{{deductTotal}}
   └─ span.text-[19px]
      「实付:」
      └─ span.text-[#d81e06].tracking-tighter.pr-[72px]
         ├─ span.text-sm「¥」
         ├─ span.text-[22px].font-[200]   {{splitPrice(data12).yuan}}   「1998」
         └─ span.text-[16px]              {{splitPrice(data12).fen}}    「.01」
```

`splitPrice(v)` 把金额字符串按小数点拆成 `{ yuan, fen }`,`fen` 含小数点(实测渲染出 `1998` + `.01`)。

### S4.5 section — 明细 / 订单信息行组

```
section.mb-3.px-[19px].pt-[8px].space-y-3.text-[20px].text-[#232222]
```

10 行,统一是 `div.flex.justify-between` + 左侧 `span.invisible` 占位 + 右侧值。逐行:

| 行 | 占位文案(invisible) | 值容器类 | 内容 |
| --- | --- | --- | --- |
| 1 | 拼单价 | `w-[354px] text-right text-[#5f5e5e]` | `¥{{pinDanJia}}` |
| 2 | 平台优惠 | 同上 | `-¥{{pingTaiYouHui}}` |
| 3 | 多多支付立减优惠 | 同上 | `-¥{{duoduoLiJian}}` |
| 4 | 订单编号(容器加 `pt-[18px]`) | `w-[448px] text-[#888888]` | `{{data13}}` |
| 5 | 支付方式 | `div.w-[448px].text-[#888888]` | `div{{payMethod}}` + `div.mt-[10px]{{payCard}}` |
| 6 | 商品快照 | `w-[448px] text-[#888888]` | 字面量「核对交易细节时，可作为判断依据」 |
| 7 | 物流公司(容器加 `pt-[1px]`) | 同上 | `{{logisticsName}}` |
| 8 | 物流公司(**原站占位文案重复,非笔误**) | 同上 | `{{logisticsNo}}` |
| 9 | 下单时间(`pt-[1px]`) | 同上 | `{{data15}}` |
| 10 | 拼单时间(`pt-[1px]`) | `w-[448px] text-[#888888] relative` | `img` v-if=userAvatar(`absolute top-[-4px] left-[211px] w-[28px] h-[28px] rounded-full bg-white`)+ `{{data16}}` |
| 11 | 发货时间(`pt-[1px]`) | `w-[448px] text-[#888888]` | `{{data17}}` |

`space-y-3` = 行间 12px。第 8 行的占位文案在原站确实写的是「物流公司」而不是「快递单号」——`invisible` 只用来占宽度,文案不可见,**照抄即可,不要"修正"**(改了会改变占位宽度 → 错位)。

## S6.2 订单信息面板字段(28 个控件,顺序即原站顺序)

| # | label | v-model | type | 默认值 |
| --- | --- | --- | --- | --- |
| 1 | (助手提示段落) | — | — | `hasExtention === false` 分支 |
| 2 | 安卓状态栏 | `showAndroidBar` | checkbox | `false` |
| 3 | 状态 | `headTitle` | text | `已签收 已按承诺时间送达` |
| 4 | 收货信息1 | `headerAddress` | text | `5天前［菜鸟驿站］海口市万科园区三幢四区` |
| 5 | 收货信息2 | `address` | text | `张三丰 188****3123` |
| 6 | 收货信息2城市 | `city` | text | `海口市三亚区` |
| 7 | 收货信息3 | `headerPhone` | text | `万科园区 86-189****3501` |
| 8 | 店铺名 | `selectedShopName` | text | `苹果官方旗舰店` |
| 9 | 商品图 | `onFileSelected` | file | — |
| 10 | 店铺标识 | `onFileSelectedShopLogo` | file | — |
| 11 | 用户头像 | `onFileSelectedUserAvatar` | file | — |
| 12 | 物流公司商标 | `onFileSelectedLogisticsLogo` | file | — |
| 13 | 商品名 | `selectedProductTitle` | text | `苹果 iPhone 14 Pro 128GB 星夜黑 移动联通电信5G手机 双卡双待` |
| 14 | 款式 | `selectedSkuItemText` | text | `黑色 128G `(**末尾有一个空格**) |
| 15 | 共减总额 | `deductTotal` | text | `10.01` |
| 16 | 拼单价 | `pinDanJia` | text | `9.9` |
| 17 | 平台优惠 | `pingTaiYouHui` | text | `10.01` |
| 18 | 多多支付立减优惠 | `duoduoLiJian` | text | `8.01` |
| 19 | 价格 | `selectedPrice` | text | `2999.01` |
| 20 | 数量 | `data19` | number(min 1,max 1000) | `1` |
| 21 | 实付款 | `data12` | text | `1998.01` |
| 22 | 订单编号 | `data13` | text | 每次加载随机,形如 `429231-9127198787175715832` |
| 23 | 下单时间 | `data15` | text | `2025-11-13 01:13:40` |
| 24 | 拼单时间 | `data16` | text | `2025-11-13 01:13:47` |
| 25 | 发货时间 | `data17` | text | `2025-11-13 08:37:38` |
| 26 | 支付方式 | `payMethod` | text | `多多支付` |
| 27 | 支付卡 | `payCard` | text | `工商银行储蓄卡(2023)支付¥3.12` |
| 28 | 物流公司 | `logisticsName` | text | `圆通快递` |
| 29 | 物流单号 | `logisticsNo` | text | `YT9917335767750` |
| 30 | (按钮)编辑信号与时间 → | — | button | — |

默认画布还渲染:`selectedPic` = `shared/images/product-default.webp`,`selectedShopLogoSrc` = `shared/icons/shop-logo-default.png`,`logisticsLogo` 与 `userAvatar` 为空。

**随机字段处理**:`data13`(订单编号)在原站每次加载随机生成。为避免 Next.js SSR/CSR 水合不一致,本仓库固定为实测到的一个值 `429231-3427912734114563867`,并提供「重新随机」能力由用户显式触发(不在渲染期调用 `Math.random()`)。

## 构建顺序与依赖

1. **基础层(顺序,主控执行)**:字体 → globals 站点样式 → TS 类型 → 共享图标 → 资源(已完成)
2. **shared 组件**:`IosStatusBar`、`AndroidStatusBar`、`SiteTopbar`、`ToolNavSidebar`、`MobileNavToggleRow`、`EditorLoginStrip`、`EditorActionBar`、`StatusBarFields`、`PinnedTooltip`、表单原子(`TextField` / `NumberField` / `TimeField` / `CheckboxField` / `FileField`)
3. **本页组件**:`PddOrderCanvas`(依赖 shared 状态栏)、`PddOrderFields`
4. **页面装配**:`page.tsx` 持有全部状态,向画布与表单分发
