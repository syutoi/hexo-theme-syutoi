# hexo-theme-syutoi 产品需求文档

> **项目名称：** hexo-theme-syutoi  
> **品牌名称：** Syutoi（书台 / 書枱）  
> **项目阶段：** v0.1 / MVP  
> **目标版本：** Syutoi for Hexo 1.0  
> **项目类型：** 开源 Hexo 主题  
> **建议许可证：** MIT  
> **产品定位：** 面向写作者、开发者和长期博客用户的现代 Hexo 主题  
> **核心理念：** A place to write, read and think.

---

# 1. 项目背景

Shoka 是一款具有鲜明设计风格的 Hexo 主题，其特点并不只是视觉效果，而是围绕博客、笔记和长文阅读形成了一套相对完整的体验。

但原版 Shoka 已长期缺乏维护，工程结构、前端依赖、第三方服务集成和主题配置均存在明显的时代痕迹。

其主题配置已经同时承载：

- 深色模式
- 字体
- 导航
- Social Links
- Sidebar
- 随机文章
- 最近评论
- 打赏
- Tag Cloud
- 评论系统
- 音乐播放器
- Algolia
- Quicklink
- Analytics
- SEO
- CDN Vendor

等大量功能，导致配置和代码的边界逐渐模糊。

ShokaX 在此基础上继续维护，并进行了 TypeScript、esbuild、模块拆分、Pagefind、Waline、Twikoo 等现代化改造，但它已经形成自己的技术路线和许可证体系。

Syutoi 不定位为 Shoka 的简单 Fork，也不定位为 ShokaX 的替代版本。

Syutoi 的目标是：

> **重新思考 Shoka 所代表的博客体验，以现代 Web 工程方式构建一个更加简洁、稳定、快速、易维护的 Hexo Theme。**

---

# 2. 品牌理念

Syutoi 来源于粤语「书台 / 書枱」。

如果 Shoka 的「书架」代表：

> 收藏、整理和沉淀知识。

那么 Syutoi 的「书台」代表：

> 阅读、思考、写作和创造知识。

Syutoi 希望给用户的不是一个功能繁复的博客 Dashboard，而是一张安静的数字书台。

品牌关键词：

- Calm
- Focused
- Thoughtful
- Minimal
- Open
- Lasting

核心品牌语：

> **A place to write, read and think.**

---

# 3. 产品愿景

Syutoi 长期不是单纯的 Hexo Theme，而是一套面向：

- Writing
- Reading
- Publishing

的设计语言。

Hexo Theme 是第一个官方实现。

长期产品关系可能演进为：

```text
Syutoi
│
├── Design System
│
├── Theme
│   ├── Hexo
│   ├── Astro
│   ├── Hugo
│   └── WordPress
│
├── Desk
│
├── Publish
│
└── Cloud
```

但 **hexo-theme-syutoi v1.0 不承担这些未来需求**。

第一阶段唯一目标：

> 做好一个真正值得长期使用的现代 Hexo Theme。

---

# 4. 产品目标

## 4.1 核心目标

Syutoi v1.0 应做到：

1. 提供优秀的中文、英文及中英文混排阅读体验。
2. 提供干净、现代、稳定的博客界面。
3. 保留 Shoka 最有价值的博客体验。
4. 显著降低主题 JS、第三方脚本和依赖复杂度。
5. 使用现代前端工程体系重新实现。
6. 提供可靠的 Light / Dark Mode。
7. 良好支持桌面、平板和移动设备。
8. 保持配置简单。
9. 保持内容和主题低耦合。
10. 为未来 Astro / Hugo 等实现保留可移植的 Design Tokens 与 Article Style。

---

# 5. 非目标

v1.0 **明确不追求：**

- 成为功能最多的 Hexo Theme；
- 完全兼容 Shoka 所有配置；
- 完全兼容 ShokaX；
- 内置音乐播放器；
- 鼠标烟花；
- 大量页面切换动画；
- 二次元背景图系统；
- 随机图片 API；
- 复杂 PJAX Hack；
- 主题内部绑定某一种评论系统；
- 主题内部绑定某一种统计系统；
- 自建 Markdown Renderer；
- AI 摘要；
- PWA；
- 多套完全不同的页面布局；
- 可视化 Theme Builder。

原则：

> **先把主题做好，再扩展功能。**

---

# 6. 目标用户

## 6.1 核心用户

### A. 技术博客作者

特征：

- 开发者
- 工程师
- 开源作者
- Markdown 重度用户

关注：

- Markdown
- Code Block
- TOC
- KaTeX
- Mermaid
- SEO
- Git 工作流

---

### B. 长期写作者

关注：

- Typography
- 长文阅读
- 归档
- 分类
- 标签
- 系列文章
- RSS
- 内容长期可维护性

---

### C. Shoka 用户

典型诉求：

> 喜欢 Shoka 的设计，但希望获得更加现代、轻量和持续维护的版本。

Syutoi 应尽可能降低这类用户的迁移成本，但：

> **兼容 Shoka 内容 > 兼容 Shoka 配置。**

---

# 7. 产品原则

## 7.1 Reading First

任何视觉设计都首先服务文章阅读。

优先级：

```text
Content
>
Typography
>
Navigation
>
Decoration
>
Animation
```

---

## 7.2 Content Is Portable

用户文章不应该因为使用 Syutoi 而被主题锁定。

尽量避免：

```markdown
{% syutoi_magic_tag %}
...
{% endsyutoi_magic_tag %}
```

这类 Theme-specific 内容。

如果未来需要扩展 Markdown，应优先采用通用格式。

---

## 7.3 Progressive Enhancement

网站在 JavaScript 未加载时仍应：

- 可以阅读文章；
- 可以访问导航；
- 可以访问归档；
- 可以访问标签；
- 可以访问分类。

JavaScript 负责增强体验，而不是维持基本功能。

---

## 7.4 Minimal Dependencies

能用浏览器原生能力完成的功能，不增加依赖。

优先：

```text
HTML
CSS
Vanilla TypeScript
```

其次才考虑第三方库。

---

## 7.5 Framework Agnostic Design

Syutoi 的：

- Colors
- Typography
- Spacing
- Article Style
- Icons
- Design Tokens

不应依赖 Hexo。

未来应能够迁移到：

- Astro
- Hugo
- WordPress
- Docusaurus

---

# 8. 技术基线

## Hexo

最低：

```text
Hexo >= 8.0
```

## Node.js

最低：

```text
Node.js >= 20.19
```

Hexo 8 官方目前要求 Node.js ≥ 20.19。

## Package Manager

开发环境：

```text
pnpm
```

用户不强制使用 pnpm。

## Template

```text
Nunjucks
```

原因：

- Hexo 原生支持；
- Shoka 已使用；
- 学习成本低；
- 无需额外 runtime；
- 模板表达能力足够。

## Client

```text
TypeScript
```

## Build

```text
esbuild
```

## CSS

```text
CSS
+
CSS Custom Properties
+
PostCSS
```

第一版：

**不使用 Stylus。**

## JS Framework

v1：

```text
None
```

不引入：

- React
- Vue
- Svelte

主题核心交互全部使用 Vanilla TypeScript。

---

# 9. 总体技术架构

建议：

```text
hexo-theme-syutoi/
│
├── layout/
│
├── scripts/
│
├── languages/
│
├── source/
│
├── src/
│   ├── client/
│   ├── styles/
│   ├── icons/
│   └── shared/
│
├── toolbox/
│
├── example/
│
├── test/
│
├── _config.yml
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
└── CHANGELOG.md
```

Hexo 官方主题本身仍遵循：

```text
_config.yml
languages/
layout/
scripts/
source/
```

的结构，因此 Syutoi 不应破坏 Hexo 的标准主题模型。

`src/` 仅属于开发阶段源代码。

---

# 10. 前端架构

建议：

```text
src/client/
├── main.ts
├── theme.ts
├── navigation.ts
├── toc.ts
├── code.ts
├── image.ts
├── search.ts
└── scroll.ts
```

禁止：

```text
app.ts
10000 lines
```

每个模块遵循：

> 一个模块解决一个清晰问题。

---

# 11. CSS 架构

建议：

```text
src/styles/
├── tokens.css
│
├── base/
│   ├── reset.css
│   ├── typography.css
│   └── global.css
│
├── components/
│   ├── header.css
│   ├── footer.css
│   ├── toc.css
│   ├── card.css
│   ├── code.css
│   └── search.css
│
├── layouts/
│   ├── home.css
│   ├── post.css
│   ├── archive.css
│   └── page.css
│
├── markdown/
│   ├── article.css
│   ├── table.css
│   ├── quote.css
│   └── code.css
│
└── themes/
    ├── light.css
    └── dark.css
```

---

# 12. Design Tokens

第一版即建立 Design Tokens。

例如：

```css
:root {
  --syutoi-color-bg: #f8f6f2;
  --syutoi-color-surface: #ffffff;

  --syutoi-color-text: #242321;
  --syutoi-color-text-secondary: #74716d;

  --syutoi-color-border: #e4e0da;

  --syutoi-color-primary: #8c8176;

  --syutoi-content-width: 720px;
  --syutoi-layout-width: 1200px;

  --syutoi-radius-sm: 6px;
  --syutoi-radius-md: 10px;

  --syutoi-space-1: 0.25rem;
  --syutoi-space-2: 0.5rem;
  --syutoi-space-3: 1rem;
  --syutoi-space-4: 1.5rem;
  --syutoi-space-5: 2rem;
}
```

以后 Astro / Hugo / WordPress 可以复用这些设计规范。

---

# 13. 页面信息架构

v1 支持以下核心页面。

## 首页

```text
/
```

展示：

- Site Identity
- Navigation
- Post List
- Pagination
- Footer

文章卡片至少显示：

- 标题
- 日期
- 摘要
- 分类
- 标签（可选）
- 封面（可选）

---

## 文章

```text
/post/
```

包含：

- 标题
- 发布时间
- 更新时间
- 分类
- 标签
- 正文
- TOC
- 上一篇 / 下一篇
- Copyright
- Comments Slot

可选：

- 阅读时间
- 字数

---

## Page

例如：

```text
/about/
/projects/
/links/
```

---

## Archive

```text
/archives/
```

默认采用：

> 时间轴 / 年份分组

但视觉保持克制。

---

## Category

```text
/categories/
```

和：

```text
/categories/foo/
```

---

## Tag

```text
/tags/
```

和：

```text
/tags/foo/
```

---

## 404

必须提供统一设计。

---

# 14. 首页设计

Syutoi 首页不完全复刻 Shoka。

首页应体现：

> 安静、阅读、作者空间。

桌面端建议：

```text
┌──────────────────────────────┐
│ Logo                  Menu   │
├──────────────────────────────┤
│                              │
│        Site Intro            │
│                              │
├──────────────────────────────┤
│                              │
│ Article                      │
│ Article                      │
│ Article                      │
│                              │
├──────────────────────────────┤
│ Footer                       │
└──────────────────────────────┘
```

v1 避免：

- 大型全屏 Cover 强依赖；
- 自动随机背景；
- 强制 Hero 图片；
- 复杂 Carousel。

封面存在时增强体验。

没有封面时仍应很好看。

---

# 15. Article Typography

这是 Syutoi v1 **最高优先级功能之一**。

目标：

> 即使把导航、动画和所有装饰全部去掉，单看文章本身仍然优秀。

需要重点设计：

- H1–H6
- Paragraph
- Strong
- Em
- Links
- Blockquote
- Lists
- Nested Lists
- Code
- Pre
- Tables
- Images
- Captions
- HR
- Footnotes
- Details
- Keyboard
- Mark

重点优化：

### 中文

- 行高
- 字间距
- 标点
- 中英文混排
- 长段落可读性

### 英文

- Line length
- Font size
- Paragraph rhythm

正文推荐最大宽度：

```text
680–760 px
```

第一版默认建议：

```text
720px
```

---

# 16. 字体系统

原则：

> 系统字体优先，Web Font 可选。

默认不强制请求 Google Fonts。

建议默认：

```css
font-family:
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  "Noto Sans SC",
  sans-serif;
```

正文可提供：

```text
sans
serif
```

两种 Style Preset。

代码：

```text
ui-monospace
SFMono-Regular
Menlo
Monaco
Consolas
```

---

# 17. Dark Mode

必须支持：

```text
light
dark
auto
```

配置：

```yaml
appearance:
  theme: auto
```

行为：

`auto`

读取：

```text
prefers-color-scheme
```

用户手动切换以后：

```text
localStorage
```

记住选择。

要求：

- 无闪屏；
- 页面加载前尽可能确定主题；
- Dark Mode 不是简单反色；
- 图片、代码、引用、边框均单独设计。

---

# 18. Navigation

桌面：

```text
Logo                 Home  Archive  About  Search
```

移动端：

```text
Logo                        Menu
```

要求：

- Accessible
- Keyboard friendly
- 无 JS 时仍可访问主要链接。

---

# 19. TOC

文章目录必须支持：

```text
H2
 ├── H3
 └── H3
H2
```

桌面端：

```text
sticky TOC
```

移动端：

```text
drawer / collapsible
```

JS 负责：

- Scroll spy
- Active heading

不应修改文章内容结构。

---

# 20. Code Block

技术博客核心能力。

必须支持：

- Syntax Highlight
- Language label
- Copy button
- Horizontal scroll
- Line wrapping optional
- Light / Dark

配置：

```yaml
article:
  code:
    copy: true
    language: true
```

第一版不自行开发 Syntax Highlighter。

使用 Hexo Renderer 输出结果。

主题只负责展示。

---

# 21. Image Experience

v1：

支持：

- Responsive image
- Caption
- Lazy loading
- Native aspect ratio

图片灯箱：

建议作为：

```text
optional enhancement
```

优先选择：

- 小型库

或者后续自行实现。

---

# 22. Search

v1 默认：

> Local Search

推荐优先研究：

```text
Pagefind
```

原因：

- 静态；
- 无第三方 SaaS；
- 隐私好；
- 搜索体验现代。

但需要解决构建集成问题。

如果 Pagefind 与 Hexo 生命周期集成复杂：

v0.1 可以暂缓。

正式 v1 至少提供：

```text
search provider interface
```

例如：

```yaml
search:
  provider: local
```

未来：

```text
pagefind
algolia
none
```

---

# 23. Comments

主题本身不直接承担评论业务。

设计一个 Comments Slot：

```text
article
...
comments container
```

v1 可以官方支持：

```text
Waline
```

作为首个 adapter。

但：

```text
comments/
```

架构必须可扩展。

未来可以增加：

```text
Twikoo
Giscus
Utterances
```

原则：

> Theme ≠ Comment System。

---

# 24. SEO

v1 必须生成或支持：

- `<title>`
- description
- canonical
- Open Graph
- Twitter Card
- article metadata

支持：

```text
RSS
Sitemap
```

但 RSS / Sitemap 由 Hexo Plugin 负责。

Syutoi 不重复实现已有成熟插件功能。

---

# 25. Social Links

配置形式不要继续沿用：

```text
url || icon || color
```

这种字符串协议。

改成结构化 YAML：

```yaml
social:
  github:
    url: https://github.com/foo
  email:
    url: mailto:foo@example.com
```

或者：

```yaml
social:
  - type: github
    url: https://github.com/foo

  - type: email
    url: mailto:foo@example.com
```

推荐第二种。

---

# 26. Icon System

不绑定远程 Iconfont。

使用：

> Local SVG icons

建议：

```text
Lucide
```

或自行维护小型 Icon Set。

原则：

- Tree-shakable
- Local
- Accessible
- 无外部请求

---

# 27. Theme Configuration

配置文件应控制在：

> **约 100–150 行以内。**

建议：

```yaml
appearance:

navigation:

home:

article:

sidebar:

search:

comments:

social:

footer:

seo:
```

示例：

```yaml
appearance:
  theme: auto
  color: default
  font: system

navigation:
  menu:
    - name: Home
      url: /
    - name: Archive
      url: /archives/
    - name: About
      url: /about/

home:
  posts_per_page: 10
  cover: true

article:
  toc: true

  code:
    copy: true

  meta:
    date: true
    updated: true
    reading_time: true

search:
  provider: none

comments:
  provider: none

footer:
  since: 2026

social:
  - type: github
    url: https://github.com/example
```

---

# 28. 配置设计原则

禁止：

```yaml
feature:
  enable:
    option:
      suboption:
        more:
```

避免超过三层嵌套。

默认配置应：

> 开箱即用。

用户只需配置：

```yaml
theme: syutoi
```

即可获得完整可用网站。

---

# 29. Shoka Migration

Syutoi 应提供：

```text
docs/migration-from-shoka.md
```

迁移目标：

### 尽可能保留

- Markdown
- Front Matter
- Categories
- Tags
- Cover
- Copyright
- Math

### 不保证兼容

- Shoka private tags
- audio
- quiz
- fireworks
- complex custom tags

迁移原则：

> 内容兼容优先于配置兼容。

---

# 30. Shoka / ShokaX 的继承策略

## 从 Shoka 继承

重点继承：

- Reading-first
- Sidebar / navigation philosophy
- Archive
- Category / Tag
- TOC
- Dark Mode
- Markdown aesthetics

不机械复制：

- Legacy JS
- Stylus structure
- CDN Vendor config
- Fancy animation
- jQuery stack
- Valine binding
- random image dependency

---

## 从 ShokaX 学习

ShokaX 当前已经采用：

- TypeScript
- esbuild
- Hexo 7
- Node 20+
- 模块化构建
- Pagefind
- Waline
- Twikoo

这些方向具有参考价值。

但：

> **Syutoi 不直接复制 ShokaX 源代码。**

主要原因：

1. 架构重新设计；
2. 保持 Syutoi 代码简单；
3. ShokaX 当前为 AGPL-3.0-or-later；
4. Syutoi 计划采用 MIT。

---

# 31. License Strategy

建议：

```text
MIT License
```

Syutoi 如果使用或修改 Shoka 的 MIT 代码，需要保留对应版权声明和 MIT License。

建议仓库：

```text
LICENSE
NOTICE
```

NOTICE 中说明：

```text
Syutoi is inspired by hexo-theme-shoka.

Portions of this project may be derived from
hexo-theme-shoka, originally created by Ruri Shimotsuki.
```

如果某模块完全重写，可以保留项目致谢而无需声称代码来源。

原则：

> 能重写的核心模块尽量重写。

---

# 32. 性能目标

v1 应设置明确 Performance Budget。

参考目标：

## JavaScript

核心 JS：

```text
gzip < 50 KB
```

目标：

```text
< 30 KB
```

不包含用户主动启用的：

- Comment
- Search
- Analytics

---

## CSS

核心 CSS：

```text
gzip < 40 KB
```

---

## External Request

默认：

```text
0 external third-party request
```

除非用户主动开启：

- comments
- analytics
- external font

---

# 33. Web Performance

目标：

桌面和移动网络条件正常情况下：

```text
LCP < 2.5s
CLS < 0.1
INP < 200ms
```

主题开发过程中持续通过：

```text
Lighthouse
```

检查。

---

# 34. Accessibility

v1 要求：

- Semantic HTML
- Keyboard navigation
- Visible focus
- ARIA only when necessary
- Proper heading hierarchy
- Color contrast
- `prefers-reduced-motion`

所有动画必须尊重：

```css
@media (prefers-reduced-motion: reduce)
```

---

# 35. Responsive Breakpoints

原则：

> Content driven，而不是 Device driven。

初始建议：

```text
mobile    < 640
tablet    640–960
desktop   > 960
wide      > 1280
```

但最终由实际 Layout 验证。

---

# 36. Internationalization

v1 至少支持：

```text
zh-CN
zh-TW
en
```

所有 UI 文本不得硬编码。

目录：

```text
languages/
├── default.yml
├── zh-CN.yml
├── zh-TW.yml
└── en.yml
```

---

# 37. Build System

开发代码：

```text
src/
```

执行：

```bash
pnpm build
```

输出：

```text
source/css/
source/js/
```

Build：

```text
TypeScript
     ↓
esbuild
     ↓
minify
     ↓
source/js
```

CSS：

```text
src/styles
     ↓
PostCSS
     ↓
source/css
```

---

# 38. Development Commands

建议：

```bash
pnpm install

pnpm dev

pnpm build

pnpm lint

pnpm typecheck

pnpm test
```

---

# 39. Quality Tooling

建议：

```text
TypeScript
ESLint
Prettier
Stylelint
Vitest
```

不要第一版堆大量工程工具。

核心目标：

> 自动发现真正影响质量的问题。

---

# 40. Testing

## Unit

适合：

- helper
- config parser
- URL
- TOC utilities

---

## Build Test

必须验证：

```bash
hexo clean
hexo generate
```

无错误。

---

## Visual Test

至少人工验证：

```text
Home
Post
Page
Archive
Category
Tag
404
```

以及：

```text
Light
Dark
Mobile
Desktop
```

---

# 41. CI

GitHub Actions：

```text
Install
↓
Typecheck
↓
Lint
↓
Test
↓
Build Theme
↓
Build Example Site
```

Node Matrix 初始：

```text
Node 20
Node latest LTS
```

---

# 42. Example Site

仓库必须提供：

```text
example/
```

用于：

- 开发；
- Regression Test；
- Demo；
- Screenshot。

内容至少包括：

- 中文文章
- 英文文章
- 长文章
- 代码
- 数学公式
- 表格
- 图片
- 引用
- 列表
- 无封面文章
- 有封面文章

---

# 43. Documentation

v1 前必须拥有：

```text
README.md

docs/
├── getting-started.md
├── configuration.md
├── writing.md
├── customization.md
├── deployment.md
└── migration-from-shoka.md
```

README 保持简洁。

详细文档未来发布至：

```text
syutoi.com
```

---

# 44. 安装方式

第一阶段至少支持：

```bash
git clone
```

例如：

```bash
git clone https://github.com/syutoi/hexo-theme-syutoi \
  themes/syutoi
```

随后：

```yaml
theme: syutoi
```

v1.0 建议发布 npm：

```bash
npm install hexo-theme-syutoi
```

是否把 npm 安装作为推荐方式，在实现阶段结合 Hexo Theme Loader 行为验证后决定。

---

# 45. Versioning

采用：

```text
Semantic Versioning
```

例如：

```text
0.1.0
0.2.0
0.9.0
1.0.0
```

规则：

### 0.x

允许快速迭代。

### 1.x

配置 API 开始保持稳定。

---

# 46. Roadmap

## Phase 0 — Foundation

目标：

> 建立工程骨架。

完成：

- Repository
- License
- Build
- TypeScript
- CSS
- Nunjucks
- CI
- Example Site

版本：

```text
0.1.0
```

---

# 47. Phase 1 — Core Layout

完成：

- Header
- Footer
- Home
- Post
- Page
- Archive
- Category
- Tag
- Responsive

版本：

```text
0.2.0
```

---

# 48. Phase 2 — Reading Experience

完成：

- Typography
- Article Style
- Code
- TOC
- Image
- Light/Dark
- Reading Meta

版本：

```text
0.3.0
```

这一阶段是 Syutoi 的核心。

---

# 49. Phase 3 — Blog Essentials

完成：

- Search
- Comments adapter
- Social
- SEO
- Open Graph
- RSS integration
- 404

版本：

```text
0.5.0
```

---

# 50. Phase 4 — Public Beta

完成：

- Configuration cleanup
- Docs
- Migration guide
- Accessibility
- Performance
- Testing
- Demo site

版本：

```text
0.9.0
```

---

# 51. Phase 5 — Stable

```text
Syutoi 1.0
```

要求：

- Stable configuration API
- Complete docs
- Demo site
- npm package
- Hexo theme directory submission
- Migration guide
- Lighthouse target reached
- Mobile experience complete

---

# 52. v0.1 MVP 验收标准

第一版开发不要一次实现整个 PRD。

**真正的 v0.1 只要求：**

### Engineering

- Hexo 8 正常运行
- Node 20+
- pnpm
- TypeScript
- esbuild
- Nunjucks
- CSS Variables
- CI

### Page

- Home
- Post
- Page
- Archive

### UI

- Header
- Footer
- Typography
- Responsive
- Light
- Dark

### Article

- Heading
- Paragraph
- Link
- Quote
- List
- Code
- Image
- Table

### Quality

```bash
pnpm build
```

通过。

```bash
hexo generate
```

通过。

没有第三方 JS 请求。

---

# 53. v0.1 明确不做

第一版不要实现：

- Comments
- Search
- Music
- AI
- PWA
- Fancybox
- Analytics
- Fireworks
- Reward
- Mermaid integration
- Pagefind
- Complex custom tags
- PJAX
- Theme marketplace

这些全部可以之后加入。

---

# 54. 成功判断

Syutoi 1.0 不是以：

> “功能比 Shoka 多”

作为成功指标。

真正指标是：

### 设计

用户看到文章时：

> 愿意继续读。

### 写作

作者看到自己的博客时：

> 愿意继续写。

### 技术

开发者看到代码时：

> 愿意维护。

### 产品

用户安装以后：

> 不需要阅读几十页配置才能正常使用。

---

# 55. 核心产品判断

Syutoi 应始终坚持：

> **Theme is presentation, not platform.**

Hexo 负责：

- Content
- Generate
- Plugin ecosystem

Syutoi 负责：

- Design
- Reading
- Navigation
- Interaction

不要把所有生态能力重新实现一遍。

---

# 56. 第一版推荐目录

最终建议从下面这个结构开始：

```text
hexo-theme-syutoi/
├── .github/
│   └── workflows/
│
├── example/
│
├── languages/
│   ├── default.yml
│   ├── en.yml
│   ├── zh-CN.yml
│   └── zh-TW.yml
│
├── layout/
│   ├── _partials/
│   ├── layout.njk
│   ├── index.njk
│   ├── post.njk
│   ├── page.njk
│   ├── archive.njk
│   ├── category.njk
│   ├── tag.njk
│   └── 404.njk
│
├── scripts/
│   ├── helpers.js
│   └── filters.js
│
├── src/
│   ├── client/
│   │   ├── main.ts
│   │   ├── theme.ts
│   │   ├── navigation.ts
│   │   ├── toc.ts
│   │   └── code.ts
│   │
│   ├── styles/
│   │   ├── tokens.css
│   │   ├── base/
│   │   ├── components/
│   │   ├── layouts/
│   │   └── markdown/
│   │
│   └── icons/
│
├── source/
│   ├── css/
│   ├── js/
│   └── images/
│
├── test/
│
├── toolbox/
│   └── build.mjs
│
├── _config.yml
├── package.json
├── tsconfig.json
├── eslint.config.js
├── README.md
├── CHANGELOG.md
├── NOTICE
└── LICENSE
```

---

# 57. 项目的一句话定义

最终可以将项目介绍定为：

> **Syutoi is a calm, modern Hexo theme for writing, reading and thinking.**

GitHub Description 可以先用：

> **A calm and modern Hexo theme for writing, reading and thinking.**

---

# 58. 最重要的开发原则

整个开发过程中，如果面对两个方案：

```text
A：功能更多
B：代码更简单、体验更稳定
```

默认选择：

```text
B
```

如果面对：

```text
A：更炫
B：更好读
```

默认选择：

```text
B
```

如果面对：

```text
A：绑定 Syutoi
B：内容可移植
```

默认选择：

```text
B
```

Syutoi 最终应该是一张：

> **安静、可靠、可以陪伴用户很多年的数字书台。**