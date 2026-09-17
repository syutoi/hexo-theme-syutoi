# Hexo Theme Syutoi

## Usage

1. Clone this repository

``` bash
# cd your-blog
git clone https://github.com/syutoi/hexo-theme-syutoi.git ./themes/syutoi
```

2. Make changes to the root `_config.yml`
  - update `theme` fragment as `syutoi`.  

3. Install the necessary plugins
  - [hexo-renderer-multi-markdown-it](https://www.npmjs.com/package/hexo-renderer-multi-markdown-it)
  - [hexo-autoprefixer](https://www.npmjs.com/package/hexo-autoprefixer)
  - [hexo-algoliasearch](https://www.npmjs.com/package/hexo-algoliasearch)
  - [hexo-symbols-count-time](https://www.npmjs.com/package/hexo-symbols-count-time)
  - [hexo-feed](https://www.npmjs.com/package/hexo-feed)

4. View a site configuration example in the `example` folder.

5. [中文使用说明](https://syutoi.com)


## 本地开发

当前仓库提供迁移前主题的运行基线，使用 Hexo 8。现代化重写计划与完成情况见 [TODO](docs/TODO.md)。

环境要求：Node.js >=20.19.0，pnpm 9.0.4（版本固定于 `packageManager`）。使用 nvm 时可执行 `nvm install`、`nvm use` 读取 `.nvmrc`。

```bash
# 在仓库根目录安装两个 workspace 的依赖
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true pnpm install

# 构建并检查示例站
pnpm clean
pnpm build
pnpm test

# 本地预览（默认只监听本机）
pnpm dev
```

访问 <http://localhost:4000>。停止服务使用 Ctrl+C。可通过 `pnpm dev --port 4001` 更换端口。

`dev` 和 `build` 会自动创建 `example/themes/syutoi`，链接到当前主题，因此修改主题无需复制文件。脚本遇到已有的其他主题目录时会报错，不会覆盖。生成的主题链接、`example/public/` 和 `example/db.json` 不纳入版本控制；`pnpm-lock.yaml` 应提交。已有锁文件时使用 `pnpm install --frozen-lockfile`。

`pnpm test` 检查上一次构建产物中的页面、正文、脚本、静态资源和 feeds；应先运行 `pnpm build`。GitHub Actions 会在 Node 20.19.0 和 Node 24 上执行安装、清理、构建与检查。

当前仍保留上游的 Stylus、定制 Markdown renderer 和浏览器 CDN 依赖，尚未达到 PRD 的“无第三方 JS”标准。安装时跳过旧 Puppeteer 自带 Chromium 下载；示例站禁用了依赖它的 Mermaid/Graphviz 构建插件，相关示例暂以代码展示。后续会在通用 Markdown renderer 迁移中移除这项依赖。
