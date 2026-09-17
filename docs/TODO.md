# Syutoi 开发任务

依据：[产品需求文档 v0.1](<hexo-theme-syutoi 产品需求文档（PRD）v0.1.md>)。

执行顺序：先建立可以运行、可以验证的旧主题基线，再按 PRD 重写。
每完成一个批次更新此文件；只有实际实现并通过验收的任务才勾选。
PRD 第 52 节的 v0.1 MVP 验收标准优先于后续版本功能清单。
当前包版本 `0.2.5` 继承自上游，不代表已完成 Syutoi 的 0.2 阶段。

## A. 可运行基线（当前批次）

- [x] A1：将当前主题名称、配置、路径和文档目录改为 Syutoi；保留上游来源和原站外链。
- [x] A2：保留原 MIT License，并添加 NOTICE 说明代码来源（PRD §31）。
- [x] A3：升级示例站到 Hexo 8，声明 Node >=20.19，建立 pnpm workspace 与锁文件；明确主题直接依赖。
- [x] A4：提供根目录 `pnpm dev/build/clean/test`；自动连接示例站到当前主题，避免手工复制。
- [x] A5：修复在真实构建中发现的配置、路径或依赖兼容问题。
- [x] A6：完成 clean → generate → 产物检查，启动本地服务并验证主要页面与 CSS/JS HTTP 响应。
- [x] A7：加入 CI，在 Node 最低支持版本与 LTS 版本执行锁定安装、构建和产物检查。
- [x] A8：更新 README，记录开发命令、运行要求及当前旧主题基线的局限。

验收：新 checkout 按 README 安装后可运行；首页、文章、独立页、归档、分类和标签页及静态资源可访问；构建日志没有错误。此阶段不代表现代化 MVP 已完成。

## B. v0.1 工程重建（PRD §8–12、37–41、52）

- [ ] B1：建立 `src/client`、`src/styles`、`src/shared`，以 TypeScript + esbuild 构建客户端，添加有实际输入的 `typecheck`。
- [ ] B2：建立 CSS + Custom Properties + PostCSS 流程；定义颜色、宽度、间距、字号和圆角 tokens。
- [ ] B3：将开发监听与 Hexo 预览串联；生产输出进入 `source/`，明确生成文件的版本控制策略。
- [ ] B4：逐步替换 Stylus 和旧脚本；切换前后都验证示例站，切换完成后移除旧构建依赖。
- [ ] B5：替换 multi-markdown-it 定制渲染器为通用 Markdown renderer；盘点旧示例语法并记录迁移差异。
- [ ] B6：简化配置至约 100–150 行、最多三层；导航与社交链接采用结构化 YAML。
- [ ] B7：引入适量 lint/typecheck；只为配置、URL 等独立逻辑添加必要单元测试，并纳入 CI。

验收：主题构建、类型检查、示例站构建均通过；核心不依赖 Stylus、自建 Markdown renderer 或第三方运行时框架。

## C. v0.1 核心页面（PRD §13–16、18、24、26、34–36、52）

- [ ] C1：重建语义化 Nunjucks 基础模板、Header/Footer 和内容容器。
- [ ] C2：实现轻量首页与文章列表，支持分页、可选摘要和可选封面。
- [ ] C3：实现文章页、独立 Page、归档页，正确显示标题、日期和主要内容。
- [ ] C4：实现中文、英文和混排排版；默认系统字体，正文宽度约 720px。
- [ ] C5：提供本地 SVG 图标，移除远程 Iconfont 和默认 Google Fonts 请求。
- [ ] C6：实现移动导航、响应式布局、键盘焦点和主要页面的无 JS 可用性。
- [ ] C7：保留并整理 zh-CN、zh-TW、en 文案，去除核心界面的硬编码文本。
- [ ] C8：整理页面 title、description、canonical 与基本 Open Graph；避免继承示例站作者身份。

验收：桌面与移动端可阅读和导航；无封面、长标题、中英文文章正常；核心页面在禁用 JS 时仍可访问。

## D. v0.1 阅读、主题与收尾（PRD §17、20–21、32–34、42、52–53）

- [ ] D1：实现 light/dark/auto，读取系统偏好、保存用户选择，并在首次绘制前应用主题。
- [ ] D2：覆盖 H1–H6、段落、列表、引用、链接、表格、图片、代码、脚注和 details 样式。
- [ ] D3：以 renderer 输出为基础提供代码语言标签、复制按钮、横向滚动及深浅配色。
- [ ] D4：实现图片响应式、原生懒加载、标题说明与合理尺寸约束。
- [ ] D5：完善 MVP 示例文章、图片和表格，增加无封面、长文和边界情况。
- [ ] D6：移除默认 PJAX、音乐、烟花、评论、搜索、打赏、动画和统计脚本；默认无第三方 JS 请求。
- [ ] D7：验证 Light/Dark、Mobile/Desktop、无 JS、键盘操作和 reduced-motion；记录实际结果。
- [ ] D8：统计核心 JS/CSS gzip 大小；使用 Lighthouse 测量 LCP/CLS/INP 相关指标并记录测试环境，避免把目标写成实测结果。
- [ ] D9：补齐配置、开发和基础写作说明，更新版本与 CHANGELOG，逐项完成 PRD §52 验收。

验收：`pnpm build`、类型检查、必要测试和 `hexo generate` 通过；核心页面完整、Light/Dark 可用、无默认第三方 JS。v0.1 暂不集成 PRD §53 列出的功能。

## E. MVP 后：完整阅读体验（0.2–0.3）

- [ ] E1：补齐分类页、标签页、404 和文章前后篇导航（PRD §13）。
- [ ] E2：实现桌面 sticky TOC、移动端折叠目录和可渐进增强的 scroll spy（§19）。
- [ ] E3：完善文章元信息、阅读时间及封面可选体验。
- [ ] E4：评估可选图片灯箱；保证关闭时不加载依赖。

## F. 博客能力（0.5，PRD §22–25）

- [ ] F1：定义搜索 provider 接口，验证 Pagefind 与 Hexo 生命周期的集成，再实现可选本地搜索。
- [ ] F2：定义 Comments Slot，以 Waline 为首个可选 adapter；不启用时无请求。
- [ ] F3：完善 Open Graph/Twitter Card、结构化社交链接和 SEO 配置。
- [ ] F4：通过 Hexo 插件验证 RSS、Sitemap，避免在主题重复实现。

## G. Beta 与稳定版（0.9–1.0，PRD §43–51）

- [ ] G1：编写 getting-started/configuration/writing/customization/deployment/migration-from-shoka 文档。
- [ ] G2：发布配置与内容迁移兼容清单，明确不支持的旧标签及替代写法。
- [ ] G3：完整验证首页、文章、Page、归档、分类、标签、404 的响应式与无障碍。
- [ ] G4：验证性能预算：核心 JS gzip <50KB（争取 <30KB）、CSS gzip <40KB；按明确环境记录性能数据。
- [ ] G5：完成 demo 站与文档站，验证 git clone 和可选 npm 安装方式。
- [ ] G6：整理版本策略、发布流程、许可证和依赖，准备正式 1.0 发布。

## 验证记录

### 2026-09-17：运行基线

- 环境：Node 20.19.2、pnpm 9.0.4、Hexo 8.1.2。
- `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true pnpm install`：已完成；锁文件已生成。
- 再次执行 `pnpm install --frozen-lockfile`（同样跳过 Chromium）：通过。
- `pnpm clean && pnpm build && pnpm test`：通过；生成 79 个文件，检查 8 类页面、正文、JS 语法、静态资源和 RSS/Atom/JSON feed。
- `pnpm dev`：监听 `127.0.0.1:4000`；首页、文章、独立页、归档、分类/标签列表及详情、404、CSS、JS、JSON feed 共 12 个地址返回 HTTP 200。
- 已修复：示例 audio 的 YAML 缩进、链接主题时递归扫描、Hexo 8 移除的 gist/jsfiddle/youtube/vimeo 示例标签、脚本资源硬编码路径，以及顶层变量压缩造成的浏览器名称冲突；移除失效的 polyfill 请求。
- 内置 CDN、字体及图标 URL 改为 HTTPS，避免本地 HTTP 预览沿用 HTTP 外链。
- Chrome 实测：1440px 桌面首页与 390px 移动端文章均完成加载，未报告未捕获的页面脚本错误；外部图片、字体加载仍受网络影响，完整视觉验收留待重写阶段。
- 示例 Mermaid/Graphviz 暂按代码展示，避免旧渲染器在构建中启动 Chromium。
- CI 工作流已添加，尚未在 GitHub 上执行；Node 24 的结果以后以 CI 实测为准。

遗留问题（后续工程重建中处理）：

- 上游 renderer 仍包含弃用依赖，Prism diff 插件存在非致命提示。
- `hexo-feed` 的 peer 范围尚未声明 Hexo 8；当前三类 feed 已通过实测。Nunjucks/Chokidar 仍有 peer 警告，后续升级或替换时需要消除。
- 旧界面仍依赖 CDN、外部图片和旧功能；无 JS 可用性、零默认第三方请求和性能指标尚未验收。
- 下一批从 B1–B3 开始：TypeScript/esbuild、CSS tokens/PostCSS 和开发监听，然后推进核心页面重写。
