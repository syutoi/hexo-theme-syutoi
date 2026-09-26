// Read-only inventory for validation tools. Hexo renders these ordinary source
// posts directly; there is no content generation, synchronization or manifest.
import {readFile, readdir} from 'node:fs/promises';
import yaml from 'js-yaml';

const directory = new URL('../example/source/_posts/theme-docs/', import.meta.url);
export const guides = await Promise.all((await readdir(directory)).filter(name => name.endsWith('.md') && name !== 'index.md').map(async name => {
  const source = await readFile(new URL(name,directory),'utf8');
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`Missing front matter: ${name}`);
  const data = yaml.load(match[1]);
  if (typeof data.title !== 'string' || typeof data.permalink !== 'string' || !/^docs\/[a-z\d-]+\/$/.test(data.permalink)) {
    throw new Error(`Invalid guide title or permalink: ${name}`);
  }
  return {path:data.permalink, title:data.title, order:data.column_order};
}));
if (new Set(guides.map(guide => guide.path)).size !== guides.length) throw new Error('Duplicate guide permalinks');
guides.sort((a,b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.path.localeCompare(b.path));
