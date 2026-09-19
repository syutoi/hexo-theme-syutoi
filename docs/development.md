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
| `pnpm test` | 运行单元/构建恢复测试、示例站及 Markdown 产物检查；先执行 `pnpm build` |
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
```

JS 由 esbuild 打包为独立 IIFE，避免污染全局变量；CSS 经 PostCSS 展开本地 imports、Autoprefixer 处理，再由 esbuild 压缩。构建器使用 [esbuild context/watch API](https://esbuild.github.io/api/#watch)，并将 PostCSS 的 import 依赖纳入监听。类型检查单独使用 [TypeScript noEmit](https://www.typescriptlang.org/tsconfig/noEmit.html)，不能用成功打包替代类型检查。

新的 `.min.js` / `.min.css` 产物**纳入版本控制**，便于 git clone 安装主题后直接生成博客；源码与产物需要一起提交。请修改 `src/`，然后运行 `pnpm build:theme`。CI 会重新构建并检查产物是否一致。开发监听与正式构建使用相同输出选项，不生成时间戳或 source maps。

JS/CSS 压缩由主题构建负责；不再安装旧 renderer 自带的 HTML/CSS/JS 压缩器。旧 `app.js`、`app.css` 及其生成入口已删除；升级后执行 `pnpm clean && pnpm build` 清理旧产物。

Design tokens 已定义颜色、深浅主题、内容宽度、字体、字号、间距和圆角。基础模板、文章排版、列表和导航共用这些 tokens，后续按 C/D 阶段继续验收细节。

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

本批使用 Linux Chrome 实测；其他浏览器、屏幕阅读器与完整无障碍审计尚未执行。代码块与表格的进一步键盘增强随 D 阶段阅读组件继续处理。

## 示例站入口

导航中的“示例”汇总当前阅读组件、长文和边界页面，路径为 `/examples/`。源码映射、故意失效资源与检查范围见 [示例站说明](examples.md)。新增页面应同时更新入口和生成产物检查，保留旧历史文章的 URL 以便迁移回归。

## 综合浏览器验收

`toolbox/check-browser.mjs` 是可选的示例站验收工具，覆盖系统深浅偏好、多档视口、无 JS、键盘、受限存储和 reduced-motion。使用独立准备的 Puppeteer/Chrome，不进入默认构建或 CI；运行方式、实测环境、结果与范围见 [D7 验收报告](validation/d7.md)。性能指标由 D8 单独记录。
