# E4 可选图片灯箱评估

后续状态：E4a 已实现本文选定方案，见 [实际配置](../configuration.md#可选图片灯箱) 与 [验收结果](../validation/e4a.md)。下文保留 E4 评估当时的原型数据和未通过项；“尚未实现”均指评估批次。

日期：2026-09-21。结论：将 PhotoSwipe 5.4.4 选为后续接入候选，使用独立本地资源、默认关闭；必须先补齐失败回退和焦点约束，再接入主题。当前完成的是 E4 的评估与隔离原型，**主题还没有灯箱开关或功能**，不可把下文的设计键直接当作已支持配置。

依据 PRD §21，灯箱是可选增强；§53 明确不将 Fancybox 等功能纳入 v0.1。当前仓库的图片、图注、原生懒加载和链接继续工作，本批不改变默认阅读界面，不安装主题生产依赖。

## 方案比较

| 方案 | 优点 | 成本 / 约束 | 决策 |
| --- | --- | --- | --- |
| 保持原生图片链接 | 无灯箱脚本；无 JS 可查看原图 | 没有覆盖层、组图切换和缩放控件 | 始终保留为回退 |
| 自建原生 dialog 查看器 | 不需第三方库；showModal 提供模态背景及焦点基础 | 缩放、拖动、组图、图片失败、移动手势和可访问性细节仍需维护；没有实测包体 | 作为单图简化方案备选 |
| PhotoSwipe 5.4.4 | MIT；Lightbox/Core 分离，支持延迟核心加载、图片缩放和切换 | 需要正确图片尺寸；原型暴露失败回退与严格焦点循环缺口 | 首选候选，补齐适配后再接入 |
| Fancybox | 面向图片及更多媒体的查看器 | 当前需求只覆盖图片，许可与分发条件需另行评估；未测包体 | 不作为首个实现 |

以上为项目选择，而非库的通用排名。PhotoSwipe 的 MIT 标记见 [官方主页](https://photoswipe.com/) 及实测 npm 包 LICENSE；分块加载、图片尺寸与渐进增强要求见 [官方入门文档](https://photoswipe.com/getting-started/)。原生模态行为见 [MDN dialog](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/dialog)；Fancybox 当前许可信息见 [官方许可页面](https://fancyapps.com/pricing/)。没有基于旧 Shoka 捆绑版本推断当前许可证。

## 隔离原型与体积

使用 npm 固定版本 5.4.4 的已发布 minified ESM，CSS 经本仓库 esbuild 压缩，gzip level 9，单位为字节。原型文件位于临时目录，不进入主题 bundle；数字不包含适配代码和图片。

| 资源 | 原始字节 | gzip 字节 |
| --- | ---: | ---: |
| photoswipe-lightbox.esm.min.js | 14338 | 4467 |
| photoswipe.esm.min.js | 54270 | 16447 |
| photoswipe.css（压缩后） | 4617 | 1460 |
| 合计 | 73225 | 22374 |

隔离原型中的启用页面加载 Lightbox/CSS，首次打开才请求 Core；关闭页面不输出相关标签，0 个可选资源请求。主题核心 JS/CSS 仍为 2028/5382 bytes gzip，本次没有变化。不能将候选总大小当作未来适配后的最终体积，也不能将离线 gzip 当作当前服务器已开启 HTTP 压缩。

浏览器为 Linux Headless Chrome 151.0.7922.108，Node 20.19.2、已有 Puppeteer 5.5.0，1440/390px。原型使用 `/blog/` 子路径与两张本地 SVG，来源为仓库的宽图/长图样例。原始记录见 [e4-probe.json](../validation/e4-probe.json)。

| 原型检查 | 实际结果 |
| --- | --- |
| 关闭时请求、原图链接 | 两档宽度均无灯箱 JS/CSS 请求，Enter 可导航原图 |
| 启用时核心延迟加载 | 首次点击前无 Core 请求，打开后请求一次 |
| 图片切换 / Escape / 焦点返回 | 方向键切换与 Escape 关闭通过，返回原图片链接 |
| reduced-motion | 测试显式设置 reduce，原型将开关动画设为 none；未量化其他动画或手势 |
| Tab 严格循环 | 两档宽度均未通过：序列中有 activeElement 为 body 的步骤，需接入层补齐并复测 |
| 无 JS | 启用页仍可通过原生链接打开图片；其可选 CSS 仍加载，不宣称无 JS 时所有资源都为零 |
| Core 下载被拦截 | 原型停留在原页面，出现动态 import 错误，没有恢复原图导航；需适配层明确处理 |
| 当前真实主题 `/pictures/` | 未集成灯箱，没有灯箱资源请求；这不是已实现配置开关的测试 |

焦点循环和失败下载是实测未通过项，不是可以忽略的警告。原型脚本会记录这些候选缺口而正常输出报告，不能用退出码 0 表示所有验收通过。触摸捏合、Safari/Firefox、真机、屏幕阅读器和完整无障碍没有测试。

## 后续 E4a 接入边界

计划接口为 `lightbox.enable: false`，单篇 `lightbox: false` 只负责退出增强，全局 false 优先；**本批尚未实现这些键**。只作用于文章与独立 Page 的正文图片，不处理页头、头像、列表封面、代码内容或非图片链接。

资源应在模板与构建层隔离：独立入口及独立 CSS，不从 `src/client/main.ts` 或核心 CSS 导入；关闭时不输出灯箱入口、样式、预加载标签或相关数据，不仅是在已下载的代码里提前 return。开启但没有合格图片的页面也不应加载资源。沿用主题 URL helper 适配子目录，保留依赖许可证，不使用 CDN 或预取远程图片探测尺寸。

图片资格需要明确：

- 现有链接如果指向文章、外站页面或其他媒体，保留 href/target/download 等语义，不劫持为灯箱。
- 独立图片可增强为原生原图链接；关闭时不改写正文。无 JS、模块或样式加载失败时仍可访问同一图片。
- 目标图尺寸必须匹配真正打开的资源。不能把缩略图 width/height 当作不同原图的尺寸，不能将图片的 CSS 显示尺寸当作固有尺寸。
- 对无尺寸图片、picture/srcset 或不同原图链接，需要显式尺寸或可靠加载后的目标尺寸；未知、失效或不支持的情况保持原生行为。不得为准备灯箱而提前下载所有懒加载图片。
- 沿用 alt 和可见 figcaption；灯箱内若展示说明，用纯文本或受控节点，不把作者属性直接当 HTML 插入。不凭灯箱支持“caption”就声称屏幕阅读器已验收。

接入前须补齐：可见关闭控件与本地化名称；背景不可操作、严格 Tab/Shift+Tab 循环、Escape 及焦点返回；reduced-motion；导入/样式/图片失败反馈与原图回退；Ctrl/Cmd/Shift 等修饰点击的原生语义。先做图片查看，不顺带加入视频、历史 hash 路由、评论或自动播放。

## E4a 验收门槛

1. 默认/全局关闭/单篇关闭/无图片：生成 HTML 无可选资源，实际网络请求为零，核心 bundle 不含候选库。
2. 启用与重复开关：核心延迟加载，资源不重复；原图、长图、小图、图注、picture、失效图、已有链接和子目录分别验证。
3. 阻断 JS/CSS/Core/图片及禁用 JS：保持内容可读和原生链接可用，处理失败不依赖未捕获异常。
4. 桌面/手机、深浅、键盘、严格焦点约束和 reduced-motion；触摸和多浏览器的实测范围另行记录。
5. 独立记录可选资源大小，不隐藏在核心体积预算中；重新检查开启和关闭两种状态的性能及布局。

## 重复运行评估

不向主题安装 PhotoSwipe。在临时目录准备候选包，先启动主题的 `pnpm dev`：

```bash
mkdir -p /tmp/syutoi-e4
npm pack photoswipe@5.4.4 --pack-destination /tmp/syutoi-e4
tar -xzf /tmp/syutoi-e4/photoswipe-5.4.4.tgz -C /tmp/syutoi-e4
export SYUTOI_PHOTOSWIPE_DIR=/tmp/syutoi-e4/package
export SYUTOI_PUPPETEER_PATH=/absolute/path/to/installed/puppeteer
export SYUTOI_CHROME=/usr/bin/google-chrome
export SYUTOI_PREVIEW_URL=http://127.0.0.1:4000
export SYUTOI_BROWSER_OUTPUT=/tmp/syutoi-e4-probe
node toolbox/evaluate-lightbox.mjs
```

脚本临时启动本机 HTTP 服务，退出时关闭，不修改主题或示例站配置。输出报告和两张截图；没有提供预览地址时只测隔离原型。已有报告可能保留在输出目录中，判断本次结果应同时核对命令退出状态和 finished 时间。更换候选版本前需重新评估 API、许可、包体与上述失败场景。
