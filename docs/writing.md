# 基础写作

本页对应 Syutoi 0.1.0。先按 [快速开始](getting-started.md) 配置 Markdown renderer，再在博客中执行 `pnpm exec hexo new "文章标题"`。完整可运行样例见 [示例清单](examples.md)。

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

分类数组通常表达层级，例如“阅读 → 笔记”；多个平级标签放在 `tags`。没有分类或标签也可发布。不要复制示例日期、作者和域名作为自己的身份。日期显示遵循博客 date_format/timezone，updated 与 date 不在同一天才单独显示更新日期。

`pnpm exec hexo new page about` 创建独立 Page，正文与文章写法相同，但默认没有文章日期、分类标签和前后篇。Page 支持 title、description、cover、lang、toc。页面导航在 `_config.syutoi.yml` 单独配置。

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

正文支持 H1–H6，通常从 H2 开始以避免重复页面主标题。renderer 为标题生成锚点，同名标题自动区分；不要假设与旧 Shoka 定制锚点完全一致。目录只包含正文标题，无标题的文章不会输出空目录。`toc: false` 关闭当前页目录；主题 sidebar.toc/sidebar.enable 可全局关闭。当前目录为普通链接，sticky、移动折叠和 scroll spy 尚未完成。

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

表格可在自己的容器内横向滚动，不强制缩成逐字换行。需要显式键盘焦点时使用 `<table tabindex="0" aria-label="数据说明">`，配合 caption 和 th 的 scope。脚注、任务列表依赖快速开始中的扩展配置；任务列表为静态内容，点击不会保存完成状态。

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

选择与用途相符的图片尺寸和编码，主题不会自动下载或转换用户图片。手写 picture/source/srcset/sizes 保留原值，路径需要适配部署目录；完整边界规则见 [正文图片配置](configuration.md#正文图片)。目前没有灯箱，需查看原图时可自行加链接。

脚注、details、目录和分页在无 JS 时可用。Mermaid、数学公式、标签属性扩展和复杂 Shoka 私有语法不默认支持；替代写法见 [迁移清单](migration-from-shoka.md)。

## 发布前检查

在博客根目录执行 `pnpm exec hexo clean`、`pnpm exec hexo generate`，预览文章、列表和手机宽度；检查图片、目录、代码、表格及链接。标题、description、author、url 应来自自己的站点。静态 HTML 中的作者内容由你维护，主题不会净化所有原生 HTML 或替你声明转载许可。
