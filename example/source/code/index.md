---
title: 代码展示与复制
lang: zh-CN
description: 语言标签、原始空白、复制反馈和无 JavaScript 代码滚动示例。
---

## 已知语言

```javascript
const greeting = "Hello, 世界";
console.log(greeting);
```

## 未指定与未知语言

```
Plain text without a declared language.
```

```unknown-language
<widget title="plain & readable">No executable markup</widget>
```

语言标签沿用 renderer 的实际输出；未知语言可能已经被 renderer 标记为 plaintext。

## 空白与长行

以下原生 pre 用来检查空行、制表符、行末空格、HTML 实体与 br 换行。复制不包含语言标签或行号。

<pre id="whitespace-code"><code class="language-text">  first &lt;tag&gt; &amp;

	second  <br>last
</code></pre>

```text
ThisIsAnIntentionallyLongCodeLineWithoutSpacesForTestingHorizontalKeyboardScrolling012345678901234567890123456789012345678901234567890123456789
```

## 空代码

<pre id="empty-code"><code></code></pre>

## 折叠内容中的代码

<details>
<summary>展开代码示例</summary>

```python
if True:
    print("Hello, 世界")
```

</details>

## 带行号的 renderer 输出

<figure class="highlight text" id="numbered-code"><table><tr><td class="gutter"><pre>1<br>2</pre></td><td class="code"><pre>first<br>  second</pre></td></tr></table></figure>
