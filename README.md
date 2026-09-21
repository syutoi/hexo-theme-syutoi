# Hexo Theme Syutoi

面向写作与阅读的 Hexo 主题，fork 自 hexo-theme-shoka。保留图片页头、波浪、图文卡片和侧栏，以 Nunjucks、TypeScript 和原生 CSS 重建核心页面。

当前版本 **0.4.0**，包含可选搜索/评论、SEO 与订阅能力，以及迁移文档、无障碍和性能验证。Demo/分发与正式 1.0 发布准备仍按 [TODO](docs/TODO.md) 推进。首个 Syutoi 版本重新编号，不延续上游遗留的 `0.2.5`；版本差异见 [CHANGELOG](CHANGELOG.md)。上游来源与 MIT 许可证保留。

在线 Demo：<https://hexo.syutoi.com/>（由 GitHub Actions 构建 `example/` 并发布到 GitHub Pages）。

## 使用主题

需要 Node.js >=20.19.0、pnpm 9.0.4 和 Hexo 8。现有博客安装方式见 [快速开始](docs/getting-started.md)，主题选项放在博客根目录的 `_config.syutoi.yml`。无需开发构建即可使用仓库中已提交的 JS/CSS，但仍需安装主题的构建时依赖。

- [配置说明](docs/configuration.md)：主题字段、覆盖规则与分页。
- [自定义](docs/customization.md)：配置、设计变量、模板与源码构建。
- [部署](docs/deployment.md)：独立博客、仓库 Demo 与 GitHub Pages。
- [基础写作](docs/writing.md)：Front Matter、Markdown、图片与代码。
- [迁移说明](docs/migration-from-shoka.md)：旧配置与旧语法的兼容范围。
- [示例说明](docs/examples.md)：阅读组件、长文和边界场景。
- [MVP 验收](docs/validation/mvp.md)：实际证据与尚未验证的范围。

默认不加载第三方 JS；Pagefind 搜索与 Waline 评论默认关闭。音乐、统计、PJAX 尚未集成。作者自行嵌入的外部内容可能产生网络请求。RSS/Atom/JSON Feed 与 Sitemap 通过可选站点插件生成，不是主题运行的必需依赖；配置见 [订阅与站点地图](docs/syndication.md)。

## 本地开发与预览

```bash
# 仓库根目录；nvm 用户先执行 nvm install 和 nvm use
pnpm install --frozen-lockfile
pnpm lint
pnpm clean
pnpm typecheck
pnpm build
pnpm test
pnpm dev
```

访问 <http://127.0.0.1:4000/examples/>。`pnpm dev --port 4001` 可更换端口；Ctrl+C 停止服务。`dev` 与 `build` 自动将 `example/themes/syutoi` 链接到当前主题，已有其他目录时不会覆盖。

修改 `src/` 后重新生成并提交 `source/js/` 与 `source/css/` 下所有变化的产物；`pnpm test` 需要已有示例构建，包含单元、隔离 Hexo、产物及 gzip 预算检查。浏览器/Lighthouse 属于可选验收工具，普通安装和构建无需 Puppeteer 或 Chrome。详细命令、CI 范围与工作流程见 [开发文档](docs/development.md)，后续任务见 [TODO](docs/TODO.md)。

代码许可证见 [LICENSE](LICENSE)；保留原作者署名。示例中的历史内容和原站链接用于来源记录及迁移对照，不作为当前功能说明。
