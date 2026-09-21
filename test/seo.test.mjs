import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { normalizeConfig } = require('../lib/config.cjs');
const { openGraphLocale, twitterHandle, metadata } = require('../lib/seo.cjs');

test('SEO config validates booleans, image schemes, handles and language territories', () => {
  const seo = normalizeConfig({}, {seo:{open_graph:'false',twitter_card:false,noindex:'true',default_image:'javascript:alert(1)',twitter_site:'https://x.com/name'}}).seo;
  assert.equal(seo.open_graph,true);
  assert.equal(seo.twitter_card,false);
  assert.equal(seo.noindex,false);
  assert.equal(seo.default_image,'');
  assert.equal(seo.twitter_site,'');
  assert.equal(twitterHandle(' @reader_1 '),'@reader_1');
  for (const invalid of ['@@name','name with spaces','name-is-bad','abcdefghijklmnop',{},null]) assert.equal(twitterHandle(invalid),'');
  for (const [language,locale] of [['en','en_US'],['en-GB','en_GB'],['zh-Hant','zh_TW'],['zh-HK','zh_HK'],['zh-CN','zh_CN'],['invalid!','']]) assert.equal(openGraphLocale(language),locale);
});

test('search and 404 remain noindex, while sharing switches are independent', () => {
  const context = {
    config:{title:'Site',url:'https://example.com'},
    syutoi_settings:()=>normalizeConfig({}, {seo:{open_graph:false}}),
    syutoi_title:()=> 'Page', is_post:()=>false, full_url_for:path=>new URL(path,'https://example.com').href
  };
  for (const type of ['search','404']) {
    const result = metadata({...context,page:{type,path:'page/',lang:'en',seo:{noindex:false}}});
    assert.equal(result.noindex,true);
    assert.equal(result.openGraph,false);
    assert.equal(result.twitterCard,true);
  }
  assert.equal(metadata({...context,page:{path:'about/',lang:'en'}}).noindex,false);
});
