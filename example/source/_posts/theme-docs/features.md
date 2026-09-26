---
title: 功能配置
description: 按需启用搜索、评论、图片预览与订阅。
date: '2026-09-22 00:00:00'
updated: '2026-09-26 00:00:00'
comments: false
permalink: docs/features/
categories:
  - 主题文档
author: Syutoi
cover: false
column: 主题文档
column_order: 90
---

搜索、评论、图片预览、统计和订阅都可以按需启用。主题功能写入博客根目录的 `_config.syutoi.yml`，订阅插件配置写入博客 `_config.yml`；修改后重启预览并重新生成。

## 本地搜索

```yaml
search:
  provider: pagefind
```

开启后导航显示搜索入口。索引在站点构建时生成，查询在浏览器本地完成。文章可用 `search: false` 退出索引。完整条件与故障处理见 [本地搜索](/docs/configuration/#本地搜索)。

## Waline 评论

准备好自己的 Waline 服务后配置：

```yaml
comments:
  provider: waline
  server_url: https://comments.example.com
```

把示例地址替换为实际服务地址。读者点击“加载评论”后才连接服务；单篇文章用 `comments: false` 关闭。部署服务、评论路径与升级注意事项见 [可选评论](/docs/configuration/#waline-comments)。

## 图片预览

```yaml
lightbox:
  enable: true
```

点击符合条件的正文图片时加载查看器。单篇文章用 `lightbox: false` 保留原生图片行为；图片尺寸与加载方式见 [图片写作](/docs/writing/#图片与折叠内容)，增强范围见 [可选图片灯箱](/docs/configuration/#可选图片灯箱)。

## 订阅与站点地图

安装并配置站点插件后，才能生成订阅文件；只开启主题入口不会生成文件。完整步骤见 [订阅与站点地图](/docs/syndication/)。

## 分享与搜索引擎信息

站点 title、description、author、url 使用自己的信息。需要默认分享图片或单篇覆盖时，参考 [SEO 配置](/docs/configuration/#seo-configuration)。

## 社交链接与访问统计

在作者侧栏展示账号，见 [社交链接与图标](/docs/social-links/)。记录网站访问，见 [访问统计](/docs/analytics/)。两者分别通过 `social` 与 `analytics.baidu` 配置，都不需要手动粘贴脚本。

## Markdown 图片属性与提示块

这些是构建时的写作扩展，配置放在站点 `_config.yml`，不是主题配置。开启方式见 [Markdown 扩展](/docs/markdown-extensions/)，图片尺寸与路径说明见 [图片与尺寸](/docs/images/)。

## 检查效果

在本地重新生成站点，检查入口是否出现、单篇退出是否生效，并对照 [写作示例](/examples/)。评论需要自己的服务地址；Demo 不预置公共评论服务。


---

[文档首页](/docs/)
