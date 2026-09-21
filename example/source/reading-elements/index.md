---
title: Markdown 阅读元素
lang: zh-CN
description: 标题、列表、引用、宽表格、图片、代码、脚注与折叠内容的完整阅读样例。
---

# 一级标题 H1

普通段落包含 **加粗**、*斜体*、~~删除线~~、[站内链接](/reading/)、`inline code` 与 <mark>标记文字</mark>。标题、正文和交互元素沿用系统字体，在浅色和深色模式下保持清晰。

## 二级标题 H2

### 三级标题 H3

#### 四级标题 H4

##### 五级标题 H5

###### 六级标题 H6

## 列表与定义

1. 第一项包含一段说明。

   这是同一列表项的第二段，需要与正文对齐。

   - 嵌套的无序列表
     - 再嵌套一层，文字依然可以自然换行。
2. 第二项使用 `inline code`。

- [x] 已完成的任务
- [ ] 尚未完成的任务
  - 补充说明不是可操作的表单。

<dl>
<dt>Markdown</dt>
<dd>用于书写内容的轻量标记语言。</dd>
<dt>Progressive enhancement</dt>
<dd>基本内容由 HTML 提供，JavaScript 为可用环境增加交互。</dd>
</dl>

## 多层引用

> 一段中文引用，可以包含 [正文链接](/typography/) 和 **重点文字**。
>
> > Nested quotation with English words. 在手机屏幕上检查嵌套引用的内侧宽度。
>
> 引用的最后一个段落。

---

## 表格

| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| 中文内容 | English | 123.45 |
| 第二行 | 混排内容 | 678.90 |

下面的宽表格使用原生 HTML，为横向滚动提供显式键盘焦点。聚焦表格后可使用方向键滚动；窄屏也能用触控滚动查看各列。

<table tabindex="0" aria-label="宽表格示例">
<caption>跨列数据比较（示例）</caption>
<thead><tr><th scope="col">项目</th><th scope="col">第一季度</th><th scope="col">第二季度</th><th scope="col">第三季度</th><th scope="col">第四季度</th><th scope="col">全年说明</th></tr></thead>
<tbody>
<tr><th scope="row">阅读记录</th><td>12 篇长文</td><td>18 篇长文</td><td>20 篇长文</td><td>16 篇长文</td><td>记录阅读过程与引用来源，保留完整的说明。</td></tr>
<tr><th scope="row">写作记录</th><td>3 篇笔记</td><td>4 篇笔记</td><td>5 篇笔记</td><td>6 篇笔记</td><td>包含中文、English 与代码示例。</td></tr>
</tbody>
</table>

## 图片与说明

<figure>
<img src="/assets/cottage-garden.webp" alt="夕阳下的乡间花园" loading="lazy">
<figcaption>本地示例图片。较长的图片说明在窄屏上自动换行，不超出正文宽度。</figcaption>
</figure>

## 代码与键盘

按 <kbd>Ctrl</kbd> + <kbd>C</kbd> 复制所选文字。

```javascript
const message = "Hello, 世界";
console.log(message);
```

```unknown-language
<example>ThisIsAnIntentionallyLongLineWithoutSpacesForCheckingHorizontalCodeScrolling012345678901234567890123456789</example>
```

## 脚注与往返跳转

这是第一个引用。[^note] 这里再次引用同一条脚注。[^note]

[^note]: 脚注可以有较长内容与 [普通链接](/reading/)。它位于正文末尾，提供返回每个引用位置的链接。

## 折叠内容

<details>
<summary>用 Enter 或 Space 打开这段较长的说明，检查摘要换行与键盘焦点</summary>

展开内容可以包含 **Markdown**、段落和列表。

- 第一项
- 第二项

<details>
<summary>嵌套的折叠说明</summary>
<p>这段内容不需要 JavaScript。</p>
</details>

</details>
