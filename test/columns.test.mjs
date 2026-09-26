import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {categoryKey,columnPosts,columnForPage} = require('../lib/columns.cjs');
const {normalizeConfig} = require('../lib/config.cjs');
const post = (path,fields={}) => ({path,title:path,date:100,...fields});

test('columns sort explicit numeric order first, then date and stable path, filtering excluded content', () => {
  const posts=[post('b'),post('z',{column_order:20}),post('a'),post('first',{column_order:10}),post('old',{date:50}),post('string',{column_order:'1'}),post('secret',{password:'x'}),post('draft',{published:false}),post('future',{date:300}),post('optout',{column:false})];
  assert.deepEqual(columnPosts({posts},{},200).map(p=>p.path),['first','z','old','a','b','string']);
  assert.ok(columnPosts({posts},{future:true},200).some(p=>p.path==='future'));
  assert.equal(posts[0].path,'b');
});

test('column membership prefers the deepest enabled category and accepts only valid explicit membership', () => {
  const p=post('one');
  const categories=[{_id:'a',name:'Parent',path:'categories/parent/',posts:[p]}, {_id:'b',parent:'a',name:'Child',path:'categories/child/',posts:[p]}];
  const site={categories};
  const settings=normalizeConfig({columns:{categories:['Parent','Parent/Child','Parent/Child']}});
  assert.deepEqual(settings.columns.categories,['Parent','Parent/Child']);
  assert.equal(categoryKey(categories[1],categories),'Parent/Child');
  assert.equal(columnForPage(site,p,settings,{},true).key,'Parent/Child');
  assert.equal(columnForPage(site,{...p,column:'Parent'},settings,{},true).key,'Parent');
  assert.equal(columnForPage(site,{...p,column:'Missing'},settings,{},true),null);
  assert.equal(columnForPage(site,{...p,column:false},settings,{},true),null);
  assert.equal(columnForPage(site,p,normalizeConfig(),{},true).key,'Parent/Child');
  assert.equal(columnForPage(site,p,normalizeConfig({columns:{categories:[]}}),{},true),null);
  const result=columnForPage(site,p,settings,{},true);
  assert.equal(result.position,1);
  assert.equal(result.previous,null);
  assert.equal(result.next,null);
});
