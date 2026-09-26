# 示例站与验收入口

启动 `pnpm dev` 后访问 <http://127.0.0.1:4000/examples/>。导航中的“示例”指向同一入口；英文页面显示 Examples。此菜单及文案只在 example 配置中提供，不改变主题默认导航。

## 页面清单

| 路径 | 源文件（相对 example/source） | 检查重点 |
| --- | --- | --- |
| `/welcome/` | `_posts/desk/welcome.md` | 置顶欢迎文章、封面与导航 |
| `/examples/` | `examples/index.md` | 当前示例入口与边界场景链接 |
| `/markdown-extensions/` | `markdown-extensions/index.md` | 可选尺寸属性、五种提示块、转义与引用 |
| `/reading/` | `reading/index.md` | 标准 Markdown 与迁移写法 |
| `/typography/` | `typography/index.md` | 中英文混排、长字符串 |
| `/reading-elements/` | `reading-elements/index.md` | 阅读元素与表格/脚注/details |
| `/code/` | `code/index.md` | 高亮、语言标签、复制、空白和键盘滚动 |
| `/pictures/` | `pictures/index.md` | 图注、尺寸、原生加载和 picture |
| `/syutoi-long-read/` | `_posts/writing/syutoi-long-read.md` | 十节完整长文、目录、封面、分类、标签 |
| `/syutoi-minimal/` | `_posts/desk/syutoi-minimal.md` | 无封面、无摘要、无目录的短文 |
| `/syutoi-boundaries/` | `syutoi-boundaries/index.md` | 长标题、重复标题、长链接与行内标识符 |
| `/examples/empty/` | `examples/empty/index.md` | 有标题/描述但无正文的独立 Page |
| `/examples/english/` | `examples/english/index.md` | en 单页语言、英文导航与折叠内容 |
| `/no-title/` | `no-title/index.md` | 无标题独立页面与未命名回退 |
| `/404.html` | 由主题生成 | 错误页面、返回链接与 noindex |

新示例使用本地图片，不需要外部图片服务。`/pictures/` 中的 `intentionally-missing-image.png` 是唯一新增的故意失效资源，用来检查 alt；不要把它当作遗漏图片补上。历史兼容夹具已移至 `test/fixtures/legacy/`，不参与公开站点生成。

## 自动检查与手动检查

先运行 `pnpm build`，再运行 `pnpm test`。现有页面检查读取生成结果，验证示例入口站内链接目标存在、长文结构、无摘要卡片、空目录抑制和英文页面；Markdown 检查继续验证阅读元素、代码保真、图片说明与边界属性。

浏览器验收时使用 1440、390、320px 屏宽及浅色/深色模式，重点检查长标题、表格、代码与图片不会撑宽整个页面。禁用 JavaScript 后，入口、分页、目录、相邻文章、原生 details 和图片仍应可访问。剪贴板、系统主题、焦点与 reduced-motion 的组合检查见 D7/D8a，性能基线及图片优化复测见 D8/D8a 报告。

空站点、全局无导航/无侧栏、子目录部署和新旧配置覆盖继续由 `test/config-render.test.mjs` 的隔离站点测试覆盖，不把示例站来回改成空站点。示例文章只在 example workspace 中，不会随主题安装复制到用户博客。

## 示例图片维护

当前图片采用温暖田园插画：页头与长文使用 `pastoral-evening.webp`，欢迎文章使用 `sunlit-desk.webp`，正文示例使用 `cottage-garden.webp`。PNG 原图保存在 `example/source/assets/`，显示时使用 WebP。旧 wallpaper 图片已替换，历史性能报告仅代表旧素材。

运行 `node toolbox/optimize-example-images.mjs`（需要 cwebp）可重新编码：页头宽 1920、质量 78；书桌宽 800、质量 75；花园宽 1280、质量 78。保持原始比例，不裁剪。生成来源及提示词见 [图片记录](design/pastoral-images.md)。宽图、长图 SVG 继续用于尺寸边界测试。

## 导航 Logo 的维护

默认导航显示 29 × 29 CSS px 的图标，使用 `source/images/logo.webp`（96 × 96，适用于常见高 DPR 屏幕）。原始 `source/images/logo.png` 保留供重新生成或显式配置使用。副本保持原图内容与透明背景，仅缩小尺寸；文件来自主题资源，普通博客无需安装图像处理工具。

维护时使用 cwebp 1.3.2，在主题根目录执行：

```bash
cwebp -lossless -m 6 -resize 96 96 source/images/logo.png -o source/images/logo.webp
pnpm build
```

这里的 lossless 指缩放结果的 WebP 编码，不表示缩放过程保留原图全部像素。替换自己的品牌图时，应根据实际显示尺寸选择合适的源图，避免导航加载数百 KB 的大图；路径仍通过 `branding.logo` 配置。

## 文章目录整理（2026-09-22）

公开文章从 27 篇收拢为 3 篇：`desk/` 下是欢迎文章与短随笔，`writing/` 下是完整长文。分类为“书台手记”和“阅读与写作”，对应 `/categories/desk/` 与 `/categories/writing/`。文章显式设置 permalink，移动源文件不会改变展示链接；日期与更新日期统一为 2026-09-22。

长标题和无标题用独立 Page 展示，不进入文章列表或订阅。旧主题文档、课程笔记、Foo 分类及占位文章退出公开站点，历史内容可从 Git 查询。保留的两个迁移夹具在隔离 Hexo 站点中测试；分页继续由隔离集成测试覆盖，当前三篇文章不生成第二页。

此前验收报告的文章数与性能数据属于当时的数据集；此次内容缩减后，不直接与旧数据集比较性能。

## 文档中心

导航“文档”进入 `/docs/`，12 篇使用指南同时归入“主题文档”分类（`/categories/docs/`）。正文唯一来源是仓库 `docs/`；`toolbox/example-docs.mjs` 维护发布清单、标题、摘要和固定链接，生成目录已加入 Git 忽略规则，请勿直接编辑。

`pnpm prepare:example`、`pnpm build` 和 `pnpm dev` 会同步文档；dev 同时监听 docs 变更。直接在 example 内运行 Hexo 前，应先在仓库根目录运行 `pnpm prepare:example`。新增指南时更新清单和 `docs/index.md`，移出清单的生成文章会在同步时清理。

指南保留各自的固定发布日期，新增手册章节使用 2026-09-26；修订时可维护同步器中的 updated 字段，避免普通文字修订改变首页排序。公开站点现有 3 篇展示文章与 12 篇指南；指南参与分类、归档和订阅。站内指南链接自动转换为 `/docs/…/`，其余仓库文档链接指向 GitHub；代码围栏中的示例保持原样。
