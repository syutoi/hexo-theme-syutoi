# 从 Shoka 迁移：当前兼容范围

本说明记录0.4.0的兼容范围；0.1.0 MVP 逐项结果见 [验收表](validation/mvp.md)，不代表完整 1.0 功能已实现。上游历史、许可证和文章中的来源链接保持保留。

## 页面与资源

- 页面使用语义化 Nunjucks 模板、系统字体、原生 CSS 和本地 SVG。旧 `app.js`、`app.css`、Stylus 源文件与生成器已删除，示例站不再安装 `hexo-renderer-stylus`、`hexo-autoprefixer`。CSS 前缀处理统一交给主题的 PostCSS 构建。
- 仓库开发预览更新后运行 `pnpm clean && pnpm build`；安装主题的博客运行 `pnpm exec hexo clean && pnpm exec hexo generate`。部署时也清理旧生成目录，避免残留文件。
- 已停止旧 PJAX、播放器、烟花、加载动画、打赏和统计脚本。旧搜索/评论接入也不会自动启用；新 Pagefind 与 Waline 使用独立配置，默认关闭，需重新设置 provider。
- 核心页面无需 JavaScript 即可阅读和导航。核心 JavaScript 增强主题偏好、移动菜单、目录高亮和代码复制；可选搜索/评论/灯箱使用独立资源；无 JS 时移动导航直接显示。
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

- 旧 `menu` 中的 `路径 || 图标` 暂时兼容，嵌套菜单展开为普通导航。新配置统一使用 `navigation.menu` 下的 `{ name, url }` 列表，社交链接推荐 `{ type, url }`，也兼容 `{ name, url }` 列表。
- 封面仅使用文章显式设置的字符串 `cover`；不再随机挑选 `_images.yml` 或 `_data/images.yml` 图片。文章不设置封面也可正常展示。
- 旧 `_data/colors.styl`、`custom.styl`、`iconfont.styl` 不再生效。按 [自定义文档](customization.md) 修改 `src/styles/` 并重新构建资源；当前没有自动注入自定义 CSS 的配置。
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

配置兼容层区分站点覆盖与主题默认值，优先读取用户显式设置；同一配置层中新字段与旧别名同时出现时以新字段为准（包括空字符串、false 和空列表）；站点覆盖中的旧别名仍优先于主题默认值。列表整体替换，空列表不会恢复默认菜单。完整字段、优先级和迁移表见 [配置文档](configuration.md)。

## 旧配置逐项清单

以下以本仓库迁移前快照 `a2a8440` 的 `_config.yml` 为基线，核对当前 `lib/config.cjs`。其他 Shoka 分支自行增加的字段不在自动兼容承诺内。“手动迁移”表示旧字段不会自动转成新字段；“移除”表示当前主题不读取它，保留旧配置也不会恢复该功能。字段详细类型见 [配置参考](configuration.md)。

| 旧字段 | 状态 | 当前写法或处理 |
| --- | --- | --- |
| `alternate` | 兼容别名 | 改用 `branding.name`；导航站点标题仍用博客 `title` |
| `sidebar.avatar`、`images` | 部分兼容 | 改用完整 `branding.avatar` 路径；旧相对头像拼接 `images`（默认 `images`），绝对路径/URL 不拼接；`images` 不再是通用资源前缀 |
| `darkmode` | 兼容别名 | `true` 对应 `appearance.theme: dark`，其他值对应 `auto`；固定浅色需显式设 `light` |
| `menu` | 部分兼容 | 改用 `navigation.menu` 列表；旧 `路径 || 图标` 仅取路径，嵌套组展开，组的 `default` 入口不保留 |
| `social` 字符串映射 | 部分兼容 | 改用 `{type, url}` 或 `{name, url}` 列表；旧图标/颜色丢弃；不安全 URL 和无名称项不显示，`skype:` 等协议不支持 |
| `footer.since`、`footer.powered` | 保留 | 使用整数年份和 YAML 布尔值；未来年份不展示 |
| `open_graph` | 手动迁移 | 改为 `seo.open_graph`；Twitter 开关/账号用 `seo.twitter_card` / `seo.twitter_site`；旧 Google+/Facebook 附加字段无映射 |
| `favicon.*` | 手动迁移 | 用 `branding.favicon` 设置单一图标；旧 Apple/Safari/Android/Windows 专用字段不读取 |
| `image_server` | 移除 | 固定页头用 `appearance.cover`，每篇文章用 Front Matter `cover`，不调用随机图服务 |
| `search.hits.per_page`、旧 Algolia 接入 | 手动迁移 | 用 `search.provider: pagefind` 重新生成索引；旧索引/分页设置不复用 |
| `valine.*` | 手动迁移 | 用 `comments.provider: waline` 和 `comments.server_url`；不复用旧 appId/appKey，不自动搬运评论 |
| `vendors.css.fancybox`、`vendors.js.fancybox` | 手动迁移 | 用 `lightbox.enable: true` 开启本地灯箱，不读取旧 Fancybox 设置 |
| `statics`、`css`、`js`、其余 `vendors.*` | 移除 | 主题资源由构建清单定位；不要把旧 CDN 或文件路径直接复制到新配置 |
| `font.*`、`iconfont` | 移除 | 默认系统字体/本地 SVG；字体与视觉定制见 [自定义指南](customization.md) |
| `sidebar.position` | 移除 | 使用当前响应式布局；可用 `sidebar.enable: false` 隐藏侧栏 |
| `widgets.*` | 移除 | 不提供随机文章或最新评论挂件；当前侧栏提供统计、分类和目录开关 |
| `footer.icon.*`、`footer.count`、`post.count` | 移除 | 不加载旧图标/访问统计；`post.reading_time` 仅为构建时阅读时长估算 |
| `tagcloud.*` | 移除 | 使用当前标签列表，旧字号/颜色参数不生效 |
| `creative_commons.*` | 移除 | 不自动输出旧许可面板；如需声明，在正文明确写出许可证和链接 |
| `reward.*`、`audio` | 移除 | 不输出打赏组件或全站播放器；正文可使用普通链接、原生媒体 |
| `auto_scroll`、`loader.*`、`fireworks.*`、`quicklink.*` | 移除 | 无旧自动滚动、加载动画、烟花或预取接入 |
| `pangu`、`exturl` | 移除 | 不自动改写中西文间距或编码外链；保留普通文本与真实 `href` |
| `baidu_analytics`、`baidu_push`、`disable_baidu_transformation` | 移除 | 不输出旧百度统计、推送和转码控制 |
| `google_site_verification`、`bing_site_verification`、`yandex_site_verification`、`baidu_site_verification` | 移除 | 无同名主题接口；可按服务要求在博客 `source/` 放验证文件并检查生成结果 |

博客级 `url`、`root`、`permalink`、分类/标签映射、分页与 renderer 配置仍放博客 `_config.yml`；主题覆盖放 `_config.syutoi.yml`。不要用主题迁移覆盖原来的文章地址规则。RSS/Sitemap 由独立插件处理，见 [订阅指南](syndication.md)。

例如下面旧覆盖配置：

```yaml
alternate: 我的博客
darkmode: true
images: /images
sidebar:
  avatar: avatar.jpg
menu:
  home: / || home
social:
  github: https://github.com/yourname || github || '#333'
```

迁移后的 `_config.syutoi.yml`：

```yaml
branding:
  name: 我的博客
  avatar: /images/avatar.jpg
appearance:
  theme: dark
navigation:
  menu:
    - name: menu.home
      url: /
social:
  - type: github
    url: https://github.com/yourname
```

头像文件放在博客 `source/images/avatar.jpg`。完成转换后删除旧别名，避免以后修改到已被新值覆盖的字段；导航列表覆盖时需列出所有想保留的入口。

## Hexo 标签兼容清单

Hexo 的 `{% 标签 %}` 与上表中的 Markdown 私有语法是两套机制：未启用的 Markdown 扩展通常显示为原文，而未知 Hexo 标签可能直接导致构建失败，不能统一当作无害的文本残留。

| 标签 | 当前行为 | 迁移边界 |
| --- | --- | --- |
| `{% links %}…{% endlinks %}` | 保留，生成普通友情链接卡片 | 内容必须为 YAML 对象数组，每项有 `site`、`url`，可选 `image`、`desc`；无效链接跳过，不保留旧动效 |
| `{% linksfile friends.yml %}` | 保留，从博客 `source/friends.yml` 读取同一格式 | 无结束标签；文件缺失、错误 YAML 或错误数据结构可能中断构建 |
| `{% media audio %}…{% endmedia %}` / `video` | 降级为普通链接列表 | 数组项可为 URL 字符串、`{name, url}` 或 `{title, list}` 分组；没有播放控件，其他媒体类型返回空内容 |
| `blockquote`、`codeblock`、`pullquote`、`img`、`iframe`、`include_code`、`post_link`、`asset_img` 等 | Hexo 8 自带标签继续由 Hexo 处理 | 不是主题私有实现；遵循 Hexo 自身语法和资源配置，不承诺旧主题装饰样式一致 |
| 其他插件/分支增加的标签 | 主题不注册 | 先查明原插件，再改为标准内容或明确安装所需插件；本主题不自动安装适配器 |

可直接放入文章的友情链接示例：

```text
{% links %}
- site: 示例站
  url: https://example.com/
  desc: 朋友的博客
{% endlinks %}
```

媒体链接兼容示例（文件需自行放入 `source/media/`）：

```text
{% media audio %}
- name: 访谈录音
  url: /media/interview.mp3
{% endmedia %}
```

如需播放控件，替换整个 media 标签块为原生 HTML；以下假设博客部署在根目录，子目录站点需补上实际 root：

```html
<audio controls preload="none" src="/media/interview.mp3">
  <a href="/media/interview.mp3">下载访谈录音</a>
</audio>
```

原生 HTML 的 URL 不经过主题标签的路径辅助函数。主题 `links` / `media` 输出则会处理博客 root。不要将旧生成的 `public/` 内容当作文章源文件迁移：旧 `data-src` 图片或 `span.exturl[data-url]` 依赖已删除的脚本；应从原始 Markdown 重新生成。手写过此类 HTML 时，改成有真实 `src` 的 `img` 和真实 `href` 的 `a`，不要直接把 base64 数据当作 URL。

## 不支持语法的替代写法

下面是内容改写建议，不是自动转换规则。保留原来的题目、答案和说明；嵌套复杂内容需要逐段检查。

| 旧写法 | 替代写法 |
| --- | --- |
| `:::info` … `:::` | 引用块 `> **提示：** 说明内容`，多段内容每行均加 `>` |
| `;;;tab1 标题`、`+++` 标签页/折叠标记 | 用 `## 标题` 分节；需要折叠时使用下面的 `details` 示例 |
| `题目{.quiz}`、`答案{.correct}`、`{.gap}` | 普通有序题目加明确“答案”段落，或将答案放入 `details` |
| `==重点==`、`++新增++` | `<mark>重点</mark>`、`<ins>新增</ins>` |
| `!!剧透!!` | `<details><summary>查看剧透</summary><p>内容</p></details>` |
| `{文字^注音}` | `<ruby>文字<rt>注音</rt></ruby>` |
| `:smile:` | Unicode 表情，如 😄 |
| 图片后的 `{.gallery}`、颜色/label 属性 | 删除私有属性，保留标准图片/文本；确需特殊排版时写明确 HTML 并自行配套样式 |

```html
<details>
  <summary>查看答案</summary>
  <p>答案及解释。复杂列表可使用 HTML 的 ol / li 元素。</p>
</details>
```

此示例内部使用 HTML，避免误以为 HTML 块中的 Markdown 在任何 renderer 配置下都会被解析。公式/图表若暂不安装插件，可导出静态图片并提供替代文字，或保留带语言名称的代码供阅读；不要把旧 KaTeX/CDN 字段当作渲染开关。

## 迁移前的只读扫描

在**博客根目录**运行以下命令（需已安装 ripgrep），只列出疑似遗留项，不修改文件：

```bash
# 盘点 Hexo 标签，包括第三方标签和结束标签。
rg -n '\{%[- ]*[A-Za-z_][A-Za-z_0-9]*' source --glob '*.md'
# 私有 Markdown 语法；命中代码示例、历史文档时应人工判断。
rg -n ':::|;;;|\+\+\+|\{\.[^}]+\}|!![^!]+!!|==[^=]+==|\+\+[^+]+\+\+' source --glob '*.md'
# 旧运行时相关 HTML 与 Stylus 定制。
rg -n 'data-src=|data-url=|exturl|colors\.styl|custom\.styl|iconfont\.styl' source themes --glob '!node_modules/**' --glob '!public/**'
# 最后逐项对照上面的配置清单，不做批量替换。
rg -n '^[[:space:]]*[A-Za-z_][A-Za-z_0-9]*:' _config*.yml
```

扫描没有命中时 `rg` 返回 1，不表示迁移失败。这些表达式不是完整解析器，也不覆盖所有公式、emoji 和第三方扩展；仍应通读关键文章并检查构建日志。原作者域名、许可证和历史来源中的 Shoka 名称应保留，不进行全局文本替换。

## 建议迁移顺序

1. 先提交或备份旧博客配置、依赖、主题定制和内容，在单独分支中安装 Syutoi；保留原主题以便回退。
2. 按 [快速开始](getting-started.md) 整理 renderer 与生成器，先用最小主题配置成功生成。
3. 保留原来的 permalink、category_map、tag_map 和站点 root，比较重要文章、分类和旧锚点链接。
4. 将旧 menu、头像、主题偏好改为新结构，逐项恢复封面、导航和社交链接。
5. 按兼容表检查旧标签，先把影响正文理解的语法改为标准 Markdown 或 HTML；对照上述标签表及替代示例逐项确认。
6. 单独开启 Pagefind、灯箱或 Waline 并验证。Waline 评论线程采用含 root 的路径；旧系统数据与线程迁移需在服务端处理，主题不自动搬运。
7. 按 [订阅文档](syndication.md) 恢复 feed/Sitemap，再检查 SEO 覆盖；noindex、search:false 与 sitemap:false 各自独立。
8. clean/generate，查看桌面/手机和无 JS 页面，再按照 [部署指南](deployment.md) 发布。

需要回退时恢复博客配置/依赖和原主题引用，重新安装相应锁文件并 clean/generate；不要只恢复旧 CSS。阅读体验 E 阶段和博客能力 F 阶段已经完成，Beta 验收仍按 [TODO](TODO.md) 推进。
