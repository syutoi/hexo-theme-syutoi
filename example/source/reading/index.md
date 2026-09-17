---
title: Syutoi 写作与迁移示例
date: 2026-09-18
description: 标准 Markdown、脚注、任务列表和原生 HTML 的写作示例，以及旧主题语法的替代方式。
---

本页使用 `hexo-renderer-markdown-it`，配合脚注和任务列表插件。主题负责版式与复制按钮，Markdown 由通用 renderer 处理。

## 中文与 English

正文支持 **重点强调**、*斜体*、~~删除线~~、`inline code` 和 [Hexo 文档](https://hexo.io/docs/)。正常换行会合并为同一段落，需要分段时留一个空行。

这是脚注引用。[^reading]

[^reading]: 脚注内容支持 **Markdown**，并提供返回正文的链接。

## 列表与表格

- 普通列表
  - 嵌套列表
- [x] 已完成的任务
- [ ] 未完成的任务

| 功能 | 当前方式 |
| --- | --- |
| 代码高亮 | Hexo 的 Highlight.js，在构建时生成 |
| 目录 | 标题锚点，文章侧栏使用 Hexo TOC |
| 图片 | 原生懒加载，响应式显示 |

## 代码

代码内容按原样保留；只有声明已知语言才高亮，未知语言显示为普通代码。

```javascript
const greeting = "Hello, 世界";
console.log(greeting);
```

```unknown-language
<widget title="plain & readable">No executable markup</widget>
```

## 图片

![窗台上的猫](/assets/wallpaper-2572384.jpg "本地示例图片")

## 提示与折叠

旧 `:::info` 等提示容器可以改为普通引用：

> **提示**：不需要额外插件也能表达重要信息。

旧 `+++` 折叠块、标签页和答案区可以改为原生 details；内部 Markdown 前后留空行。

<details>
<summary>查看答案与说明</summary>

**答案始终保留在 HTML 中**，禁用 JavaScript 后仍可展开。

```text
A native details element works without JavaScript.
```

</details>

## 行内 HTML

使用 <kbd>Ctrl</kbd> + <kbd>C</kbd>，<mark>标记重点</mark>，H<sub>2</sub>O，x<sup>2</sup>。
注音使用 <ruby>书台<rp>（</rp><rt>syutoi</rt><rp>）</rp></ruby>。

## 重复标题

第一个标题的位置。

## 重复标题

第二个同名标题会得到不同的锚点。

## 旧语法迁移

| 旧写法或功能 | 当前行为与替代方式 |
| --- | --- |
| `:::info` 等私有提示块 | 不解析；改为引用或 HTML |
| `;;;id 标签` | 不解析；改为分节标题或 details |
| `+++` 折叠块 | 不解析；使用 details / summary |
| `{.quiz}`、`{.correct}`、`[]{.gap}` | 不提供答题交互；改为列表、答案文字和 details |
| `!!隐藏文字!!` | 不解析；使用 details |
| `++下划线++`、`==高亮==`、颜色标签 | 不默认加载扩展；使用 u / mark 等 HTML |
| `{文字^注音}` | 使用 ruby / rt |
| `$...$`、`$$...$$` | 不默认渲染数学公式；原文保留，可由站点自行选择插件 |
| Mermaid、Graphviz、图表 | 作为代码展示，不启动浏览器、不加载图表脚本 |
| 合并单元格、无表头表格 | 改为标准 Markdown 表格或 HTML table |
| `links` / `linksfile` Hexo 标签 | 保留普通友情链接卡片 |
| `media audio/video` Hexo 标签 | 保留媒体链接列表，或改用 HTML audio / video |

历史文档中保留的插件安装方式、配置和语法示例不再作为当前安装指南。原有文章 URL 与原站链接保留；旧标题锚点格式可能变化，迁移后请检查指向具体小节的链接。
