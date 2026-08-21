# 共享外壳组件规格(SharedShell.spec)

适用页面:两个目标页共用
组件根:`src/components/sites/order-hereserver-com-a6d29d9e/shared/`
参考截图:
- `docs/design-references/order-hereserver-com-a6d29d9e/*/full-desktop-1440.png`
- `docs/design-references/order-hereserver-com-a6d29d9e/*/nav-sidebar.png`
- `docs/design-references/order-hereserver-com-a6d29d9e/*/editor-panel.png`
- `docs/design-references/order-hereserver-com-a6d29d9e/*/states/B-android-screen.png`

**INTERACTION MODEL:静态布局 + 点击/输入驱动。零滚动驱动行为。**(判定依据见各页 `BEHAVIORS.md`)

全部计算值来自 `getComputedStyle()`。v3→v4 类改写规则见 [`SHARED_SHELL.md`](./SHARED_SHELL.md#tailwind-v3--v4-必须显式化的类)。

---

## 1. `SiteTopbar`

目标文件:`shared/SiteTopbar.tsx`

### DOM 结构

```
nav > div > [ a(logo+文字) , div(竖线) , h1(页面标题) ]
```

### 计算样式

**nav**:`backgroundColor rgb(255,255,255)`;`borderBottomWidth 1px`;`borderBottomColor rgb(229,231,235)`;`position sticky`(仅 ≥768px);`top 0`;`zIndex 50`;`height 57px`
类:`bg-white border-b border-gray-200 md:sticky md:top-0 z-50`

**div(容器)**:`maxWidth 1440px`;`marginInline auto`;`padding 12px 16px`;`display flex`;`alignItems center`;`gap 16px`;`height 56px`;`justifyContent flex-start`(≥768px)/ `space-between`(<768px)
类:`max-w-[1440px] mx-auto px-4 py-3 flex items-center justify-between md:justify-start gap-4`

**a**:`display flex`;`alignItems center`;`gap 8px`;`width 120px`;`height 32px`;`cursor pointer`
类:`flex items-center gap-2`,`href="https://order.hereserver.com/"`

**img**:`width 32px`;`height 32px`;类 `w-8 h-8`;`src` = `SHARED_ASSETS.siteLogo`;`alt="魔猫订单"`

**span**:`fontSize 20px`;`lineHeight 28px`;`fontWeight 600`;`color rgb(17,24,39)`;`width 80px`
类:`text-xl font-semibold text-gray-900 hidden sm:inline`;文本 `魔猫订单`

**div(竖线)**:`width 1px`;`height 24px`;`backgroundColor rgb(209,213,219)`
类:`hidden md:block h-6 w-px bg-gray-300`

**h1**:`fontSize 20px`(≥768px)/ `18px`(<768px);`lineHeight 28px`;`fontWeight 600`;`color rgb(55,65,81)`
类:`text-lg md:text-xl font-semibold text-gray-700`
文本:pdd → `拼多多订单生成器`;taobao → `淘宝交易成功订单生成器 - 2025 新版`

### 状态与行为

N/A —— 纯静态。无 hover(logo `a` 只有 `cursor: pointer`,无颜色变化)。

### 响应式

- **1440 / 768px**:`justify-content: flex-start`,竖线与 h1 可见,nav `sticky`
- **640–767px**:nav 变 `static`,`justify-content: space-between`,竖线隐藏,h1 降为 18px
- **<640px**:`span「魔猫订单」` 隐藏(`hidden sm:inline`),只留 32×32 logo

---

## 2. `ToolNavSidebar`

目标文件:`shared/ToolNavSidebar.tsx` + `shared/tool-nav-items.ts`

### DOM 结构

```
aside#separator-sidebar > div > [ ul(1 项:返回首页) , ul(18 项工具链接) ]
```

### 计算样式

**aside**:`width 256px`;`minWidth 256px`;`height calc(100vh - 60px)` 实测 840px;`position sticky`;`top 60px`;`overflowY auto`;滚动条隐藏
类:`md:w-64 md:min-w-[256px] md:h-[calc(100vh-60px)] md:overflow-y-auto md:sticky md:top-[60px] scrollbar-hide` + 条件 `block` / `hidden md:block`
属性:`id="separator-sidebar"`、`aria-label="Sidebar"`

**div**:`padding 16px 12px`;`height 840px`;类 `h-full px-3 py-4 overflow-y-auto scrollbar-hide`

**ul(第一组)**:类 `space-y-2 font-medium`;`fontWeight 500`;宽 232px;高 40px

**ul(第二组)**:类 `pt-4 mt-4 space-y-2 font-medium border-t border-gray-200`;`borderTopWidth 1px`;`borderTopColor rgb(229,231,235)`;`paddingTop 16px`;`marginTop 16px`

**li**:高 40px;相邻间 `marginTop 8px`(来自 `space-y-2`)

**a(第一组)**:类 `flex items-center p-2 text-gray-900 rounded-[8px] hover:bg-gray-100 group`
**a(第二组)**:类 `flex items-center p-2 text-gray-900 transition duration-75 rounded-[8px] hover:bg-gray-100 group`
共同:`fontSize 16px`;`lineHeight 24px`;`fontWeight 500`;`color rgb(17,24,39)`;`padding 8px`;`borderRadius 8px`

**span(文字)**:类 `ms-3` → `margin-inline-start: 12px`

**svg(仅第一组)**:`NavHomeIcon`,类 `icon shrink-0 w-5 h-5 text-gray-500`,`viewBox="0 0 1024 1024"`,`fill="#272636"`

### 状态与行为

**hover(导航链接)**
- **触发**:鼠标悬停
- **State A**:`background-color: rgba(0, 0, 0, 0)`
- **State B**:`background-color: rgb(243, 244, 246)`
- **Transition**:`0.075s cubic-bezier(0.4, 0, 0.2, 1)`(第二组带 `transition duration-75`;第一组用 preflight 默认)
- **实现方式**:纯 CSS `hover:bg-gray-100`

`color` / `boxShadow` / `transform` / `opacity` 均不变。

### 数据(18 项,顺序即原站顺序)

见 [`SHARED_SHELL.md` 的导航表](./SHARED_SHELL.md#左侧工具导航-asideseparator-sidebar)。第 1 项(淘宝订单生成器)与第 5 项(拼多多订单生成器)指向本仓库已建路由;其余 16 项与「返回首页」指向原站绝对地址。

### 响应式

- **≥768px**:始终 `block`,256px 宽,`sticky top-60px`
- **<768px**:默认 `hidden`;由 `MobileNavToggleRow` 的 `isShowNav` 切到 `block`(此时占满容器宽度,非 sticky)

---

## 3. `MobileNavToggleRow`

目标文件:`shared/MobileNavToggleRow.tsx`

### 计算样式

**div**:类 `flex justify-center gap-4 py-4 md:hidden`;`padding 16px 0`;`gap 16px`

**button**:类
`py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-[8px] border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100`
`fontSize 14px`;`padding 10px 20px`;`borderWidth 1px`;`borderColor rgb(229,231,235)`;`borderRadius 8px`

**a**:类
`text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-[8px] text-sm px-5 py-2.5`
`href="#editor-ct"`;文本 `编辑截图`

### 状态与行为

**导航开关(点击驱动)**
- **触发**:点击 button
- **State A**:文本 `打开导航`,`aside` = `hidden md:block`
- **State B**:文本 `关闭导航`,`aside` = `block`
- **Transition**:无(瞬时)
- **实现方式**:父级 `useState<boolean>` 提升到 page

**hover**
- button:`background-color #fff → rgb(243,244,246)`,`color rgb(17,24,39) → rgb(29,78,216)`
- a:`background-color rgb(37,99,235) → rgb(29,78,216)`

### 响应式

`md:hidden` —— **仅 <768px 渲染**。

---

## 4. `IosStatusBar`

目标文件:`shared/IosStatusBar.tsx`
参考截图:`states/A-default-screen.png`

### DOM 结构

```
div.ios-bar.ios-bar-v2
├─ div.ios-left    > [ span.ios-time , span.ios-location ]
├─ div.ios-center   (空)
└─ div.ios-right   > [ span.ios_single > i×0..2 , span.ios_wifi , div.ios_battery > span > [em , i > a] ]
```

### 计算样式

**根 div**:`position absolute`;`top 0`;`left 0`;`width 589.5px`;`height 74.5px`;`backgroundColor rgb(255,255,255)`;`display flex`;`alignItems center`;`paddingLeft 47.5px`;`paddingRight 42px`
类:`ios-bar absolute top-0 left-0 w-full h-[74.5px] bg-white flex items-center px-[42px] pl-[47.5px] ios-bar-v2 block`

**div.ios-left**:`flex 1 1 0%`;`display flex`;`alignItems center`;实测 381.5×52.5
类:`ios-left flex-1 flex items-center`

**span.ios-time**:`fontSize 25px`;`fontWeight 600`;`marginLeft 16px`;`marginBlock 7.5px`;实测 73.56×37.5
类:`ios-time ml-4 text-[25px] font-semibold my-[7.5px]`

**span.ios-location**:`width 21px`;`height 21px`;`marginRight 7.5px`;`position relative`;`left 10px`;`textIndent -9999px`;`backgroundSize cover`;背景图 `ios-location.png`
类:`ios-location block w-[21px] h-[21px] mr-[7.5px] relative left-[10px] indent-[-9999px] bg-cover ios-location-icon-v2`
文本 `定位`(被 `text-indent` 推出视口);默认 `display: none`

**div.ios-center**:类 `ios-center`,空元素

**div.ios-right**:`display flex`;`alignItems center`;实测 118.5×20.5;类 `ios-right flex items-center`

**span.ios_single**:`marginLeft 7.5px`;`width 28px`;`height 19px`;`position relative`;`textIndent -9999px`;`backgroundSize cover`;背景图 `ios-signal.png`(画满 4 格)
类:`ios_single ml-[7.5px] w-[28px] h-[19px] relative indent-[-9999px] bg-cover ios-signal-icon-v2`

**i.ios-single-1**:`position absolute`;`backgroundColor rgb(155,155,155)`;`borderRadius 1.2px`;`width 4.8px`;`height 17px`;`right 0.1px`;`top 1px`
类:`ios-single-1 absolute bg-[#9b9b9b] rounded-[1.2px] w-[4.8px] h-[17px] right-[0.1px] top-[1px]`

**i.ios-single-2**:同上,`width 4px`;`height 14px`;`right 7.8px`;`top 4px`
类:`ios-single-2 absolute bg-[#9b9b9b] rounded-[1.2px] w-[4px] h-[14px] right-[7.8px] top-[4px]`

> `f.css` 里 `.ios-bar-v1` 分支给的是 `right: 7.1px`,那是旧版状态栏的值,**不适用于 v2**。v2 的实际值由 bundle 写在类名上,实测三档信号稳定复现:
> - `signal=4` → 无遮罩 `<i>`
> - `signal=3` → 仅 `.ios-single-1`(`w-[4.8px] h-[17px] right-[0.1px] top-[1px]`)
> - `signal=2` → 追加 `.ios-single-2`(`w-[4px] h-[14px] right-[7.8px] top-[4px]`)

**span.ios_wifi**:`marginLeft 5.5px`;`width 32.5px`;`height 20.5px`;`textIndent -9999px`;`backgroundSize cover`;背景图 `ios-wifi.png`
类:`ios_wifi ml-[5.5px] w-[32.5px] h-[20.5px] indent-[-9999px] bg-cover ios-wifi-icon-v2`;文本 `wifi`

**div.ios_battery**:`display flex`;`position relative`;`marginLeft 5.5px`;`width 39.5px`;`height 19.5px`;`backgroundSize cover`;`::before` 铺 `ios-battery.png`
类:`group ios_battery flex relative ml-[5.5px] w-[39.5px] h-[19.5px] bg-cover ios-battery-icon-v2`(充电时追加 `ios_battery-charging`)

**span(电池内层)**:`marginRight 5px`;`flex 1 1 0%`;`display flex`;`flexDirection column`;`borderRadius 7px`;`overflow hidden`;实测 34.5×19.5
类:`mr-[5px] flex-1 flex flex-col rounded-[7px] overflow-hidden`

**em.battery-value**:`flex 1 1 0%`;`textIndent -9999px`;`backgroundColor rgb(25,25,25)`;`zIndex 1`;内联 `width: {battery}%`
类:`flex-1 z-11 indent-[-9999px] battery-value`;文本 `电量`
> 原站类名写的是 `z-11`(Tailwind v3 无此值,不生成规则),真正的层级来自 CSS `.battery-value { z-index: 1 }`。照抄类名但依赖 CSS。

**i.battery-value-number**:`display flex`;`alignItems center`;`justifyContent center`;`position absolute`;`width 100%`;`height 100%`;`fontSize 15px`;`fontWeight 600`;`color rgb(255,255,255)`;`fontStyle normal`;`zIndex 10`
类:`flex items-center justify-center absolute w-full h-full text-[15px] font-semibold text-white not-italic battery-value-number z-10`
文本:`{battery}`(仅 `time_electricity` 为真时渲染)

**a.ios-battery-charging-icon-v2**:`width 6.5px`;`height 10px`;`backgroundSize cover`;背景图 `ios-battery-charging.png`;默认 `hidden`
类:`hidden w-[6.5px] h-[10px] bg-cover ios-battery-charging-icon-v2`

### 状态与行为(全部实测)

| 行为 | 触发 | State A | State B | Transition |
| --- | --- | --- | --- | --- |
| 定位显隐 | `time_location` | `.ios-location` `display:none` | `display:block`,盒 21×21 | 无 |
| 充电 | `time_charging` | `em` 背景 `rgb(25,25,25)`;`a` `display:none` | 根加 `.ios_battery-charging` → `em` 背景 `rgb(52,199,89)`;`a` `display:block` | 无 |
| 电量数字 | `time_electricity` | 渲染数字 | 不渲染数字(`i` 仍占 39.5×19.5) | 无 |
| 信号格数 | `time_signal` | 4 → 无遮罩;3 → 仅 `.ios-single-1` | 2 → `.ios-single-1` + `.ios-single-2` | 无 |
| 电量条宽 | `time_battery` | `em` 内联 `width: {n}%` | — | 无 |

**所有状态切换均为瞬时,没有任何 CSS transition 或动画。**

### 响应式

N/A —— 位于固定 589.5px 宽的画布内,不随视口变化。

---

## 5. `AndroidStatusBar`

目标文件:`shared/AndroidStatusBar.tsx`
参考截图:`states/B-android-screen.png`

### 计算样式

**根 div**:`position absolute`;`top 0`;`left 0`;`right 0`;`height 74.5px`;`backgroundColor rgb(255,255,255)`;`padding 18px 26px`
类:`material-top-bar py-[18px] px-[26px] h-[74.5px] absolute top-0 left-0 right-0 bg-white`(`block` / `hidden`)

**div**:类 `flex items-center justify-between`;实测 537.5×32

**div.material-left**:类 `material-left flex items-center gap-2 flex-row`;实测 102.63×32
- 时间 `div.font-semibold.text-2xl` → `fontSize 24px`;`lineHeight 32px`;`fontWeight 600`;实测 70.63×32

**div.material-right**:类 `material-right flex flex-row items-center gap-2`;`gap 8px`
- `div.material-cell.w-7.h-7` → 28×28,`MaterialCellIcon`
- `div.material-wifi.w-7.h-7` → 28×28,`MaterialWifiIcon`
- `div.material-battery.w-7.h-7.relative.top-[1px]` → 28×28,`MaterialBatteryIcon`

三个 Material 图标 `viewBox="0 -960 960 960"`,`fill="#1f1f1f"`,`height/width 28px`。

### 状态与行为

**iOS ↔ Android 互斥**
- **触发**:`showAndroidBar`
- **State A**(false):`.material-top-bar` `display:none`;`.ios-bar` 可见
- **State B**(true):`.material-top-bar` `display:block`;`.ios-bar` `display:none`
- **Transition**:无

### 已记录的取舍(必须知道)

原站安卓栏的图标集**每次加载随机**。3 次独立观测:

| 观测 | `material-right` 内容 | 宽度 | 左侧通知 SVG 数 |
| --- | --- | --- | --- |
| run0 | `material-5g` + cell + wifi + battery | 136px | 0 |
| run1 | 同上 | 136px | 3 |
| run2 | `material-clock` + `material-5g` + cell + wifi + battery | 168px | 0 |
| run3 | cell + wifi + battery(无 5g) | 100px | 0 |

`material-cell` 的 `path` 在观测中也出现过双排(双卡)与单排两种形态。

在渲染期调用随机数会破坏 Next.js 水合。因此本组件固定渲染 **cell + wifi + battery**(4 次观测中 100% 出现的三个),省略随机出现的 `material-5g` / `material-clock` 与左侧随机通知图标。该状态在原站默认不可见(需勾选「安卓状态栏」)。

### 响应式

N/A —— 画布内固定宽度。

---

## 6. `EditorLoginStrip`

目标文件:`shared/EditorLoginStrip.tsx`

### 计算样式

**div.user-container**:`display flex`;`alignItems center`;`justifyContent center`
类:`user-container justify-center`
> 原站 HTML 上带 `hide`,但 bundle 在挂载后移除了它 —— 实测该条是**可见**的。克隆时直接可见,不带 `hide`。

**div.avatar**:`width 20px`;`height 20px`;`borderRadius 50%`;`overflow hidden`;`flexShrink 0`
内 `img`:`width 100%`;`height 100%`;`objectFit cover`;属性 `width="40px" height="40px"`;`src` = `SHARED_ASSETS.loginAvatar`;`alt="用户头像"`

**div.username**:空
**div.logout**:类 `logout ml-1 hide`,文本 `| 登出`,默认隐藏
**div.no-username**:`marginLeft 10px`;`fontSize 16px`;`color rgb(51,51,51)`;`cursor pointer`;文本 `请登录后使用`

### 状态与行为

原站点击会走支付宝登录流程。**本仓库范围排除鉴权** —— 保留视觉,`no-username` 保持 `cursor: pointer` 但不绑任何行为。

---

## 7. `EditorActionBar`

目标文件:`shared/EditorActionBar.tsx`

### 计算样式

**div**:类 `p-6` → `padding 24px`

**button#generatePic**:类
`bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white font-medium py-2.5 px-5 rounded-[8px] transition-colors`
`backgroundColor rgb(37,99,235)`;`color #fff`;`fontWeight 500`;`padding 10px 20px`;`borderRadius 8px`;文本 `生成截图`

**a#downdloadPic**:类
`mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-[4px]` + 未出图时 `hidden`
`backgroundColor rgb(59,130,246)`;`fontWeight 700`;`padding 8px 16px`;`borderRadius 4px`;属性 `download`、`target="_blank"`;文本 `导出`

### 状态与行为

**截图导出(点击驱动)**
- **触发**:点击 `#generatePic`
- **State A**:`screenMirrorData` 为空 → `.screen-mirror` 不渲染;`a#downdloadPic` 带 `hidden`
- **State B**:光栅化完成 → `.screen-mirror` 渲染,内联 `backgroundImage: url(dataURL)`;`a` 去掉 `hidden`,`href` = dataURL
- **Transition**:无
- **实现方式**:`html2canvas-pro` 动态 `import()`(仅客户端),对 `#screen` 取图

**`.screen-mirror` 覆盖层**:`position absolute`;`inset 0`;`zIndex 50`;`backgroundColor #fff`;`backgroundPosition center`;`backgroundSize contain`;`backgroundRepeat no-repeat`;`width 100vw`
类:`screen-mirror absolute top-0 left-0 bottom-0 right-0 z-50 bg-center bg-contain bg-no-repeat bg-[#fff] w-screen`

**hover**:`background-color rgb(37,99,235) → rgb(29,78,216)`,`0.15s cubic-bezier(0.4,0,0.2,1)`

---

## 8. `StatusBarFields`

目标文件:`shared/StatusBarFields.tsx`
参考截图:`states/C-editor-topbar-panel.png`

### 计算样式

**容器**:类 `p-6 pt-0 space-y-4`,由 page 用 `hidden` 控制显隐(对应原站 `v-show="enableEditTopbar"`)

7 行,前 6 行 label 类为 `text-gray-700 mb-2`(**注意:不带 `block`**,与订单面板的 `block text-gray-700 mb-2` 不同),后 3 个 checkbox 行容器为 `mb-4 flex items-center gap-3`。

| # | label | type | v-model | min | max | 默认 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 手机时间 | `time` | `time_time` | — | — | `08:41` |
| 2 | 电量 | `number` | `time_battery` | 9 | 91 | `26` |
| 3 | 蜂窝信号 | `number` | `time_signal` | 2 | 4 | `3` |
| 4 | 定位 | `checkbox` | `time_location` | — | — | `false` |
| 5 | 充电 | `checkbox` | `time_charging` | — | — | `false` |
| 6 | 电池百分比 | `checkbox` | `time_electricity` | — | — | `true` |
| 7 | (按钮)`← 编辑订单信息` | — | — | — | — | — |

输入框类:`border border-gray-300 bg-gray-50 text-gray-900 rounded-[8px] focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`
checkbox 类:`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-[4px] focus:ring-blue-500 focus:ring-2`
按钮类:`bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 text-white font-medium py-2.5 px-5 rounded-[8px] transition-colors`

> 时间与电量在原站是随机默认值。本仓库固定为 `08:41` / `26`,理由见 `SHARED_SHELL.md`。

---

## 9. `PinnedTooltip`

目标文件:`shared/PinnedTooltip.tsx`

原站用 Tippy.js 渲染两个**常显**提示到 `<body>` 末尾。

### 计算样式

`backgroundColor rgb(51,51,51)`;`color rgb(255,255,255)`;`fontSize 14px`;`lineHeight 19.6px`;`fontWeight 400`;`borderRadius 4px`;`zIndex 9999`;`pointerEvents none`;内层 padding `5px 9px`;外框高 29.6px

| # | 文案 | 锚点 | placement | 相对 `#screen` |
| --- | --- | --- | --- | --- |
| 1 | `点击这里使用支付宝登录以获得完整功能` | `.user-container` | `bottom` | x 671,y 37,w 270 |
| 2 | `截图仅用于玩笑晒单,切勿用于非法目的` | `#editor-ct` | `left` | x 343.8,y 408,w 260.2 |

第 2 条是原站防滥用提示,必须保留。

### 状态与行为

原站两条都是 `showOnCreate` 常显、`pointer-events: none`。本实现用**相对锚点的绝对定位**代替 Popper,不引入 Tippy —— 无交互、无动画,视觉与位置一致即可。

### 响应式

<768px 时三栏堆叠,原站 Tippy 会重新定位。本实现在 <768px 隐藏第 1 条(锚点位置随布局大幅变化),保留第 2 条贴在画布上。已记录为取舍。

---

## 10. 表单原子 `fields.tsx`

目标文件:`shared/fields.tsx`

导出 `TextField` / `NumberField` / `TimeField` / `CheckboxField` / `FileField`。

**行容器**:`div.mb-4` → `marginBottom 16px`
**label(文本/数字/时间/file)**:`block text-gray-700 mb-2` → `display block`;`color rgb(55,65,81)`;`fontSize 16px`;`lineHeight 24px`;`marginBottom 8px`
**label(checkbox,订单面板)**:同上带 `block`
**input(text/number/time)**:`border border-gray-300 bg-gray-50 text-gray-900 rounded-[8px] focus:ring-blue-500 focus:border-blue-500 w-full p-2.5`
→ `borderWidth 1px`;`borderColor rgb(209,213,219)`;`backgroundColor rgb(249,250,251)`;`color rgb(17,24,39)`;`borderRadius 8px`;`padding 10px`;`width 100%`
**input(checkbox)**:`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-[4px] focus:ring-blue-500 focus:ring-2`
→ 16×16;`backgroundColor rgb(243,244,246)`;`borderColor rgb(209,213,219)`;`borderRadius 4px`
**input(file)**:无类,浏览器原生外观

### 状态与行为

- 受控输入,`onChange` 直接回写 page 状态,画布**同帧更新**(原站是 Vue 响应式,视觉上无延迟)
- `focus`:`ring-blue-500` + `border-blue-500`;checkbox 为 `ring-blue-500 ring-2`
- file:`FileReader.readAsDataURL` → 写入对应 `src` 状态。`userAvatar` / `logisticsLogo` 为空时**对应 `<img>` 整体不渲染**(原站 `v-if`)

### 响应式

`w-full` —— 跟随 `#editor-ct` 宽度(≥768px 为 384px 减去 48px padding = 336px)。
