# Syutoi 开发任务

依据：[产品需求文档 v0.1](<hexo-theme-syutoi 产品需求文档（PRD）v0.1.md>)。

执行顺序：先建立可以运行、可以验证的旧主题基线，再按 PRD 重写。
每完成一个批次更新此文件；只有实际实现并通过验收的任务才勾选。
PRD 第 52 节的 v0.1 MVP 验收标准优先于后续版本功能清单。
当前包版本 `0.2.5` 继承自上游，不代表已完成 Syutoi 的 0.2 阶段。

## A. 可运行基线（已完成）

- [x] A1：将当前主题名称、配置、路径和文档目录改为 Syutoi；保留上游来源和原站外链。
- [x] A2：保留原 MIT License，并添加 NOTICE 说明代码来源（PRD §31）。
- [x] A3：升级示例站到 Hexo 8，声明 Node >=20.19，建立 pnpm workspace 与锁文件；明确主题直接依赖。
- [x] A4：提供根目录 `pnpm dev/build/clean/test`；自动连接示例站到当前主题，避免手工复制。
- [x] A5：修复在真实构建中发现的配置、路径或依赖兼容问题。
- [x] A6：完成 clean → generate → 产物检查，启动本地服务并验证主要页面与 CSS/JS HTTP 响应。
- [x] A7：加入 CI，在 Node 最低支持版本与 LTS 版本执行锁定安装、构建和产物检查。
- [x] A8：更新 README，记录开发命令、运行要求及当前旧主题基线的局限。

验收：新 checkout 按 README 安装后可运行；首页、文章、独立页、归档、分类和标签页及静态资源可访问；构建日志没有错误。此阶段不代表现代化 MVP 已完成。

## B. v0.1 工程重建（当前阶段，PRD §8–12、37–41、52）

- [x] B1：建立 `src/client`、`src/styles`、`src/shared`，以 TypeScript + esbuild 构建客户端，添加有实际输入的 `typecheck`。
- [x] B2：建立 CSS + Custom Properties + PostCSS 流程；定义颜色、宽度、间距、字号和圆角 tokens。
- [x] B3：将开发监听与 Hexo 预览串联；生产输出进入 `source/`，明确生成文件的版本控制策略。
- [x] B4：逐步替换 Stylus 和旧脚本；切换前后都验证示例站，切换完成后移除旧构建依赖。已按反馈恢复接近原版的视觉结构，并重新完成本地验证。
- [x] B5：替换 multi-markdown-it 定制渲染器为通用 Markdown renderer；盘点旧示例语法并记录迁移差异。
- [x] B6：简化配置至约 100–150 行、最多三层；导航与社交链接采用结构化 YAML。
- [ ] B7：引入适量 lint/typecheck；只为配置、URL 等独立逻辑添加必要单元测试，并纳入 CI。

验收：主题构建、类型检查、示例站构建均通过；核心不依赖 Stylus、自建 Markdown renderer 或第三方运行时框架。

## C. v0.1 核心页面（PRD §13–16、18、24、26、34–36、52）

- [x] C1：重建语义化 Nunjucks 基础模板、Header/Footer 和内容容器。
- [ ] C2：实现轻量首页与文章列表，支持分页、可选摘要和可选封面。
- [ ] C3：实现文章页、独立 Page、归档页，正确显示标题、日期和主要内容。
- [ ] C4：实现中文、英文和混排排版；默认系统字体，正文宽度约 720px。
- [x] C5：提供本地 SVG 图标，移除远程 Iconfont 和默认 Google Fonts 请求。
- [ ] C6：实现移动导航、响应式布局、键盘焦点和主要页面的无 JS 可用性。
- [ ] C7：保留并整理 zh-CN、zh-TW、en 文案，去除核心界面的硬编码文本。
- [ ] C8：整理页面 title、description、canonical 与基本 Open Graph；避免继承示例站作者身份。

验收：桌面与移动端可阅读和导航；无封面、长标题、中英文文章正常；核心页面在禁用 JS 时仍可访问。

## D. v0.1 阅读、主题与收尾（PRD §17、20–21、32–34、42、52–53）

- [x] D1：实现 light/dark/auto，读取系统偏好、保存用户选择，并在首次绘制前应用主题。
- [ ] D2：覆盖 H1–H6、段落、列表、引用、链接、表格、图片、代码、脚注和 details 样式。
- [ ] D3：以 renderer 输出为基础提供代码语言标签、复制按钮、横向滚动及深浅配色。
- [ ] D4：实现图片响应式、原生懒加载、标题说明与合理尺寸约束。
- [ ] D5：完善 MVP 示例文章、图片和表格，增加无封面、长文和边界情况。
- [x] D6：移除默认 PJAX、音乐、烟花、评论、搜索、打赏、动画和统计脚本；默认无第三方 JS 请求。
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
- 当时的下一批计划为 B1–B3；完成记录见下。


### 2026-09-17：B1–B3 构建链与主题偏好

- 完成 TypeScript 严格检查、esbuild IIFE 打包、PostCSS imports/Autoprefixer 与 design tokens；配置、源码和开发说明已加入仓库。
- 新产物为 `source/js/syutoi.min.js` 和 `source/css/syutoi.min.css`，随源码纳入版本控制；CI 增加类型检查、单元测试和产物一致性检查。旧布局仍走原来的构建链。
- `pnpm dev` 串联首次资源构建、资源监听和 Hexo 服务。实际验证了 CSS import 更新、TS 更新、语法错误保留旧产物、恢复后继续构建，以及 SIGTERM 后端口释放。
- 原深浅色控制器已迁入新客户端（提前完成 D1）：light/dark/auto、启动时应用偏好、键盘操作、本地 SVG、持久化、系统跟随、跨标签页同步、旧偏好兼容和受限存储回退。
- Chrome 对新客户端进行了隔离验证（阻断旧 app.js 与外部请求）：在 body 解析前设置模式；键盘切换、重新加载、显式偏好不被系统覆盖、auto 跟随系统、跨标签同步和禁止 localStorage 均通过。此检查不代表完整旧页面已消除外部依赖。
- `pnpm typecheck`、完整示例站构建（81 个文件）、7 项单元/构建测试及 8 类页面产物检查通过。构建失败测试会故意构造语法错误；其报错属于测试输入，测试本身应通过。
- 锁定安装通过；CI 配置已更新，Node 24 与远端 CI 的结果仍待实际运行。

下一批：继续 B4/B5，迁移旧脚本与 Stylus、替换定制 Markdown renderer；随后完成 B6 配置整理及 B7 剩余 lint。B4/B7 本批只有部分进展，尚未勾选。完整页面、排版和无 JS 验收仍按 C/D 阶段推进。


### 2026-09-18：B4 页面资源切换

- 已将所有核心模板切换为原生 CSS / TypeScript；移除 Stylus、旧 app.js 生成器及 PJAX、播放器、烟花等运行时，并从示例依赖及锁文件移除 Stylus renderer 和 Hexo Autoprefixer。主题构建仍使用 PostCSS Autoprefixer。
- 为解除旧运行时耦合，同步完成基础语义模板、Header/Footer、内容容器（C1）、本地 SVG 与系统字体（C5）、默认第三方功能移除（D6）。首页、文章、归档和移动导航已具备新版基础实现；其余 C/D 项继续按各自完整范围验收。
- 友情链接保留原生链接与图片；旧媒体列表转换为普通链接。标题和配置值默认转义；封面改为显式可选，取消随机图片。见 [迁移说明](migration-from-shoka.md)。
- 切换前基线构建及 7 项测试通过；切换后 `pnpm typecheck`、示例站构建（75 个文件）、11 项单元/构建恢复测试和 8 类页面产物检查通过。新增测试覆盖 URL、旧/新菜单、置顶分页、空首页及子目录资源/内容链接。
- 本地 Chrome 实测 10 类页面：桌面 1440px、移动 390px 无横向页面溢出；关闭 JS 后正文和移动导航可用；键盘菜单、Escape 焦点返回、复制正文代码（不带行号）、深浅色切换通过。阻断外部资源时无页面脚本错误，未发出第三方脚本、字体、样式请求。作者正文的外部图片仍可能请求网络。
- 已检查桌面与移动端截图。完整 Lighthouse、更多排版边界及 Node 24 / 远端 CI 尚未运行，留在原任务中。
- 定制 renderer 与 Prism diff 的非致命提示仍保留；旧示例说明不代表全部旧功能仍被支持。

下一批：B5，替换 `hexo-renderer-multi-markdown-it`，盘点示例语法并记录迁移差异；随后 B6 精简配置。

### 2026-09-18：B4 视觉验收反馈

- 用户反馈新版与原版差异过大、界面简陋。上一批将工程迁移扩大为整体视觉重设计，技术检查通过不能代替视觉验收。B4 恢复为未完成。
- 暂停 B5；先确认视觉保留范围，修正首页构图、文章卡片、封面与信息层次，再检查桌面/移动端效果。
- PRD §14 的简约方向与“无封面仍应很好看”需要同时满足，不能仅以删除视觉元素作为实现。


### 2026-09-18：B4 视觉修正与提交策略

- 按用户确认的方向恢复接近原版的图片页头、静态波浪、交错图文卡片、分类入口、作者侧栏，以及文章内容面板和普通目录链接。保留 TypeScript / PostCSS 构建及无 JS 可读性。
- 页头通过 `appearance.cover` 显式配置；示例站复用本地图片，三篇文档文章设置明确封面，其他文章保留无封面卡片。未恢复随机图片、CDN 脚本、PJAX 和播放器。
- 本地检查 Light/Dark 桌面首页与移动页面截图，并复测主要页面、键盘菜单、代码复制和禁用 JS 的导航。技术与截图检查记录不代表用户已最终认可所有视觉细节，C/D 阶段继续完善。
- 后续每完成一个大任务，在检查通过后创建一次 Git 提交，提交信息使用英文。当前提交以 B4 为边界，B5 单独执行和提交。


### 2026-09-18：B5 通用 Markdown renderer

- 示例站改用 `hexo-renderer-markdown-it@7.1.1`，显式启用脚注与 `markdown-it-task-lists@2.1.1`；代码使用 Hexo 内置 Highlight.js，未知语言回退纯文本，保留复制按钮。
- 移除 `hexo-renderer-multi-markdown-it` 及其 Puppeteer / deasync 依赖链、旧 minify 配置和不用的 Pangu 模板过滤器；CI / 安装说明不再设置跳过 Chromium 下载的环境变量。HTML 不再额外压缩，JS/CSS 仍由主题构建压缩。
- 盘点原示例私有语法；Java 笔记和普通历史说明中的提示块改为引用，题目改为普通文本。复杂特殊功能历史页保留原文并明确标注支持范围，保留历史来源链接。具体差异见 [迁移说明](migration-from-shoka.md)。
- 新增 `/reading/` 写作示例，覆盖脚注、任务列表、表格、代码、未知语言转义、原生图片懒加载、details、ruby 与重复标题；新增实际 HTML 产物检查并纳入 `pnpm test`。
- 类型检查、76 个文件的示例站构建、11 项单元/构建恢复测试、9 类页面及 Markdown 产物检查通过。新 renderer 构建日志无旧 Prism diff 提示。
- Chrome：10 类页面在 1440px / 390px 与无 JS 下复测通过；写作示例另测 Light/Dark、精确代码复制、脚注、图片与无 JS 原生折叠。已查看移动端正文截图；未改变 B4 修正后的页面外壳。
- 仍存在 Nunjucks/Chokidar 与 hexo-feed/Hexo 的 peer 范围提示；本地构建通过，Node 24 / 远端 CI 尚未运行。

下一批：B6，简化主题配置并统一导航与社交链接的结构化 YAML；作为独立任务验证与提交。


### 2026-09-18：B6 配置整理

- 默认主题配置从 309 行精简为 111 行（含说明），示例覆盖为 24 行；只列出实际接入模板的字段，最多三层。新增 [配置文档](configuration.md)，说明 Hexo 覆盖顺序、完整列表替换、空值、有效 URL 及旧字段映射。
- 导航统一为 `navigation.menu` 的 `{ name, url }` 列表；`menu.*` 标签按语言翻译，普通标签保留原文。社交链接也使用结构化列表，显示为作者侧栏中的普通链接；默认不含上游作者账号。
- 展示名、头像、网站图标统一放入 branding，接入侧栏和页脚开关。空菜单不再输出空导航或菜单按钮；关闭侧栏时使用居中单列布局。
- 兼容旧 alternate、darkmode、menu、sidebar.avatar/images 和 social 映射；站点显式旧字段不会被新默认值遮盖，同一覆盖配置中显式新字段优先。非法 URL 和无效链接条目被忽略，配置文字默认转义。
- 类型检查、干净示例站构建、19 项测试、9 类页面和 Markdown 产物检查通过。其中 3 项测试创建隔离 Hexo 站点，实际验证新/旧配置、子目录 URL、空菜单、禁用侧栏和页脚、社交链接转义及年份区间。
- Chrome 回归：10 类页面桌面/移动端、无 JS 导航，以及写作页 Light/Dark、复制、脚注、图片、原生 details 均通过。

下一批：B7，补齐适量 lint / 工程检查并纳入 CI；独立验证与提交。
