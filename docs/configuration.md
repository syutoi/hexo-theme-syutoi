# 主题配置

主题默认配置只列出已经实现的选项，最多三层字段。用户在博客根目录创建 `_config.syutoi.yml`，只写需要覆盖的字段，无需复制整份默认文件。

Hexo 的同名字段覆盖顺序是：主题 `_config.yml` → 博客 `_config.syutoi.yml` → 博客 `_config.yml` 中的 `theme_config`。列表整体替换，不追加；`[]` 表示清空。修改配置后重启预览：主题仓库使用 `pnpm dev`，独立博客使用 `pnpm exec hexo server`。

站点的标题、作者、描述、语言、URL、目录、分页、日期、Markdown 和 feed 插件配置仍放在博客 `_config.yml`。主题不会重复提供这些 Hexo 选项。

## 最小配置

博客 `_config.yml`：

```yaml
theme: syutoi
title: 我的书台
author: 你的名字
language: zh-CN
```

无需另写主题配置即可生成页面。默认没有远程封面、社交账号或第三方脚本；未配置头像时显示站点名称的首字母。

## 常用覆盖

```yaml
branding:
  name: 我的书台
  avatar: /images/me.jpg
  logo: /images/logo.webp
  favicon: /images/favicon.png

appearance:
  theme: auto
  cover: /images/banner.jpg

navigation:
  menu:
    - name: menu.home
      url: /
    - name: menu.archives
      url: /archives/
    - name: 关于我
      url: /about/

social:
  - name: GitHub
    url: https://github.com/yourname
  - name: Email
    url: mailto:hello@example.com
```

图片放在博客 `source/images/`。以 `/` 开头的路径会自动加入站点 `root` 前缀，也支持完整 HTTPS URL。`/about/` 等自定义页面需要先创建；示例站导航只是例子，不会自动创建这些页面。

## 字段说明

| 字段 | 默认值 | 行为 |
| --- | --- | --- |
| `branding.name` | 空字符串 | 页头大图区域展示名；留空使用站点 title，导航标题始终使用站点 title |
| `branding.avatar` | 空字符串 | 作者侧栏头像完整路径；留空显示首字母 |
| `branding.logo` | `/images/logo.webp` | 导航栏标题旁的品牌图标；空字符串回退为字母标记 |
| `branding.favicon` | `/images/favicon.png` | 网站图标；空字符串关闭 |
| `appearance.theme` | `auto` | auto / light / dark；读者保存的选择优先 |
| `appearance.cover` | 空字符串 | 固定页头图片；留空使用渐变背景 |
| `post_list.summary` | `true` | 首页、分类和标签列表显示摘要 |
| `post_list.summary_length` | `160` | 摘要最多 Unicode 码点数（1–1000 的整数），超出追加省略号；无效值回退 160 |
| `post_list.cover` | `true` | 列表显示文章 cover；不影响文章页和页头 |
| `post.reading_time` | `true` | 文章头部显示正文预计阅读时间；单篇 reading_time: false 可关闭 |
| `search.provider` | `none` | none / pagefind；启用后生成独立搜索页面，文章/Page 可用 search: false 退出索引 |
| `comments.provider` | `none` | none / waline；有效 server_url 才启用内容页插槽 |
| `comments.server_url` | 空字符串 | 完整 HTTP(S) Waline 服务地址；点击加载后连接 |
| `seo.open_graph` / `seo.twitter_card` | `true` | 分别输出 Open Graph / Twitter Card |
| `seo.default_image` / `seo.default_image_alt` | 空字符串 | 站点分享图与对应替代文字 |
| `seo.twitter_site` | 空字符串 | Twitter 账号名，可带 @，不填主页 URL |
| `seo.noindex` | `false` | true 为全站输出 noindex, follow |
| `lightbox.enable` | `false` | 正文图片的可选灯箱；单篇 lightbox: false 可关闭，首次点击才加载查看器 |
| `navigation.menu` | 首页、归档、分类、标签 | `{ name, url }` 列表；空列表移除菜单链接 |
| `social` | `[]` | `{ type, url }` 或 `{ name, url }` 列表，显示在作者侧栏；不加载外部图标或组件 |
| `sidebar.enable` | `true` | 显示侧栏；关闭后使用居中的单列布局 |
| `sidebar.statistics` | `true` | 显示文章、分类、标签数量 |
| `sidebar.categories` | `true` | 在非文章页显示顶级分类列表 |
| `sidebar.toc` | `true` | 在文章和独立 Page 显示桌面固定/手机折叠目录；JS 增强滚动高亮，单页 toc: false 可关闭 |
| `footer.since` | 空值 | 起始年份整数；早于当前年份时显示年份区间，否则只显示当前年 |
| `footer.powered` | `true` | 显示 Hexo / Syutoi 标识 |
| `footer.rss` | `true` | 显示页脚 RSS 链接；还需站点 feed.rss.enable 为 true 且插件已注册 RSS 生成器 |

`footer.rss` 只控制页脚；作者侧栏的 RSS 链接跟随站点 feed 开关与插件注册状态。关闭整个侧栏也会隐藏其中的社交链接。文章封面仍由文章 Front Matter 的 `cover` 决定，不使用页头封面作为随机回退。

导航 `name` 以 `menu.` 开头时查找语言文件，如 `menu.home`；找不到翻译时显示后缀。其他名称按字面显示。社交名称始终按字面显示。标签文本默认 HTML 转义。

布尔值使用真正的 YAML `false` / `true`，不是带引号的字符串。未知模式回退 auto；错误类型的布尔值使用默认值；缺少名称、非法 URL、非对象的链接条目会被忽略。链接支持站内路径、HTTP(S)、mailto；图片只允许站内路径或 HTTP(S)，不接受 javascript/data 等协议。

## 旧配置兼容

| 旧字段 | 新字段 |
| --- | --- |
| `alternate` | `branding.name` |
| `sidebar.avatar` + `images` | `branding.avatar` 完整路径 |
| `darkmode: true/false` | `appearance.theme: dark/auto` |
| `menu` 映射及 `路径 \|\| 图标` | `navigation.menu` 列表；旧嵌套菜单展开，忽略分组 default |
| `social` 映射及 `URL \|\| 图标 \|\| 颜色` | `social` 列表；旧图标和颜色不再读取 |

站点的旧字段不会被新版主题默认值遮住；站点覆盖配置中同时存在新字段和旧别名时，新字段优先，包括空字符串与空列表。建议逐步改用新字段，不再向旧配置添加功能。

旧 CDN、Iconfont、Google Fonts、加载动画、烟花、播放器、评论、搜索、打赏、统计脚本、Quicklink、Base64 链接、随机图等字段已从默认配置删除，在本版本没有效果。它们不会仅因为旧配置还在就发起外部请求。详细范围见 [迁移说明](migration-from-shoka.md)。

## 首页与文章列表

列表保留图文卡片样式；封面完全由文章 `cover` 提供，未配置时使用文字卡片。图片延迟加载。标题完整输出并自动换行，摘要在视觉上最多显示三行。无封面且无摘要时卡片收紧留白；没有文章时显示空状态。

在博客 `_config.syutoi.yml` 中统一控制首页、分类和标签列表：

```yaml
post_list:
  summary: true
  summary_length: 160
  cover: true
```

文章 Front Matter 可单独设置：

```yaml
summary: 这是一段自定义的列表摘要。
cover: /images/article.jpg
```

`summary: false` 或 `summary: ''` 隐藏该篇的列表摘要；`cover: false` 或留空不显示该篇封面。全局列表开关关闭时，单篇设置不会重新开启。自定义摘要按纯文本输出；未设置时依次使用 `description`、`<!-- more -->` 前的内容、正文，移除 HTML 标签并截断。列表摘要设置不改变文章正文和 SEO 描述。

分页属于博客 `_config.yml`：

```yaml
per_page: 10
pagination_dir: page
index_generator:
  path: ''
  order_by: -date
```

`index_generator.per_page` 若显式设置则优先于 `per_page`；`0` 表示不分页。文章 `sticky: true` 会排在首页列表最前，同组按 `order_by` 排序；置顶文章只出现一次。分页使用普通链接，无需 JavaScript。首页分类卡片只出现在第一页。

## 文章、独立 Page 与归档

文章页显示标题、发布日期、作者、分类、正文、标签及上一篇/下一篇；没有相邻文章时不输出空导航。作者优先使用文章 `author`，否则使用站点 `author`。发布日期、作者及阅读时间显示在文章头部；更新日期与发布日期不在同一天时，也在头部显示更新时间，不在页尾重复。日期格式跟随站点 `date_format`。文章末尾显示年份、作者及永久链接，不自动声明任何转载许可；如需指定许可，请在正文中明确写出。

```yaml
---
title: 我的阅读笔记
date: 2026-09-18 09:00:00
updated: 2026-09-19 10:00:00
author: 文章作者
categories:
  - 阅读
  - 笔记
tags:
  - 写作
cover: /images/notes.jpg
toc: true
---
```

独立页面可使用 `hexo new page about` 创建，或直接创建 `source/about/index.md`，设置 `title` 并书写 Markdown。支持可选 `cover` 和 `cover_alt`，默认不显示文章日期、阅读时间、分类标签、来源声明和相邻文章导航。站点导航链接需要另行配置。

文章和独立 Page 的正文有标题时生成目录；`toc: false` 关闭当前页目录，主题 `sidebar.toc: false` 关闭所有目录，`sidebar.enable: false` 关闭侧栏及两种目录。

761px 及以上屏宽使用侧栏 sticky 目录，长目录在面板内滚动；760px 及以下在正文前显示默认折叠的原生 details。Enter/Space 可展开，目录链接使用原生锚点跳转，选中后不强制收起。两种呈现共享同一份生成目录，CSS 只显示当前屏宽的一种，无 JS 时仍可操作。

启用 JS 后，标题越过视口顶部 96px 阅读线时更新当前章节；正文首标题之前不高亮，页面底部选择最后一个可见标题。高亮使用下划线、字重与 `aria-current="location"`，不会修改 URL/history、移动焦点或触发页面平滑滚动。长桌面目录仅在自身内部显示活动链接，键盘焦点在目录中时不自动滚动。窗口跨断点且焦点位于目录时，会移至可见的对应链接，手机目录按需展开。

文章模板预留空的 Nunjucks `comments` block，供继承 `post.njk` 的自定义模板扩展；默认没有评论容器或外部脚本。本阶段不集成评论服务。

归档按年份分组、默认按日期倒序排列。归档首页、年份页和月份页均遵循博客 `_config.yml` 的分页设置，空站点也会生成归档首页：

```yaml
archive_generator:
  per_page: 10 # 未设置时跟随站点 per_page；0 不分页
  yearly: true
  monthly: true
  daily: false
```

三个日期层级可独立开关；每日归档标题包含具体日期。`archive.enabled: false` 禁用归档生成，此时也应移除指向归档的自定义导航链接。

## 正文排版

文章与独立 Page 的内容最大宽度为 `720px`，窄屏随内容面板收缩；标题、封面、正文、页尾与相邻文章导航保持对齐。列表页仍沿用现有图文卡片布局。

正文使用系统无衬线字体，补充本地 PingFang、Microsoft YaHei 和 Noto 中文字体回退，不下载 Web Font；各平台的实际字形可能不同。默认字号 `1rem`，行高 `1.85`，段落间距 `1.5rem`，保留浏览器文字缩放能力。

中英文使用自然换行与起始侧对齐，不强制两端对齐、不自动插入空格；中文标点使用严格断行规则。普通英文单词在正常边界换行，过长链接和行内标识符在必要时折行，代码块保持原始行并在容器内横向滚动。

页面 Front Matter 可设置 `lang: en`、`lang: zh-CN` 或 `lang: zh-TW`；混排段落可使用原生 HTML `lang` 属性标注局部语言。排版示例见 `/typography/`（源码 `example/source/typography/index.md`）。

## 界面语言

在博客 `_config.yml` 设置 `language: zh-CN`、`zh-TW` 或 `en`；也可提供有顺序的语言列表。文章或 Page 的 `lang` 优先，支持 `zh_Hant` 等常见标记规范化。缺失文案按单页语言、站点语言列表、英文逐键回退。

内置导航名称使用 `menu.*` 键以跟随语言，例如 `menu.friends`；直接写“友链”等名称时保留原文。自定义文案继续通过 `source/_data/languages.yml` 覆盖，详细示例与兼容范围见 [语言说明](../languages/README.md)。

## 页面与分享元信息

主题生成 title、description、canonical、Open Graph 和 Twitter Card，不加载第三方脚本：

- 标题由当前页面标题和博客 `title` 组成，首页不重复站点名；列表第 2 页起加入本地化页码。
- 描述依次取单页 `seo.description`、页面 `description`、more 摘要、正文、博客 `description`，跳过空值。移除 HTML、script/style 内容，转换常用 HTML 实体，最多保留 160 个 Unicode 码点；没有描述时省略对应标签。列表摘要的显示开关不影响 SEO 描述。
- canonical 和 og:url 使用当前生成路径，经 Hexo `full_url_for` 转为绝对 URL，遵循博客 `url` 和 `pretty_urls`。分页有自己的 URL，不统一指回首页；文章 `link` 是阅读原文入口，不改变 canonical。
- 分享图片依次取单页 `seo.image`、文章/Page 的 `cover`、全局 `seo.default_image`；首页及无正文列表最后回退到固定页头 `appearance.cover`。不抓取正文图片或使用头像。图片转为绝对 HTTP(S) 地址；无有效图片使用 summary 卡片，有图片使用 summary_large_image。替代文字与选中的图片对应，分别取 `seo.image_alt`、`cover_alt`、`seo.default_image_alt`，缺失时不编造描述。
- 文章作者优先使用 Front Matter `author`，其次为博客 `author`；发布时间与更新时间输出为 UTC ISO 时间。Page 和列表不输出文章时间或作者标签。
- 404 和搜索页面固定输出 `noindex, follow`；站点或单页也可主动设置 noindex。RSS/Atom/JSON Feed 仍由插件生成，主题保留发现链接；Sitemap 通过可选站点插件生成，配置见 [订阅与站点地图](syndication.md)；当前不生成 JSON-LD。

上线前必须在博客 `_config.yml` 填写真实的 `title`、`description`、`author` 和 `url`；部署在子目录时保持 url 的路径与 root 一致，例如 `url: https://example.com/blog`、`root: /blog/`。本仓库示例站使用 `https://hexo.syutoi.com`，供公开 Demo；你自己的博客应换成自己的地址。主题元信息不会从 package.json 作者或示例站 branding 读取站点身份。

可在浏览器查看页面源代码，检查生成的绝对地址。若希望隐藏 URL 中的 index.html，可使用 Hexo 配置：

```yaml
pretty_urls:
  trailing_index: false
```

<a id="seo-configuration"></a>

### SEO 配置与单页覆盖（F3）

博客 `_config.syutoi.yml`：

```yaml
seo:
  open_graph: true
  twitter_card: true
  default_image: /images/share.jpg
  default_image_alt: 山间的书桌
  twitter_site: '@your_account'
  noindex: false
```

`open_graph` 和 `twitter_card` 可分别关闭对应标签组；不影响 title、description、canonical 或普通 author 标签。图片无需远程 SDK，主题不会下载或探测远程图片尺寸；请提供可公开访问的图片。`twitter_site` 仅接受账号名（可带一个 `@`），不是个人主页 URL；无效值省略。

文章或 Page 的 Front Matter 可以单独覆盖：

```yaml
seo:
  title: 用于浏览器标题与分享的标题
  description: 用于搜索结果与分享的简介。
  canonical: https://example.com/original/
  image: /images/article-share.jpg
  image_alt: 图片内容的简短描述
  noindex: true
  twitter_creator: '@article_author'
```

- `seo.title` 覆盖浏览器及分享标题，正文标题与列表标题保持 Front Matter `title`。`seo.description` 优先于普通 `description`，同样转为纯文本并截断。
- `seo.canonical` 是明确声明原始页面的可选覆盖，可为 HTTP(S) 地址或站内路径；本地路径遵循 Hexo root 与 pretty_urls。忽略 URL 片段；拒绝不安全协议或带用户名密码的地址，错误值回退到当前生成路径。canonical 与 og:url 始终一致。普通 `link` 不改变 canonical。
- `seo.image: false` 禁止该页所有分享图片回退；空值或无效地址会尝试下一候选图片。`cover: false` 只关闭封面，不关闭全站分享默认图。
- `seo.noindex: true` 输出 `noindex, follow`；全局开启后单页 false 不会撤销它。404/搜索也不能通过 false 取消。noindex 不改变页面可访问性。
- Open Graph 使用页面语言生成 `og:locale`（例如 zh_TW、en_GB）；只有文章输出分类 `article:section` 与标签 `article:tag`。Page 和列表不冒充文章，不生成不存在的多语言页面关系。
- `twitter_creator` 只用于文章作者，未配置时不推断为博客站点账号。主题不生成猜测的作者个人主页地址。

字段全部在生成时处理并由模板转义。分享平台的缓存与抓取结果不由主题控制。协议参考：[Open Graph](https://ogp.me/)。

### 结构化社交链接（F3）

推荐使用 PRD 的列表格式；按配置顺序显示文字链接，不引入图标字体或分享 SDK：

```yaml
social:
  - type: github
    url: https://github.com/yourname
  - type: email
    url: mailto:hello@example.com
  - type: mastodon
    name: 我的 Mastodon
    url: https://example.social/@yourname
  - name: 关于本站
    url: /about/
```

内置类型标签：github、gitlab、email、twitter、x、mastodon、bluesky、rss、website；类型大小写不敏感。`name` 优先，可用任意语言；未知类型需提供 name，否则忽略。非法 URL 与空标签忽略，本地路径包含站点 root，`social: []` 清空。

原有 `{name, url}` 列表继续有效。也兼容 `social: {github: {url: ...}}` 的结构化映射以及 Shoka 的 `url || icon || color` 字符串映射；旧图标和颜色不解析为新组件。

## Markdown 阅读元素

完整样例位于 `/reading-elements/`（源码 `example/source/reading-elements/index.md`），覆盖 H1–H6、段落强调、嵌套列表、任务列表、定义列表、引用、表格、图片说明、代码、脚注和原生 details。

表格保留 Markdown 的左/中/右对齐，单元格顶部对齐并保留最小宽度，窄屏在表格内部横向滚动。较宽表格如需显式键盘焦点，可使用原生 HTML `<table tabindex="0" aria-label="数据说明">`，配合 caption、th 的 scope 描述数据关系；聚焦后可按方向键滚动。代码高亮内部的布局表格不使用普通表格的单元格最小宽度。

脚注跳转后高亮目标脚注，返回链接对应原引用位置。原生 details 保留浏览器标记与 Enter/Space 操作，支持嵌套；这些功能无需 JavaScript。figure/figcaption 可为图片添加说明，长说明随正文宽度换行。代码复制和图片加载规则见下方对应章节。

## 代码展示与复制

`/code/` 提供语言、缩进、空行、行末空格、br 换行、空代码、行号和折叠代码示例。高亮继续由 Hexo renderer 完成；主题在生成页面时添加语言标签、带名称的滚动区域和状态位置，原始代码 HTML 片段保持不变。未知语言可能被 renderer 转为 plaintext，标签忠实显示其结果，不重新猜测语言。

滚动区域有显式 Tab 焦点，可用左右方向键滚动长行；无 JavaScript 时标签和滚动仍可用。浏览器提供 Clipboard API 时才添加复制按钮，复制内容不含标签、行号或按钮文字，保留缩进、空行和行末空格。成功／失败反馈显示在当前代码块下方，也通过 status 区域播报。进行中的复制拒绝重复触发但保留按钮焦点；失败后可重试或手动选择代码。

Clipboard API 不可用时不显示复制按钮；权限拒绝时显示失败提示，不自动请求其他权限或引入备用外部组件。构建侧新增 htmlparser2 用来定位 HTML 片段，不进入浏览器 bundle。代码颜色仍使用主题的深浅色 token，不加载浏览器高亮器。

## 正文图片

完整样例位于 `/pictures/`。主题在生成阶段为正文 img 补充缺失的 `loading="lazy"` 和 `decoding="async"`，原生 HTML 与 Markdown 图片均适用；作者明确设置的属性不覆盖。未指定 loading 且 `fetchpriority="high"` 时使用 eager。页头与文章封面由原模板管理，不会被正文规则改成懒加载。

独立段落中单张图片或图片链接的 `title` 会生成 figcaption，保留 alt、链接和其他属性；混排文字、多图段落不自动转为 figure，已有 figure/figcaption 不重复添加。title 按文字转义，不执行 HTML。替代文字 alt 应描述图片内容，图注可提供补充说明：

```markdown
![图片的替代文字](/images/photo.jpg "显示在图片下方的说明")
```

正文图片最大宽度不超过容器，高度上限为 `min(80vh, 960px)`，按原比例完整显示；小图不强制放大。超长信息图可自行链接到原图，或在原生 HTML 图片上设置 `style="max-height: none"` 取消高度上限。文章封面和首页卡片仍使用原有裁剪方式。

建议为已知尺寸的图片填写原生 width/height，让浏览器预留比例；主题保留这些尺寸，不自动下载图片探测尺寸。也不生成缩略图或 srcset。picture/source、srcset、sizes、已有说明和链接均保留作者设置。

正文 img 的站内绝对 src 经过 Hexo URL helper 处理，适配站点 root。手写 source/srcset 中的地址由作者负责：子目录部署可以使用相对路径或带部署前缀的路径。无 JS 时仍由浏览器加载图片，替代文字在失败时保留；样例中 `intentionally-missing-image.png` 是故意设置的失败场景。可选图片灯箱默认关闭，开启方式和范围见下一节。


## 可选图片灯箱

```yaml
# 博客 _config.syutoi.yml
lightbox:
  enable: true
```

默认 `false`。文章和独立 Page 的 Front Matter 可写 `lightbox: false` 退出；全局关闭时单篇 `true` 不会重新启用。只增强正文，不处理页头、头像、封面或列表图片。开启后重启预览，在 `/pictures/` 可查看普通图、长图、图注和失败图。

合格的独立 img 会获得指向同一图片的原生链接；已指向同一图片的单图链接也可增强。实际打开时使用图片的固有尺寸，不能把用于显示缩略图的 width/height 当作原图尺寸。未加载图片只在用户点击后尝试取得尺寸（最多等待 10 秒）；不会为建立组图而预先下载所有懒加载图片。每次打开只包含已取得可靠尺寸的图片，因此组图数量可能随正文图片加载而增加。

不同原图链接需要作者显式提供**目标原图**尺寸：

```html
<a href="/images/original.jpg" data-lightbox-width="2400" data-lightbox-height="1600">
  <img src="/images/thumbnail.jpg" alt="山间的湖泊" width="480" height="320">
</a>
```

链接必须只含一张 img（允许空白）。普通文章链接、含文字的链接、target/download 链接，以及 picture/srcset 保留原生行为；这一版不为响应式图片猜测当前来源或尺寸。单图可用 `data-lightbox="false"`（img 或已有 a）退出。自定义链接的原图宽高须是 1–100000 的整数；src 的相对路径保持原义，增强链接的站内绝对路径适配 root。

说明使用 figcaption 的纯文本，没有说明则使用 alt；不解释 HTML。灯箱提供本地化关闭/缩放/切换按钮、方向键、Escape、Tab/Shift+Tab 循环，关闭后返回触发链接，打开期间背景 inert；系统减少动态效果时关闭过渡动画。

关闭或没有合格图片时，HTML 不输出任何灯箱资源与增强标记。启用且有图片时只加载独立入口；首次点击才请求本地 PhotoSwipe 核心与独立 CSS，无 CDN。禁用 JS 或入口加载失败时链接正常工作；核心或样式失败会导航原图；灯箱内原图加载失败显示可点击的原图链接，无法修复原图自身的 404。Ctrl/Cmd/Shift/Alt 点击保留浏览器行为。

资源体积、浏览器验收和未测范围见 [E4a 验收](validation/e4a.md)；[E4 评估](decisions/optional-lightbox.md) 保留选型时的历史问题。


## 阅读时间与封面替代文字

```yaml
# 博客 _config.syutoi.yml
post:
  reading_time: true
```

文章 Front Matter 可写 `reading_time: false` 隐藏当前篇估时；全局关闭后，单篇 `true` 不会重新启用。空正文、仅图片或仅代码块的文章不输出估时；有正文的短文最少显示约 1 分钟。只在文章头部显示，不为首页卡片、归档或独立 Page 增加阅读时间。

估算在 Hexo 构建阶段完成，不依赖站点字数插件或客户端计时。中日韩文字按每分钟 300 个文字计，其余字母/数字词按每分钟 200 词计，混排时相加并向上取整。实体先按 HTML 解析，行内格式不拆开单词；正文标题、引用、列表、表格、原生 figcaption 图注、脚注正文、行内代码和 details 内的文字计入，代码块/行号、图片 alt/title 属性、脚注标记/返回符号、script/style/template/SVG/math 与显式 hidden/aria-hidden 内容不计入。计算基于 renderer 输出，不计主题后续生成的复制按钮、语言标签或 title 图注。它不是理解代码、图片或复杂内容所需时间，也不是实际阅读行为统计；未按各语言精细分词。

封面仍完全可选，`cover: false`、空值或不设置时不输出图片，也不预留图片占位，不使用页头图片作为回退。文章和独立 Page 可为有信息含义的封面写替代文字：

```yaml
cover: /images/city.webp
cover_alt: 夜色中的城市与水面倒影
```

`cover_alt` 仅接受文字，默认空字符串（装饰性图片）；输出经过 HTML 转义。列表封面位于重复的文章链接内，继续使用空 alt，避免重复读出标题。无有效 cover 时 cover_alt 不会单独生成元素，也不改变分享元信息。


## 本地搜索

```yaml
# 博客 _config.syutoi.yml
search:
  provider: pagefind
```

重新启动 `pnpm dev`，或执行 `hexo clean && hexo generate`。页头出现搜索图标，进入 `/search/` 后输入关键词并按 Enter 或点击搜索。结果每批显示 10 条，可继续加载。默认 `none` 不生成搜索入口、页面或索引；仅启用后的搜索页加载独立 JS/CSS，首次查询才加载本地搜索引擎。

文章或 Page 的 Front Matter 可写 `search: false` 退出索引。索引包含标题、正文和代码，排除草稿、密码内容、尚未发布的文章（除非站点 future: true），不索引导航/侧栏等模板文字。索引语言沿用站点首选 language，全站内容放入同一个索引；不提供翻译搜索或简繁转换。search: false 不是访问控制。

`/search/` 和 `/_syutoi/search/` 为启用时的保留目录，不要放置同名页面或静态资源。Pagefind 原生构建包随主题依赖安装，启用时需要平台二进制；不要省略其 optional dependencies。普通 Hexo generate/server 使用同一套索引生成器，不需要另外执行 Pagefind CLI。修改、删除内容或关闭搜索后，Hexo 更新路由并清理旧索引；部署时也应同步删除旧文件。

查询不会发送给远端搜索服务；无 JS 时可通过搜索页中的归档链接浏览。网络错误会显示重试提示，重新提交即可。实现边界、依赖与生命周期证据见 [搜索决策](decisions/local-search.md) 和 [F1 验收](validation/f1.md)。

<a id="waline-comments"></a>

## 可选评论（F2）

默认 `comments.provider: none`。在博客 `_config.syutoi.yml` 中配置自己的 Waline 服务：

```yaml
comments:
  provider: waline
  server_url: https://comments.example.com
```

`server_url` 是 Waline 服务的根地址，可带部署子路径，不要追加 `/api/comment`。只接受完整 HTTP(S) 地址；空值、相对地址、带账号密码、查询参数或片段的地址不启用插槽。HTTPS 博客请使用 HTTPS 服务，并在服务端配置允许的站点来源。服务部署、数据库、审核、反垃圾和账户权限由 Waline 管理；主题不创建服务或保存服务端密钥。

开启后，文章与普通独立页底部显示“加载评论”。读者点击后才加载本站的 Waline JS/CSS 并连接服务，未点击时只加载小型本地入口与插槽样式。首页、归档、分类、标签、搜索与 404 不输出评论插槽。关闭时不引用评论资源，也不发起评论服务请求。可在单篇文章或独立页 Front Matter 中关闭：

```yaml
comments: false
```

`comments: true` 不会绕过全局关闭。带 `password` 或 `published: false` 的内容不显示插槽。不会把 Shoka 遗留的评论配置自动转换为新的服务连接。

评论路径使用构建时的站点相对 URL，包含 `root` 子目录并去掉结尾 `index.html`；地址栏的查询参数、锚点和预览域名不影响它。修改 permalink 或 root 会改变评论线程标识；已有 Waline 数据需要自行迁移，主题不会迁移评论数据。

界面支持简体中文、繁体中文、英文，跟随页面语言及主题明暗选择。客户端固定为 `@waline/client` 3.13.0，资源随主题本地构建；关闭表情 CDN、GIF 搜索、图片上传、文章反应、评论计数与访问统计。加载后的评论正文、头像、登录等仍由服务端数据与 Waline 行为决定，可能引用外部资源。

资源下载失败可再次点击重试；服务请求失败时可用 Waline 的刷新按钮或“重新加载评论”。重新加载会清空当前未提交的编辑内容。没有 JavaScript 或入口脚本未加载时显示提示，正文阅读不受影响。

适配依据：[Waline 客户端 API](https://waline.js.org/en/reference/client/api.html)、[组件选项](https://waline.js.org/en/reference/client/props.html)。
