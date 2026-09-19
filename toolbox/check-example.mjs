import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { parseDocument, DomUtils } from 'htmlparser2';
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
  'pictures/index.html',
  'examples/index.html',
  'examples/empty/index.html',
  'examples/english/index.html',
  'syutoi-long-read/index.html',
  'syutoi-minimal/index.html',
  'syutoi-boundaries/index.html'
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


const hub = await readFile(new URL('examples/index.html', output), 'utf8');
const links = DomUtils.getElementsByTagName('a', parseDocument(hub).children);
const targets = new Set(links.map(link => link.attribs.href).filter(href => href?.startsWith('/') && !href.startsWith('//')));
for (const target of targets) {
  const path = decodeURIComponent(new URL(target, 'https://example.com').pathname).slice(1);
  const file = path.endsWith('/') || !path ? path + 'index.html' : path;
  assert((await stat(new URL(file, output))).isFile(), `Example hub has a broken link: ${target}`);
}
const longRead = await readFile(new URL('syutoi-long-read/index.html', output), 'utf8');
assert((longRead.match(/<h2 id=/g) || []).length >= 10, 'Long-form sample is incomplete');
assert.match(longRead, /class="article-toc"|class="sidebar-section article-toc"/);
assert.match(longRead, /class="article-cover"/);
const minimal = await readFile(new URL('syutoi-minimal/index.html', output), 'utf8');
assert.doesNotMatch(minimal, /class="article-cover"|class="sidebar-section article-toc"/);
const home = await readFile(new URL('index.html', output), 'utf8');
const cards = home.match(/<li class="post-card[\s\S]*?<\/li>/g) || [];
const minimalCard = cards.find(card => card.includes('/syutoi-minimal/'));
assert(minimalCard, 'Minimal sample must be discoverable on the homepage');
assert.doesNotMatch(minimalCard, /has-cover|has-summary|post-summary/);
const empty = await readFile(new URL('examples/empty/index.html', output), 'utf8');
assert.doesNotMatch(empty, /class="sidebar-section article-toc"/);
const english = await readFile(new URL('examples/english/index.html', output), 'utf8');
assert.match(english, /<html lang="en"/);
assert.match(english, /aria-label="Main navigation"/);
console.log(`Verified ${targets.size} local example links and long, minimal, empty and English samples.`);
