# E4a 可选灯箱验收

日期：2026-09-21。固定 PhotoSwipe 5.4.4（MIT），只作为构建开发依赖；版权及许可证随 `source/js/photoswipe.LICENSE.txt` 分发。默认关闭，不改变既有页头、波浪、卡片和侧栏，也不修改示例站的默认配置。

## 实现与 E4 差异

`lightbox.enable: true` 开启文章/Page 正文图片增强，单篇 `lightbox: false` 退出。HTML 生成时先检查图片资格，只有合格正文才输出独立 `lightbox.min.js`。关闭、无图、只有不支持的图片时均不输出入口、CSS、核心或增强数据。首次点击才加载本地 `photoswipe.min.js` 和 `lightbox.min.css`；原生链接作为无 JS 与失败回退。

接入层直接使用 PhotoSwipe Core，省去 E4 隔离原型的 Lightbox 包装层：自己处理加载 Promise、样式就绪、尺寸、事件修饰键、严格焦点循环与背景 inert。E4 中失败的 Tab 循环和模块失败回退已在真实 Hexo 页面复测；旧报告保留为历史证据。

普通图使用 naturalWidth/naturalHeight；缩略图的显示 width/height 不用于推断原图。不同原图链接要求显式 `data-lightbox-width/height`。未知尺寸只探测被点击的原图，10 秒超时后恢复原图导航；不提前探测全部懒加载图。每次打开根据已知尺寸建立组图。picture/srcset、非图片链接、target/download、混排链接保留原生行为。说明只使用图注/alt 的纯文本。

## 自动化与浏览器

环境：Linux、Node 20.19.2、pnpm 9.0.4、Hexo 8.1.2、Puppeteer 5.5.0、Chrome 151.0.7922.108。浏览器工具独立准备，不加入生产依赖。

- `pnpm lint`、`pnpm clean`、`pnpm typecheck`、`pnpm build`、`pnpm test` 通过；50 项测试、19 类页面和 20 个样例入口检查，示例生成 103 个文件。
- 默认预览站回归：176 组页面/视口/深浅检查、66 组无 JS 检查通过；无未捕获脚本异常。报告见 [e4a-regression.json](e4a-regression.json)。
- 真实临时 Hexo `/blog/` 站点：1440/390px × light/dark；比较开启/关闭时图片渲染宽高与整页溢出，检查初始请求以及首次/重复打开的资源请求。
- 普通图、长图、小尺寸显示图、显式原图、图注、picture、损坏图片、已有文章链接、修饰键点击与子目录路径通过。测试发现并修复双重 root 前缀；单元测试覆盖引号中的 `>` 与伪 href 文本，保留原链接属性。
- Tab/Shift+Tab 各 12 次均在灯箱内，背景 inert，方向键切换、Escape/按钮关闭和触发链接焦点返回通过；减少动态效果时禁用过渡。普通动画下过早按 Escape/点击关闭会在开场动画完成后关闭，不再丢失操作。
- 禁用 JS、阻断入口/Core/CSS、返回无效 CSS、点击损坏图片均恢复同一原图 URL，无未捕获页面异常；灯箱中的原图下载失败显示可访问的原生原图链接。重复打开不重复请求 Core/CSS；远处未加载的懒图不因打开灯箱而下载。

原始开关、网络、键盘、失败场景与本机导航耗时记录在 [e4a-browser.json](e4a-browser.json)。重复运行方式见 [开发文档](../development.md#可选灯箱评估)。脚本创建临时站点与 HTTP 服务，退出时清理，不改变博客配置；失败返回非零状态。

## 资源与性能范围

体积以 gzip level 9 统计，包含构建注释；每项独立检查，实际服务器不一定使用 gzip。记录见 [e4a-budget.json](e4a-budget.json)。核心 JS/CSS 内容哈希与 E4 前一致，分别为 2028/5382 bytes gzip。

| 可选资源 | 原始字节 | gzip 字节 | 独立上限 |
| --- | ---: | ---: | ---: |
| lightbox.min.js | 4835 | 2175 | <6000 |
| photoswipe.min.js | 60067 | 17356 | <20000 |
| lightbox.min.css | 4965 | 1628 | <3000 |

首次打开后的三项总计 21159 bytes gzip，不含图片；首次点击前只增加 2175 bytes 入口。

可选入口在启用且有合格图片时加载；Core 与独立 CSS 仅在点击时加载。全局关闭的真实模板测试及单篇关闭/无图浏览器测试均无灯箱资源请求。关闭入口之外，预先构建的可选文件仍存在于发布目录中，不代表浏览器会请求它们。

本次性能验收覆盖资源隔离、包体预算、重复加载、懒图请求和图片布局尺寸；报告中的本机导航/打开耗时仅是单次探针，受缓存、浏览器调度与机器负载影响，不是 Lighthouse 得分或真实用户 INP。本批未重新运行完整 Lighthouse 矩阵，不沿用 D8 得分作为开启灯箱后的指标。

## 未测范围

未测试 Safari/Firefox、真机触摸捏合、多指手势和屏幕阅读器，不能据此宣称完整无障碍验收。静态视口检查使用桌面 Headless Chrome；移动宽度不等于移动设备。远程原图本身的网络可用性、CORS/CDN 策略或 404 无法由灯箱修复。
