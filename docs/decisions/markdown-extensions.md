# Markdown 写作扩展

## 决策

保留 hexo-renderer-markdown-it 7.1.1 / Markdown-it 13，提供可选图片尺寸属性与 GitHub 风格提示块，不另建 renderer。

- 图片：使用 renderer 已提供的 markdown-it-attrs，白名单 width/height。
- 提示块：固定 @mdit/plugin-alert 0.7.4，其 peer 依赖匹配 Markdown-it 13，提供 CommonJS 导出。新版本 2.0.1 要求 Node >=22，0.23.2 要求 Markdown-it 14；不为此提升项目运行要求或强制替换 renderer 的依赖。
- `lib/markdown-alerts.cjs` 仅把命名导出转换为 Hexo 可加载的插件函数，固定顶层与五种类型，并转义可配置标题；不维护语法解析器。
- 样式在主题内构建，不引入插件 CSS 的全局配色或运行时脚本。

@mdit 的版本固定是一项兼容性选择，不代表使用最新版本。将来升级 Hexo renderer 时一并评估插件版本，保留作者语法与行为测试。markdown-it-github-alerts 候选的嵌套闭合和转义处理未满足本次需求，未引入。

## 维护与验证

图片属性不等于强制布局，也不承诺通用 attrs 样式。规则与安装配置统一见 writing.md。验证涵盖真实 Hexo 插件加载、子目录 URL、尺寸及图注、属性白名单、转义与代码、五种类型、普通嵌套引用和关闭插件。浏览器检查桌面/手机明暗模式、图片尺寸以及无 JS 阅读。

此次子目录回归发现 renderer 与主题图片增强都加入 root 的情况；图片增强沿用灯箱的路径判断，避免 `/blog/blog/`，同时继续处理原生 HTML 中的站点图片。
