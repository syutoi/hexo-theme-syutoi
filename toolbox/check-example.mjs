import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { Script } from 'node:vm';

const output = new URL('../example/public/', import.meta.url);
const pages = [
  'index.html',
  'hello-world/index.html',
  'friends/index.html',
  'archives/index.html',
  'categories/index.html',
  'tags/index.html',
  'tags/Foo/index.html',
  '404.html',
  'reading/index.html',
  'typography/index.html',
  'reading-elements/index.html',
  'code/index.html',
  'pictures/index.html'
];

for (const page of pages) {
  const html = await readFile(new URL(page, output), 'utf8');
  assert.match(html, /<!doctype html>/i, `${page}: missing HTML layout`);
  assert.match(html, /class="powered-by"[\s\S]*?Syutoi/, `${page}: theme footer missing`);
  assert.match(html, /js\/syutoi\.min\.js/, `${page}: new client missing`);
  assert.match(html, /css\/syutoi\.min\.css/, `${page}: token stylesheet missing`);
  assert(html.indexOf('js/syutoi.min.js') < html.indexOf('css/syutoi.min.css'), `${page}: theme bootstrap must precede styles`);
  assert.match(html, /data-theme-toggle/, `${page}: theme control missing`);
  assert.match(html, /<main[^>]+id="main"/, `${page}: main landmark missing`);
  assert.doesNotMatch(html, /<script[^>]+src=["'](?:https?:)?\/\//i, `${page}: external script`);
  assert.doesNotMatch(html, /(?:css\/app\.css|js\/app\.js|data-background-image|class="exturl)/, `${page}: legacy runtime markup`);
  assert.doesNotMatch(html, /Template render error|extends ['"]_partials/, `${page}: unrendered template`);
}

const post = await readFile(new URL('hello-world/index.html', output), 'utf8');
assert.match(post, /Welcome to/, 'Post body was not rendered');
new Script(await readFile(new URL('js/syutoi.min.js', output), 'utf8'), { filename: 'syutoi.min.js' });
const styles = await readFile(new URL('css/syutoi.min.css', output), 'utf8');
assert.match(styles, /--syutoi-color-bg/, 'Design tokens missing');
assert.doesNotMatch(styles, /@import\s/, 'CSS imports were not bundled');
for (const asset of ['css/syutoi.min.css', 'images/favicon.ico']) {
  assert((await stat(new URL(asset, output))).size > 0, `${asset}: empty asset`);
}
const feed = JSON.parse(await readFile(new URL('feed.json', output), 'utf8'));
assert(feed.items.length > 0, 'JSON feed has no posts');
for (const feed of ['rss.xml', 'atom.xml']) {
  assert((await stat(new URL(feed, output))).size > 0, `${feed}: empty feed`);
}

console.log(`Verified ${pages.length} pages, post content, JavaScript, static assets and feeds.`);
