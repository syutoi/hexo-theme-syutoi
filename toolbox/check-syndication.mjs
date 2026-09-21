import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import yaml from 'js-yaml';
import { parseXml, child, children } from './xml.mjs';
const output = new URL('../example/public/',import.meta.url);
const config = yaml.load(await readFile(new URL('../example/_config.yml',import.meta.url),'utf8'));
const read = path => readFile(new URL(path,output),'utf8');
const site = new URL(config.url);
const root = config.root || '/';
const localUrl = value => {
  const url = new URL(value);
  assert.equal(url.origin,site.origin,'Syndication URL has the wrong origin');
  assert(url.pathname.startsWith(root),'Syndication URL lost the site root');
  return url;
};
const rss = parseXml(await read(config.feed.rss.output));
assert.equal(rss.name,'rss');
const channel = child(rss,'channel');
assert.equal(child(channel,'title').text,config.title);
const items = children(channel,'item');
assert(items.length > 0 && items.length <= config.feed.limit);
for (const item of items) {
  localUrl(child(item,'link').text);
  assert.equal(child(item,'guid').text,child(item,'link').text);
  assert(Number.isFinite(Date.parse(child(item,'pubDate').text)));
}
const atom = parseXml(await read(config.feed.atom.output));
assert.equal(atom.uri,'http://www.w3.org/2005/Atom');
const entries = children(atom,'entry');
assert.equal(entries.length,items.length);
const json = JSON.parse(await read(config.feed.jsonFeed.output));
assert.equal(json.version,'https://jsonfeed.org/version/1');
assert.equal(json.items.length,items.length);
localUrl(json.feed_url);
for (const [index,entry] of entries.entries()) {
  assert.equal(child(entry,'id').text,json.items[index].id);
  assert.equal(child(entry,'content').text,json.items[index].content_html);
  assert.equal(child(items[index],'description').text,json.items[index].content_html);
  assert.equal(child(entry,'updated').text,json.items[index].date_modified);
  assert(Number.isFinite(Date.parse(json.items[index].date_modified)));
}
const sitemap = parseXml(await read(config.sitemap.path));
assert.equal(sitemap.uri,'http://www.sitemaps.org/schemas/sitemap/0.9');
const urls = children(sitemap,'url').map(entry => child(entry,'loc').text);
assert(urls.length > 0);
assert.equal(new Set(urls).size,urls.length);
for (const value of urls) {
  const url = localUrl(value);
  const path = decodeURIComponent(url.pathname.slice(root.length));
  const file = path.endsWith('/') || !path ? `${path}index.html` : path;
  assert((await stat(new URL(file,output))).isFile(),`Sitemap points to a missing page: ${value}`);
  assert(!/^(?:404\.html|search\/)/.test(path));
}
console.log(`Verified RSS, Atom and JSON Feed (${items.length} posts each), strict XML and ${urls.length} sitemap URLs.`);
