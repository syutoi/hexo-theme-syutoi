# Syutoi 0.1.0 MVP 验收

2026-09-20 按 [PRD §52](../hexo-theme-syutoi%20产品需求文档（PRD）v0.1.md) 逐项核对。此处的“通过”只针对列出的实现和实测范围；不是整个 PRD、1.0 发布或所有设备的验收。

## Engineering

| 项目 | 结果 | 证据 / 范围 |
| --- | --- | --- |
| Hexo 8 | 通过 | example 使用 Hexo 8.1.2，干净生成成功 |
| Node 20+ | 通过 | 本机 Node 20.19.2；最低声明 >=20.19.0 |
| pnpm | 通过 | 固定 9.0.4，workspace 与锁文件安装流程 |
| TypeScript | 通过 | src/client 与 shared，`pnpm typecheck` |
| esbuild | 通过 | JS/CSS 构建、监听与失败保留产物检查 |
| Nunjucks | 通过 | 核心模板与主题注册的 renderer，默认文本转义 |
| CSS Variables | 通过 | src/styles/tokens.css 的深浅色及布局 tokens |
| CI | 已配置，本地同序列通过 | .github/workflows/ci.yml：Node 20.19.0/24；未声称远端 CI 已执行或 Node 24 已实测 |

## Page

| 项目 | 结果 | 证据 / 范围 |
| --- | --- | --- |
| Home | 通过 | 分页、置顶、分类入口、可选摘要和封面、空站点测试 |
| Post | 通过 | 长文、无标题、无封面、元信息、目录、前后文章 |
| Page | 通过 | 独立页面、空正文、英文页面，不输出文章专属元信息 |
| Archive | 通过 | 日期分组、分页及隔离站点日期层级配置检查 |

## UI

| 项目 | 结果 | 证据 / 范围 |
| --- | --- | --- |
| Header | 通过 | 桌面/移动导航、键盘菜单与跳转正文 |
| Footer | 通过 | 站点年份、可选署名与 feed 链接 |
| Typography | 通过 | 中英文、标题层级、720px 正文与长字符串 |
| Responsive | 通过（视口模拟） | 1440/768/390/320px，176 组有 JS 与 66 组无 JS 检查，无整页横向溢出 |
| Light | 通过 | 系统偏好、按钮、存储持久化与受限存储 |
| Dark | 通过 | 深色 tokens、系统跟随与跨标签页同步 |

## Article

| 项目 | 结果 | 证据 / 范围 |
| --- | --- | --- |
| Heading | 通过 | H1–H6、重复锚点、原生目录 |
| Paragraph | 通过 | 中文/英文/长段落及换行 |
| Link | 通过 | 原生链接、脚注往返；作者自写链接仍需自行检查 |
| Quote | 通过 | 普通与嵌套引用 |
| List | 通过 | 有序、无序、嵌套与任务列表 |
| Code | 通过 | 构建时高亮、语言标签、滚动、复制保真与失败重试；权限以替身验证 |
| Image | 通过 | 可选封面、正文说明、原生懒加载、尺寸约束与失效 alt；不包含灯箱 |
| Table | 通过 | 对齐、窄屏容器滚动、显式 tabindex 表格键盘操作 |

## Quality

| 项目 | 结果 | 证据 / 范围 |
| --- | --- | --- |
| `pnpm build` | 通过 | 生成主题资源与 99 个示例文件 |
| `hexo generate` | 通过 | `pnpm build:example` 实际执行 Hexo generate；另有隔离 Hexo 站点测试 |
| 没有第三方 JS 请求 | 通过（默认主题） | D7/D8a 浏览器报告；主题核心使用本地 JS/CSS。历史友链图片、作者嵌入内容不等于零外部资源 |

自动检查还包括 lint、typecheck、41 项测试、19 类生成页面、20 个示例入口链接、Markdown 产物与 gzip 预算。页面功能和 UI 的细节证据见 [D7](d7.md)、[D8a 浏览器结果](d8a-browser.json)。本批主要变更文档和版本，沿用上一批浏览器证据并重新执行构建检查，不虚构新的浏览器或性能测量。

## 超出 §52 的结果与限制

- [D8 基线](d8.md) 与 [D8a 优化](d8a.md)：核心 JS/CSS gzip 为 1334/5211 bytes。两类页面 12 次 LCP <2.5s、CLS <0.1；首页移动最慢一次 2.483s，结果仅针对记录的实验室条件。
- INP 未实测，不能用 TBT 代替；真机、Safari/Firefox、屏幕阅读器和完整 WCAG 未验证。
- RSS 由可选站点插件提供；不要求安装它才能使用主题。Sitemap、搜索、评论适配器与阅读时间等后续能力继续跟踪在 TODO。
- §53 不做的 Comments、Search、Music、AI、PWA、Fancybox、Analytics、Fireworks、Reward、Mermaid integration、Pagefind、Complex custom tags、PJAX、Theme marketplace 未在本轮集成。保留的旧链接/媒体标签兼容只输出静态内容，不恢复旧运行时。
- 包仍配置为 `private: true`，没有 npm 发布、Git tag 或站点部署。公开安装/发布流程与完整平台部署文档留在 G 阶段。

当前结论：§52 的本地 MVP 范围已具备并验证，CI 的远端执行状态另行核实；不能将本表作为完整 1.0 或真实用户性能验收。


## D9 安装文档验证

在 `/tmp/syutoi-d9-install` 创建独立博客，以本地 Git 导出替代远端 clone，主题代码为 D8a 后的代码及本批 0.1.0 包版本。执行快速开始中的生产依赖安装（`--prod --frozen-lockfile --filter hexo-theme-syutoi`），再安装独立博客依赖；未复用当前仓库 node_modules 链接。首次额外尝试离线安装因缺少缓存 tarball 失败，按文档正常联网安装成功，没有更改主题锁文件。

博客配置与第一篇文章直接取自文档，创建 about 页面后执行 Hexo clean/generate，共生成 28 文件。检查 7 类页面、脚注、任务列表、代码容器、图片、相邻文章导航与 `?v=0.1.0` 资源 URL 通过；这些页面没有远程 script src。未安装 feed，验证了订阅插件并非必需。

独立博客解析到 category 2.0.0、tag 2.0.0、server 3.0.0，主题仓库示例仍使用自己的锁定依赖。安装报告有 Hexo/Nunjucks 的 chokidar peer 版本提示，实际生成通过；不将这次结果称作无警告安装。未测试远端 Git 权限、npm 发布或托管平台部署。51 个文档本地链接目标检查通过（排除代码示例中的站点路径）。
