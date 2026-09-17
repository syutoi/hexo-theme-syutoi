# 从 Shoka 迁移：当前兼容范围

本说明记录 B4 已实施的改动；主题仍在重建，不代表完整 v0.1 已验收。上游历史、许可证和文章中的来源链接保持保留。

## 页面与资源

- 页面使用语义化 Nunjucks 模板、系统字体、原生 CSS 和本地 SVG。旧 `app.js`、`app.css`、Stylus 源文件与生成器已删除，示例站不再安装 `hexo-renderer-stylus`、`hexo-autoprefixer`。CSS 前缀处理统一交给主题的 PostCSS 构建。
- 更新后运行 `pnpm clean && pnpm build`。部署时也清理旧生成目录，避免残留文件。
- 已停止 PJAX、播放器、烟花、加载动画、评论、搜索、打赏和统计脚本。旧配置暂保留至 B6，但相关字段不再启用这些功能。
- 核心页面无需 JavaScript 即可阅读和导航。JavaScript 仅增强主题偏好、移动菜单和代码复制；无 JS 时移动导航直接显示。
- 不再默认加载远程字体、图标或第三方脚本。正文中的外部图片和用户自己嵌入的内容仍由作者控制。

## 视觉迁移范围

保留接近原版的图片页头、波浪过渡、分类入口、交错图文卡片、作者侧栏与文章内容面板。使用原生 CSS 和本地 SVG 实现，波浪是静态装饰。目录为普通锚点链接，暂未实现 E2 的 sticky / scroll spy。

页头图片通过 `appearance.cover` 显式配置；留空时使用渐变背景，布局仍可用。示例站使用仓库已有的本地图片，正文封面也显式指定，不依赖随机图片服务。文章没有封面时仍显示完整文本卡片。

```yaml
appearance:
  theme: auto
  cover: /assets/banner.jpg # 文件放在博客 source/assets/banner.jpg
```

保留 `alternate` 作为页头展示名，以及 `sidebar.avatar` / `images` 作为头像路径配置；后续 B6 调整字段时会提供迁移说明。

## 配置和内容

- 旧 `menu` 中的 `路径 || 图标` 暂时兼容，嵌套菜单展开为普通导航。也接受 `navigation.menu` 下的 `{ name, url }` 列表；配置结构统一在 B6 完成。
- 封面仅使用文章显式设置的字符串 `cover`；不再随机挑选 `_images.yml` 或 `_data/images.yml` 图片。文章不设置封面也可正常展示。
- 旧 `_data/colors.styl`、`custom.styl`、`iconfont.styl` 不再生效。修改 `src/styles/` 并重新构建资源；自定义入口的正式设计待后续完成。
- 外部链接保留真实 `href`，图片保留真实 `src`，不再依赖旧 JS 解码和懒加载。友情链接标签保留为普通链接卡片。
- `{% media audio/video %}` 中的播放列表以可访问的链接列表展示，不再加载第三方播放器。单个媒体也可以改为标准 HTML `audio` / `video` 标签，并设置 `controls`、`preload="none"`。
- 旧定制 Markdown renderer 仍在使用，因此旧示例文档描述的全部功能不等于当前主题支持范围。标签页内容暂按顺序展示、公式暂用 renderer 的 MathML；交互图表、灯箱等不属于当前迁移验收。B5 将盘点并替换旧语法。
- Nunjucks 默认转义标题和配置文本；只有文章渲染结果、受控资源标签和分页 HTML 标记为安全输出。博客作者仍应自行审核写入 Markdown 的原始 HTML。

## 下一步

B5 替换定制 Markdown renderer，随后 B6 精简配置；完整排版、SEO、可访问性和性能预算继续按 [TODO](TODO.md) 验收。
