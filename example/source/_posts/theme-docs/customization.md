---
title: 外观定制
description: 调整配色、字体与布局，维护自己的主题定制。
date: '2026-09-22 00:00:00'
updated: '2026-09-26 00:00:00'
comments: false
permalink: docs/customization/
categories:
  - 主题文档
author: Syutoi
cover: false
column: 主题文档
column_order: 40
---

先用 [主题配置](/docs/configuration/) 调整外观；只有配置无法满足需求时才修改主题源码。当前没有 custom_css、custom_js、inject 或动态皮肤配置，单独把 CSS 放进博客 source 不会自动引用。

## 使用配置与站点资源

博客 `_config.syutoi.yml`：

```yaml
branding:
  name: 我的书台
  avatar: /images/avatar.webp
  logo: /images/brand.png
  favicon: /images/favicon.png
appearance:
  theme: auto
  cover: /images/banner.webp
sidebar:
  enable: true
social:
  - type: github
    url: https://github.com/yourname
```

把文件放在博客 `source/images/`，用自己的真实文件替换示例路径。`branding.name` 显示在页头大图区域；导航标题使用博客 `title`。`logo: ''` 回退为字母标记；不配置头像时使用首字母。封面、列表和侧栏可以分别配置，详见配置文档。

不要用复制整份上游配置的方法定制。列表会整体替换；修改菜单时应包含所有需要的项目。不要把测试服务地址或他人的社交账号当作默认值。

## 调整颜色、字体与间距

在自己维护的主题分支中修改 `src/styles/tokens.css`。例如分别在已有的 `:root` 和 `:root[data-theme="dark"]` 规则内调整：

```css
:root {
  --syutoi-color-primary: #235c80;
  --syutoi-color-focus: #235c80;
  --syutoi-radius-md: 12px;
}
:root[data-theme="dark"] {
  --syutoi-color-primary: #9ac9e8;
  --syutoi-color-focus: #9ac9e8;
}
```

上例是需要合并的片段，不是替换整个 tokens 文件。保留浅色与深色两组值，并实际检查正文、链接和焦点的对比度。字体默认使用系统字体；填入字体名称不会自动下载对应字体。

布局与文章样式分别位于 `src/styles/layouts/site.css` 和 `src/styles/markdown/article.css`。集中存放自己覆盖样式时，可新建 `src/styles/custom.css`，在 `src/styles/main.css` 最后加入 `@import './custom.css';`。这属于源码定制，需要自行维护文件和 import，并重新构建。

## 修改模板与脚本

- `layout/_partials/header.njk`：导航与品牌图标。
- `layout/_partials/hero.njk`：页头大图与展示名。
- `layout/_partials/sidebar.njk`、`footer.njk`：作者信息与页脚。
- `layout/post.njk`、`page.njk`：文章与独立页。
- `layout/_partials/head/head.njk`：资源引用和元信息。
- `src/client/main.ts`：核心渐进增强入口；可选搜索、评论、灯箱有自己的独立入口。

Nunjucks 的站点标题、配置文字默认转义；修改模板时保留这一行为。可选功能应继续通过开关和独立资源接入。覆盖页面的 comments block 时也要考虑资源加载条件，不要只隐藏容器却仍下载依赖。

## 构建与保存修改

以下命令在主题目录执行，不是在博客根目录：

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

`pnpm build` 会生成主题资源并构建主题自带示例。`pnpm build:theme` 只生成主题 JS/CSS，适合随后返回自己的博客执行 `pnpm exec hexo clean && pnpm exec hexo generate`。

提交源码及所有发生变化的 `source/js/`、`source/css/` 产物。不要直接编辑 `.min.js` 或 `.min.css`，下次构建会覆盖它们。版本号是资源 URL 的缓存参数；自己的定制分支若不改变版本号，发布时应让 CDN 重新验证或清除旧文件。

模板和静态资源变更在博客重新生成后生效；配置、依赖或构建入口变更后重启预览。外观验收至少查看首页和文章的浅色/深色、桌面/手机，以及键盘焦点。

## 更新主题

把站点配置和文章留在博客，源码定制保存在自己的主题分支或 fork，先提交本地修改再合并上游更新。合并后重新安装锁定依赖、构建、验证并提交产物；不要用覆盖整个主题目录的方法更新。

当前没有承诺跨版本稳定的私有 CSS 类名、DOM 结构或插槽注入 API。升级前查看 [Changelog](https://github.com/syutoi/hexo-theme-syutoi/blob/main/CHANGELOG.md) 与 [迁移说明](/docs/migration-from-shoka/)，配置能表达的内容优先留在配置中。


---

[文档首页](/docs/)
