import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseXml, child, children } from '../toolbox/xml.mjs';
const require = createRequire(new URL('../example/package.json',import.meta.url));
const Hexo = require('hexo');
const yaml = require('js-yaml');
const root = fileURLToPath(new URL('../',import.meta.url));

async function fixture(t, {rootPath='/',plugins=true,enabled=true,empty=false}={}) {
  const directory = await mkdtemp(join(tmpdir(),'syutoi-syndication-'));
  const hexo = new Hexo(directory,{silent:true});
  t.after(async()=>{await hexo.exit();await rm(directory,{recursive:true,force:true});});
  await mkdir(join(directory,'themes'),{recursive:true});
  await mkdir(join(directory,'source/_posts'),{recursive:true});
  await symlink(root,join(directory,'themes/syutoi'));
  await symlink(join(root,'example/node_modules'),join(directory,'node_modules'));
  await writeFile(join(directory,'package.json'),JSON.stringify({name:'syndication-fixture',hexo:{version:'8.1.2'},dependencies:{'hexo-renderer-markdown-it':'7.1.1','hexo-renderer-ejs':'1.0.0',...(plugins?{'hexo-feed':'1.1.2','hexo-generator-sitemap':'3.0.1'}:{})}}));
  const feed = {limit:20,tag_dir:false,category_dir:false};
  for (const [type,file,output] of [['rss','rss','updates/rss.xml'],['atom','atom','updates/atom.xml'],['jsonFeed','json','updates/feed.json']]) feed[type]={enable:enabled,output,template:join(root,`layout/_alternate/${file}.ejs`)};
  await writeFile(join(directory,'_config.yml'),yaml.dump({
    title:'Site & reading',description:'Notes <and> writing',author:'Writer',language:['en','zh-CN'],
    timezone:'UTC',theme:'syutoi',url:'https://example.com'+rootPath.replace(/\/$/,''),root:rootPath,
    permalink:':title/',future:false,render_drafts:false,ignore:['**/node_modules/**','**/themes/syutoi/example/**'],
    feed,sitemap:{path:'maps/sitemap.xml',tags:true,categories:true,rel:false}
  }));
  if (!empty) {
    const content = {
      '_posts/article.md':'title: "Reading & <writing>"\ndate: 2020-01-01\nupdated: 2020-02-03\ncategories: [Writing]\ntags: ["A & B"]',
      '_posts/excluded.md':'title: Excluded from sitemap\ndate: 2019-01-01\nupdated: 2019-02-01\nsitemap: false\nseo:\n  noindex: true',
      '_posts/unpublished.md':'title: Unpublished\ndate: 2020-01-01\npublished: false\nsitemap: false',
      '_posts/future.md':'title: Future\ndate: 2099-01-01',
      '_drafts/draft.md':'title: Draft\ndate: 2020-01-01',
      'about/index.md':'title: About',
      'hidden/index.md':'title: Hidden\nsitemap: false',
      '404.md':'title: Not found\ntype: 404\npermalink: 404.html\nsitemap: false'
    };
    for(const [path,front] of Object.entries(content)) {
      const destination=join(directory,'source',path);
      await mkdir(join(destination,'..'),{recursive:true});
      await writeFile(destination,`---\n${front}\n---\nA **bold** note &amp; a closing sequence: ]]&gt;.\n`);
    }
  }
  await hexo.init();
  await hexo.call('generate');
  return {hexo,read:path=>readFile(join(directory,'public',path),'utf8')};
}

for (const rootPath of ['/','/blog/']) test(`feed and sitemap plugins emit valid content and URLs under ${rootPath}`, async t => {
  const {hexo,read} = await fixture(t,{rootPath});
  const prefix='https://example.com'+rootPath;
  const rss=parseXml(await read('updates/rss.xml'));
  assert.equal(rss.name,'rss');
  const channel=child(rss,'channel');
  assert.equal(child(channel,'title').text,'Site & reading');
  assert.equal(child(channel,'atom:link').attributes.href.value,prefix+'updates/rss.xml');
  const items=children(channel,'item');
  assert.equal(items.length,2);
  assert.equal(child(items[0],'title').text,'Reading & <writing>');
  assert.equal(child(items[0],'link').text,prefix+'article/');
  assert.match(child(items[0],'description').text,/<strong>bold<\/strong>/);
  assert.match(child(items[0],'category').text,/Writing/);
  assert.equal(new Date(child(channel,'lastBuildDate').text).toISOString(),'2020-02-03T00:00:00.000Z');
  const atom=parseXml(await read('updates/atom.xml'));
  assert.equal(atom.uri,'http://www.w3.org/2005/Atom');
  assert(children(atom,'link').some(link=>link.attributes.rel?.value==='self' && link.attributes.href.value===prefix+'updates/atom.xml'));
  const entries=children(atom,'entry');
  assert.equal(entries.length,2);
  assert.equal(child(entries[0],'updated').text,'2020-02-03T00:00:00.000Z');
  assert.match(child(entries[0],'content').text,/<strong>bold<\/strong>/);
  const json=JSON.parse(await read('updates/feed.json'));
  assert.equal(json.feed_url,prefix+'updates/feed.json');
  assert.equal(json.items.length,2);
  assert.equal(json.items[0].date_modified,'2020-02-03T00:00:00.000Z');
  assert.equal(json.items[0].content_html,child(entries[0],'content').text);
  const sitemap=parseXml(await read('maps/sitemap.xml'));
  assert.equal(sitemap.uri,'http://www.sitemaps.org/schemas/sitemap/0.9');
  const urls=children(sitemap,'url').map(node=>decodeURI(child(node,'loc').text));
  assert(urls.includes(prefix+'article/'));
  assert(urls.includes(prefix+'about/index.html'));
  assert(urls.some(url=>url.includes('/tags/')));
  assert(urls.some(url=>url.includes('/categories/')));
  assert(!urls.some(url=>/excluded|unpublished|future|draft|hidden|404|search/.test(url)));
  assert(urls.every(url=>url===prefix.replace(/\/$/,'') || url.startsWith(prefix)));
  const home=await read('index.html');
  for (const output of ['rss.xml','atom.xml','feed.json']) assert(home.includes(`href="${rootPath}updates/${output}"`));
  for (const type of ['rss','atom','jsonFeed']) assert(hexo.extend.generator.get(type));
});

test('disabled feeds and missing plugins do not advertise nonexistent routes', async t => {
  for (const options of [{enabled:false},{plugins:false}]) {
    const {hexo,read}=await fixture(t,options);
    assert(!hexo.route.list().some(path=>path.startsWith('updates/')));
    const home=await read('index.html');
    assert.doesNotMatch(home,/rel="alternate"[^>]*type="application\/(?:rss|atom|feed\+json)/);
    assert.doesNotMatch(home,/href="\/updates\//);
    if(options.plugins===false) assert(!hexo.route.list().includes('maps/sitemap.xml'));
  }
});

test('empty sites keep valid empty feeds and the sitemap plugin creates no route', async t => {
  const {hexo,read}=await fixture(t,{empty:true});
  assert.equal(children(child(parseXml(await read('updates/rss.xml')),'channel'),'item').length,0);
  assert.equal(children(parseXml(await read('updates/atom.xml')),'entry').length,0);
  assert.deepEqual(JSON.parse(await read('updates/feed.json')).items,[]);
  assert(!hexo.route.list().includes('maps/sitemap.xml'));
});
