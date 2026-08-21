# 行为清单(BEHAVIORS) — 淘宝交易成功订单生成器(2025 新版)

源:`https://order.hereserver.com/mock-order/taobao/success2025.html`
提取工具:Playwright 1.49.1 驱动本机 Chrome(headless),视口 1440/768/390
共享外壳部分见 [`../SHARED_SHELL.md`](../SHARED_SHELL.md)

## 交互模型判定

**INTERACTION MODEL:静态布局 + 点击/输入驱动的表单。零滚动驱动行为。**

与拼多多页判定结果一致(同一套外壳):

- `scrollY = 0 / 200 / 435` 三点采样,`nav` 的 `position` / `rectTop` / `boxShadow` / `height` / `zIndex` 全程不变;两侧栏 `rectTop` 恒 60
- 无平滑滚动库(`window` 上无 `Lenis` / `LocomotiveScroll` / `ScrollMagic` / `gsap` / `AOS`),仅 `f.css` 给 `body` 设了原生 `scroll-behavior: smooth` + `scroll-padding-top: 100px`
- 无 `scroll-snap`,无 IntersectionObserver 入场动画,无视差

## 状态矩阵

共享外壳状态(A/B/C/D/E/F/G2/G3/G4/H/H'/J)与拼多多页完全一致,见该页 `BEHAVIORS.md`。本页**额外**有两个状态:

| ID | 状态 | 触发 | 变化(实测) |
| --- | --- | --- | --- |
| K | 展示扣减详情 | 勾选「展示扣减详情」checkbox(默认 `false`) | 画布内 `v-if="showDeductDetail"` 的 5 行明细区出现;**同时**编辑器新增 5 个输入框;实付款右侧箭头 `<img>` 由 `rotate-90` 变 `-rotate-90` |
| L | 订单状态下拉 | 点 `#dropdownDefaultButton`「订单状态」 | `#dropdown` 去掉 `hidden` → 显示 7 个状态页链接 |

### 状态 K 细节

新增的 5 个编辑器字段与实测默认值:

| label | v-model | 默认值 |
| --- | --- | --- |
| 扣减详情-商品总价 | `deductDetail.total` | `100.00` |
| 扣减详情-运费 | `deductDetail.deliveryFee` | `0` |
| 扣减详情-店铺优惠 | `deductDetail.shopDiscount` | `0` |
| 扣减详情-淘金币抵扣 | `deductDetail.taocoin` | `2.82` |
| 扣减详情-红包 | `deductDetail.coupon` | `2.01` |

画布内明细区容器:`div.space-y-6.py-3.text-[19px].text-[#232222].leading-[28px]`,5 行:

| 左侧 | 右侧 | 右侧类 |
| --- | --- | --- |
| `商品总价` | `¥100.00` | `w-[354px] text-right font-semibold tracking-tighter` |
| `运费` + `<span class="ml-2 text-[17px] text-[#888888]">运费(快递)</span>` | `¥0` | 同上 |
| `店铺优惠` | `-¥0` | `w-[354px] text-right text-[#fb7730] font-semibold tracking-tighter` |
| `淘金币抵扣` | `-¥2.82` | 同上(橙色) |
| `红包` | `-¥2.01` + 16×16 `chevron-right.png`(`inline-block relative top-[-1px] ml-1`) | 同上(橙色) |

箭头旋转是 K 状态唯一的**视觉指示器**:

```
:class="showDeductDetail ? '-rotate-90' : 'rotate-90'"
```

实测该 `<img>` 类:`w-4 h-4 ml-2 relative top-[1px] origin-center`。**无 transition** —— 旋转是瞬时的,不要自己加动画。

### 状态 L 细节

```
button#dropdownDefaultButton  「订单状态」+ 10×6 chevron-down SVG(class="w-2.5 h-2.5 ms-3")
class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300
       font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center"
onclick="document.getElementById('dropdown').classList.toggle('hidden')"
```

注意:这个开关是**原生 DOM 操作**(内联 `onclick` 直接 toggle class),不是 Vue 状态。

`#dropdown` 实测:`width 176px`、`border-radius 8px`、`background #fff`、`z-index 10`、`box-shadow: 0 1px 2px 0 rgba(0,0,0,0.05)`;类 `z-10 hidden bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44`。

内层 `ul.py-2.text-sm.text-gray-700`,7 项,每项 `a.block.px-4.py-2.hover:bg-gray-100`:

| 文案 | href |
| --- | --- |
| 通用 | `./order.html` |
| 订单关闭 | `./close.html` |
| 交易成功 | `./success.html` |
| 交易成功2025 | `./success2025.html` |
| 已付款 | `./paid.html` |
| 待发货 | `./place.html` |
| 已发货 | `./shipped.html` |

`divide-y divide-gray-100` 实测子元素 `border-top-color: rgb(229,231,235)`。

## hover 状态(实测)

外壳部分同拼多多页。本页额外:

| 元素 | 属性 | before | after |
| --- | --- | --- | --- |
| `#dropdownDefaultButton` | `background-color` | `rgb(37,99,235)` | `rgb(29,78,216)` |
| `#dropdown` 内各链接 | `background-color` | `rgba(0,0,0,0)` | `rgb(243,244,246)` |

画布内的按钮(闲鱼转卖 / 申请售后 / 加入购物车 / 再买一单 / 客服 / 更多 / 进店逛逛)在原站**没有 hover 态** —— 它们是被截图的手机 UI 复刻,不是可交互控件。不要加 hover 效果。

## 响应式行为(实测)

与拼多多页**完全一致**(同一套外壳),断点 768px:

| 宽度 | `nav.position` | 左导航 | `.screen-ct` | `#editor-ct` | 移动切换行 | `body.scrollWidth` |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 | `sticky` | 256px | 589.5px | 384px / `h 840px` | 隐藏 | 1440 |
| 1024 / 900 / 768 | `sticky` | 256px | 589.5px | 384px / `h 840px` | 隐藏 | **1294** |
| 767 / 640 | `static` | 隐藏 | = 视口 | = 视口 / `h auto` | 显示 | = 视口 |
| 390 | `static` | 隐藏 | 390px | 390px / `h auto` | 显示 | 390 |

## 与拼多多页的架构差异(实现时最容易踩的点)

| | 拼多多 | 淘宝 success2025 |
| --- | --- | --- |
| `#screen` 背景 | `background-image: url(pdd-bg.compressed.png)`,`cover` | **无背景图**(原站已注释掉 `url(./img/success.png)`),仅 `background-color: #fff` |
| 行标签来源 | **烤在背景 PNG 里**;DOM 用 `<span class="invisible">拼单价</span>` 占位对齐 | **全部是真实 DOM 文本** |
| 底部操作栏 | 烤在背景 PNG 里 | 真实 `<footer absolute bottom-0>` |
| 画布根容器 | `div.flex.flex-col.text-sm.w-[589.5px].relative.top-[-15px]` | `div.bg-[#f2f4f6].flex.flex-col.text-sm.w-[589.5px]` |
| 分节背景 | 依赖背景图 | 每个 `section` 显式 `bg-white`,section 之间靠 `mt-3` 露出 `#f2f4f6` 底色 |
| 编辑字段数 | 28(不含状态栏面板) | 33 默认 / 38(展开扣减详情) |

**这条差异决定了两页不能共用画布组件。** 拼多多画布的每一处 `w-[354px]` / `w-[448px]` / `ml-[60px]` / `mt-[101px]` / `pr-[72px]` 都是为了和背景图里的标签对齐,改动任一数值都会错位。

## 无障碍与语义

- `aside` 带 `aria-label="Sidebar"`;`#dropdown` 的 `ul` 带 `aria-labelledby="dropdownDefaultButton"`
- 装饰 SVG 带 `aria-hidden="true"`
- 全部 `<img>` 有中文 `alt`(图标 / 位置图标 / 店铺Logo / 商品图片 / 箭头 / 红包图标 / 订单信息图标 / 收货信息图标 / 旺旺客服 / 更多)
- `#screen` 全局 `user-select: none`
