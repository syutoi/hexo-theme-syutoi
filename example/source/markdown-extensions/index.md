---
title: 图片属性与提示块
comments: false
---

## 图片尺寸

![Lumi](/images/avatar.png "100 像素宽的头像"){width=100 height=100}

横图只写宽度即可保持原始比例：

![乡间花园](/assets/cottage-garden.webp "320 像素宽的田园插画"){width=320}

```markdown
![Lumi](/images/avatar.png){width=100 height=100}
![乡间花园](/assets/cottage-garden.webp){width=320}
```

不需要尺寸时，仍使用普通 Markdown 图片。尺寸受容器宽度限制；height 不用于强制裁剪或拉伸图片。

## 五种提示块

> [!NOTE]
> 这是一条补充说明，可以包含 **重点**、[文档链接](/docs/) 和 `行内代码`。

> [!TIP]
> 小图可以只指定宽度，保持图片原有比例。
>
> - 使用有意义的替代文字。
> - 为正文配图写简短说明。

> [!IMPORTANT]
> 修改博客配置后，请重新启动本地预览。

> [!WARNING]
> 删除文章后，部署时也要同步删除旧的生成文件。

> [!CAUTION]
> 覆盖主题文件之前，请先保存自己的修改。

```markdown
> [!TIP]
> 修改配置后，请重新启动预览。
```

## 普通引用与原样展示

> 普通引用保留原有排版。
>
> > 内层引用也应完整显示。

> [!UNKNOWN]
> 未知标记保留为普通引用，不解释为提示块。

> \[!TIP]
> 转义后的标记保持原样。

完整配置及使用范围见 [写作指南](/docs/writing/)。
