# 快速开始

本页主要用于已有 Hexo 博客；新博客先看 [从空目录开始](#从空目录开始)，再执行安装步骤。想先查看效果，可按 [README](../README.md) 启动仓库自带示例。以下命令在博客根目录执行，要求 Node >=20.19.0、pnpm 9.0.4；当前实现以 Hexo 8.1.2 验证。本文描述当前开发分支；0.3.0 标签包含搜索和评论，后续 SEO、Sitemap 与文档改进见 Changelog 的 Unreleased。

## 安装主题与依赖

```bash
git clone https://github.com/syutoi/hexo-theme-syutoi.git themes/syutoi
pnpm --dir themes/syutoi install --prod --frozen-lockfile --filter hexo-theme-syutoi
pnpm add hexo@8.1.2 hexo-renderer-markdown-it@7.1.1 markdown-it-task-lists@2.1.1 hexo-generator-category hexo-generator-tag hexo-server
```

主题内部已经注册 Nunjucks renderer，不另装重复的 Nunjucks renderer。主题自带首页/归档生成器和分类/标签总览；站点 category/tag 插件负责各分类与标签的详情页。`hexo-server` 只用于本地预览。

检查博客 `package.json`，移除已有的其他 Markdown renderer（如 `hexo-renderer-marked` 或旧 `hexo-renderer-multi-markdown-it`），保留一个 renderer。旧 index/archive 插件也可移除，避免同名生成器与主题重复。仅移除实际安装的包，保留自己确实使用的其他站点插件。

主题生产依赖用于 Hexo 生成过程；`source/` 已含预构建 JS/CSS，不必为使用主题安装全部开发依赖。完整源码开发使用仓库根目录的 `pnpm install --frozen-lockfile`，见开发文档。当前没有可用的 npm 主题发布流程，请使用 Git 安装。

## 配置博客

合并到博客 `_config.yml`，不要创建重复的顶层键：

```yaml
theme: syutoi
title: 我的书台
author: 你的名字
description: 记录与思考
language: zh-CN
url: https://example.com # 替换为自己的站点地址
root: /

highlight:
  enable: true
  line_number: false
  auto_detect: false
  tab_replace: ''
prismjs:
  enable: false

markdown:
  preset: default
  render:
    html: true
    breaks: false
    linkify: true
    typographer: false
  plugins:
    - markdown-it-footnote
    - name: markdown-it-task-lists
      options:
        enabled: false
  anchors:
    level: 1
    collisionSuffix: ''
    permalink: false
  images:
    lazyload: true
    prepend_root: true
```

footnote 由所选 renderer 提供，task-lists 显式安装；`enabled: false` 让任务复选框不可编辑，不是关闭任务列表解析。`html: true` 允许作者写 details、ruby 等原生 HTML，适用于自己维护的内容，不会净化外部投稿 HTML。

可选的外观覆盖写入博客 `_config.syutoi.yml`：

```yaml
branding:
  name: 我的书台
appearance:
  theme: auto
  cover: /images/banner.webp
```

使用封面时将文件放入 `source/images/banner.webp`；不需要封面可省略 `cover`。其他选项见 [配置说明](configuration.md)。不要修改主题默认 `_config.yml` 来保存自己的站点身份。

## 写作与预览

```bash
pnpm exec hexo new "第一篇文章"
pnpm exec hexo new page about
pnpm exec hexo clean
pnpm exec hexo generate
pnpm exec hexo server --ip 127.0.0.1
```

在 `source/_posts/` 写文章，在 `source/about/index.md` 写独立页面；导航需自行加入 `/about/`。访问 <http://127.0.0.1:4000>。博客中使用 `hexo` 命令，仓库中的 `pnpm dev` 则用于自带示例，两者工作目录不同。

## 可选订阅与部署检查

RSS/Atom/JSON Feed 使用可选站点插件 `hexo-feed` 与 `hexo-renderer-ejs`，Sitemap 使用 `hexo-generator-sitemap`。安装命令、完整配置、开关与排除规则见 [订阅与站点地图](syndication.md)。未安装插件时主题不会输出订阅入口。

上线前填入实际的 url、root、作者与描述；子目录站点例如 `url: https://example.com/blog` 与 `root: /blog/`。部署生成的 `public/`，由宿主配置 404、HTTPS、文本 gzip/Brotli 和缓存策略；主题不会配置服务器。发布后检查页面和静态资源 URL，并用实际网络复测性能。两种项目布局的部署步骤与 GitHub Pages 示例见 [部署指南](deployment.md)。


## 从空目录开始

先使用 Hexo CLI 初始化博客（现有博客跳过此步）：

```bash
pnpm dlx hexo-cli@4.3.2 init my-blog
cd my-blog
```

然后执行本文安装步骤，并检查初始化模板带来的 renderer、首页/归档插件。不要把本主题仓库直接当作自己的博客根目录；这里的 example 是开发夹具。

## 升级与排查

先保存博客与主题的本地修改，在主题目录中获取自己选择的已发布 tag 或提交，再按原安装命令安装主题生产依赖。标签可能尚未推送；不要假设本地开发记录中的每个标签都能在远端获取。构建前查看 [Changelog](../CHANGELOG.md)，升级后重启服务并 clean/generate。

| 现象 | 检查 |
| --- | --- |
| 找不到 nunjucks、pagefind 等模块 | 是否在 themes/syutoi 安装了主题生产依赖；只安装博客依赖不够 |
| 页面无样式或图片 404 | 是否部署整个 public；url/root 是否匹配；资源文件是否存在 |
| 修改配置后没变化 | 重启预览，并检查博客 theme_config 是否覆盖了 _config.syutoi.yml |
| 页面重复、Markdown 输出不一致 | 是否有重复的首页/归档生成器或多个 Markdown renderer |
| 看不到搜索/评论入口 | 默认关闭；检查 provider，评论还需要有效 server_url 与当前页未退出 |
| 启用 feed 却没有订阅文件 | 检查插件是否安装、模板路径与命令工作目录；见订阅文档 |

源码定制见 [自定义](customization.md)，文章功能开关见 [写作](writing.md)，从旧主题升级见 [迁移](migration-from-shoka.md)。
