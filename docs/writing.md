# 基础写作

本页对应 0.5.0；可选图片属性与提示块从此版本提供。先按 [快速开始](getting-started.md) 配置 Markdown renderer，再在博客中执行 `pnpm exec hexo new "文章标题"`。完整可运行样例见 [示例清单](examples.md)。

## 文章与独立页面

文章保存到 `source/_posts/`，文件以 YAML Front Matter 开头：

```markdown
---
title: 一篇阅读笔记
date: 2026-09-20 09:00:00
updated: 2026-09-20 10:00:00
description: 用于页面分享和搜索摘要的简短说明。
summary: 文章列表中显示的摘要。
cover: /images/notes.webp
cover_alt: 摊开的笔记本与书签
reading_time: true
categories:
  - 阅读
tags:
  - 笔记
toc: true
---

这是开头的段落。

<!-- more -->

## 第一节

从这里开始正文。
```

`cover` 可省略，或使用 `false`；图片来自博客 `source/images/`，不会随机回退到别的封面。`summary: false` 隐藏列表摘要，未设置时按 description、more 摘要、正文回退。`description` 与列表摘要不同，隐藏列表摘要不会关闭页面元信息。`author` 可单篇覆盖站点作者，`sticky: true` 将文章置顶到首页。

分类数组通常表达层级，例如“阅读 → 笔记”；多个平级标签放在 `tags`。没有分类或标签也可发布。不要复制示例日期、作者和域名作为自己的身份。日期显示遵循博客 date_format/timezone，updated 与 date 不在同一天才在文章头部显示更新日期。正文阅读时间由构建时估算，短文最少约 1 分钟；纯代码块或纯图片不显示估时，可用 `reading_time: false` 关闭。算法和全局开关见 [阅读时间说明](configuration.md#阅读时间与封面替代文字)。

`pnpm exec hexo new page about` 创建独立 Page，正文与文章写法相同，但默认没有文章日期、分类标签和前后篇。Page 支持 title、description、cover、cover_alt、lang、toc，不显示文章阅读时间。页面导航在 `_config.syutoi.yml` 单独配置。

## 标题、正文与链接

```markdown
## 小节标题

段落之间留一个空行。**重点**、*强调*、`行内代码`。

[站内文章](/reading/)
[外部资料](https://example.com)

> 引用内容，并注明来源。

- 无序列表
- 第二项

1. 第一步
2. 第二步
```

正文支持 H1–H6，通常从 H2 开始以避免重复页面主标题。renderer 为标题生成锚点，同名标题自动区分；不要假设与旧 Shoka 定制锚点完全一致。目录只包含正文标题，无标题的文章不会输出空目录。`toc: false` 关闭当前页目录；主题 sidebar.toc/sidebar.enable 可全局关闭。桌面目录固定在侧栏，手机目录在正文前以原生 details 折叠；无 JS 仍可展开和跳转。JS 只增强章节高亮及跨屏宽焦点处理，长目录可在面板内滚动。

中英文自然换行，不自动修改文字空格；长链接可折行。设置 `lang: en` 或 `lang: zh-TW` 可改变单页界面语言。手写 Markdown 链接需自行检查部署路径，尤其是子目录站点；主题不会重写所有正文 href。

## 代码、表格与脚注

````markdown
```js
const greeting = '你好，Syutoi';
console.log(greeting);
```

| 项目 | 数量 |
| :--- | ---: |
| 笔记 | 3 |

- [x] 已完成
- [ ] 待整理

一句带注释的话。[^source]

[^source]: 这里放来源或补充说明。
````

代码围栏标注语言后在构建时高亮；不支持的语言可能显示为 plaintext。Tab 可聚焦代码滚动区域，左右方向键阅读长行。有 Clipboard API 时提供复制按钮，保留缩进和换行，不复制行号。普通 HTTP 生产页面可能没有该 API；无 JS 或无 API 时仍可选择代码。复制失败会提供反馈，可重试。

表格可在自己的容器内横向滚动，不强制缩成逐字换行。普通正文表格会在构建时自动补上 `tabindex="0"`，无 JS 时也可用 Tab 聚焦、方向键滚动。原生 HTML 可用 `<table aria-label="数据说明">`，配合 caption 和 th 的 scope；作者显式设置的 tabindex 会保留，负值会取消普通 Tab 访问。脚注、任务列表依赖快速开始中的扩展配置；任务列表为静态内容，点击不会保存完成状态。

## 图片与折叠内容

```markdown
![窗边的猫](/images/cat.webp "摄于一个晴朗的下午")
```

alt 用于替代文字，独立图片的 title 会显示为图注。普通正文图片默认懒加载、异步解码；尺寸不超过内容宽度，长图按比例缩放。已知尺寸可写原生 HTML 预留比例：

```html
<img src="/images/cat.webp" alt="窗边的猫" width="1280" height="800">

<details>
  <summary>查看补充说明</summary>
  <p>这段内容无需 JavaScript 即可展开。</p>
</details>
```

选择与用途相符的图片尺寸和编码，主题不会自动下载或转换用户图片。手写 picture/source/srcset/sizes 保留原值，路径需要适配部署目录；完整边界规则见 [正文图片配置](configuration.md#正文图片)。默认保留原生图片；可在主题配置中启用 [可选灯箱](configuration.md#可选图片灯箱)，单篇 Front Matter 的 `lightbox: false` 可退出。picture/srcset 和非图片链接仍保留原生行为。

脚注、details、目录和分页在无 JS 时可用。Mermaid、数学公式、标签属性扩展和复杂 Shoka 私有语法不默认支持；替代写法见 [迁移清单](migration-from-shoka.md)。

## 搜索、评论、订阅与 SEO

这些能力有独立开关，不能相互替代：

| Front Matter | 作用 |
| --- | --- |
| `search: false` | 从已开启的 Pagefind 索引中排除文章或 Page |
| `comments: false` | 不显示本页评论插槽；true 不会越过全局关闭 |
| `lightbox: false` | 不增强本页正文图片；保留原图链接 |
| `sitemap: false` | 告诉已安装的 Sitemap 插件排除本页 |
| `seo.noindex: true` | 在 HTML 中请求不被索引，不改变页面可访问性 |
| `seo.image: false` | 不为本页生成分享图片，包括默认图回退 |

站点主题配置 `search.provider: pagefind` 启用搜索；`comments.provider: waline` 与有效 server_url 启用评论。主题不为你部署评论服务，读者点击后才连接服务。功能开启后仍应检查各页面的 Front Matter。

单页覆盖浏览器/分享标题和简介：

```yaml
seo:
  title: 分享时使用的标题
  description: 页面介绍。
  image: /images/share.webp
  image_alt: 与分享图片对应的描述
```

正文标题仍使用普通 title。完整 SEO 字段、优先级与 canonical 覆盖见 [配置说明](configuration.md#seo-configuration)。普通 Page 也可参与搜索、评论和 Sitemap，但不输出文章日期和阅读时间。

搜索排除不等于订阅排除；hexo-feed 没有这里支持的单篇 feed:false 开关。发布状态、未来日期、feed 限制和 Sitemap 的实际范围见 [订阅与站点地图](syndication.md)。静态公开页面不应依靠这些展示开关保护私密内容。

## 发布前检查

在博客根目录执行 `pnpm exec hexo clean`、`pnpm exec hexo generate`，预览文章、列表和手机宽度；检查图片、目录、代码、表格及链接。标题、description、author、url 应来自自己的站点。静态 HTML 中的作者内容由你维护，主题不会净化所有原生 HTML 或替你声明转载许可。

## 可选图片属性与提示块

这两项扩展由 Markdown renderer 在构建时处理，主题负责排版，不增加浏览器端解析脚本。Demo 已启用；普通博客按下方配置开启。当前使用 Hexo renderer 7.1.1 和 Markdown-it 13；不要同时启用多个 attrs 或提示块插件。

在博客 `_config.yml` 的现有 `markdown.plugins` 列表中追加，保留已经使用的脚注、任务列表等插件：

```yaml
markdown:
  plugins:
    - name: markdown-it-attrs
      options:
        allowedAttributes: [width, height]
    - name: ./themes/syutoi/lib/markdown-alerts.cjs
```

`markdown-it-attrs` 已由 `hexo-renderer-markdown-it@7.1.1` 提供。提示块依赖随主题生产依赖安装；更新主题后，在主题目录运行 `pnpm install --prod --frozen-lockfile --filter hexo-theme-syutoi`。如果主题目录不是 `themes/syutoi`，相应修改插件路径。配置后重启预览，clean/generate；删除对应插件配置即可关闭该项扩展。

### 图片尺寸属性

```markdown
![Lumi](/images/avatar.png){width=100 height=100}
![花园](/images/garden.webp "午后的乡间花园"){width=320}
```

推荐只写宽度，让图片保持原始比例。width/height 使用正整数像素值；两者都写时应符合原图比例。主题保留 `max-width: 100%`、`height: auto`，手机端按容器缩小，不保证强行显示为指定宽高，也不提供裁剪。只写 height 不保证控制实际显示高度。图注、延迟加载与可选灯箱继续适用。

白名单只限制属性名，不验证数值，也不是“只解析图片”的开关；其他可附加属性的元素仍可能被解析。此版本仅承诺图片尺寸用法，不开放 style、class、id、事件属性。写出字面花括号时使用代码围栏或转义。原生 HTML 仍可用；未启用扩展的环境可能把属性显示为普通文字。

### GitHub 风格提示块

```markdown
> [!TIP]
> 修改主题配置后，请重新启动预览。
>
> - 检查页面。
> - 检查图片链接。
```

支持 NOTE、TIP、IMPORTANT、WARNING、CAUTION，标记大小写不敏感，须独占引用的第一行。正文可以包含普通 Markdown。提示块前后留空行，只支持顶层提示块；列表、普通引用或提示块内部不再识别新提示块，内部普通引用正常排版。未知标记保持普通引用，`> \[!TIP]` 可原样展示，代码围栏内不解析。

默认使用英文类型标签。需要全站自定义标签时，在提示块插件的 options 中配置：

```yaml
- name: ./themes/syutoi/lib/markdown-alerts.cjs
  options:
    titles:
      note: 说明
      tip: 提示
      important: 重要
      warning: 注意
      caution: 警告
```

标签是普通文字并经过转义，按这份博客配置统一显示，不随单页语言切换。提示块使用主题明暗配色，同时保留文字标签，不依赖颜色区分含义；无 JavaScript 也能完整阅读。关闭插件时退回普通引用。

实际效果见 [图片属性与提示块示例](/markdown-extensions/)。
