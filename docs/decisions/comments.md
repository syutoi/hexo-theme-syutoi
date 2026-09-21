# F2：Comments Slot 与 Waline

评论是默认关闭的独立能力。主题提供容器、启用条件、资源加载和失败提示，Waline 提供评论业务。沿用 PRD §23 的可扩展插槽，不更改现有文章排版。

- `lib/comments.cjs` 负责 URL 校验、页面范围和稳定线程路径；`scripts/helpers/comments.js` 连接 Hexo helper。
- `layout/_partials/comments.njk` 是共享插槽，文章与普通 Page 的 `comments` block 包含它；启用策略同时控制页面的入口 JS/CSS。
- `src/client/comments/types.ts` 定义 `CommentsAdapter.mount(options)` 与实例 `destroy()`。当前注册 `waline`；新增系统应另建 adapter、资源入口和配置白名单，不把业务代码加入核心 `main.ts`。
- `comments.min.js/css` 仅在启用的内容页引用。点击加载后按顺序获取 `waline.min.css/js`，超时为 15 秒，失败移除失败资源并允许重试。重复点击加载期间被阻止；重新加载先销毁旧实例，复用已成功下载的资源。
- 本地锁定 `@waline/client` 3.13.0（MIT），与当前 Node 20.19 基线兼容。评估时最新版 3.15.2 声明 Node >=22，因此本阶段不升级运行时。打包依赖许可证见 `source/js/waline.LICENSE.txt`，包括 Vue 与其他运行时依赖；不从 ShokaX 移植代码。
- 以主题 token 覆盖 Waline 颜色，页面暗色选择器与现有 `data-theme` 一致。禁用客户端额外媒体服务、计数及文章反应；保留 Waline 署名。
- 线程标识来自 Hexo 的 URL helper，包含 root、忽略 index.html。不会从窗口查询参数/锚点计算身份。旧站迁移 permalink/root 时需要自行迁移服务端数据。

只验证本地模拟 API 下的真实客户端、读取、提交及错误恢复，不宣称完成真实 Waline 服务的部署、CORS、鉴权、审核、通知或垃圾过滤验收。示例站保持默认关闭，避免将测试内容发往公开服务。

参考：[Waline API](https://waline.js.org/en/reference/client/api.html)、[Waline props](https://waline.js.org/en/reference/client/props.html)、已安装 npm 包的 package.json、类型声明与源码。
