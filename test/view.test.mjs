import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
const require = createRequire(import.meta.url);
const { safeUrl, navigationItems } = require('../lib/view.cjs');

test('URLs preserve local paths and reject executable or malformed protocols', () => {
  for (const value of ['/blog/a/', '../image.png', '#part', 'https://example.com/a?x=1&y=2', 'mailto:a@example.com']) assert.equal(safeUrl(value), value);
  for (const value of ['javascript:alert(1)', 'DATA:text/html,test', 'java\nscript:alert(1)', '\\evil.example', null, false]) assert.equal(safeUrl(value), '');
  assert.equal(safeUrl('mailto:a@example.com', true), '');
});
test('structured navigation takes precedence and legacy nested menus flatten', () => {
  const translate = key => ({ 'menu.home': '首页' }[key] || key);
  assert.deepEqual(navigationItems({menu:{home:'/ || home', more:{default:'/ || list', archives:'/archives/ || box'}}}, translate), [{label:'首页',url:'/'},{label:'archives',url:'/archives/'}]);
  assert.deepEqual(navigationItems({navigation:{menu:[null,{name:'Read',url:'/read/'},{name:'Bad',url:'javascript:alert(1)'}]},menu:{home:'/'}}, translate), [{label:'Read',url:'/read/'}]);
});

test('home pagination preserves sticky posts exactly once and renders empty sites', () => {
  class Query {
    constructor(posts) { this.posts = posts; this.length = posts.length; }
    sort() { return this; }
    toArray() { return this.posts; }
    slice(start, end) { return new Query(this.posts.slice(start, end)); }
  }
  let generator;
  const hexo = { config: {per_page:2}, extend:{generator:{register:(_, fn) => {generator = fn;}}} };
  runInNewContext(readFileSync(new URL('../scripts/generaters/index.js',import.meta.url),'utf8'), {hexo,require});
  const context = {model:()=>({Query})};
  const pages = generator.call(context,{posts:new Query([{title:'a'},{title:'b',sticky:true},{title:'c'}])});
  assert.deepEqual(pages.flatMap(p => p.data.posts.toArray()).map(p=>p.title), ['b','a','c']);
  assert.equal(pages.length,2);
  const empty = generator.call(context,{posts:new Query([])});
  assert.equal(empty.length,1);
  assert.equal(empty[0].path,'');
  assert.equal(empty[0].data.posts.length,0);
});

test('local resources and legacy content tags respect subdirectory deployments', () => {
  const { url_for, unescapeHTML } = require('hexo-util');
  const tags = {};
  const helpers = {};
  const hexo = {config:{root:'/blog/',url:'https://example.com/blog'},theme:{config:{}},extend:{tag:{register:(name,fn)=>{tags[name]=fn;}},helper:{register:(name,fn)=>{helpers[name]=fn;}}}};
  for (const file of ['scripts/tags/links.js','scripts/tags/media.js','scripts/helpers/asset.js']) {
    const fileUrl = new URL('../'+file,import.meta.url);
    runInNewContext(readFileSync(fileUrl,'utf8'),{hexo,require:createRequire(fileUrl)});
  }
  const context = {config:hexo.config,url_for:value=>url_for.call(hexo,value)};
  assert.match(helpers._css.call(context,'syutoi.min.css'), /href="\/blog\/css\/syutoi.min.css/);
  const cards = tags.links([], '- site: "A & B"\n  url: /friends/\n  image: /images/avatar.jpg');
  assert.match(unescapeHTML(cards),/href="\/blog\/friends\/"/);
  assert.match(unescapeHTML(cards),/src="\/blog\/images\/avatar.jpg"/);
  assert.match(cards,/A &amp; B/);
  assert.doesNotMatch(tags.links([], '- site: bad\n  url: "javascript:alert(1)"'),/href=/);
  const media = tags.media(['audio'], '- title: Music\n  list:\n    - https://example.com/playlist\n- name: Local\n  url: /song.mp3');
  assert.match(unescapeHTML(media),/href="https:\/\/example.com\/playlist"/);
  assert.match(unescapeHTML(media),/href="\/blog\/song.mp3"/);
});
