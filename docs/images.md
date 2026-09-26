# 图片与尺寸

正文图片、作者头像、页头和文章封面使用不同配置。本页说明放在哪里、怎样控制显示大小，以及如何开启点击放大。

## 图片放在哪里

独立博客可把图片放在 `source/images/`，正文使用 `/images/文件名`。在本仓库示例站，内容图片可放在 `example/source/images/` 或 `example/source/assets/`，分别使用 `/images/…` 和 `/assets/…`。

例如，文件 `source/images/cat.webp` 对应：

```markdown
![窗边的猫](/images/cat.webp "午后的阳光")
```

方括号内是图片不可见时的替代文字；引号内是图注。独立段落中的单张图片可自动生成图注，混排文字或多张图片时不会自动组合成相册。图注按文字显示，不解析 HTML。

## 用 Markdown 设置大小

示例站已启用图片属性扩展，因此可以直接写：

```markdown
![头像](/images/avatar.png){width=100 height=100}
![头像](/images/avatar.png){width="100" height="100"}
![花园](/assets/cottage-garden.webp "午后的花园"){width=320}
```

两种引号写法均支持。属性紧跟图片语法之后。普通博客需要先在站点 `_config.yml` 的现有 `markdown.plugins` 列表中追加：

```yaml
markdown:
  plugins:
    - name: markdown-it-attrs
      options:
        allowedAttributes: [width, height]
```

保留原有的脚注、任务列表等插件，不要重复添加 attrs。该插件由当前使用的 `hexo-renderer-markdown-it@7.1.1` 提供；renderer 的完整安装方法见 [快速开始](getting-started.md)，提示块与扩展维护见 [Markdown 扩展](markdown-extensions.md)。修改插件配置后重启预览并重新生成。

width/height 填正整数像素值，如 `100`，不写 `100px` 或 `50%`。通常只写 width，保持原图比例；同时填写宽高时应符合原图比例。主题保留响应式 `max-width: 100%` 和 `height: auto`，手机窄屏仍会缩小图片，不会强制拉伸成指定矩形。只写 height 不保证能控制显示高度。

## 不启用扩展也能设置尺寸

使用原生 HTML 即可，无需 attrs 插件：

```html
<img src="/images/avatar.png" alt="我的头像" width="100" height="100">
```

普通 Markdown 或原生 HTML 图片仍会获得主题的懒加载和异步解码处理，作者明确设置的属性保留。属性配置只限制可解析的属性名，并不验证数值，也不限制插件仅作用于图片；当前手册仅推荐图片 width/height 用法。

## 头像、页头和封面

| 用途 | 配置位置 | 字段 |
| --- | --- | --- |
| 作者侧栏头像 | `_config.syutoi.yml` | `branding.avatar` |
| 导航 Logo | `_config.syutoi.yml` | `branding.logo` |
| 浏览器图标 | `_config.syutoi.yml` | `branding.favicon` |
| 页头大图 | `_config.syutoi.yml` | `appearance.cover` |
| 文章或独立页封面 | 内容文件的 Front Matter | `cover`、`cover_alt` |
| 分享预览图 | 主题配置或 Front Matter | 见 [SEO 字段](configuration.md#seo-configuration) |

```yaml
# 博客 _config.syutoi.yml
branding:
  avatar: /images/avatar.webp
appearance:
  cover: /images/banner.webp
```

```yaml
# 文章 Front Matter 中的字段
cover: /images/article.webp
cover_alt: 桌上的书与一杯茶
```

正文的 `{width=100}` 不控制上述图片。头像按侧栏样式显示，页头和封面可能裁剪；选择合适构图，并为图片提供足够但不过大的分辨率。`cover: false` 可关闭单篇封面；`post_list.cover: false` 只隐藏列表图片。布局定制见 [外观定制](customization.md)。

## 点击放大与长图

在主题配置 `_config.syutoi.yml` 中启用：

```yaml
lightbox:
  enable: true
```

只增强合格的正文图片；头像、页头和封面不属于灯箱范围。单篇文章可写 `lightbox: false` 退出。缩略图链接不同原图时，要填写原图的真实尺寸；picture/srcset 等情况保留原生行为。详细条件见 [可选图片灯箱](configuration.md#可选图片灯箱)。

正文图片保持比例，最大高度为 `min(80vh, 960px)`。非常长的信息图可链接到原图阅读；如果要取消高度限制，可以使用原生 HTML：

```html
<img src="/images/long-chart.webp" alt="完整流程图" style="max-height: none">
```

这属于作者明确编写的 HTML，不需要、也不应为此扩大 attrs 的属性白名单。

## 路径与文件体积

主题会为正文 img 的站内绝对路径处理 `root` 子目录前缀；自己编写的 `source/srcset` 路径需要适配部署目录。不要把本地磁盘路径写进 Markdown。文件名大小写应与链接一致，发布后仍需检查是否 404。

设置 width 只改变显示尺寸，**不会压缩原文件**。主题不会自动下载、裁剪、转码或生成响应式图片；上传前应自行缩小和压缩。普通照片、插画可使用已经准备好的 WebP 文件，原图可单独保留。图片优化和示例资源维护见 [示例图片编码工具](../toolbox/optimize-example-images.mjs)。

## 常见问题

| 现象 | 常见原因与处理 |
| --- | --- |
| `{height="100" width="100"}` 出现在正文 | attrs 未启用、配置放错文件或进程未重启；检查站点 `_config.yml`，不是主题配置 |
| 设置宽高后比例不变 | 主题优先保持比例，属性不提供裁剪；正方形头像素材需自行准备 |
| 图片比指定尺寸小 | 内容容器宽度或长图高度上限生效；这属于响应式布局 |
| 小图片下载仍然很慢 | CSS 尺寸不减少文件体积，换用合适分辨率的压缩文件 |
| 点击图片没有灯箱 | 检查全局/单篇开关以及图片是否符合灯箱条件 |

对照效果：[图片展示](/pictures/) · [图片属性与提示块](/markdown-extensions/) · [友链头像](/friends/)。
