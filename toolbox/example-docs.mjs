import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const root = fileURLToPath(new URL('../', import.meta.url));
export const documents = [
  ['getting-started', '快速开始', '安装 Syutoi、配置 Hexo，并启动你的第一个站点。'],
  ['configuration', '基础配置', '站点身份、导航、侧栏及主题配置字段参考。'],
  ['social-links', '社交链接与图标', '配置 GitHub、X、知乎、小红书等账号及内置图标。', '2026-09-26 00:00:00'],
  ['customization', '外观定制', '调整配色、字体与布局，维护自己的主题定制。'],
  ['writing', '文章写作', 'Front Matter、封面、摘要、目录及 Markdown 写作方法。'],
  ['images', '图片与尺寸', '图片路径、宽高设置、头像封面、灯箱和体积排查。', '2026-09-26 00:00:00'],
  ['markdown-extensions', 'Markdown 扩展', '开启图片属性和提示块，配置中文标签并排查常见问题。', '2026-09-26 00:00:00'],
  ['features', '功能配置', '按需启用搜索、评论、图片预览与订阅。'],
  ['analytics', '访问统计', '配置访问统计服务；当前支持百度统计的接入与验证。', '2026-09-26 00:00:00'],
  ['syndication', '订阅与站点地图', '生成 RSS、Atom、JSON Feed 和 Sitemap。'],
  ['deployment', '部署指南', '发布静态站点并检查路径、缓存和部署配置。'],
  ['migration-from-shoka', '从 Shoka 迁移', '配置与内容兼容边界，以及旧语法的替代方式。']
];
const routes = new Map(documents.map(([slug]) => [`docs/${slug}.md`, `/docs/${slug}/`]));
routes.set('docs/index.md', '/docs/');
routes.set('docs/examples.md', '/examples/');

// Rewrite authored Markdown links, leaving examples inside code fences untouched.
export function rewriteDocumentLinks(markdown, source) {
  let fence;
  return markdown.split('\n').map(line => {
    const marker = line.match(/^\s{0,3}(`{3,}|~{3,})/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length) fence = undefined;
      return line;
    }
    if (fence) return line;
    return line.replace(/(\]\()([^\s)]+)(\))/g, (match, before, href, after) => {
      if (/^(?:[a-z]+:|\/|#)/i.test(href)) return match;
      const [path, fragment] = href.split('#');
      const target = posix.normalize(posix.join(posix.dirname(source), path));
      const route = routes.get(target) || `https://github.com/syutoi/hexo-theme-syutoi/blob/main/${target}`;
      return before + route + (fragment ? '#' + fragment : '') + after;
    });
  }).join('\n');
}

export async function syncExampleDocs() {
  const directory = join(root, 'example/source/_posts/theme-docs');
  await mkdir(directory, {recursive:true});
  const expected = new Set(documents.map(([slug]) => `${slug}.md`));
  // This ignored directory is exclusively generated; never place authored content here.
  for (const name of await readdir(directory)) {
    if (name.endsWith('.md') && !expected.has(name)) await unlink(join(directory, name));
  }
  const entries = [['index', 'Syutoi 使用手册', '从安装到发布，按顺序开始使用书台。'], ...documents];
  for (const [slug, title, description, date = '2026-09-22 00:00:00'] of entries) {
    const source = `docs/${slug}.md`;
    const body = rewriteDocumentLinks((await readFile(join(root, source), 'utf8')).replace(/^# [^\n]+\n+/, ''), source);
    const index = documents.findIndex(([name]) => name === slug);
    const navigation = slug === 'index' ? '' : '\n\n---\n\n[文档首页](/docs/)' +
      (index > 0 ? ` · [上一篇：${documents[index - 1][1]}](/docs/${documents[index - 1][0]}/)` : '') +
      (index < documents.length - 1 ? ` · [下一篇：${documents[index + 1][1]}](/docs/${documents[index + 1][0]}/)` : '') + '\n';
    const data = {title, description, date, updated:'2026-09-26 00:00:00', comments:false};
    if (slug !== 'index') Object.assign(data, {permalink:`docs/${slug}/`, categories:['主题文档'], author:'Syutoi', cover:false});
    const destination = slug === 'index' ? join(root, 'example/source/docs/index.md') : join(directory, `${slug}.md`);
    await mkdir(dirname(destination), {recursive:true});
    const content = `---\n${yaml.dump(data)}---\n\n${body}${navigation}`;
    let previous;
    try { previous = await readFile(destination, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (previous !== content) await writeFile(destination, content);
  }
}
