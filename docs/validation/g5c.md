# G5c：线上 Demo 与文档中心验收

日期：2026-09-23。目标：[hexo.syutoi.com](https://hexo.syutoi.com/)。只读请求与浏览器检查，没有登录、提交表单、推送、部署或更改 DNS。

## HTTP 与内容

使用 `toolbox/check-online.mjs`，最终 58 次请求、213 项检查通过。原始请求的状态、最终 URL、MIME、字节数与 SHA-256，以及检查列表保存在 [HTTP 记录](g5c-online.json)。

- 20 个主要页面涵盖首页、文档首页、示例入口、Markdown 扩展、欢迎文章、长文、友链、归档、分类、标签、404 文件，以及八篇使用指南。
- 每页 HTTP 200、HTML MIME 和 main 内容均正确；canonical 与 Open Graph URL 一致，生产域名正确。
- 所有文档站内链接与片段目标通过；页面引用的同源脚本、样式及图片返回正常状态和相应 MIME。
- 线上核心 `syutoi.min.js` / `syutoi.min.css` 与当前本地预构建文件逐字节一致。
- RSS、Atom、Sitemap 通过严格 XML 解析，JSON Feed 包含文章且使用生产站点 URL；Sitemap 的地址实际可访问。
- `/404.html` 文件可直接访问并标记 noindex；随机不存在的路由返回真正的 HTTP 404，并使用主题错误页，未退回 HTTP 200 首页。

部分 canonical 使用 `/index.html`，与目录 URL 是等价页面；检查同时接受这两种写法，并请求 canonical 指向的实际地址。JSON Feed 首页 URL 省略末尾斜杠也按同一 URL 处理。这两项不判为站点故障。

首轮有数次 curl TLS 连接中断。工具改为两路并发、有限重试后进行完整复验；本报告记录最终通过轮次，不宣称网络永远稳定。首轮原始数据留在本机 `/tmp/syutoi-online-Hwt0hO/report.json`，最终响应正文位于 `/tmp/syutoi-online-EiEvrp/`。

## 浏览器

Chrome 151.0.7922.108，通过 Puppeteer 5.5.0 对生产站点验证：[浏览器记录](g5c-browser.json)。

- 首页、文档首页、Markdown 扩展示例，1440/390px 与 light/dark，共 12 组无页面横向溢出，main 内容可见。
- 五种提示块均存在，图片实际加载成功，扩展示例头像显示宽度为 100px。
- 禁用 JavaScript 后，能从文档首页点击进入快速开始页面。
- 没有捕获到页面脚本异常；外站请求在浏览器专项检查中阻断，不依赖外部友链图片完成验证。

可手动复查上述三页：切换桌面与手机宽度、系统浅深模式，查看图片与提示块，再关闭 JavaScript 从文档首页进入指南。该浏览器抽查不代替既有完整功能矩阵。

## 范围

当前部署包含木色、田园配图、文档中心和 Markdown 扩展。资源哈希一致不等于确认完整站点的 Git commit，部署没有公开构建版本标记；本次新提交的 G5a 文档调整与验收工具没有通过本次操作发布。

第三方友链头像不在同源资产验收范围内，报告列出该外部 URL。没有重测 Lighthouse、真实用户性能、完整 WCAG 或其他浏览器；下一阶段 G5d 为新素材和当前内容集建立性能基线。G5 总任务仍未完成。
