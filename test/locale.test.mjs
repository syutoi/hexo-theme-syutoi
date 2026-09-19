import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { resolveLocale } = require('../lib/locale.cjs');
const yaml = require('js-yaml');
const available = ['en', 'zh-CN', 'zh-TW', 'zh-HK', 'ja'];

test('locale resolution normalizes aliases, arrays and malformed settings without losing the content language', () => {
  assert.deepEqual(resolveLocale('zh_hant', ['zh-CN', 'en'], available), {lang:'zh-Hant', languages:['zh-TW','zh-CN','en']});
  assert.deepEqual(resolveLocale('en-US', 'zh-CN', available), {lang:'en-US', languages:['en','zh-CN']});
  assert.deepEqual(resolveLocale(undefined, ['zh_CN','en'], available), {lang:'zh-CN', languages:['zh-CN','en']});
  assert.deepEqual(resolveLocale('fr', undefined, available), {lang:'fr', languages:['en']});
  assert.deepEqual(resolveLocale({bad:true}, [null,'bad tag','default'], available), {lang:'en', languages:['en']});
  assert.deepEqual(resolveLocale('zh-HK', 'en', available), {lang:'zh-HK', languages:['zh-HK','en']});
});

const flatten = (data, prefix = '') => Object.entries(data).flatMap(([key,value]) => typeof value === 'object' ? flatten(value, `${prefix}${key}.`) : [[`${prefix}${key}`,value]]);
const files = directory => readdirSync(directory,{withFileTypes:true}).flatMap(entry => entry.isDirectory() ? files(new URL(entry.name+'/',directory)) : [new URL(entry.name,directory)]);
test('core translations have matching nonempty keys and cover literal template labels', () => {
  const tables=['en','zh-CN','zh-TW'].map(locale=>Object.fromEntries(flatten(yaml.load(readFileSync(new URL(`../languages/${locale}.yml`,import.meta.url),'utf8')))));
  const keys=Object.keys(tables[0]).sort();
  for(const table of tables) {
    assert.deepEqual(Object.keys(table).sort(),keys);
    for(const value of Object.values(table)) assert.equal(typeof value==='string' && value.trim().length>0,true);
  }
  for(const path of [...files(new URL('../layout/',import.meta.url)),new URL('../scripts/helpers/view.js',import.meta.url)]) {
    const source=readFileSync(path,'utf8');
    for(const [,key] of source.matchAll(/__\(['"]([^'"]+)['"]/g)) assert(keys.includes(key),`Missing ${key} in ${path}`);
  }
});
