import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require = createRequire(import.meta.url);
const {columnHomes} = require('../lib/column-homes.cjs');
const categories = [{_id:'guide',name:'Guide',path:'categories/guide/'},{_id:'notes',name:'Notes',path:'categories/notes/'}];
const index = (fields = {}) => ({_id:'intro',source:'_posts/guide/index.md',categories:[categories[0]],date:new Date('2020-01-01'),path:'2020/01/01/guide/index/',content:'Intro',...fields});
const resolve = (posts, pages=[], enabled='all', config={}) => columnHomes(posts,categories,pages,{columns:{categories:enabled}},config,path=>`https://example.com/${path}`);

test('index convention is optional, category based and excluded from posts', () => {
  const result = resolve([index()]);
  assert.equal(result.homes.Guide.path,'categories/guide/index.html');
  assert.ok(result.excluded.has('intro'));
  assert.equal(Object.keys(resolve([index({column:false})]).homes).length,0);
  assert.equal(Object.keys(resolve([index()],[],[]).homes).length,0);
  assert.equal(Object.keys(resolve([index({source:'_posts/index.md'})]).homes).length,0);
  for (const fields of [{password:'secret'},{published:false},{date:new Date('2999-01-01')}]) {
    const hidden = resolve([index(fields)]);
    assert.ok(hidden.excluded.has('intro'));
    assert.equal(Object.keys(hidden.homes).length,0);
  }
  assert.ok(resolve([index({date:new Date('2999-01-01')})],[],'all',{future:true}).homes.Guide);
});

test('home ambiguity, duplicate homes, reserved and conflicting routes fail clearly', () => {
  assert.throws(()=>resolve([index({categories:[]})]),/needs categories/);
  assert.throws(()=>resolve([index({categories})]),/ambiguous/);
  assert.ok(resolve([index({categories,column:'Notes'})]).homes.Notes);
  assert.throws(()=>resolve([index(),index({_id:'second',source:'_posts/second/index.md'})]),/Multiple index/);
  for(const path of ['/','/archives/','/categories/','../escape/','https://example.com/']) {
    assert.throws(()=>resolve([index({__permalink:path,path})]),/invalid or reserved/);
  }
  const home=index({__permalink:'guide/',path:'/guide/'});
  assert.throws(()=>resolve([home],[{path:'guide/index.html'}]),/conflicts/);
  assert.throws(()=>resolve([home,{_id:'article',path:'guide/',source:'_posts/chapter.md'}]),/conflicts/);
  assert.throws(()=>resolve([index({__permalink:'categories/notes/',path:'categories/notes/'})]),/conflicts/);
});
