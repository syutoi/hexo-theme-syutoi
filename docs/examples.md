# 示例站与验收入口

启动 `pnpm dev` 后访问 <http://127.0.0.1:4000/examples/>。导航中的“示例”指向同一入口；英文页面显示 Examples。此菜单及文案只在 example 配置中提供，不改变主题默认导航。

## 页面清单

| 路径 | 源文件（相对 example/source） | 检查重点 |
| --- | --- | --- |
| `/examples/` | `examples/index.md` | 当前示例入口与边界场景链接 |
| `/reading/` | `reading/index.md` | 标准 Markdown 与迁移写法 |
| `/typography/` | `typography/index.md` | 中英文混排、长字符串 |
| `/reading-elements/` | `reading-elements/index.md` | 阅读元素与表格/脚注/details |
| `/code/` | `code/index.md` | 高亮、语言标签、复制、空白和键盘滚动 |
| `/pictures/` | `pictures/index.md` | 图注、尺寸、原生加载和 picture |
| `/syutoi-long-read/` | `_posts/syutoi-long-read.md` | 十节完整长文、目录、封面、分类、标签 |
| `/syutoi-minimal/` | `_posts/syutoi-minimal.md` | 无封面、无摘要、无目录、无分类标签 |
| `/syutoi-boundaries/` | `_posts/syutoi-boundaries.md` | 长标题、重复标题、长链接与行内标识符 |
| `/examples/empty/` | `examples/empty/index.md` | 有标题/描述但无正文的独立 Page |
| `/examples/english/` | `examples/english/index.md` | en 单页语言、英文导航与折叠内容 |
| `/no-title/` | `_posts/no-title.md` | 既有无标题文章与未命名回退 |
| `/404.html` | 由主题生成 | 错误页面、返回链接与 noindex |

新示例使用本地图片，不需要外部图片服务。`/pictures/` 中的 `intentionally-missing-image.png` 是唯一新增的故意失效资源，用来检查 alt；不要把它当作遗漏图片补上。旧历史示例仍可能引用外部资源，不代表主题默认依赖它们。

## 自动检查与手动检查

先运行 `pnpm build`，再运行 `pnpm test`。现有页面检查读取生成结果，验证示例入口站内链接目标存在、长文结构、无摘要卡片、空目录抑制和英文页面；Markdown 检查继续验证阅读元素、代码保真、图片说明与边界属性。

浏览器验收时使用 1440、390、320px 屏宽及浅色/深色模式，重点检查长标题、表格、代码与图片不会撑宽整个页面。禁用 JavaScript 后，入口、分页、目录、相邻文章、原生 details 和图片仍应可访问。剪贴板、系统主题、焦点与 reduced-motion 的最终组合检查在 D7 记录，性能实测留到 D8。

空站点、全局无导航/无侧栏、子目录部署和新旧配置覆盖继续由 `test/config-render.test.mjs` 的隔离站点测试覆盖，不把示例站来回改成空站点。示例文章只在 example workspace 中，不会随主题安装复制到用户博客。
