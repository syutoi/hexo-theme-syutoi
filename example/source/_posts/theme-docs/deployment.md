---
title: 部署指南
description: 发布静态站点并检查路径、缓存和部署配置。
date: '2026-09-22 00:00:00'
updated: '2026-09-26 00:00:00'
comments: false
permalink: docs/deployment/
categories:
  - 主题文档
author: Syutoi
cover: false
column: 主题文档
column_order: 120
---

部署对象是 Hexo 生成的静态目录，不是主题源码。下面区分普通博客与本仓库示例；只准备本地生成文件不等于已经发布。首次发布需自行配置托管平台、域名和权限。

## 选择正确的构建路径

| 场景 | 命令工作目录 | 构建命令 | 发布目录 |
| --- | --- | --- | --- |
| 独立 Hexo 博客 | 博客根目录 | `pnpm exec hexo clean && pnpm exec hexo generate` | 博客的 `public/` |
| 本主题仓库示例 | 主题仓库根目录 | `pnpm clean && pnpm build` | `example/public/` |

独立博客安装方法见 [快速开始](/docs/getting-started/)。提交博客 package.json 和 pnpm-lock.yaml，并确保 CI 能取得主题与主题生产依赖。主题自带已提交的 JS/CSS，普通博客无需运行主题的完整开发构建。

已有博客使用嵌套 Git clone 安装主题时，主题内容不会自动进入博客提交。可把主题作为 Git submodule 记录并固定到已推送的 commit，再让 CI 递归检出；也可以在 CI 中单独检出自己维护的主题仓库。不要只提交一个本机目录路径或软链接。

## 设置最终 URL

博客 `_config.yml`：

```yaml
# 根域名或自定义域名
url: https://example.com
root: /
```

项目子目录站点使用：

```yaml
url: https://yourname.github.io/blog
root: /blog/
```

菜单和主题图片路径写 `/about/`、`/images/banner.webp`，由 helper 加入 root；不要手工重复 `/blog/`。正文手写链接、picture/srcset 等仍需自行检查。canonical、feed 和 Sitemap 使用最终 url；改变 root/permalink 也会改变评论线程标识。

本仓库示例的域名是 `hexo.syutoi.com`。fork 后请修改 `example/_config.yml`，并修改或移除 `.github/workflows/pages.yml` 中写入 CNAME 的步骤，不要照搬别人的域名。

## 独立博客的 GitHub Pages 示例

先在仓库 Settings → Pages 将发布来源设为 GitHub Actions。下例假设主题已作为 `themes/syutoi` submodule 提交，博客已有 pnpm 锁文件；私有子模块还需要自己的读取权限。

在博客仓库创建 `.github/workflows/pages.yml`：

```yaml
name: Deploy blog
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - uses: pnpm/action-setup@v4
        with:
          version: 9.0.4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.19.2'
          cache: pnpm
      - uses: actions/configure-pages@v5
      - run: pnpm install --frozen-lockfile
      - run: pnpm --dir themes/syutoi install --prod --frozen-lockfile --filter hexo-theme-syutoi
      - run: pnpm exec hexo clean && pnpm exec hexo generate
      - uses: actions/upload-pages-artifact@v4
        with:
          path: public
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

按自己的默认分支调整 main；提交此 workflow 并推送匹配分支会触发发布。部署权限、environment 和 build/deploy 的依赖关系遵循 [GitHub Pages 官方说明](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。Action 的主版本按上例锁定，后续升级需按平台文档验证。

使用自定义域名时，在平台设置域名及 DNS，并把自己的域名写入博客 `source/CNAME`（单行、不带协议）；Hexo 会复制到 public。使用默认 github.io 地址时不需要该文件。TLS 与 DNS 不由主题配置。

## 本仓库 Demo

仓库已有 [Pages workflow](https://github.com/syutoi/hexo-theme-syutoi/blob/main/.github/workflows/pages.yml)：推送 main 或手动运行会安装依赖、构建 example、写入 CNAME、上传 `example/public/` 并部署。它使用仓库 .nvmrc/packageManager，不使用上一节的独立博客命令。

[CI workflow](https://github.com/syutoi/hexo-theme-syutoi/blob/main/.github/workflows/ci.yml) 执行 lint、构建、测试和资源一致性检查；Pages 工作流是另一个 workflow，没有等待 CI 成功的依赖关系。当前文档不声称增加了发布闸门。发布前请先在本地完成检查，按需要自行设置分支保护。

## 其他静态托管

安装依赖并执行上表对应的构建命令，将发布目录交给静态托管服务。配置保留 `404.html` 的错误页行为，并将目录请求映射到 index.html。不要把所有缺失路径都重写为首页；本主题没有客户端路由。

建议让 HTML 及时重新验证；JS/CSS 使用版本查询参数，但图片和内容搜索索引不都使用同一种版本策略。Pagefind 开启时，整批发布 `search/`、`_syutoi/search/` 与对应页面，避免新页面引用旧索引。所有可选资源均应与当前生成文件一起发布，不能只上传核心 JS/CSS。

不要上传 node_modules、源配置、缓存数据库或评论服务密钥；正常部署只需要生成目录。压缩、缓存、HTTPS 和 HTTP 状态由宿主负责。

## 发布前与发布后

1. 确认 url/root、身份、导航、图片以及可选服务地址来自自己的站点。
2. 独立博客 clean/generate；主题开发额外运行 lint、typecheck、build、test。
3. 本地预览首页、文章、独立页、分页、404，检查子目录静态资源路径。
4. 上传生成目录，访问实际部署地址，检查 404 HTTP 状态、资源返回类型及 canonical。
5. 启用订阅/Sitemap 时检查实际 XML/JSON 地址；开启搜索/评论时检查真实网络环境下的交互。

其他平台步骤可参考 [Hexo 部署文档](https://hexo.io/docs/github-pages)。本阶段验证本地构建步骤和文档结构，未执行远程发布或修改 DNS。服务端部署、鉴权和跨域需要在自己的环境验证。


---

[文档首页](/docs/)
