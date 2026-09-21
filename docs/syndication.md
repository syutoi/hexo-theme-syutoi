# 订阅与站点地图

RSS、Atom、JSON Feed 和 Sitemap 属于博客的插件配置，放在博客 `_config.yml`，不放在 `_config.syutoi.yml`。主题提供 feed 展示模板和 HTML 订阅入口，内容筛选、路由生成与 Sitemap 模板由插件负责。

## 安装与配置

在博客根目录安装（本仓库示例站已配置）：

```bash
pnpm add hexo-feed@1.1.2 hexo-renderer-ejs@1.0.0 hexo-generator-sitemap@3.0.1
```

当前验收环境为 Hexo 8.1.2 / Node 20.19.2。`hexo-feed` 的 peer 范围仍未声明 Hexo 8，实际三类输出已通过测试；安装警告不等于官方兼容承诺。不同时安装会生成相同 feed 路径的其他 feed 插件。

博客 `_config.yml`：

```yaml
url: https://example.com
root: /

feed:
  limit: 20
  order_by: -date
  tag_dir: false
  category_dir: false
  rss:
    enable: true
    template: themes/syutoi/layout/_alternate/rss.ejs
    output: rss.xml
  atom:
    enable: true
    template: themes/syutoi/layout/_alternate/atom.ejs
    output: atom.xml
  jsonFeed:
    enable: true
    template: themes/syutoi/layout/_alternate/json.ejs
    output: feed.json

sitemap:
  path: sitemap.xml
  rel: false
  tags: true
  categories: true
```

请在博客根目录执行 Hexo 命令；feed 模板路径相对当前工作目录，主题文件夹名需为 `syutoi`。程序调用 Hexo API 时可给 template 配置绝对路径。自定义输出可用 `updates/rss.xml`、`updates/atom.xml`、`updates/feed.json` 和 `maps/sitemap.xml`；不要在路径中重复填写 root。

子目录部署示例：`url: https://example.com/blog`、`root: /blog/`。订阅自引用地址和 Sitemap 地址都包含该前缀；页面或文章的 URL 遵循 Hexo permalink/pretty_urls。修改 URL 后重新生成，勿沿用测试域名。

## 开关与包含范围

- 将三类 feed 的 `enable` 分别设为 false 可关闭对应生成器；主题也会隐藏该类型的发现链接。配置开启但没安装插件时同样不展示链接。主题的 `footer.rss: false` 只隐藏页脚 RSS，不能关闭生成文件或 head/侧栏订阅入口。
- `hexo-feed` 输出文章，不包含普通独立页；验收配置下草稿、`published: false` 内容不进入 feed，`future: false` 会让 Hexo 排除未来文章。`limit: 20` 输出最近 20 篇，`limit: 0` 输出全部。本文配置仅验收主 feed，不启用按分类/标签拆分的 feed。
- Sitemap 包含文章、普通独立页、站点首页，并可包含分类/标签详情。归档与分页不会因为存在路由就自动进入该插件的列表；主题生成的虚拟 404 和搜索页不在插件内容集合中。
- 单篇文章或独立页使用 `sitemap: false` 排除 Sitemap。用户自行创建的 404/搜索/隐藏页也应显式填写。`seo.noindex` 只控制 HTML 的 robots 标签，不会替插件自动设置 sitemap 开关；改到其他 canonical 的页面也应按需要设置排除。
- `sitemap: false` 不影响 feed，`search: false` 也不影响 feed；`hexo-feed` 1.1.2 没有本主题支持的单篇 `feed: false` 开关。不要把搜索/SEO/评论开关当作订阅内容过滤器。
- 空站点仍生成有效的空 RSS/Atom/JSON Feed；Sitemap 插件在没有可收录文章或 Page 时不生成文件。
- 关闭 Sitemap 可移除该插件依赖；该版本没有 `sitemap.enable` 开关。更改插件、配置或排除规则后重启预览，并 `hexo clean && hexo generate`，清除旧输出。

排除示例：

```yaml
---
title: 不加入站点地图的页面
sitemap: false
seo:
  noindex: true
---
```

## 模板与内容

RSS 正文以 XML 转义后的 HTML 输出，读者解析 XML 后可得到正常 HTML，不再把已转义 HTML 放进 CDATA 造成二次转义。Atom/JSON Feed 的文章修改时间使用 `updated`（缺省回退 date）；RSS lastBuildDate 与 Atom feed updated 使用所选文章的最新时间。三种 feed 均提供自己的订阅 URL，RSS 分类使用文本节点。正文保留 Markdown 渲染结果；主题不在 feed 中挂载评论、灯箱或站点客户端脚本。

主题不会抓取正文中的外部图片，也不会代替读者软件重写全部相对链接。需要跨读者稳定展示的外部媒体应使用绝对地址。

## 验证与发布

本仓库 `pnpm test` 包含实际插件集成测试，并用严格 XML 解析器检查示例输出；`node toolbox/check-syndication.mjs` 还检查三种 feed 的文章一致性和 Sitemap URL 是否对应本地生成文件。

部署后可访问 `/rss.xml`、`/atom.xml`、`/feed.json` 和 `/sitemap.xml`，确认返回实际文件。可自行将站点地图提交给搜索引擎；本阶段未向外部服务提交内容，也未验证搜索引擎收录。

插件文档：[hexo-feed](https://github.com/sergeyzwezdin/hexo-feed)、[hexo-generator-sitemap](https://github.com/hexojs/hexo-generator-sitemap)。
