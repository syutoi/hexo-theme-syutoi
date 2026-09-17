# 开发与构建

当前处于渐进迁移阶段：旧布局仍使用 Stylus 和原客户端；深浅色切换由新的 TypeScript 客户端负责。任务状态见 [TODO](TODO.md)。

## 环境与命令

使用 Node.js >=20.19.0 和 pnpm 9.0.4。仓库提供 `.nvmrc`；首次运行先执行 `nvm install`、`nvm use`。

```bash
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true pnpm install --frozen-lockfile
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
| `pnpm test:unit` | 测试主题偏好、优先级、系统跟随和受限存储的纯逻辑 |
| `pnpm test` | 运行偏好/构建恢复测试及示例站产物检查；先执行 `pnpm build` |
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

JS 由 esbuild 打包为独立 IIFE，避免向旧脚本泄漏变量；CSS 经 PostCSS 展开本地 imports、Autoprefixer 处理，再由 esbuild 压缩。构建器使用 [esbuild context/watch API](https://esbuild.github.io/api/#watch)，并将 PostCSS 的 import 依赖纳入监听。类型检查单独使用 [TypeScript noEmit](https://www.typescriptlang.org/tsconfig/noEmit.html)，不能用成功打包替代类型检查。

新的 `.min.js` / `.min.css` 产物**纳入版本控制**，便于 git clone 安装主题后直接生成博客；源码与产物需要一起提交。请修改 `src/`，然后运行 `pnpm build:theme`。CI 会重新构建并检查产物是否一致。开发监听与正式构建使用相同输出选项，不生成时间戳或 source maps。

`.min` 文件名也避免过渡期旧 renderer 再次压缩新语法。暂时保留 `source/js/_app`、`source/css/*.styl` 和脚本生成器；B4 完成后再删除旧链路。

Design tokens 已定义颜色、深浅主题、内容宽度、字体、字号、间距和圆角。当前应用于新主题按钮及浏览器 color-scheme，旧布局的配色与排版将在 C 阶段逐步接入。

## 深浅色偏好

```yaml
appearance:
  theme: auto # auto | light | dark
```

优先级为读者保存的 `syutoi.theme`、旧版 `theme` 存储值、站点默认值。仅 `auto` 跟随系统变化；手动选定的 light/dark 不会被系统变化覆盖。按钮按 auto → light → dark → auto 循环，也支持键盘操作和跨标签页同步。

启动脚本位于 head 中、样式之前，先确定颜色模式再渲染正文。localStorage 不可用时仍可在当前页面切换。旧 `darkmode` 仅在 `appearance.theme` 未配置时作为兼容回退；新配置优先。

主题按钮使用本地内联 SVG，不依赖 CDN。整个旧页面仍有外部依赖，完整的无 JS 阅读和零默认第三方请求验收属于后续任务。
