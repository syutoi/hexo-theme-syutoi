---
title: 图片展示与加载
lang: zh-CN
description: 正文图片、说明、尺寸约束、原生懒加载与 picture 示例。
---

## 独立图片的标题说明

![窗台上的猫](/assets/wallpaper-2572384.jpg "窗台上的猫：说明来自 Markdown title，alt 仍作为替代文字。")

## 横图与原始链接

[![横向尺寸示例](/assets/image-wide.svg "点击图片查看原图；长说明保持在正文宽度内。")](/assets/image-wide.svg)

## 竖图与明确尺寸

<figure>
<img src="/assets/image-tall.svg" alt="纵向尺寸示例，上下各有一个粉色圆形" width="300" height="1600">
<figcaption>原图 300 × 1600，正文中完整缩放显示，不裁去顶部或底部。</figcaption>
</figure>

## 小图不放大

<img src="/assets/image-wide.svg" alt="小尺寸横图" width="120" height="30">

## 作者设置优先

<img src="/assets/image-wide.svg" alt="立即加载的图片" width="1200" height="300" loading="eager" decoding="sync">

## Picture 与响应式来源

<figure>
<picture>
<source media="(max-width: 540px)" srcset="../assets/image-wide.svg">
<img src="/assets/wallpaper-2572384.jpg" alt="窄屏使用尺寸示例，宽屏显示窗台上的猫">
</picture>
<figcaption>已有 figure 和 figcaption 保持原样，不重复生成说明。</figcaption>
</figure>

## 无法加载的图片

<img src="/assets/intentionally-missing-image.png" alt="示例图片未能加载时可见的替代文字" width="480" height="180">

## 折叠区域里的图片

<details>
<summary>展开查看图片</summary>

![折叠内容中的横图](/assets/image-wide.svg "展开后仍使用浏览器原生图片加载。")

</details>
