# 共享外壳规格(SHARED_SHELL)

`order.hereserver.com/mock-order/*` 下所有生成器页面共用同一套工具外壳。本文件记录两个目标页**逐像素相同**的部分,供各组件 spec 引用。所有数值来自 Playwright `getComputedStyle()` 实测,不是估算。

## 技术栈还原

| 原站 | 本仓库对应 |
| --- | --- |
| Vue 3(`vue.global.prod.min.js`)+ 选项式 API,`createApp` 挂在 `body#app` | React 19 客户端组件 + `useState` |
| Tailwind CSS **v3.4.5** Play CDN(`qncdn.hereserver.com/tw3.4.5.js`),运行时生成 24339 字符样式表 | Tailwind CSS v4(构建期) |
| 自托管字体 `mock-order/font/f.css` | `next/font/local`,字体文件已下载到 shared 资源根 |
| Tippy.js 常显提示 | 静态定位元素 |
| 业务逻辑打包在 `js/cjs/*-mg.js`(JS-Obfuscator 混淆,276–284 KB) | 直接用 React 重写;默认数据由浏览器实测取得 |

### Tailwind v3 → v4 必须显式化的类

实测计算值:

| 原站类 | v3 实测值 | v4 同名类 | 本仓库写法 |
| --- | --- | --- | --- |
| `rounded-lg`(108 处) | `8px` | 本项目 `--radius-lg` 被 shadcn 覆写为 `10px` | `rounded-[8px]` |
| `rounded-sm`(1 处) | `2px` | v4 为 `0.25rem`,本项目更被覆写为 `6px` | `rounded-[2px]` |
| `rounded`(10 处) | `4px` | 一致 | `rounded-[4px]`(显式) |
| `shadow-sm`(1 处) | `0 1px 2px 0 rgba(0,0,0,0.05)` | v4 语义已改 | `shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]` |
| `flex-shrink-0`(4 处) | `flex-shrink: 0` | v4 已移除该拼写 | `shrink-0` |
| `bg-black bg-opacity-50` | `rgba(0,0,0,0.5)` | v4 已移除 `bg-opacity-*` | `bg-black/50` |

其余 `rounded-[7px]` / `rounded-[1.2px]` / `rounded-[7.5px]` 等任意值原样保留。

## 字体

`mock-order/font/f.css` 声明 4 个 `@font-face`,其中 PingFang SC 的 4 条声明在原站是**注释掉的**,不要移植:

| family | weight | 文件 | 本仓库路径 |
| --- | --- | --- | --- |
| `SF Pro` | 400 | `sf-pro-text_regular.07bdfc6e.woff2` | `public/sites/order-hereserver-com-a6d29d9e/shared/fonts/sf-pro-text-regular.woff2` |
| `SF Pro` | 500 | `sf-pro-text_medium.dcc28d6a.woff2` | `…/sf-pro-text-medium.woff2` |
| `SF Pro` | 600 | `sf-pro-text_semibold.a0c74f8f.woff2` | `…/sf-pro-text-semibold.woff2` |
| `WeChatNum` | 400 | `WeChatNum.04b083e1.ttf` | `…/fonts/WeChatNum.ttf` |

**字体栈**:`f.css` 给 `body` 设的是 `SF Pro, "Helvetica Neue", "PingFang SC", -apple-system, sans-serif, Roboto`,但页面**内联 `<style>` 在其后覆盖**,实际生效的是:

```
-apple-system, SF Pro, "Helvetica Neue", "PingFang SC", sans-serif, Roboto
```

实测 `body` 计算值确认为上式。`-webkit-font-smoothing: antialiased`。

`.money` → `font-family: WeChatNum; font-style: normal`(本次两页未用到该类,但属于共享 CSS)。

## 全局 CSS(需移植)

```css
.gray-color { color: #9f9f9f }
.hide { display: none }
#screen { user-select: none }
.time-h { font-variant-numeric: tabular-nums; letter-spacing: -0.03em }

/* 隐藏滚动条 —— 三侧栏都用 */
.scrollbar-hide::-webkit-scrollbar { display: none }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none }

.sidebar { height: calc(100vh - 60px); overflow-y: auto }

.user-container { display: flex; align-items: center }
.avatar { width: 20px; height: 20px; border-radius: 50%; overflow: hidden; flex-shrink: 0 }
.avatar img { width: 100%; height: 100%; object-fit: cover }
.username, .no-username { margin-left: 10px; font-size: 16px; color: #333 }
.logout, .no-username { cursor: pointer }
```

另外 `f.css` 还定义了 `.mask1`–`.mask15` 共 15 种马赛克(纯色 / 条纹渐变 / 彩虹),由「隐私部分随机马赛克」开关驱动 —— **该开关在两个目标页都是注释掉的**,故本次不实现,仅在 globals 里保留类定义以备后用。

`f.css` 还有一整套 `.ios-bar-v1` 规则,是旧版状态栏。两个目标页 `#screen` 都带 `use-ios-bar-v2`,走 v2 分支,**v1 规则不移植**。

## 页面外壳布局(≥768px)

```
body.bg-gray-100.text-gray-900.min-h-screen
├─ nav.bg-white.border-b.border-gray-200.md:sticky.md:top-0.z-50        1440×57(56 + 1px 下边框)
│  └─ div.max-w-[1440px].mx-auto.px-4.py-3.flex.items-center.justify-between.md:justify-start.gap-4   1440×56
│     ├─ a.flex.items-center.gap-2                                       120×32
│     │  ├─ img.w-8.h-8            32×32   site-logo.png
│     │  └─ span.text-xl.font-semibold.text-gray-900.hidden.sm:inline    80×28  「魔猫订单」20px/28px w600 #111827
│     ├─ div.hidden.md:block.h-6.w-px.bg-gray-300                        1×24   #d1d5db
│     └─ h1.text-lg.md:text-xl.font-semibold.text-gray-700              ?×28   20px/28px w600 #374151
└─ div.max-w-[1440px].mx-auto
   └─ div.flex.flex-col.md:flex-row.md:gap-6.md:px-4.overflow-x-hidden.md:overflow-visible
      ├─ div.flex.justify-center.gap-4.py-4.md:hidden                    仅 <768px 显示
      ├─ aside#separator-sidebar                                         256×calc(100vh-60px)
      ├─ div.screen-ct.relative                                          589.5×1278
      └─ div#editor-ct.sidebar                                           384×calc(100vh-60px)
```

**横向溢出是原站真实行为**:768px 时 `document.body.scrollWidth = 1294`(256 + 589.5 + 384 + 2×24 gap + 32 px padding = 1293.5),外层 `md:overflow-visible` 放开溢出,页面可横向滚动。1440px 时 `scrollWidth = 1440`,不溢出。必须复现。

## 左侧工具导航 `aside#separator-sidebar`

```
class="md:w-64 md:min-w-[256px] md:h-[calc(100vh-60px)] md:overflow-y-auto md:sticky md:top-[60px] scrollbar-hide"
:class="isShowNav ? 'block' : 'hidden md:block'"
aria-label="Sidebar"
```

实测:`width 256px`,`min-width 256px`,`height 840px`(视口 900 时),`position sticky`,`top 60px`。

内层 `div.h-full.px-3.py-4.overflow-y-auto.scrollbar-hide` → 256×840,padding `16px 12px`。

- 第一组 `ul.space-y-2.font-medium` —— 1 项「返回首页 - 更多功能」,带内联 SVG(viewBox `0 0 1024 1024`,fill `#272636`,`class="icon flex-shrink-0 w-5 h-5 text-gray-500"`),`target="_blank"`
- 分隔:第二组 `ul.pt-4.mt-4.space-y-2.font-medium.border-t.border-gray-200` —— `border-top: 1px solid #e5e7eb`,`padding-top 16px`,`margin-top 16px`
- 第二组 18 项纯文字链接,每项 `li` 高 40px,相邻 `li` 之间 `margin-top: 8px`
- 链接类:`flex items-center p-2 text-gray-900 transition duration-75 rounded-lg hover:bg-gray-100 group`,文字包在 `span.ms-3`(= `margin-inline-start: 0.75rem`)
- 字号 16px / 行高 24px / `font-weight 500`(来自 `ul.font-medium`)/ 颜色 `#111827`

**hover 实测**:`background-color: rgba(0,0,0,0) → rgb(243,244,246)`,过渡 `0.075s cubic-bezier(0.4,0,0.2,1)`(`transition duration-75`)。第一组那一项没有 `transition duration-75`,用 Tailwind preflight 默认过渡。

导航 18 项(顺序、文案、链接):

| # | 文案 | href |
| --- | --- | --- |
| 1 | 淘宝订单生成器 | `../taobao/success2025.html` |
| 2 | 淘宝订单列表生成器 | `../taobao/list.html` |
| 3 | 京东订单生成器 | `../jd/order.html` |
| 4 | 京东订单列表生成器 | `../jd/list.html` |
| 5 | 拼多多订单生成器 | `../pdd/order.html` |
| 6 | 退货退款订单生成器 | `../pdd/return.html` |
| 7 | 闲鱼订单生成器 | `../fish/order.html` |
| 8 | 美团订单生成器 | `../meituan/order.html` |
| 9 | 微信聊天与转账截图 | `../wechat/index.html` |
| 10 | 得物订单生成器 | `../dewu/order.html` |
| 11 | 携程酒店订单生成器 | `../xc/order-new.html` |
| 12 | 飞猪车票订单生成器 | `../feizhu/order.html` |
| 13 | 抖音订单生成器 | `../douyin/order.html` |
| 14 | 快手订单生成器 | `../kuaishou/order.html` |
| 15 | 去哪儿订单生成器 | `../qunaer/order.html` |
| 16 | 二维码生成器 | `../qrcode/index.html` |
| 17 | 微信转账收款截图 | `https://jietuer.com/weixin-zhuanzhang.html`(`_blank`) |
| 18 | 支付宝付款截图 | `https://jietuer.com/alipay-fukuang.html`(`_blank`) |

本仓库只克隆了第 1 项和第 5 项,其余 16 项在原站是真实页面。**保留原文案与相对链接语义**,指向本仓库不存在的路由时按下文「已知取舍」处理。

## 移动端导航开关(<768px)

```
div.flex.justify-center.gap-4.py-4.md:hidden
├─ button  「打开导航」/「关闭导航」  @click="isShowNav = !isShowNav"
│   class="py-2.5 px-5 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200
│          hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100"
└─ a[href="#editor-ct"]  「编辑截图」
    class="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300
           font-medium rounded-lg text-sm px-5 py-2.5"
```

文案来自 `openNavText` / `closeNavText`,实测值 `打开导航` / `关闭导航`。

## iOS 状态栏(`.ios-bar.ios-bar-v2`)

DOM 由 bundle 追加到 `#screen` **末尾**,`absolute top-0` 覆盖在 `#screen` 的 120px 顶部内边距上。

```html
<div class="ios-bar absolute top-0 left-0 w-full h-[74.5px] bg-white flex items-center
            px-[42px] pl-[47.5px] ios-bar-v2 block">
  <div class="ios-left flex-1 flex items-center">                          <!-- 381.5×52.5 -->
    <span class="ios-time ml-4 text-[25px] font-semibold my-[7.5px]">08:41</span>
    <span class="ios-location block w-[21px] h-[21px] mr-[7.5px] relative left-[10px]
                 indent-[-9999px] bg-cover ios-location-icon-v2">定位</span>
  </div>
  <div class="ios-center"></div>
  <div class="ios-right flex items-center">                                 <!-- 118.5×20.5 -->
    <span class="ios_single ml-[7.5px] w-[28px] h-[19px] relative indent-[-9999px]
                 bg-cover ios-signal-icon-v2">
      <i class="ios-single-1 absolute bg-[#9b9b9b] rounded-[1.2px] w-[4.8px] h-[17px] right-[0.1px] top-[1px]"></i>
      <i class="ios-single-2 absolute bg-[#9b9b9b] rounded-[1.2px] w-[4px] h-[14px] right-[7.8px] top-[4px]"></i>
    </span>
    <span class="ios_wifi ml-[5.5px] w-[32.5px] h-[20.5px] indent-[-9999px] bg-cover ios-wifi-icon-v2">wifi</span>
    <div class="group ios_battery flex relative ml-[5.5px] w-[39.5px] h-[19.5px] bg-cover ios-battery-icon-v2">
      <span class="mr-[5px] flex-1 flex flex-col rounded-[7px] overflow-hidden">
        <em class="flex-1 z-11 indent-[-9999px] battery-value" style="width: 26%">电量</em>
        <i class="flex items-center justify-center absolute w-full h-full text-[15px] font-semibold
                  text-white not-italic battery-value-number z-10">26
          <a class="hidden w-[6.5px] h-[10px] bg-cover ios-battery-charging-icon-v2"></a>
        </i>
      </span>
    </div>
  </div>
</div>
```

配套 CSS(v2 分支,图标已落地为文件):

```css
.ios-bar-v2 .ios-location-icon-v2 { background-image: url(shared/status-bar/ios-location.png); background-size: cover }
.ios-bar-v2 .ios-signal-icon-v2   { background-image: url(shared/status-bar/ios-signal.png);   background-size: cover }
.ios-bar-v2 .ios-wifi-icon-v2     { background-image: url(shared/status-bar/ios-wifi.png);     background-size: cover }
.ios-bar-v2 .ios-battery-icon-v2  { position: relative }
.ios-bar-v2 .ios-battery-icon-v2::before {
  content: ''; position: absolute; inset: 0;
  background-image: url(shared/status-bar/ios-battery.png); background-size: cover;
}
.ios-bar-v2 .battery-value { background-color: #191919; z-index: 1 }
.ios-bar-v2 .ios-battery-charging-icon-v2 { background-image: url(shared/status-bar/ios-battery-charging.png); background-size: cover }

/* 白色图标变体(深色背景页用,本次两页未触发,但属共享 CSS) */
.ios-bar-v2.white-icon .ios-time { color: #fff }
.ios-bar-v2.white-icon .ios-location-icon-v2 { background-image: url(shared/status-bar/ios-location-white.png) }
.ios-bar-v2.white-icon .ios-signal-icon-v2   { background-image: url(shared/status-bar/ios-signal-white.png) }
.ios-bar-v2.white-icon .ios-wifi-icon-v2     { background-image: url(shared/status-bar/ios-wifi-white.png) }
.ios-bar-v2.white-icon .ios-battery-icon-v2::before { background-image: url(shared/status-bar/ios-battery-white.png); opacity: .6 }
.ios-bar-v2.white-icon .battery-value { background-color: #fff }

/* 充电态 —— 原站用 .ios_battery-charging 修饰类 */
.ios_battery-charging .battery-value { background-color: #34c759 }
.ios_battery-charging .ios-battery-charging-icon-v2 { display: block }
```

### 状态栏各状态实测差异

| 状态 | 触发 | 变化 |
| --- | --- | --- |
| 默认 | — | `.ios-location` `display:none`;信号 3 格 → 渲染 1 个 `.ios-single-1` 遮罩 |
| 定位开 | 「定位」勾选 | `.ios-location` `display:block`,盒 21×21 |
| 充电开 | 「充电」勾选 | `.ios_battery` 加 `.ios_battery-charging`;`em.battery-value` 背景 `#191919 → #34c759`;`a` 由 `display:none → block` |
| 电池百分比关 | 「电池百分比」取消勾选 | `i.battery-value-number` 仍占位 39.5×19.5,但**数字文本不渲染** |
| 信号 4 | 「蜂窝信号」=4 | 无遮罩 `<i>`,4 格全亮 |
| 信号 3 | =3(默认) | 1 个 `.ios-single-1` |
| 信号 2 | =2 | `.ios-single-1` + `.ios-single-2` |

信号图标机制:背景 PNG 画满 4 格,靠 `#9b9b9b` 的 `<i>` 从右往左**盖掉**多余格子。

`ios-time` 与 `battery` 的默认值**每次加载随机**(实测见到 `08:41 / 26%`、`19:51 / 54%`、`06:05 / 60%`、`09:23`)。本仓库固定为 iOS 官方宣传时间 `08:41` 与 `26%`,避免 SSR/CSR 水合不一致。

## Android 状态栏(`.material-top-bar`)

```
class="material-top-bar py-[18px] px-[26px] h-[74.5px] absolute top-0 left-0 right-0 bg-white hidden"
```

默认 `hidden`;「安卓状态栏」勾选后 `display:block`,同时 iOS 栏隐藏(二者互斥)。

内部 `div.flex.items-center.justify-between` → 537.5×32:

- `.material-left.flex.items-center.gap-2.flex-row` → 102.63×32
  - 时间 `div.font-semibold.text-2xl` → 70.63×32
  - `div.flex.items-center.gap-1.flex-row` → 24×24,内含微信图标 SVG(viewBox `0 0 1024 1024`,fill `#5D5D5D`)
- `.material-right.flex.flex-row.items-center.gap-2` → 136×28,四个 28×28 图标:
  - `.material-5g`(仅安卓栏激活时出现)
  - `.material-cell` —— Material Symbols 信号条,`viewBox="0 -960 960 960"` fill `#1f1f1f`
  - `.material-wifi` —— 同上
  - `.material-battery.relative.top-[1px]` —— 同上

三个 Material 图标的 `path` 数据见 `states/status-bar-html.json`。

## 编辑器面板外壳 `div#editor-ct`

```
class="sidebar md:w-96 md:min-w-[384px] md:sticky md:top-[60px] md:h-[calc(100vh-60px)]
       md:overflow-y-auto scrollbar-hide max-md:h-auto"
```

实测 ≥768px:`width 384px`,`min-width 384px`,`position sticky`,`top 60px`,`height 840px`,`overflow-y auto`。<768px:`width` 撑满,`height auto`。

### 登录条(原站 `.user-container` 带 `hide`,由 bundle 移除)

```
div.user-container.justify-center            (display:flex; align-items:center)
├─ div.avatar        20×20 圆形,内 img 40×40 → login-avatar.png
├─ div.username      (空)
├─ div.logout.ml-1.hide   「| 登出」
└─ div.no-username        「请登录后使用」   16px #333 margin-left:10px cursor:pointer
```

### 生成截图按钮区

```
div.p-6
├─ button#generatePic  「生成截图」  @click="screenshot"
│   class="bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white
│          font-medium py-2.5 px-5 rounded-lg transition-colors"
└─ a#downdloadPic  「导出」  download target="_blank"
    class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hidden"
```

hover 实测:`rgb(37,99,235) → rgb(29,78,216)`,过渡 `0.15s cubic-bezier(0.4,0,0.2,1)`(`transition-colors`)。

### 助手提示(`hasExtention === false` 分支,实测生效)

```html
<div class="mb-4">
  <p class="text-gray-500 text-base">
    更新
    <a href="../../mockhelper.html" target="_blank"
       class="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">生成器助手</a>
    输入淘宝京东详情页链接后自动填写,如已安装完成请刷新本页
  </p>
</div>
```

渐变实测:`linear-gradient(to right, rgb(56,189,248), rgb(5,150,105))`。

`hasExtention === true` 分支(浏览器扩展已装)会显示「京东或淘宝详情页链接」输入框 + 绿色机器人按钮 —— 实测为 `false`,**本仓库固定走 false 分支**。

### 表单行统一样式

```
div.mb-4
├─ label.block.text-gray-700.mb-2          16px/24px  #374151  margin-bottom:8px
└─ input[type=text|number|time]
    class="border border-gray-300 bg-gray-50 text-gray-900 rounded-lg
           focus:ring-blue-500 focus:border-blue-500 w-full p-2.5"
```

checkbox 行:`input.w-4.h-4.text-blue-600.bg-gray-100.border-gray-300.rounded.focus:ring-blue-500.focus:ring-2`
file 行:`input[type=file]`,无额外类(浏览器原生样式)

### 面板切换按钮

```
button  「编辑信号与时间 →」   @click="enableEditTopbar = !enableEditTopbar; scrollTop()"
button  「← 编辑订单信息」     @click="enableEditTopbar = !enableEditTopbar"
class="bg-gray-700 hover:bg-gray-800 focus:ring-4 focus:ring-gray-300 text-white
       font-medium py-2.5 px-5 rounded-lg transition-colors"
```

hover 实测:`rgb(55,65,81) → rgb(31,41,55)`,`0.15s`。
两个面板用 `v-show="!enableEditTopbar"` / `v-show="enableEditTopbar"` 互斥(是 `display:none` 切换,不是卸载)。

### 「编辑信号与时间」面板 7 个字段(实测)

| label | type | 默认 | min | max |
| --- | --- | --- | --- | --- |
| 手机时间 | `time` | 随机(固定为 `08:41`) | — | — |
| 电量 | `number` | 随机(固定为 `26`) | 9 | 91 |
| 蜂窝信号 | `number` | `3` | 2 | 4 |
| 定位 | `checkbox` | `false` | — | — |
| 充电 | `checkbox` | `false` | — | — |
| 电池百分比 | `checkbox` | `true` | — | — |

第 7 项是「← 编辑订单信息」按钮所在行。

## 截图导出

`button#generatePic` → `screenshot()` → 把 `#screen` 光栅化为 dataURL → 写入 `screenMirrorData` → 触发覆盖层:

```html
<div class="screen-mirror absolute top-0 left-0 bottom-0 right-0 z-50 bg-center bg-contain
            bg-no-repeat bg-[#fff] w-screen"
     v-if="screenMirrorData" :style="{ backgroundImage: `url(${screenMirrorData})` }"></div>
```

同时 `a#downdloadPic` 去掉 `hidden`,`href` 指向该 dataURL。原站光栅化逻辑在混淆 bundle 里(`js/dlpic.js` 的打包版本)。本仓库用 `html2canvas` 实现同等行为。

## 常显浮层(Tippy.js)

两个都是 `.tippy-box`:`background-color #333`,`color #fff`,`font-size 14px`,`line-height 19.6px`,`border-radius 4px`,`z-index 9999`,`pointer-events none`;内层 `.tippy-content` `padding 5px 9px`;实测外框 h = 29.6px。

| # | 文案 | 锚点 | placement | 相对 `#screen` 位置 |
| --- | --- | --- | --- | --- |
| 1 | 点击这里使用支付宝登录以获得完整功能 | `.user-container`(登录条) | `bottom` | x 671,y 37,w 270 |
| 2 | 截图仅用于玩笑晒单,切勿用于非法目的 | `#editor-ct` | `left` | x 343.8,y 408,w 260.2 |

第 2 条是原站的**防滥用提示**,必须保留。

## 已知不移植

| 项 | 原因 |
| --- | --- |
| `div#pwall` 打赏/会员弹窗(¥5 / ¥19 / ¥165 三档「食物投递方案」) | 默认 `display:none`,URL 上不可见;且是指向第三方收款账户的支付募集界面,不复刻 |
| 支付宝登录、`hasExtention === true` 的扩展联动 | 需真实后端与浏览器扩展,超出「无后端 / 无鉴权」范围;登录条视觉保留但不可点通 |
| Clarity / 百度统计 / Mixpanel / GA 四套分析脚本 | 第三方追踪,克隆视觉无关 |
| `.mask1`–`.mask15` 马赛克开关 | 原站两页均已注释掉该开关 |
| `.ios-bar-v1` 全套规则 | 两页都走 `use-ios-bar-v2` |
| 左侧导航 16 个未克隆页面的目标路由 | 本次只克隆 2 页;链接保留原文案,指向原站绝对地址 |
