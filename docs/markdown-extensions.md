# Markdown 扩展

图片尺寸属性和 GitHub 风格提示块从 v0.5.0 提供，默认不启用。示例站已配置；独立博客需要按本页设置。

## 启用扩展

这两项扩展由 Markdown renderer 在构建时处理，主题负责排版，不增加浏览器端解析脚本。Demo 已启用；普通博客按下方配置开启。当前使用 Hexo renderer 7.1.1 和 Markdown-it 13；不要同时启用多个 attrs 或提示块插件。

在博客 `_config.yml` 的现有 `markdown.plugins` 列表中追加，保留已经使用的脚注、任务列表等插件：

```yaml
markdown:
  plugins:
    - name: markdown-it-attrs
      options:
        allowedAttributes: [width, height]
    - name: ./themes/syutoi/lib/markdown-alerts.cjs
```

`markdown-it-attrs` 已由 `hexo-renderer-markdown-it@7.1.1` 提供。提示块依赖随主题生产依赖安装；更新主题后，在主题目录运行 `pnpm install --prod --frozen-lockfile --filter hexo-theme-syutoi`。如果主题目录不是 `themes/syutoi`，相应修改插件路径。配置后重启预览，clean/generate；删除对应插件配置即可关闭该项扩展。

## 图片尺寸属性

```markdown
![Lumi](/images/avatar.png){width=100 height=100}
![花园](/images/garden.webp "午后的乡间花园"){width=320}
```

推荐只写宽度，让图片保持原始比例。width/height 使用正整数像素值；两者都写时应符合原图比例。主题保留 `max-width: 100%`、`height: auto`，手机端按容器缩小，不保证强行显示为指定宽高，也不提供裁剪。只写 height 不保证控制实际显示高度。图注、延迟加载与可选灯箱继续适用。

白名单只限制属性名，不验证数值，也不是“只解析图片”的开关；其他可附加属性的元素仍可能被解析。此版本仅承诺图片尺寸用法，不开放 style、class、id、事件属性。写出字面花括号时使用代码围栏或转义。原生 HTML 仍可用；未启用扩展的环境可能把属性显示为普通文字。

<a id="alerts"></a>

## GitHub 风格提示块

```markdown
> [!TIP]
> 修改主题配置后，请重新启动预览。
>
> - 检查页面。
> - 检查图片链接。
```

支持 NOTE、TIP、IMPORTANT、WARNING、CAUTION，标记大小写不敏感，须独占引用的第一行。正文可以包含普通 Markdown。提示块前后留空行，只支持顶层提示块；列表、普通引用或提示块内部不再识别新提示块，内部普通引用正常排版。未知标记保持普通引用，`> \[!TIP]` 可原样展示，代码围栏内不解析。

默认使用英文类型标签。需要全站自定义标签时，在提示块插件的 options 中配置：

```yaml
- name: ./themes/syutoi/lib/markdown-alerts.cjs
  options:
    titles:
      note: 说明
      tip: 提示
      important: 重要
      warning: 注意
      caution: 警告
```

标签是普通文字并经过转义，按这份博客配置统一显示，不随单页语言切换。提示块使用主题明暗配色，同时保留文字标签，不依赖颜色区分含义；无 JavaScript 也能完整阅读。关闭插件时退回普通引用。

实际效果见 [图片属性与提示块示例](/markdown-extensions/)。


## 配置未生效时

| 现象 | 检查方式 |
| --- | --- |
| 图片后面显示花括号 | attrs 应写在博客 `_config.yml` 的 `markdown.plugins`，保留 width/height 白名单，并重启预览 |
| 提示块仍是普通引用 | 检查包装插件路径与主题依赖，确保标记独占引用首行，且提示块位于顶层 |
| 修改后旧页面不变 | 停止旧进程，重新 clean/generate 后再启动；线上需重新部署 |
| 脚注或任务列表失效 | 添加扩展时不要覆盖掉原本使用的插件列表 |

完整的图片尺寸、路径和加载说明见 [图片与尺寸](images.md)。常规 Markdown、代码、表格和 Front Matter 见 [文章写作](writing.md)。
