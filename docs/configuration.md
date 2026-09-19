# 主题配置

主题默认配置为 120 行（含注释），只列出已经实现的选项，最多三层字段。用户在博客根目录创建 `_config.syutoi.yml`，只写需要覆盖的字段，无需复制整份默认文件。

Hexo 的同名字段覆盖顺序是：主题 `_config.yml` → 博客 `_config.syutoi.yml` → 博客 `_config.yml` 中的 `theme_config`。列表整体替换，不追加；`[]` 表示清空。修改配置后重新启动 `pnpm dev`。

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
  favicon: /images/favicon.ico

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
| `branding.name` | 空字符串 | 页头展示名；留空使用站点 title |
| `branding.avatar` | 空字符串 | 作者侧栏头像完整路径；留空显示首字母 |
| `branding.favicon` | `/images/favicon.ico` | 网站图标；空字符串关闭 |
| `appearance.theme` | `auto` | auto / light / dark；读者保存的选择优先 |
| `appearance.cover` | 空字符串 | 固定页头图片；留空使用渐变背景 |
| `post_list.summary` | `true` | 首页、分类和标签列表显示摘要 |
| `post_list.summary_length` | `160` | 摘要最多 Unicode 码点数（1–1000 的整数），超出追加省略号；无效值回退 160 |
| `post_list.cover` | `true` | 列表显示文章 cover；不影响文章页和页头 |
| `navigation.menu` | 首页、归档、分类、标签 | `{ name, url }` 列表；空列表移除菜单链接 |
| `social` | `[]` | `{ name, url }` 列表，显示在作者侧栏；不加载外部图标或组件 |
| `sidebar.enable` | `true` | 显示侧栏；关闭后使用居中的单列布局 |
| `sidebar.statistics` | `true` | 显示文章、分类、标签数量 |
| `sidebar.categories` | `true` | 在非文章页显示顶级分类列表 |
| `sidebar.toc` | `true` | 在文章和独立 Page 显示普通目录链接；单页 toc: false 可关闭，尚未提供 scroll spy |
| `footer.since` | 空值 | 起始年份整数；早于当前年份时显示年份区间，否则只显示当前年 |
| `footer.powered` | `true` | 显示 Hexo / Syutoi 标识 |
| `footer.rss` | `true` | 显示页脚 RSS 链接；还需站点 feed.rss.enable 为 true |

`footer.rss` 只控制页脚；作者侧栏的 RSS 链接跟随站点 feed 开关。关闭整个侧栏也会隐藏其中的社交链接。文章封面仍由文章 Front Matter 的 `cover` 决定，不使用页头封面作为随机回退。

导航 `name` 以 `menu.` 开头时查找语言文件，如 `menu.home`；找不到翻译时显示后缀。其他名称按字面显示。社交名称始终按字面显示。标签文本默认 HTML 转义。

布尔值使用真正的 YAML `false` / `true`，不是带引号的字符串。未知模式回退 auto；错误类型的布尔值使用默认值；缺少名称、非法 URL、非对象的链接条目会被忽略。链接支持站内路径、HTTP(S)、mailto；图片只允许站内路径或 HTTP(S)，不接受 javascript/data 等协议。

## 旧配置兼容

| 旧字段 | 新字段 |
| --- | --- |
| `alternate` | `branding.name` |
| `sidebar.avatar` + `images` | `branding.avatar` 完整路径 |
| `darkmode: true/false` | `appearance.theme: dark/auto` |
| `menu` 映射及 `路径 || 图标` | `post_list.summary` | `true` | 首页、分类和标签列表显示摘要 |
| `post_list.summary_length` | `160` | 摘要最多 Unicode 码点数（1–1000 的整数），超出追加省略号；无效值回退 160 |
| `post_list.cover` | `true` | 列表显示文章 cover；不影响文章页和页头 |
| `navigation.menu` 列表；旧嵌套菜单展开，忽略分组 default |
| `social` 映射及 `URL || 图标 || 颜色` | `social` 列表；旧图标和颜色不再读取 |

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

文章页显示标题、发布日期、作者、分类、正文、标签及上一篇/下一篇；没有相邻文章时不输出空导航。作者优先使用文章 `author`，否则使用站点 `author`。更新日期与发布日期不在同一天时显示更新时间，显示格式跟随站点 `date_format`。文章末尾显示年份、作者及永久链接，不自动声明任何转载许可；如需指定许可，请在正文中明确写出。

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

独立页面可使用 `hexo new page about` 创建，或直接创建 `source/about/index.md`，设置 `title` 并书写 Markdown。支持可选 `cover`，默认不显示文章日期、分类标签、来源声明和相邻文章导航。站点导航链接需要另行配置。

文章和独立 Page 有标题时会在侧栏生成原生目录链接；`toc: false` 关闭当前页目录，主题 `sidebar.toc: false` 关闭所有目录，`sidebar.enable: false` 关闭整个侧栏。目录无需 JavaScript；滚动高亮和移动端折叠留待 E2 实现。

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
