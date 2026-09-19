# 界面语言与翻译覆盖

核心界面维护 `zh-CN`、`zh-TW`、`en` 三套同名键。`ja`、`zh-HK` 暂保留历史翻译，缺失的新键按下述规则回退；本阶段不承诺这两种语言完整本地化。播放器、搜索、打赏等已移除功能的文案不再保留在三套核心语言文件中。

站点 `_config.yml` 可以写 `language: zh-CN`，也可以写有优先顺序的列表：

```yaml
language:
  - zh-CN
  - en
```

文章或 Page 的 `lang`（也兼容 Hexo 的 `language` 字段）优先；语言目录路由继续由 Hexo 识别。语言标记统一大小写和分隔符，例如 `zh_CN` → `zh-CN`。`zh-Hans` 使用简体文案，`zh-Hant` 使用繁体文案，`en-US` 使用英文文案；HTML 的 lang 保留规范化后的内容语言。

翻译按单页语言、站点语言列表、英文的顺序逐键回退。不支持的内容语言仍保留在 HTML lang 中；缺失语言不会随机使用其他已加载的语言。没有有效语言设置时使用英文。旧的 `default.yml` 占位字符串已移除，由显式英文回退替代。

导航 `name: menu.home` 等内置键跟随页面语言，`menu.friends` 表示友链。自定义导航名称、作者名、分类标签名称及正文均按原文显示。Hexo、Syutoi、RSS、Atom、JSON Feed 等产品或协议名称无需翻译。

## 自定义文案

在博客 `source/_data/languages.yml` 中覆盖实际翻译表的键，无需修改主题文件。例如：

```yaml
en:
  menu:
    home: Start here
  desk:
    rss: Subscribe via RSS
zh-CN:
  desk:
    rss: 订阅更新
zh-TW:
  menu:
    home: 回到首頁
```

`zh-Hant` 页面使用 `zh-TW` 翻译，因此应覆盖 `zh-TW`；`en-US` 同理覆盖 `en`。翻译值按纯文本处理，模板会转义 HTML。带 `%s` 的标题键必须保留占位符；`post.copyright.link` 包含标签后的标点，可一并修改。

修改后重新构建。`pnpm test` 检查三套核心键一致、模板使用的键存在，并通过真实 Hexo 生成验证语言列表、页面覆盖、自定义文案和回退行为。
