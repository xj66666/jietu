# 行为清单(BEHAVIORS) — 拼多多订单生成器

源:`https://order.hereserver.com/mock-order/pdd/order.html`
提取工具:Playwright 1.49.1 驱动本机 Chrome(headless),视口 1440/768/390
共享外壳部分见 [`../SHARED_SHELL.md`](../SHARED_SHELL.md)

## 交互模型判定(最关键的一条)

**INTERACTION MODEL:静态布局 + 点击/输入驱动的表单。零滚动驱动行为。**

判定过程(先滚后点,严格按 skill 要求):

1. **滚动 sweep** —— 在 `scrollY = 0 / 200 / 435`(1440×900 下页面最大滚动量仅 435px)逐点采样:
   - `nav`:`position sticky`、`rectTop` 恒为 `0`、`boxShadow` 恒为 `none`、`height` 恒 57px、`zIndex` 恒 50 —— **无任何滚动态变化**
   - `#separator-sidebar`:`rectTop` 恒为 `60`
   - `#editor-ct`:`rectTop` 恒为 `60`
   - `document.documentElement` 的 `scroll-behavior` = `smooth`(来自 `f.css` 的 `body` 规则),`scroll-padding-top: 100px`
   - `scrollSnapType` 无;无 `.lenis` / `.locomotive-scroll` / `[data-scroll-container]`;`window` 上无 `Lenis` / `LocomotiveScroll` / `ScrollMagic` / `gsap` / `AOS`
   - 无 IntersectionObserver 驱动的入场动画,无视差层
2. **点击 sweep** —— 见下「状态矩阵」
3. **hover sweep** —— 见下「hover 状态」

页面之所以几乎不滚动:三栏各自 `md:sticky md:top-[60px]` + `md:h-[calc(100vh-60px)] md:overflow-y-auto`,滚动发生在**栏内**而非页面。

## 状态矩阵

| ID | 状态 | 触发 | 变化(实测) |
| --- | --- | --- | --- |
| A | 默认 | 加载 | iOS 状态栏显示;编辑器显示「订单信息」面板(28 个控件) |
| B | 安卓状态栏 | 勾选「安卓状态栏」checkbox | `.ios-bar` → `display:none`;`.material-top-bar` → `display:block`,并额外渲染 `.material-5g` 图标。二者互斥 |
| C | 信号与时间面板 | 点「编辑信号与时间 →」 | `v-show` 切换:订单面板 `display:none`,状态栏面板 `display:block`(7 行)。同时调 `scrollTop()` 把编辑器滚回顶部 |
| D | 定位开 | 勾选「定位」 | `.ios-location` `display:none → block`,盒 21×21 |
| E | 充电开 | 勾选「充电」 | `.ios_battery` 追加 `.ios_battery-charging`;`em.battery-value` 背景 `rgb(25,25,25) → rgb(52,199,89)`;充电闪电 `a` `display:none → block` |
| F | 电池百分比关 | 取消勾选「电池百分比」 | `i.battery-value-number` 盒仍为 39.5×19.5,但数字文本不渲染 |
| G2 | 蜂窝信号 = 2 | number input | `.ios_single` 内渲染 `.ios-single-1`(4.8×17,right .1px,top 1px)+ `.ios-single-2`(4×14,right 7.1px,top 4px) |
| G3 | 蜂窝信号 = 3(默认) | — | 仅 `.ios-single-1` |
| G4 | 蜂窝信号 = 4 | — | 无遮罩 `<i>` |
| H | 移动端导航收起 | <768px 加载 | `aside` = `hidden md:block` → 不可见;切换按钮文案「打开导航」 |
| H' | 移动端导航展开 | 点切换按钮 | `aside` = `block`;按钮文案「关闭导航」 |
| J | 已生成截图 | 点「生成截图」 | `screenMirrorData` 有值 → `.screen-mirror` 覆盖层出现(`z-50`、`bg-contain bg-center bg-no-repeat`、底色 `#fff`、`w-screen`);`a#downdloadPic` 去掉 `hidden` |
| — | 商品图/店铺标识/用户头像/物流商标 上传 | `input[type=file]` change | 对应 `<img>` 的 `:src` 换成 `FileReader` 的 dataURL;`logisticsLogo` 与 `userAvatar` 为空时对应 `<img>` 整体 `v-if` 不渲染 |

**过渡说明**:以上状态切换在原站**全部是瞬时的**,没有任何 CSS transition 或动画。唯一有过渡的是下面的 hover。

## hover 状态(实测 before → after)

| 元素 | 属性 | before | after | transition |
| --- | --- | --- | --- | --- |
| 左侧导航链接 | `background-color` | `rgba(0,0,0,0)` | `rgb(243,244,246)` | `0.075s cubic-bezier(0.4,0,0.2,1)`(`transition duration-75`) |
| `button#generatePic` | `background-color` | `rgb(37,99,235)` | `rgb(29,78,216)` | `0.15s cubic-bezier(0.4,0,0.2,1)`(`transition-colors`) |
| 「编辑信号与时间」按钮 | `background-color` | `rgb(55,65,81)` | `rgb(31,41,55)` | `0.15s cubic-bezier(0.4,0,0.2,1)` |
| 移动端「打开导航」按钮 | `background-color` + `color` | `#fff` / `#111827` | `rgb(243,244,246)` / `rgb(29,78,216)` | Tailwind preflight 默认 |
| `a#downdloadPic`(导出) | `background-color` | `rgb(59,130,246)` | `rgb(29,78,216)` | preflight 默认 |

`color` / `boxShadow` / `transform` / `opacity` 在所有 hover 中均**未变化**。

`focus` 态:输入框 `focus:ring-blue-500 focus:border-blue-500`;按钮 `focus:ring-4 focus:ring-blue-300` / `focus:ring-gray-300`;移动端按钮额外 `focus:z-10 focus:ring-4 focus:ring-gray-100`。

## 响应式行为(实测)

断点**精确落在 768px**(Tailwind `md`)。逐宽度采样:

| 宽度 | `nav.position` | 左导航 | `.screen-ct` | `#editor-ct` | 移动切换行 | `body.scrollWidth` |
| --- | --- | --- | --- | --- | --- | --- |
| 1440 | `sticky` | 可见 256px | 589.5px | 384px / `h 840px` | 隐藏 | 1440 |
| 1024 | `sticky` | 可见 256px | 589.5px | 384px / `h 840px` | 隐藏 | **1294** |
| 900 | `sticky` | 可见 256px | 589.5px | 384px / `h 840px` | 隐藏 | **1294** |
| 768 | `sticky` | 可见 256px | 589.5px | 384px / `h 840px` | 隐藏 | **1294** |
| 767 | `static` | 隐藏 | 767px | 767px / `h 2770px` | 显示 | 767 |
| 640 | `static` | 隐藏 | 640px | 640px / `h 2770px` | 显示 | 640 |
| 390 | `static` | 隐藏 | 390px | 390px / `h 2794px` | 显示 | 390 |

要点:

- **768–1293px 区间页面横向溢出**(`scrollWidth 1294 > 视口`)。外层 `overflow-x-hidden md:overflow-visible` 在 md 以上放开裁剪,所以原站在这个区间确实可以左右拖。这是原站行为,必须复现,不要"顺手修掉"。
- `.screen-ct` 在 <768px 时宽度跟随视口,但内部 `#screen` 仍固定 `589.5px` 且父级 `overflow-x-hidden` 生效 → 画布被裁切,不缩放。
- `nav` 在 <768px 失去 `sticky`(类是 `md:sticky md:top-0`),变成普通静态块。
- `#editor-ct` 在 <768px 由 `max-md:h-auto` 变成完整高度展开(2770–2794px),不再内部滚动。
- 顶栏 `span「魔猫订单」` 是 `hidden sm:inline` → <640px 隐藏,只留 logo。
- `h1` 是 `text-lg md:text-xl` → <768px 为 18px/28px,≥768px 为 20px/28px。

## 无障碍与语义

- `aside` 带 `aria-label="Sidebar"`
- 装饰性 SVG 带 `aria-hidden="true"`
- 所有 `<img>` 都有中文 `alt`(店铺图标 / 品牌图标 / 箭头 / 商品图片 / 用户头像 / 物流图标)
- 站内跳转用 `<a href>`,外链带 `target="_blank"`
- `#screen` 全局 `user-select: none`
