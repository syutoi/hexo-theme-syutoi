# 从 Shoka 迁移：当前兼容范围

本说明记录 Syutoi 0.1.0 的兼容范围；MVP 逐项结果见 [验收表](validation/mvp.md)，不代表完整 1.0 功能已实现。上游历史、许可证和文章中的来源链接保持保留。

## 页面与资源

- 页面使用语义化 Nunjucks 模板、系统字体、原生 CSS 和本地 SVG。旧 `app.js`、`app.css`、Stylus 源文件与生成器已删除，示例站不再安装 `hexo-renderer-stylus`、`hexo-autoprefixer`。CSS 前缀处理统一交给主题的 PostCSS 构建。
- 仓库开发预览更新后运行 `pnpm clean && pnpm build`；安装主题的博客运行 `pnpm exec hexo clean && pnpm exec hexo generate`。部署时也清理旧生成目录，避免残留文件。
- 已停止 PJAX、播放器、烟花、加载动画、评论、搜索、打赏和统计脚本。对应旧字段已从默认配置删除；即使用户覆盖文件仍有这些字段，也不会启用这些功能。
- 核心页面无需 JavaScript 即可阅读和导航。JavaScript 仅增强主题偏好、移动菜单和代码复制；无 JS 时移动导航直接显示。
- 不再默认加载远程字体、图标或第三方脚本。正文中的外部图片和用户自己嵌入的内容仍由作者控制。

## 视觉迁移范围

保留接近原版的图片页头、波浪过渡、分类入口、交错图文卡片、作者侧栏与文章内容面板。使用原生 CSS 和本地 SVG 实现，波浪是静态装饰。目录保留原生锚点链接，桌面 sticky、手机原生折叠，JS 渐进增强滚动高亮。

页头图片通过 `appearance.cover` 显式配置；留空时使用渐变背景，布局仍可用。示例站使用仓库已有的本地图片，正文封面也显式指定，不依赖随机图片服务。文章没有封面时仍显示完整文本卡片。

```yaml
appearance:
  theme: auto
  cover: /assets/banner.jpg # 文件放在博客 source/assets/banner.jpg
```

页头展示名改用 `branding.name`，头像改用 `branding.avatar` 完整路径；旧 `alternate`、`sidebar.avatar` / `images` 仍作为兼容别名，见 [配置文档](configuration.md)。

## 配置和内容

- 旧 `menu` 中的 `路径 || 图标` 暂时兼容，嵌套菜单展开为普通导航。新配置统一使用 `navigation.menu` 下的 `{ name, url }` 列表，社交链接也使用 `{ name, url }` 列表。
- 封面仅使用文章显式设置的字符串 `cover`；不再随机挑选 `_images.yml` 或 `_data/images.yml` 图片。文章不设置封面也可正常展示。
- 旧 `_data/colors.styl`、`custom.styl`、`iconfont.styl` 不再生效。修改 `src/styles/` 并重新构建资源；自定义入口的正式设计待后续完成。
- 外部链接保留真实 `href`，图片保留真实 `src`，不再依赖旧 JS 解码和懒加载。友情链接标签保留为普通链接卡片。
- `{% media audio/video %}` 中的播放列表以可访问的链接列表展示，不再加载第三方播放器。单个媒体也可以改为标准 HTML `audio` / `video` 标签，并设置 `controls`、`preload="none"`。
- 定制 Markdown renderer 已替换，旧示例文档保留历史说明并加注提示，不能再作为当前功能清单。差异见下表。
- Nunjucks 默认转义标题和配置文本；只有文章渲染结果、受控资源标签和分页 HTML 标记为安全输出。博客作者仍应自行审核写入 Markdown 的原始 HTML。

## Markdown 兼容清单

使用 [Hexo 官方 renderer](https://github.com/hexojs/hexo-renderer-markdown-it)，不在主题中维护私有 Markdown 解析器。移除旧 renderer 及其 Puppeteer、deasync 和捆绑的压缩链，安装无需跳过 Chromium 下载；Hexo 自身的其他传递依赖不属于本次清理范围。

| 示例中发现的语法 | 当前处理 / 迁移建议 |
| --- | --- |
| 标题、强调、链接、图片、标准表格、代码围栏 | 继续支持；代码高亮由 Hexo 在构建时生成 |
| 脚注 `[^id]` | 显式启用 markdown-it-footnote |
| 任务列表 `- [x]` | 显式启用 markdown-it-task-lists，生成不可编辑复选框 |
| `:::info` / `:::note info` 等 | 不默认解析；普通说明页和 Java 笔记已改为引用，特殊功能历史页保留原语法供对照 |
| `;;;id 标题` / `+++` | 不默认解析；改为分节标题或 HTML details / summary |
| `{.quiz}` / `{.correct}` / `{.gap}` | 移除交互依赖；Java 笔记改为普通题目与答案，特殊功能历史页保留语法参考 |
| 颜色、label、gallery 等 `{.class}` | 不默认启用 attrs；改为普通 Markdown 或明确的 HTML，gallery 图片仍正常显示，属性指令仅为原文 |
| `!!spoiler!!`、`++ins++`、`==mark==`、emoji 别名 | 不默认启用；使用 details、u/ins、mark 和 Unicode emoji |
| `{文字^注音}`、上下标 | 使用 ruby/rt、sub、sup |
| 多行/合并单元格/无表头表格 | 改为标准 Markdown 表格或 HTML table |
| 数学公式、Mermaid、Graphviz、图表 | 不默认渲染；公式原文保留，围栏作为代码；有需要时由站点自行配置插件 |
| 围栏后的标题、链接、`mark:` 行高亮参数 | 不保证兼容定制 renderer；语言仍可识别，说明改为围栏前后的普通文字或 Hexo codeblock 标签 |
| 自动 Pangu 排版 | 不再自动改写内容与代码；间距由作者控制 |
| HTML/CSS/JS minify 配置 | 旧捆绑压缩器已移除，JS/CSS 由主题构建压缩，HTML 保留可读输出 |
| 标题锚点 | 由新 renderer 生成，同名标题使用后缀；文章 URL 保留，旧小节链接需检查 |

盘点范围：`elements.md`、`markdown.md`、`code-highlight.md`、`tag-plugins.md`、两篇 Java 笔记，以及 `theme-syutoi-doc` 下的历史说明。特殊功能历史页有大量私有语法，当前明确作为原文参考保留；不声称这些展示已完整兼容。

运行示例 `/reading/` 展示当前受支持的脚注、列表、表格、高亮代码、未知语言回退、原生折叠与注音，可作为新文章的写作起点。

## 配置迁移

主题默认配置只列出当前可用字段，示例覆盖仅保留示例所需配置。只保留当前可用功能；示例不再继承上游作者的个人社交账号。历史文档中的原站链接与来源记录仍然保留。

配置兼容层区分站点覆盖与主题默认值，优先读取用户显式设置；新字段与旧别名同时出现时以新字段为准。列表整体替换，空列表不会恢复默认菜单。完整字段、优先级和迁移表见 [配置文档](configuration.md)。

## 下一步

MVP 后续阅读体验按 [TODO](TODO.md) 的 E 阶段推进；真实 INP、多浏览器、屏幕阅读器及公开发布仍需后续验证。
