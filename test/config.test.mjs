import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { normalizeConfig } = require('../lib/config.cjs');
const { navigationItems } = require('../lib/view.cjs');
const defaults = require('js-yaml').load(readFileSync(new URL('../_config.yml',import.meta.url),'utf8'));

test('explicit legacy site settings are not hidden by modern theme defaults', () => {
  const legacy = { alternate:'My site', darkmode:true, images:'assets', sidebar:{avatar:'me.png'}, menu:{home:'/ || home', posts:{default:'/ || list',archives:'/archives/ || box'}}, social:{github:'https://github.com/example || github || red'} };
  const result = normalizeConfig(defaults, legacy);
  assert.equal(result.branding.name,'My site');
  assert.equal(result.branding.avatar,'assets/me.png');
  assert.equal(result.appearance.theme,'dark');
  assert.deepEqual(result.navigation.menu,[{name:'menu.home',url:'/'},{name:'menu.archives',url:'/archives/'}]);
  assert.deepEqual(result.social,[{name:'github',url:'https://github.com/example'}]);
});

test('explicit modern values, including empty lists and strings, win over legacy aliases', () => {
  const result = normalizeConfig(defaults,{alternate:'Old',branding:{name:'',avatar:''},sidebar:{avatar:'old.png',enable:false},darkmode:true,appearance:{theme:'light'},menu:{home:'/'},navigation:{menu:[]},social:[]});
  assert.equal(result.branding.name,'');
  assert.equal(result.branding.avatar,'');
  assert.equal(result.sidebar.enable,false);
  assert.equal(result.appearance.theme,'light');
  assert.deepEqual(result.navigation.menu,[]);
  assert.deepEqual(result.social,[]);
});

test('malformed values and unsafe URLs do not become executable links or broken settings', () => {
  const result = normalizeConfig(defaults,{branding:{avatar:'javascript:alert(1)',name:{bad:true}},appearance:{theme:'invalid',cover:'data:text/html,x'},social:[null,{},false,{name:'Bad',url:'javascript:alert(1)'},{name:'Email',url:'mailto:hello@example.com'}],sidebar:{enable:'false'},footer:{since:'yesterday',powered:false}});
  assert.equal(result.branding.avatar,'');
  assert.equal(result.branding.name,'');
  assert.equal(result.appearance.cover,'');
  assert.equal(result.appearance.theme,'auto');
  assert.equal(result.sidebar.enable,true);
  assert.equal(result.footer.since,null);
  assert.equal(result.footer.powered,false);
  assert.deepEqual(result.social,[{name:'Email',url:'mailto:hello@example.com'}]);
  assert.doesNotThrow(()=>normalizeConfig(null,null));
});

test('default navigation translates while custom labels stay literal', () => {
  const settings = normalizeConfig(defaults,{navigation:{menu:[{name:'menu.home',url:'/'},{name:'My notes',url:'/notes/'}]}});
  assert.deepEqual(navigationItems(settings,key=>key==='menu.home'?'首页':key),[{label:'首页',url:'/'},{label:'My notes',url:'/notes/'}]);
  assert.equal(normalizeConfig(defaults).branding.name,'');
  assert.equal(normalizeConfig(defaults).branding.logo,'/images/logo.webp');
  assert.equal(normalizeConfig(defaults).social.length,0);
});

test('normalization does not mutate reusable defaults and accepts absolute legacy avatars', () => {
  const original = structuredClone(defaults);
  const settings = normalizeConfig(defaults,{sidebar:{avatar:'https://example.com/me.png'},footer:{since:2020}});
  assert.equal(settings.branding.avatar,'https://example.com/me.png');
  assert.equal(settings.footer.since,2020);
  settings.navigation.menu[0].name='Changed';
  assert.deepEqual(defaults,original);
});


test('list options preserve explicit false and reject invalid summary lengths', () => {
  assert.deepEqual(normalizeConfig(defaults, {post_list:{summary:false,cover:false,summary_length:32}}).post_list,
    {summary:false,cover:false,summary_length:32});
  for (const summary_length of [0, -1, 1001, 1.5, '80', null]) {
    assert.equal(normalizeConfig(defaults, {post_list:{summary_length}}).post_list.summary_length, 160);
  }
});
