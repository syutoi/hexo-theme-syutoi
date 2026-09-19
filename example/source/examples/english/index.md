---
title: Writing with Syutoi
lang: en
description: An English page for checking navigation, reading and progressive enhancement.
---

## A page in another language

This page sets `lang: en` in its front matter. The site still contains Chinese articles, but this page uses English interface labels. Custom titles and article content remain exactly as the author wrote them.

## Read without extra dependencies

A blog post should remain useful when JavaScript is unavailable. Headings, links, images and native disclosure elements belong to the document. Optional controls can improve the experience when the browser supports them.

```javascript
const message = "Read, write, and think.";
console.log(message);
```

<details>
<summary>Open a short writing checklist</summary>

- Give the page a clear title.
- Add meaningful alternative text to images.
- Review the page on a narrow screen.

</details>

Return to the [example index](/examples/) or read the [long article](/syutoi-long-read/).
