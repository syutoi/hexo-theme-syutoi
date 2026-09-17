# 开发与构建

页面已切换到原生 CSS 和 TypeScript 客户端，移除了 Stylus 与旧脚本；Markdown 已使用通用 `hexo-renderer-markdown-it`。任务状态见 [TODO](TODO.md)。

## 环境与命令

使用 Node.js >=20.19.0 和 pnpm 9.0.4。仓库提供 `.nvmrc`；首次运行先执行 `nvm install`、`nvm use`。

```bash
pnpm install --frozen-lockfile
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
| `pnpm typecheck` | 严格检查 `src/**/*.ts`，不输出文件 |
| `pnpm test:unit` | 测试主题偏好、URL、导航、分页与构建失败恢复 |
| `pnpm test` | 运行单元/构建恢复测试及示例站及 Markdown 产物检查；先执行 `pnpm build` |
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
