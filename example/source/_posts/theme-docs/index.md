---
title: Syutoi 使用手册
description: 从安装到发布，按顺序开始使用书台。
date: '2026-09-22 00:00:00'
updated: '2026-09-26 00:00:00'
comments: false
permalink: docs/
categories:
  - 主题文档
column: 主题文档
---

从安装、外观设置到文章写作与发布，这里汇总 Syutoi（书台）的日常使用方法。手册对应当前开发分支：包版本仍为 **0.5.0**，百度统计与社交平台图标在 **v0.5.0 标签之后**加入。使用固定标签时，请阅读该标签中的文档；差异见 [版本记录](https://github.com/syutoi/hexo-theme-syutoi/blob/main/CHANGELOG.md)。

## 第一次使用

1. [快速开始](/docs/getting-started/)：安装主题、配置 renderer、启动本地预览。
2. [基础配置](/docs/configuration/)：设置标题、作者、头像、导航、侧栏及分页。
3. [文章写作](/docs/writing/)：创建文章，填写分类、标签、日期、摘要和封面。
4. [部署指南](/docs/deployment/)：生成并发布静态站点。

## 按需求查找

| 我想做什么 | 阅读指南 |
| --- | --- |
| 修改页头名字、作者名字、头像和菜单 | [基础配置](/docs/configuration/) |
| 添加 GitHub、X、知乎、小红书等账号 | [社交链接与图标](/docs/social-links/) |
| 调整木色配色、字体与布局 | [外观定制](/docs/customization/) |
| 写文章、设置置顶、摘要、目录与更新时间 | [文章写作](/docs/writing/) |
| 将分类作为专栏、设置文章顺序 | [专栏与阅读顺序](/docs/columns/) |
| 显示或隐藏文章目录、关闭目录序号 | [目录显示与序号](/docs/configuration/#table-of-contents) |
| 控制图片宽高、设置头像封面、开启大图预览 | [图片与尺寸](/docs/images/) |
| 使用 `{width=100}` 或 NOTE/TIP 提示块 | [Markdown 扩展](/docs/markdown-extensions/) |
| 开启本地搜索、Waline 评论、图片灯箱 | [功能配置](/docs/features/) |
| 接入百度统计并检查是否生效 | [访问统计](/docs/analytics/) |
| 提供 RSS、Atom、JSON Feed 和站点地图 | [订阅与站点地图](/docs/syndication/) |
| 发布到网站或排查子目录路径 | [部署指南](/docs/deployment/) |
| 从原 Shoka 主题迁移 | [从 Shoka 迁移](/docs/migration-from-shoka/) |

## 配置应该放在哪里

| 文件 | 负责什么 |
| --- | --- |
| 博客 `_config.yml` | 站点标题、作者、描述、语言、URL、日期、分页、Markdown 插件与订阅插件 |
| 博客 `_config.syutoi.yml` | 头像、主题配色模式、导航、社交账号、搜索、评论、灯箱与百度统计 |
| 文章顶部 Front Matter | 单篇标题、日期、分类标签、封面、摘要及功能退出开关 |

本仓库 Demo 对应 `example/_config.yml` 和 `example/_config.syutoi.yml`。请覆盖博客配置，不要直接改主题 `_config.yml` 的默认值，方便后续升级。列表如 `social`、`navigation.menu` 会整体替换，需要一次写全。

手册本身就是示例博客的一部分：文章保存在 `example/source/_posts/theme-docs/`，本导读页保存在 `example/source/_posts/theme-docs/index.md`。可以直接参照这些 Markdown 文件和 Front Matter 编写自己的内容。

## 修改后如何看到效果

独立博客修改配置或插件后，停止原来的预览进程，在博客目录执行：

```bash
pnpm exec hexo clean
pnpm exec hexo generate
pnpm exec hexo server
```

主题仓库的 Demo 则在仓库根目录执行 `pnpm build`；本地预览使用 `pnpm dev`，配置变动后需重启。查看 <http://127.0.0.1:4000/>。本地生效不等于线上已更新，线上仍需部署生成文件。

## 对照效果与排查

[示例入口](/examples/) 包含代码、图片、表格、中英文混排及边界场景；[图片属性与提示块](/markdown-extensions/) 和 [友链](/friends/) 可对照图片尺寸。主题安装不会自动复制 Demo 的文章、账号或统计 ID，请使用你自己的配置。

图片属性显示为普通文字时，先看 [图片常见问题](/docs/images/#常见问题)；社交图标不出现时看 [社交链接排查](/docs/social-links/#隐藏与排查)；统计未生效时看 [百度统计排查](/docs/analytics/#常见问题)。其他安装问题见 [安装与升级排查](/docs/getting-started/#升级与排查)。

[源码仓库](https://github.com/syutoi/hexo-theme-syutoi) · [版本记录](https://github.com/syutoi/hexo-theme-syutoi/blob/main/CHANGELOG.md)
