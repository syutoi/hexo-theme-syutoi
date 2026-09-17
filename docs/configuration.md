# 主题配置

主题默认配置为 111 行（含注释），只列出已经实现的选项，最多三层字段。用户在博客根目录创建 `_config.syutoi.yml`，只写需要覆盖的字段，无需复制整份默认文件。

Hexo 的同名字段覆盖顺序是：主题 `_config.yml` → 博客 `_config.syutoi.yml` → 博客 `_config.yml` 中的 `theme_config`。列表整体替换，不追加；`[]` 表示清空。修改配置后重新启动 `pnpm dev`。

站点的标题、作者、描述、语言、URL、目录、分页、日期、Markdown 和 feed 插件配置仍放在博客 `_config.yml`。主题不会重复提供这些 Hexo 选项。

## 最小配置

博客 `_config.yml`：

```yaml
theme: syutoi
title: 我的书台
author: 你的名字
language: zh-CN
```

无需另写主题配置即可生成页面。默认没有远程封面、社交账号或第三方脚本；未配置头像时显示站点名称的首字母。

## 常用覆盖

```yaml
branding:
  name: 我的书台
  avatar: /images/me.jpg
  favicon: /images/favicon.ico

appearance:
  theme: auto
  cover: /images/banner.jpg

navigation:
  menu:
    - name: menu.home
      url: /
    - name: menu.archives
      url: /archives/
    - name: 关于我
      url: /about/

social:
  - name: GitHub
    url: https://github.com/yourname
  - name: Email
    url: mailto:hello@example.com
```

图片放在博客 `source/images/`。以 `/` 开头的路径会自动加入站点 `root` 前缀，也支持完整 HTTPS URL。`/about/` 等自定义页面需要先创建；示例站导航只是例子，不会自动创建这些页面。

## 字段说明

| 字段 | 默认值 | 行为 |
| --- | --- | --- |
| `branding.name` | 空字符串 | 页头展示名；留空使用站点 title |
| `branding.avatar` | 空字符串 | 作者侧栏头像完整路径；留空显示首字母 |
| `branding.favicon` | `/images/favicon.ico` | 网站图标；空字符串关闭 |
| `appearance.theme` | `auto` | auto / light / dark；读者保存的选择优先 |
| `appearance.cover` | 空字符串 | 固定页头图片；留空使用渐变背景 |
| `navigation.menu` | 首页、归档、分类、标签 | `{ name, url }` 列表；空列表移除菜单链接 |
| `social` | `[]` | `{ name, url }` 列表，显示在作者侧栏；不加载外部图标或组件 |
| `sidebar.enable` | `true` | 显示侧栏；关闭后使用居中的单列布局 |
| `sidebar.statistics` | `true` | 显示文章、分类、标签数量 |
| `sidebar.categories` | `true` | 在非文章页显示顶级分类列表 |
| `sidebar.toc` | `true` | 在文章页显示普通目录链接；尚未提供 scroll spy |
| `footer.since` | 空值 | 起始年份整数；早于当前年份时显示年份区间，否则只显示当前年 |
| `footer.powered` | `true` | 显示 Hexo / Syutoi 标识 |
| `footer.rss` | `true` | 显示页脚 RSS 链接；还需站点 feed.rss.enable 为 true |

`footer.rss` 只控制页脚；作者侧栏的 RSS 链接跟随站点 feed 开关。关闭整个侧栏也会隐藏其中的社交链接。文章封面仍由文章 Front Matter 的 `cover` 决定，不使用页头封面作为随机回退。

导航 `name` 以 `menu.` 开头时查找语言文件，如 `menu.home`；找不到翻译时显示后缀。其他名称按字面显示。社交名称始终按字面显示。标签文本默认 HTML 转义。

布尔值使用真正的 YAML `false` / `true`，不是带引号的字符串。未知模式回退 auto；错误类型的布尔值使用默认值；缺少名称、非法 URL、非对象的链接条目会被忽略。链接支持站内路径、HTTP(S)、mailto；图片只允许站内路径或 HTTP(S)，不接受 javascript/data 等协议。

## 旧配置兼容

| 旧字段 | 新字段 |
| --- | --- |
| `alternate` | `branding.name` |
| `sidebar.avatar` + `images` | `branding.avatar` 完整路径 |
| `darkmode: true/false` | `appearance.theme: dark/auto` |
| `menu` 映射及 `路径 || 图标` | `navigation.menu` 列表；旧嵌套菜单展开，忽略分组 default |
| `social` 映射及 `URL || 图标 || 颜色` | `social` 列表；旧图标和颜色不再读取 |

站点的旧字段不会被新版主题默认值遮住；站点覆盖配置中同时存在新字段和旧别名时，新字段优先，包括空字符串与空列表。建议逐步改用新字段，不再向旧配置添加功能。

旧 CDN、Iconfont、Google Fonts、加载动画、烟花、播放器、评论、搜索、打赏、统计脚本、Quicklink、Base64 链接、随机图等字段已从默认配置删除，在本版本没有效果。它们不会仅因为旧配置还在就发起外部请求。详细范围见 [迁移说明](migration-from-shoka.md)。
