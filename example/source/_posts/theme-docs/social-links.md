---
title: 社交链接与图标
description: 配置 GitHub、X、知乎、小红书等账号及内置图标。
date: '2026-09-26 00:00:00'
updated: '2026-09-26 00:00:00'
comments: false
permalink: docs/social-links/
categories:
  - 主题文档
author: Syutoi
cover: false
column: 主题文档
column_order: 30
---

社交链接显示在作者头像、名字和文章数量下方。内置图标在 v0.5.0 之后加入；使用旧标签时，请阅读对应版本的说明。

## 添加账号

在博客根目录的 `_config.syutoi.yml` 中填写自己的主页地址。本仓库的示例站使用 `example/_config.syutoi.yml`：

```yaml
social:
  - type: github
    url: https://github.com/yourname
  - type: x
    url: https://x.com/yourname
  - type: zhihu
    url: https://www.zhihu.com/people/yourname
  - type: xiaohongshu
    url: https://www.xiaohongshu.com/user/profile/your-id
  - type: email
    name: 给我写信
    url: mailto:hello@example.com
```

替换示例地址，删除不使用的条目，然后重启预览或重新生成部署。列表整体覆盖，不会与主题默认值逐项合并；按填写顺序显示。不要在同一个 YAML 文件里重复声明多个 `social`。

## 支持的平台

| `type` | 平台或用途 |
| --- | --- |
| `github` | GitHub |
| `gitlab` | GitLab |
| `x` | X；`twitter` 是兼容别名，也使用 X 图标 |
| `zhihu` | 知乎 |
| `xiaohongshu` | 小红书 |
| `bilibili` | 哔哩哔哩 |
| `weibo` | 微博 |
| `telegram` | Telegram |
| `youtube` | YouTube |
| `instagram` | Instagram |
| `mastodon` | Mastodon |
| `bluesky` | Bluesky |
| `email` | 邮件，地址使用 `mailto:` |
| `rss` | 订阅链接；不会自动生成订阅文件 |
| `website` | 个人网站或其他网页 |

类型大小写不敏感。内置平台图标随主题提供，无需准备图片、安装插件或连接图标 CDN。只有配置使用的 SVG 会嵌入页面，颜色跟随明暗主题。图标保留键盘焦点、无障碍名称和悬停提示；名称取自内置标签或自定义 `name`。

品牌 SVG 来自 Simple Icons；来源、版本与许可见 [图标维护说明](https://github.com/syutoi/hexo-theme-syutoi/blob/main/layout/_partials/icons/README.md)。

## 自定义名称和文字链接

设置 `type` 时，`name` 修改悬停提示和读屏名称，不会把图标变为文字：

```yaml
social:
  - type: github
    name: 我的开源项目
    url: https://github.com/yourname
  - name: 关于我
    url: /about/
  - type: my-community
    name: 我的社区
    url: https://example.com/community/
```

不填写 `type` 时显示文字，适合尚未支持的平台。未知类型有 `name` 时也显示文字，没有名称则忽略。主题不会根据 URL 猜测平台，不接受任意图标文件路径作为 `type`。名称按纯文字转义，不能填写 HTML。

URL 支持站内路径、HTTP(S) 和 `mailto:`；填写平台的完整个人主页链接，不要只写账号名。非法地址会被忽略。站内路径会自动加入站点 `root` 前缀，自定义页面需要自行创建。

## 隐藏与排查

```yaml
social: []
```

上述配置隐藏全部社交链接。`sidebar.enable: false` 会隐藏整个侧栏，包括社交区域。

| 现象 | 检查方式 |
| --- | --- |
| 显示文字，没有图标 | 使用内置 `type`，例如 `type: github`；仅写 `name: GitHub` 会保留文字 |
| 某一项不显示 | 检查 URL、类型拼写；未知类型需补上 `name` |
| 整个社交区域不显示 | 检查列表是否为空、侧栏是否关闭，以及配置覆盖顺序 |
| 更新后没有变化 | 重启预览并重新生成；线上还需部署生成文件 |

旧的 `{name, url}` 列表保持文字显示；也支持 `social: {github: {url: ...}}` 的结构化映射。Shoka 的 `URL || icon || color` 字符串映射仍按文字链接处理，不使用旧图标和颜色。建议使用本页的列表格式。


---

[文档首页](/docs/)
