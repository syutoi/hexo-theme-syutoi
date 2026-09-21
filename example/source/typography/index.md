---
title: 中文、English 与混排阅读
lang: zh-CN
date: 2026-09-22 00:00:00
description: 系统字体、段落节奏、标点和长文本换行的排版示例。
---

## 中文：让文字自然呼吸

阅读一篇长文时，合适的行长能帮助视线找到下一行。书写的节奏来自段落，也来自标点：逗号、句号、问号与感叹号，各有停顿。“引号里的句子”与《书名号里的标题》，应当保留原来的含义；不必为了填满一行，强行拉大汉字之间的距离。这里继续写下完整的段落，观察不同屏幕宽度下的换行，直到文字自然落在下一行。

繁體中文也使用本機字型。「閱讀、思考與寫作」可以出現在同一段落中，標點與文字應保持自然的間距；縮小視窗時，內容仍然完整可讀。

## English: a comfortable line length

<div lang="en">

Reading should feel unhurried. A paragraph needs enough room to develop an idea, but a line should not stretch across the entire screen. System fonts keep this page available without waiting for a remote font download. Ordinary English words wrap at their natural boundaries, while unusually long identifiers can wrap when necessary. The next paragraph starts with a clear pause rather than an indentation added by the theme.

**Emphasis gives a sentence weight**, and *italics introduce a quieter change of voice*. Neither should interrupt the rhythm of the surrounding text. Punctuation, parentheses (including this aside), and numbers such as 720 and 1.85 remain part of the same reading experience.

</div>

## 混排：Hexo 8 与 TypeScript

使用 Hexo 写作时，可以在中文段落里讨论 CSS、TypeScript 和 Unicode，也可以保留未加空格的版本号v0.1或API名称。主题不会自动插入字符，复制时仍然得到原文。行内代码 `const message = "Hello, 世界"` 与 **重要结论**、*补充说明* 应与周围文字协调。

化学式 H<sub>2</sub>O、指数 x<sup>2</sup> 和注音 <ruby>书台<rp>（</rp><rt>syutoi</rt><rp>）</rp></ruby> 不应让普通上下标撑大整行。需要局部语言标记时，可以使用 `<span lang="en">English text</span>`。

### 一段足够长的标题：在移动设备上观察中文标点、English words 和多行标题之间的间距

> “排版不是改变文字的内容，而是让内容更容易阅读。”
>
> This quotation keeps its natural spacing on narrow screens.

- 中文列表项包含一段稍长的说明，用来观察换行之后是否仍然与第一行的正文对齐。
- An English list item can continue across several lines without breaking ordinary words unnecessarily.
  - 嵌套项包含 `inline code`，与上层内容保持清晰的层次。

## 长链接与长标识符

[https://example.com/this-is-a-deliberately-long-address-for-checking-readable-layout-without-horizontal-page-scrolling](https://example.com/this-is-a-deliberately-long-address-for-checking-readable-layout-without-horizontal-page-scrolling)

`AnExtremelyLongIdentifierWithoutAnySpacesUsedToVerifyThatInlineCodeCanWrapWithinTheArticleOnSmallScreens0123456789`

```text
ThisCodeLineIntentionallyHasNoBreaksToVerifyThatCodeBlocksScrollHorizontallyInsteadOfWideningTheWholePage012345678901234567890123456789
```
