# 开发与构建

页面已切换到原生 CSS 和 TypeScript 客户端，移除了 Stylus 与旧脚本；Markdown 已使用通用 `hexo-renderer-markdown-it`。任务状态见 [TODO](TODO.md)。

## 环境与命令

使用 Node.js >=20.19.0 和 pnpm 9.0.4。仓库提供 `.nvmrc`；首次运行先执行 `nvm install`、`nvm use`。

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm test
pnpm dev
```

| 命令 | 行为 |
| --- | --- |
| `pnpm build:theme` | 构建新的 JS 与 CSS，不生成示例站 |
| `pnpm build:example` | 连接本地主题并生成示例站；使用已有主题产物 |
| `pnpm build` | 先构建主题资源，再生成示例站 |
| `pnpm lint` | ESLint 检查手写 JS/TS；出现错误或警告均失败 |
| `pnpm typecheck` | 严格检查 `src/**/*.ts`，不输出文件 |
| `pnpm test:unit` | 测试主题偏好、URL、导航、分页与构建失败恢复 |
| `pnpm test` | 运行单元/隔离 Hexo/构建恢复测试、页面与 Markdown 产物检查及 gzip 预算检查；先执行 `pnpm build` |
| `pnpm dev` | 首次构建资源，监听源码，启动 Hexo 预览 |
| `pnpm dev --port 4001` | 在指定端口预览，默认只监听 127.0.0.1 |
| `pnpm clean` | 删除示例站数据库和 public，不删除已提交的主题产物 |

修改 `src/` 后会重新构建资源，Hexo 随后更新站点；构建失败时保留上一次成功产物，修正源码后自动恢复。刷新浏览器查看结果，目前不提供浏览器自动刷新。配置文件、依赖或构建工具变更后重启 `pnpm dev`。Ctrl+C 会同时停止 Hexo 和资源监听。

## 源码与产物

```text
src/client/main.ts       → source/js/syutoi.min.js
src/client/theme.ts     ↗
src/shared/theme.ts     ↗
src/styles/main.css     → source/css/syutoi.min.css
src/styles/tokens.css  ↗
src/client/lightbox.ts   → source/js/lightbox.min.js
src/client/photoswipe.ts → source/js/photoswipe.min.js
src/styles/lightbox.css  → source/css/lightbox.min.css
```

JS 由 esbuild 打包为独立 IIFE；可选查看器入口通过 `window.SyutoiPhotoSwipe` 提供延迟加载的构造函数，核心入口不引用它。CSS 经 PostCSS 展开本地 imports、Autoprefixer 处理，再由 esbuild 压缩。构建器使用 [esbuild context/watch API](https://esbuild.github.io/api/#watch)，并将 PostCSS 的 import 依赖纳入监听。类型检查单独使用 [TypeScript noEmit](https://www.typescriptlang.org/tsconfig/noEmit.html)，不能用成功打包替代类型检查。

新的 `.min.js` / `.min.css` 产物**纳入版本控制**，便于 git clone 安装主题后直接生成博客；源码与产物需要一起提交。请修改 `src/`，然后运行 `pnpm build:theme`。CI 会重新构建并检查产物是否一致。开发监听与正式构建使用相同输出选项，不生成时间戳或 source maps。

JS/CSS 压缩由主题构建负责；不再安装旧 renderer 自带的 HTML/CSS/JS 压缩器。旧 `app.js`、`app.css` 及其生成入口已删除；升级后执行 `pnpm clean && pnpm build` 清理旧产物。

Design tokens 已定义颜色、深浅主题、内容宽度、字体、字号、间距和圆角。基础模板、文章排版、列表和导航共用这些 tokens，当前验收证据见 [MVP 验收表](validation/mvp.md)。

## 深浅色偏好

```yaml
appearance:
  theme: auto # auto | light | dark
```

优先级为读者保存的 `syutoi.theme`、旧版 `theme` 存储值、站点默认值。仅 `auto` 跟随系统变化；手动选定的 light/dark 不会被系统变化覆盖。按钮按 auto → light → dark → auto 循环，也支持键盘操作和跨标签页同步。

启动脚本位于 head 中、样式之前，先确定颜色模式再渲染正文。localStorage 不可用时仍可在当前页面切换。旧 `darkmode` 仅在 `appearance.theme` 未配置时作为兼容回退；新配置优先。

主题按钮使用本地内联 SVG，不依赖 CDN。页面不再请求第三方 JS、图标字体或 Google Fonts。正文中作者提供的外部图片仍会产生请求；无 JS 时正文、链接、分页和移动导航可用，主题按钮和复制按钮作为渐进增强功能。

## 旧主题兼容

本批移除了默认 PJAX、音乐播放器、烟花、搜索、评论、统计和打赏运行时。默认配置已精简，已停用的功能不会因旧字段仍在而加载；配置与兼容规则见 [配置文档](configuration.md)。具体差异见 [迁移说明](migration-from-shoka.md)。

## Markdown 渲染

示例站安装 `hexo-renderer-markdown-it@7.1.1`，只显式启用 footnote 和 task-lists 扩展。配置位于 `example/_config.yml`；额外插件使用 `{ name, options }` 形式，以便 renderer 从示例站的依赖目录解析。不要同时安装多个 Markdown renderer。

代码高亮交给 Hexo 内置 Highlight.js，`highlight.enable: true`、`line_number: false`、`auto_detect: false`；未知语言回退到纯文本。`markdown.render.html: true` 允许博客作者写入 details、ruby 等 HTML；这适用于受信任的作者内容，并不提供对外来 HTML 的净化。`breaks: false` 使用普通 Markdown 分段规则。

图片启用原生懒加载与站点 root 前缀；标题从 H1 开始生成锚点，同名标题自动区分。原站链接不变，但旧定制锚点与扩展语法需要按 [迁移清单](migration-from-shoka.md) 检查。

## 代码检查

`pnpm lint` 使用 ESLint flat config（`eslint.config.mjs`）。JS 采用 ESLint recommended，TS 采用 typescript-eslint recommended；JS 增加 no-var / prefer-const，JS/TS 使用严格相等检查。规则重点是代码正确性，不强制缩进、引号或整库格式化。

检查覆盖 `scripts/`、`lib/`、`toolbox/`、`test/`、根目录 JS 配置及 `src/**/*.ts`。Hexo 脚本按 CommonJS 解析，并只在 `scripts/` 声明只读 `hexo` 全局；Node 工具与浏览器客户端分别声明运行环境。TypeScript 的未定义名称由 `pnpm typecheck` 检查。

`example/`、`source/` 生成资源、node_modules 和 coverage 不参与 lint，避免递归主题链接和重复检查产物。CSS、Nunjucks、YAML 不在本轮 lint 范围，继续通过实际构建、配置测试和页面检查验证。

CI 在锁定安装后依次执行 lint、clean、typecheck、build、test 和生成资源一致性检查。`pnpm lint` 使用 `--max-warnings=0`，未使用的规则禁用注释也报错。提交前使用与 CI 相同的检查顺序；不用默认 `--fix`，避免未经审阅的批量修改。

单元测试继续聚焦主题偏好、配置、URL、分页和构建恢复；配置兼容另通过隔离 Hexo 站点验证。没有为页面外观添加快照测试。

## 导航与键盘回归

移动导航使用普通展开按钮与链接，不锁定焦点。Enter / Space 切换菜单，Escape 收起；Tab 离开菜单或点击外部时收起。收起时若焦点仍在菜单内，会回到菜单按钮。同页锚点继续使用浏览器原生跳转。跨越 760/761px 断点时，隐藏按钮上的焦点移到首个导航链接，隐藏菜单内的焦点移回按钮。

无 JavaScript 时隐藏菜单按钮，直接显示全部导航链接。移动页头参与正常布局，较多导航项会推开横幅，不覆盖站点介绍。导航链接最小高度为 44px；跳转正文链接与正文目标均提供可见键盘焦点。

手动回归步骤（提交导航改动时执行）：

1. 在 390px 屏宽，刷新后按 Tab、Enter，确认“跳转正文”进入 main 且焦点可见。
2. 用 Tab 到菜单按钮，按 Space / Enter 展开，再用 Tab 进入链接；Escape 收起并回到按钮。
3. 展开菜单，将焦点放在最后一项后按 Tab，确认能离开且菜单收起；点击菜单外也应收起。
4. 将焦点分别放在导航链接、菜单按钮，跨越 760/761px 断点，确认焦点位于仍可见的对应控件。浏览器可能在 CSS 隐藏控件后才发送媒体查询事件，因此需要检查焦点确实转移。
5. 使用指向 `#main` 的导航链接确认同页跳转；增加多项导航，在 320/390/760px 检查页头与横幅不重叠，页面无横向溢出。
6. 禁用 JavaScript，检查首页、文章、Page、归档、分类、标签、友链和 404 的导航、链接、分页及原生 details 仍可用。

本批使用 Linux Chrome 实测；其他浏览器、屏幕阅读器与完整无障碍审计尚未执行。代码块、表格及无 JS 交互的综合结果见 D7/D8a 报告。

## 示例站入口

导航中的“示例”汇总当前阅读组件、长文和边界页面，路径为 `/examples/`。源码映射、故意失效资源与检查范围见 [示例站说明](examples.md)。新增页面应同时更新入口和生成产物检查，保留旧历史文章的 URL 以便迁移回归。

## 综合浏览器验收

`toolbox/check-browser.mjs` 是可选的示例站验收工具，覆盖系统深浅偏好、多档视口、无 JS、键盘、受限存储和 reduced-motion。使用独立准备的 Puppeteer/Chrome，不进入默认构建或 CI；运行方式、实测环境、结果与范围见 [D7 验收报告](validation/d7.md)。性能指标由 D8 单独记录。

## 性能预算与测量

构建后运行 `pnpm check:budget`，检查生成的核心 JS/CSS（含构建注释），以 gzip level 9、十进制 KB 统计；严格上限为 JS <50 KB、CSS <40 KB，JS <30 KB 是争取目标。可选灯箱另外检查适配入口 <6 KB、PhotoSwipe 核心 <20 KB、独立 CSS <3 KB，分别报告，不合并进核心预算。该检查也进入 `pnpm test` 和现有 CI；它不包含页面 HTML、图片、feed 或其他第三方服务，也不代表服务器已开启压缩。

`toolbox/check-performance.mjs` 使用独立安装的 Lighthouse CLI 和本机 Chrome，依次测量首页/长文、mobile/desktop，每组 3 次，保存完整原始报告及含中位数/范围的摘要。它不进入默认测试或下载浏览器；构建与服务启动由调用者负责。固定版本与初始方法见 [D8 性能报告](validation/d8.md)，G4 基线及交互测量见 [G4 性能报告](validation/g4.md)，当前加载性能复测见 [G4a](validation/g4a.md)。默认输出目录为 `/tmp/syutoi-performance`，新测量请指定独立目录，保留历史基线。


## 版本与提交检查

当前版本为 `0.4.0`，收录 SEO/订阅、迁移文档、无障碍与性能验证；`0.3.0` 为可选本地搜索与评论插槽；`0.2.0` 为阅读体验增强，`0.1.0` 为首个 MVP。此前 `0.2.5` 沿用自上游，不表示本项目已完成 PRD 的 0.2 阶段。版本与破坏性变更记录在 [CHANGELOG](../CHANGELOG.md)。`package.json` 版本也用于 JS/CSS URL 的缓存参数，修改后需重新生成示例站。

提交前停止预览监听，依次运行 `pnpm lint`、`pnpm clean`、`pnpm typecheck`、`pnpm build`、`pnpm test`，检查 `git diff --check` 及生成资源是否同步。然后恢复 `pnpm dev`。修改文档或包版本不需要重新运行未受影响的 Lighthouse 矩阵。

现有 CI 配置覆盖 Node 20.19.0 / 24；本机已实测 Node 20.19.2，远端 CI 与 Node 24 的执行状态不由本地检查推断。`main` 推送另由 `.github/workflows/pages.yml` 构建示例站并部署到 GitHub Pages（自定义域名 `hexo.syutoi.com`）。主题保持 `private: true`；本地版本标签用于标记开发里程碑，不表示已推送标签或发布 npm。完整 deployment 文档与 npm 安装方式仍按后续 G 阶段处理。


## 目录增强回归

目录由布局统一调用 Hexo toc helper，桌面 nav 和手机 details 复用生成内容；不会给正文重复插入标题 ID。CSS 断点为 760/761px，与主导航一致。`src/client/toc.ts` 通过 requestAnimationFrame 合并滚动检查，并响应 resize/hash/load/toggle；可用时 ResizeObserver 补充正文尺寸变化，缺少该 API 时保留事件回退。

使用与 D7 相同的 `SYUTOI_PUPPETEER_PATH` / `SYUTOI_CHROME`，启动预览后运行 `node toolbox/check-toc.mjs`。可设置 `SYUTOI_BROWSER_OUTPUT` 保存截图与结果；覆盖双向滚动、深链接刷新、短视口长目录、跨断点焦点、原生 Enter/Space、无 JS 和无 ResizeObserver。完整记录见 [E2 验收](validation/e2.md)。综合脚本 `check-browser.mjs` 也检查手机折叠目录展开后的无 JS 跳转。


## 可选灯箱评估

`toolbox/evaluate-lightbox.mjs` 是隔离可行性探针，不是主题运行时。候选包与浏览器工具独立准备，固定版本、运行步骤和未通过项见 [E4 决策](decisions/optional-lightbox.md)。E4a 已接入默认关闭的独立灯箱，实际配置与验收见 [E4a](validation/e4a.md)。不要将评估报告正常输出误认为所有候选行为均通过。


`toolbox/check-lightbox.mjs` 生成临时 Hexo 子目录站点，验证开关隔离、延迟加载、桌面/手机深浅、键盘、失败回退和无 JS；不修改示例站配置。与 D7 共用外部 Puppeteer/Chrome 环境变量，不下载浏览器，不进入默认 CI。先执行 `pnpm build:theme`，再运行：

```bash
SYUTOI_PUPPETEER_PATH=/absolute/path/to/installed/puppeteer \
  SYUTOI_BROWSER_OUTPUT=/tmp/syutoi-e4a node toolbox/check-lightbox.mjs
```

PhotoSwipe 5.4.4 是锁定的构建开发依赖，发布产物包含其独立核心和 `source/js/photoswipe.LICENSE.txt`；消费者生成博客无需运行时 npm 下载。更新依赖时重新评估 API/包体，并同步许可证；测试会比较许可证与构建依赖。CI 检查整个 `source/js/`、`source/css/` 的生成一致性。


## 本地搜索回归

F1 采用 Pagefind Node API 在 Hexo generator 中返回内存路由，默认关闭；provider 接口及生命周期见 [搜索决策](decisions/local-search.md)。`test/search.test.mjs` 验证记录过滤、空索引、实际 generate 前后路由、修改/删除/禁用与许可证。索引失败会中断构建。

`toolbox/check-search.mjs` 使用独立 Puppeteer/Chrome，在临时 Hexo 子目录站点验收搜索，不修改 example 配置。先执行 `pnpm build:theme`，然后运行：

```bash
SYUTOI_PUPPETEER_PATH=/absolute/path/to/installed/puppeteer \
  SYUTOI_BROWSER_OUTPUT=/tmp/syutoi-f1 node toolbox/check-search.mjs
```

可选搜索入口 JS <6 KB gzip、CSS <3 KB gzip 纳入 `pnpm check:budget`。动态生成的 Pagefind 引擎和内容索引不混入核心预算，浏览器报告独立统计样本站点体积。内容越多，索引与构建时间越大；没有大站规模的性能保证。

## 评论回归（F2）

`node toolbox/check-comments.mjs` 使用临时 Hexo 站点、实际 Waline 客户端和本地模拟 API，覆盖桌面/移动端明暗模式、键盘加载、资源隔离、失败重试、服务异常、重复挂载与评论提交。不会连接真实评论服务；页面和评论数据会在结束后清理。无 JS、全局关闭、单页关闭与列表页均检查无 Waline 或服务请求。

```bash
SYUTOI_PUPPETEER_PATH="$PWD/node_modules/.pnpm/puppeteer@5.5.0/node_modules/puppeteer" \
SYUTOI_BROWSER_OUTPUT=/tmp/syutoi-f2 \
node toolbox/check-comments.mjs
```

Puppeteer 与 Chrome 使用现有可选浏览器验收环境，不属于主题生产依赖。单元测试另用真实 Hexo 验证配置、语言、子目录 URL 和页面资源引用。

评论资源预算独立统计：入口 JS <4 KB gzip、插槽 CSS <2 KB、Waline JS <100 KB、Waline CSS <10 KB。即使功能关闭，生成目录仍含可选静态文件，但 HTML 不引用、浏览器不下载这些资源。

升级 Waline 或锁文件后，运行 `node toolbox/comments-licenses.mjs` 重新生成打包依赖许可声明。`pnpm test` 会校验版本与许可清单一致。当前 API npm 包未附许可证文件，声明 MIT 且作者与客户端一致，清单复用该作者的客户端 MIT 文本。

## 订阅与 Sitemap 回归（F4）

`pnpm test` 包含 `test/syndication.test.mjs` 的真实 Hexo + hexo-feed + hexo-generator-sitemap 集成：根目录/子目录、自定义输出、XML/JSON 内容与时间、排除项、关闭/缺少插件以及空站点。相对 feed 模板路径由 CLI 的博客工作目录解析；临时 API 夹具使用绝对模板路径，避免依赖测试进程 cwd。

新增 `toolbox/check-syndication.mjs` 检查示例站三类 feed 的一致性，并把 Sitemap 中每条 URL 映射为生成目录文件；严格 XML 解析使用仅用于开发检查的 saxes。该命令已纳入 `pnpm test`，因此现有 CI 同样执行。未增加浏览器脚本或主题运行时依赖。

配置及边界见 [订阅与站点地图](syndication.md)。

## 核心页面响应式与无障碍验收（G3）

先生成示例站并启动预览。现有 `check-browser.mjs` 覆盖响应式、键盘交互、主题状态、reduced-motion 和真实禁用 JavaScript 的回退；新增 `check-accessibility.mjs` 对首页、文章、Page、归档、分类/标签索引和详情、404 执行 axe 扫描、跳转链接、200% 文字与表格键盘滚动检查：

```bash
SYUTOI_PUPPETEER_PATH=/absolute/path/to/installed/puppeteer \
SYUTOI_AXE_PATH=/absolute/path/to/installed/axe-core/axe.min.js \
SYUTOI_A11Y_OUTPUT=/tmp/syutoi-a11y \
node toolbox/check-accessibility.mjs
```

可用 `SYUTOI_CHROME` 指定 Chrome、`SYUTOI_PREVIEW_URL` 指定根目录示例站预览地址。工具依赖需单独准备，不进入主题生产安装；本次验证使用 Puppeteer 5.5.0、axe-core 4.13.0 和 Chrome 151。脚本按示例站固定路由执行，不是任意博客的通用扫描器。

无 JS 扫描先禁用脚本加载页面，确认增强控件隐藏，再仅为 axe 的计时器恢复执行，不重新加载页面或运行主题脚本；另有全程禁用 JS 的真实表格滚动和原有浏览器回归。报告保留 violations 与 incomplete；发现违规非零退出，incomplete 必须人工复核，不应直接当作通过。200% 检查改变根字号，不等同于操作浏览器缩放菜单；320 CSS px 矩阵单独验证重排。

正文普通表格在构建时补 `tabindex="0"`，无 JS 也能用方向键横向滚动；保留作者显式 tabindex，排除高亮代码内部的布局表格。自定义负 tabindex 会取消普通 Tab 访问，需要作者自行负责。

详见 [G3 验证记录](validation/g3.md)。此验收不代表完整 WCAG 合规认证，也不涵盖屏幕阅读器、Safari/Firefox 或真实手机设备。

## 实验室交互性能（G4）

`toolbox/check-interaction-performance.mjs` 用独立安装的 web-vitals 测量实际脚本交互的 INP。工具仅在验收浏览器内注入，不打包进主题，不发送指标到外部服务。先构建并通过本机静态服务提供 `example/public`，不要与 Lighthouse、构建或其他浏览器验收同时运行：

```bash
npm install --prefix /tmp/syutoi-vitals --no-audit --no-fund web-vitals@5.1.0
SYUTOI_PUPPETEER_PATH=/absolute/path/to/installed/puppeteer \
SYUTOI_WEB_VITALS_PATH=/tmp/syutoi-vitals/node_modules/web-vitals/dist/web-vitals.iife.js \
SYUTOI_INTERACTION_OUTPUT=/tmp/syutoi-interactions \
node toolbox/check-interaction-performance.mjs
```

可通过 `SYUTOI_PREVIEW_URL` 和 `SYUTOI_CHROME` 调整本机地址/浏览器。固定两页、两种视口，每组新隐私上下文重复三次；mobile 仅使用 390px 视口和 4× CPU slowdown，desktop 为 1440px、1×，DPR 均为 1，不模拟触摸设备。交互在页面加载后执行，不模拟网络节流；因此不可与 Lighthouse 默认 mobile 节流数值视为同一种测试。

操作包括主题切换、移动菜单打开/Escape、长文目录展开/锚点与代码复制。使用真实浏览器剪贴板 API，仅复制本地示例代码；无法复制会失败，不用替身伪造成功。每次操作留 700ms 供回调更新，以 `onINP(callback, {reportAllChanges:true, durationThreshold:16})` 收集并保存本次脚本会话值。无数据、脚本错误或操作失败会非零退出；只有带 `finished` 的报告代表执行完成。指标超过 200ms 仍记录真实数据，不因波动直接作为 CI 门槛。

这是指定交互序列的实验室结果，不是现场用户的第 75 百分位数，也不代表搜索/评论/灯箱或页面整个真实访问过程。无交互的 Lighthouse navigation 仍只报告 TBT，不能用 TBT 替代 INP。方法依据 [web-vitals 官方用法](https://github.com/GoogleChrome/web-vitals) 和 [INP 定义](https://web.dev/articles/inp)。交互实测及边界见 [G4 性能报告](validation/g4.md)，加载性能后续复测见 [G4a](validation/g4a.md)。


## 独立 Git 安装验收（G5a）

在主题仓库根目录运行 `pnpm check:install`。需要 Git、pnpm、网络及已安装的仓库开发依赖。工具在系统临时目录新建独立博客，从本地仓库 clone **HEAD 提交**（不包含未提交修改），按快速开始的站点 YAML 安装生产依赖并生成页面；不启动服务、不修改当前示例配置、不推送或发布。

检查根目录与 `/blog/` 两种部署路径，分别关闭/开启图片属性、提示块、Pagefind 与灯箱。涵盖基础页面、资产路径、Markdown 输出和冻结锁文件重装。它创建的是最小独立站点，并未执行 Hexo CLI init，也未验证远端仓库/标签可用性。当前不提供 npm 主题安装。

控制台输出临时工作区及 `report.json` 路径，成功或失败都保留命令日志以便复查。验收后可以自行删除该临时目录。主题依赖由克隆的锁文件固定；站点插件按快速开始命令解析当时版本，首次安装后使用生成的站点锁文件复验。该网络验收为可选维护工具，不放入日常 `pnpm test`。

最近结果见 [G5a 报告](validation/g5a.md)。


## 线上 Demo 验收（G5c）

运行 `pnpm check:online`，使用 curl 对 `https://hexo.syutoi.com/` 进行只读验收；可用 `SYUTOI_ONLINE_URL` 指定其他同结构的 HTTPS Demo。需要联网，不登录、不提交表单、不部署。工具依次检查核心页面和八篇文档、canonical/og:url、文档站内链接与锚点、页面资源的 HTTP 状态/MIME、RSS/Atom/Sitemap 的 XML、JSON Feed 和随机不存在路径的真实 404。

canonical 接受目录 URL 与其 index.html 等价写法，同时检查实际地址可访问。线上核心 JS/CSS 与本地预构建文件逐字节对比；这可识别资源差异，不能替代构建提交标识。网络错误有限重试，仍失败则报告失败，不能等同于主题错误。每次在临时目录保留响应正文与 `report.json`，失败返回非零状态。

只检查同源资源；第三方友链图片列为外部资源，不代表已验证其可用性。该工具不测 Lighthouse、运行时交互、域名配置权限或完整无障碍，浏览器和性能验收另行执行。最近结果见 [G5c 报告](validation/g5c.md)。

当前视觉与内容集的性能基线见 [G5d](validation/g5d.md)：核心预算通过，但移动首页 LCP 尚未达标。旧 G4/G4a 数字仅代表当时素材，不能当作当前站点实测。
