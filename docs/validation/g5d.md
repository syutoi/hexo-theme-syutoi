# G5d：当前视觉与内容的性能基线

日期：2026-09-23。测量提交 `0eac0de`，测量前工作区干净，执行 `pnpm build`。本次不修改图片、模板或运行时代码，不创建 tag、不部署。此前 G5c 的线上验收与本次本地性能测量是两项独立工作。

## 环境与方法

- Node 20.19.2、Lighthouse 12.8.2、Chrome 151.0.7922.108。
- Linux 7.0.0-31-generic、Intel i7-1165G7、8 个逻辑 CPU、约 16.5GB 内存。
- Python 静态服务提供 `example/public`，地址 `http://127.0.0.1:4173`；未配置生产压缩、CDN 或服务器缓存。
- 首页和长文，各 mobile/desktop，每组 3 次独立 Chrome profile，共 12 次 Lighthouse 导航，串行执行，使用原有 simulate 节流与 mobile/desktop preset。
- Lighthouse 完成后，再使用原有 web-vitals 工具串行运行 12 次交互会话；mobile 使用 4 倍 CPU 减速，desktop 为 1 倍，不额外模拟交互阶段的网络。
- 没有与构建或其他浏览器验收并行，没有替换页面或屏蔽资源来提高分数。12 次 Lighthouse 均无运行警告，全部样本保留。

沿用 G4/G4a 的工具与方法，但当前是 11 篇文章（3 篇展示 + 8 篇指南），并采用木色、田园图片、新头像和扩展样式。旧报告的内容集不同，不能据此计算严格的前后优化收益。当前页面及关键图片的字节和哈希见 [数据集记录](g5d-dataset.json)。

## Lighthouse 结果

下表为每组三次的中位数，LCP 范围为全部样本最小值至最大值。

| 页面 / 模式 | Performance | LCP（秒） | LCP 范围（秒） | CLS | TBT（毫秒） |
| --- | ---: | ---: | ---: | ---: | ---: |
| 首页 / mobile | 94 | **3.013** | 3.006–3.013 | 0.04856 | 0 |
| 首页 / desktop | 98 | 1.148 | 0.528–1.148 | 0.00045 | 0 |
| 长文 / mobile | 98 | 2.105 | 2.103–2.108 | 0.04856 | 0 |
| 长文 / desktop | 99 | 0.669 | 0.555–1.086 | 0 | 0 |

**移动首页三次均超过 LCP <2.5s 目标**；其余三组的每次 LCP 均低于 2.5s，所有测量的 CLS 均低于 0.1。不能把较高的 Performance 分数或体积预算通过写成所有性能目标已达标。

完整环境、节流设置、逐次指标、请求、诊断与原始文件 SHA-256 见 [性能记录](g5d-performance.json)。原始 Lighthouse JSON 留在 `/tmp/syutoi-g5d-performance/`。

## 核心资源预算

- 核心 JS gzip：**2026 bytes**，低于 50KB 上限及 30KB 争取目标。
- 核心 CSS gzip：**5756 bytes**，低于 40KB 上限。
- 11 项核心和可选资源预算均通过；gzip level 9，十进制 KB。

这不是页面总下载量。页面 HTML、图片、索引、服务器响应头等不能被核心预算排除后视为没有成本。

## 图片与待验证方向

移动首页的 LCP 元素为 `.hero-image`，即 `pastoral-evening.webp`；初始 HTML 已直接引用、具有 fetchpriority=high、未使用懒加载。此次首页总传输量为 1,065,511 bytes，主要图片文件为：

| 文件 | 原图/显示资源尺寸 | 文件字节 | 当前用途 |
| --- | --- | ---: | --- |
| avatar.png | 1030×1030 | 748349 | 侧栏以 96×96 CSS px 显示 |
| pastoral-evening.webp | 1920×640 | 155078 | 页头与长文封面 |
| sunlit-desk.webp | 800×1200 | 104890 | 欢迎文章封面 |

表中为文件字节，网络传输记录还包含响应头。首页头像虽标记 lazy，但在本轮 Lighthouse 采集中确实被请求；不能假定它在所有视口中都不产生网络成本。长文 mobile 总传输量为 222,405 bytes，desktop 为 971,537 bytes，显示出视口与资源加载范围的差别。

头像是总传输的主要来源，页头图也是尺寸适配候选；但尚未进行隔离试验，不能据此断言头像就是 LCP 根因。Lighthouse 的模拟渲染等待归因也不等于已经证明具体浏览器瓶颈。

新增 G5d1：先比较头像显示副本、页头尺寸/编码以及首屏图片加载竞争，保留原始素材和现有视觉构图；选择方案后按同样环境重新测量。目标是解决移动首页差距，而不是删除配图或降低节流强度。

## 实验室交互结果

主题切换、移动菜单开关与 Escape、文章目录跳转和代码复制，共 12 次会话：

| 页面 / 模式 | INP 中位数（毫秒） | 范围（毫秒） |
| --- | ---: | ---: |
| 首页 / mobile | 80 | 72–112 |
| 长文 / mobile | 120 | 104–184 |
| 首页 / desktop | 32 | 32–48 |
| 长文 / desktop | 56 | 56–64 |

所有所测会话低于 200ms，没有页面脚本异常，菜单关闭和代码复制状态断言通过。详见 [交互记录](g5d-interactions.json)，原始输出位于 `/tmp/syutoi-g5d-interactions/`。这些是指定脚本操作的实验室会话值，不是生产真实用户 p75；TBT 也不能代替 INP。

## 复跑

先 `pnpm build`，用 Python 启动静态服务：

```bash
python -m http.server 4173 --bind 127.0.0.1 --directory example/public
```

另一终端运行（工具路径按本机安装位置修改，每次使用新输出目录）：

```bash
SYUTOI_LIGHTHOUSE_CLI=/tmp/syutoi-lighthouse-d8/node_modules/lighthouse/cli/index.js \
SYUTOI_PERFORMANCE_OUTPUT=/tmp/syutoi-g5d-performance \
node toolbox/check-performance.mjs

SYUTOI_PUPPETEER_PATH="$PWD/node_modules/.pnpm/puppeteer@5.5.0/node_modules/puppeteer" \
SYUTOI_WEB_VITALS_PATH=/tmp/syutoi-g4-vitals/node_modules/web-vitals/dist/web-vitals.iife.js \
SYUTOI_INTERACTION_OUTPUT=/tmp/syutoi-g5d-interactions \
node toolbox/check-interaction-performance.mjs
```

本次完成新基线测量，未宣称解决移动首页 LCP；下一项为 G5d1 图片成本隔离验证与优化。没有重新运行不受影响的全量单元测试；构建、资源预算及本次导航/交互检查已实际执行。
