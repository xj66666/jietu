# 输出计划(Output Plan)

生成时间:2026-08-21
执行 skill:`/clone-website`
命令参数:`https://order.hereserver.com/mock-order/pdd/order.html https://order.hereserver.com/mock-order/taobao/success2025.html`

## 用户已确认的方案决策

| 决策点 | 选定方案 |
| --- | --- |
| 浏览器自动化 | 安装 Playwright + Chromium,用 Node 脚本驱动(截图 / getComputedStyle / 交互 sweep / 视觉 QA diff) |
| Node 版本 | 用户升级本机 Node 到 22/24 LTS(Next 16 需 ≥20.9.0;当前 v18.19.0) |
| 克隆范围 | 完整克隆整个工具:三栏布局 + 全部表单双向绑定 + 实时预览 + 图片上传 + 截图导出 |
| 路由形式 | 完全保留原 pathname(含 `.html` 后缀) |

## 共享基础

- **app-root**:`.`(仓库根,单一 Next.js 应用)
- **origin**:`https://order.hereserver.com`(同源,两页共用一套字体 / 全局 CSS / layout)
- **site-key**:`order-hereserver-com-a6d29d9e`
- **同站共享组件根**:`src/components/sites/order-hereserver-com-a6d29d9e/shared/`
- **同站共享资源根**:`public/sites/order-hereserver-com-a6d29d9e/shared/`

两页同源且技术栈一致(Vue 3 + Tailwind CDN 3.4.5),因此**基础层建设一次、顺序执行**,之后页面级工作才可并行。

## 目标 1:拼多多订单生成器

| 项 | 值 |
| --- | --- |
| 源 URL | `https://order.hereserver.com/mock-order/pdd/order.html` |
| normalized pathname | `/mock-order/pdd/order.html` |
| page-key | `mock-order-pdd-order-html-f0d21aee` |
| 目标路由 | `/mock-order/pdd/order.html` |
| 路由文件 | `src/app/mock-order/pdd/order.html/page.tsx` |
| artifact root | `docs/research/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/` |
| screenshot root | `docs/design-references/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/` |
| component root | `src/components/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/` |
| asset root | `public/sites/order-hereserver-com-a6d29d9e/mock-order-pdd-order-html-f0d21aee/` |
| 下载脚本 | `scripts/download-assets-order-hereserver-com-a6d29d9e-mock-order-pdd-order-html-f0d21aee.mjs` |

## 目标 2:淘宝订单生成器(success2025)

| 项 | 值 |
| --- | --- |
| 源 URL | `https://order.hereserver.com/mock-order/taobao/success2025.html` |
| normalized pathname | `/mock-order/taobao/success2025.html` |
| page-key | `mock-order-taobao-success2025-html-172e23a1` |
| 目标路由 | `/mock-order/taobao/success2025.html` |
| 路由文件 | `src/app/mock-order/taobao/success2025.html/page.tsx` |
| artifact root | `docs/research/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/` |
| screenshot root | `docs/design-references/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/` |
| component root | `src/components/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/` |
| asset root | `public/sites/order-hereserver-com-a6d29d9e/mock-order-taobao-success2025-html-172e23a1/` |
| 下载脚本 | `scripts/download-assets-order-hereserver-com-a6d29d9e-mock-order-taobao-success2025-html-172e23a1.mjs` |

## 路由段命名合法性核查

两条路由的目录名含 `.`(`order.html`、`success2025.html`)。这不触发任何 App Router 特殊语法:

- 无前导 `_`(私有目录)或 `@`(并行插槽)
- 无 `(...)`(路由组)或 `[...]`(动态段)
- `.` 在目录名中是普通字符

因此 `src/app/mock-order/pdd/order.html/page.tsx` 会精确解析为 `/mock-order/pdd/order.html`。Phase 4 需实测确认。

## 冲突核查

`npm run build` 前的现存路由清单(未改动的模板脚手架):

- `src/app/layout.tsx` —— 根 layout,**将被修改**(合并字体与站点全局样式)
- `src/app/page.tsx` —— 模板脚手架首页

两个目标路由都不是 `/`,因此 **`src/app/page.tsx` 保持不动**(skill 只允许「首个单 URL 克隆进未改动模板」时替换它,本次是多 URL,不适用)。

其余核查结果:

- `docs/research/` 下原本只有 `INSPECTION_GUIDE.md`,无同名 artifact root
- `docs/design-references/` 无既存内容
- `src/components/sites/` 不存在,全新创建
- `public/sites/` 不存在,全新创建
- 两个下载脚本名各自带完整 site-key + page-key,互不覆盖

**结论:无冲突,无需替换任何既存产物。**

## 需要改动的共享基础文件

| 文件 | 改动性质 |
| --- | --- |
| `src/app/layout.tsx` | 合并 `next/font` 字体配置;根 metadata 保持通用,页面级 metadata 由各路由自行 export |
| `src/app/globals.css` | 追加站点设计令牌与全局工具类(`.scrollbar-hide`、`.money`、`.defaultFont` 等),不删除既有 shadcn 令牌 |
| `package.json` | 追加 `playwright`(devDependency,仅用于提取与 QA)、`html2canvas`(截图导出功能) |
| `.gitignore` | 追加 `.tmp-src/`(提取阶段的源码暂存目录) |

## 并行策略

1. 基础层(字体 / globals.css / 类型 / 图标 / 资源下载)—— **顺序,由主控执行**
2. 两页各自的组件构建 —— 每个 builder 独立 worktree 分支,完成后由主控合并
3. 页面装配 —— 主控执行
4. 视觉 QA diff —— 主控执行
