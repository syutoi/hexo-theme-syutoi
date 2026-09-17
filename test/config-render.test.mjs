import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(new URL('../example/package.json', import.meta.url));
const Hexo = require('hexo');
const yaml = require('js-yaml');
const root = fileURLToPath(new URL('../', import.meta.url));

async function render(settings, rootPath = '/') {
  const directory = await mkdtemp(join(tmpdir(), 'syutoi-config-'));
  const hexo = new Hexo(directory, { silent: true });
  try {
    await mkdir(join(directory, 'themes'), { recursive: true });
    await mkdir(join(directory, 'source/_posts'), { recursive: true });
    await symlink(root, join(directory, 'themes/syutoi'));
    await symlink(join(root, 'example/node_modules'), join(directory, 'node_modules'));
    await writeFile(join(directory, 'package.json'), JSON.stringify({name:'config-fixture',hexo:{version:'8.1.2'},dependencies:{'hexo-renderer-markdown-it':'7.1.1'}}));
    await writeFile(join(directory, '_config.yml'), yaml.dump({title:'Fixture',author:'Writer',theme:'syutoi',language:'en',url:'https://example.com'+rootPath,root:rootPath,ignore:['**/node_modules/**','**/themes/syutoi/example/**']}));
    await writeFile(join(directory, '_config.syutoi.yml'), yaml.dump(settings));
    await writeFile(join(directory, 'source/_posts/sample.md'), '---\ntitle: Example\ndate: 2020-01-01\n---\n## Heading\n\nA paragraph.\n');
    await hexo.init();
    await hexo.call('generate');
    return await readFile(join(directory, 'public/index.html'), 'utf8');
  } finally {
    await hexo.exit();
    await rm(directory, {recursive:true,force:true});
  }
}

test('Hexo renders structured social links and local paths safely under a subdirectory', async () => {
  const html = await render({branding:{name:'My & blog',avatar:'/images/avatar.jpg'},navigation:{menu:[{name:'Only link',url:'/reading/'}]},social:[{name:'<b>Mail</b>',url:'mailto:hello@example.com'},{name:'Unsafe',url:'javascript:alert(1)'}],footer:{since:2020}}, '/blog/');
  assert.match(html,/My &amp; blog/);
  assert.match(html,/href="\/blog\/reading\/"/);
  assert.match(html,/src="\/blog\/images\/avatar.jpg"/);
  assert.match(html,/href="mailto:hello@example.com"/);
  assert.match(html,/&lt;b&gt;Mail&lt;\/b&gt;/);
  assert.doesNotMatch(html,/javascript:|>Unsafe</);
  assert.match(html,new RegExp(`2020–${new Date().getFullYear()}`));
  const navigation = html.match(/<nav id="site-navigation"[\s\S]*?<\/nav>/)[0];
  assert.equal((navigation.match(/<a /g)||[]).length,1,'A menu override must replace defaults');
});

test('Hexo respects empty navigation, absent images and disabled sidebar/footer features', async () => {
  const html = await render({navigation:{menu:[]},branding:{avatar:'',favicon:''},sidebar:{enable:false},footer:{powered:false,rss:false}});
  assert.match(html,/site-layout without-sidebar/);
  assert.doesNotMatch(html,/<aside|class="hero-image"|rel="icon"|class="powered-by"/);
  assert.doesNotMatch(html,/id="site-navigation"|data-nav-toggle/);
  assert.match(html,/Example/);
});

test('Hexo legacy overrides preserve identity, navigation and theme preference', async () => {
  const html = await render({alternate:'Legacy name',darkmode:true,sidebar:{avatar:'avatar.jpg'},menu:{home:'/ || home'},social:{mail:'mailto:legacy@example.com || envelope'}});
  assert.match(html,/data-theme-default="dark"/);
  assert.match(html,/>Legacy name<\/p>/);
  assert.match(html,/src="\/images\/avatar.jpg"/);
  assert.match(html,/href="mailto:legacy@example.com"/);
});
