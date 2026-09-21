# F1 本地搜索接入决策

2026-09-21。采用固定 Pagefind 1.5.2，默认 `search.provider: none`，首个可选 provider 为 `pagefind`。不接入 Algolia 或远端搜索服务，不改变已打标签的 0.2.0；本批记录于 Unreleased。

## 生命周期选择

[Pagefind Node API](https://pagefind.app/docs/node-api/) 支持虚拟记录及内存输出；[CLI](https://pagefind.app/docs/running-pagefind/) 通常在静态站点写出后扫描目录。本项目采用 Node API，在 Hexo generator 内从 locals 的文章/Page 构建记录，调用 addCustomRecord/getFiles，再将结果交给 Hexo route。无需扫描可能尚未更新的 public，无须用户改写 hexo generate/server/deploy 命令。

隔离 Hexo 测试确认 after_generate 时索引已存在于内存路由，而 public 尚无文件；重新生成时正文变化产生新分片，删除内容移除旧分片，全局关闭移除搜索页和全部索引路由。开发预览和静态生成共用同一条路径。每轮完整重建索引，串行管理 Pagefind service 并在 finally 关闭；没有增量索引或大站点构建速度承诺。

## Provider 边界

构建侧 `lib/search.cjs` 的 `searchProviders` 接收规范化记录和索引语言，返回 `{path, data}` 路由数组；客户端 `src/client/search/provider.ts` 提供 `search(query)`、延迟解析结果的 `data()` 和失败后的 `reset()`。界面依赖规范化的 URL、标题和纯文本摘要，不直接依赖 Pagefind 的结果结构。当前只注册 pagefind；none 不建索引、不生成搜索页、不输出搜索入口，未知名称回退 none。

只索引文章与独立 Page 的标题和渲染后正文，含代码文本；不抓取页头、侧栏、页脚、归档与列表。排除草稿、未到发布日期的文章（future 未开启时）、password 内容、search: false；剔除正文 script/style/template/SVG、hidden/aria-hidden 和代码行号。输出路径来自 Hexo 本地 path 和 URL helper，保留部署 root。保留 `/search/` 和 `/_syutoi/search/`，与已有文章/Page 冲突时报错，避免覆盖。

按站点首选语言建立一个全站索引，包含不同页面语言的内容。Pagefind 支持[单一语言索引及中日韩分词](https://pagefind.app/docs/multilingual/)，实际中文/英文命中见验收。索引语言不随当前结果页面语言拆分；未实现跨语言翻译、简繁自动转换或可切换的语言过滤。

## 交互与依赖

使用独立搜索页面和原生导航链接，沿用现有卡片、配色和版式。仅该页面加载独立 JS/CSS；首次非空提交才请求 manifest、Pagefind 模块、Worker/WASM 和按需分片。每批展示 10 条；更多结果后聚焦第一条新增链接。加载、空结果、错误和重试提供三语言文案；清空或修改查询后忽略旧响应，中文输入法组合输入期间不提交。

无 JS 或入口脚本失败时，禁用的表单不会误提交查询，归档链接仍可浏览。查询不写入 URL、localStorage 或第三方服务；搜索索引是公开静态资源，search: false 只退出搜索，不是页面访问控制。模块/索引失败显示错误，可再次提交重试；超时为 15 秒。

Pagefind 是构建生产依赖，包含平台原生二进制；即使关闭搜索，正常安装仍会安装这个包，但不会启动它或让浏览器请求索引。不要在启用搜索的构建中省略 Pagefind 的平台 optional dependencies。构建失败直接报错，不用不完整的索引冒充成功。分发许可证见 `source/js/pagefind.LICENSE.txt`。浏览器只采用引擎 API，不加载 Pagefind 的预制 UI、样式或高亮插件。

## 固定版本的错误处理适配

真实 WASM 故障测试发现 Pagefind 1.5.2 构造函数调用异步 init 却未消费其 rejection：即使搜索 Promise 已被界面捕获，Worker 仍额外报告未处理异常。生成器对 pagefind.js/pagefind-worker.js 中这一处初始化调用补上 catch；原库已保存的 initError 仍通过 search/getPtr 拒绝，不吞掉搜索失败。每个文件必须恰好匹配一次，否则构建报错，要求升级依赖时重新评估，不能静默套用补丁。MIT 许可证保留，生成文件加上适配注释。

完整结果与未测范围见 [F1 验收](../validation/f1.md)。
