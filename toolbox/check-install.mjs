// Optional end-to-end Git installation check; uses an isolated site and network installs.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, readFile, writeFile, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseDocument, DomUtils } from 'htmlparser2';
import yaml from 'js-yaml';

const exec = promisify(execFile);
const repository = fileURLToPath(new URL('../', import.meta.url));
const directory = await mkdtemp(join(tmpdir(), 'syutoi-install-'));
const theme = join(directory, 'themes/syutoi');
const report = {directory, node:process.version, commit:'', commands:[], scenarios:[]};
console.log(`Installation workspace: ${directory}`);
async function run(command, args, cwd = directory) {
  console.log(`Running: ${command} ${args.join(' ')}`);
  try {
    const result = await exec(command, args, {cwd, maxBuffer:16*1024*1024, env:{...process.env, CI:'true'}});
    report.commands.push({command:[command,...args], cwd, stdout:result.stdout, stderr:result.stderr});
    return result.stdout.trim();
  } catch (error) {
    report.commands.push({command:[command,...args], cwd, stdout:error.stdout, stderr:error.stderr, code:error.code});
    throw error;
  }
}
try {
  report.commit = await run('git', ['rev-parse','HEAD'], repository);
  report.pnpm = await run('pnpm', ['--version']);
  await mkdir(join(directory,'themes'), {recursive:true});
  await run('git', ['clone','--no-hardlinks',repository,theme]);
  assert.equal(await run('git', ['rev-parse','HEAD'], theme), report.commit);
  await run('pnpm', ['--dir',theme,'install','--prod','--frozen-lockfile','--filter','hexo-theme-syutoi']);
  // A standalone minimal Hexo blog, not the theme workspace or its example dependencies.
  await writeFile(join(directory,'package.json'), JSON.stringify({name:'syutoi-install-validation',private:true,hexo:{version:'8.1.2'}},null,2));
  await run('pnpm', ['add','hexo@8.1.2','hexo-renderer-markdown-it@7.1.1','markdown-it-task-lists@2.1.1','hexo-generator-category','hexo-generator-tag','hexo-server']);
  await run('pnpm', ['install','--frozen-lockfile']);
  await run('pnpm', ['--dir',theme,'install','--prod','--frozen-lockfile','--filter','hexo-theme-syutoi']);
  await assert.rejects(access(join(theme,'node_modules/esbuild')), 'Theme dev dependencies should not be installed');
  const manifest = JSON.parse(await readFile(join(directory,'package.json'),'utf8'));
  report.siteVersions = {};
  for (const name of Object.keys(manifest.dependencies)) {
    report.siteVersions[name] = JSON.parse(await readFile(join(directory,'node_modules',name,'package.json'),'utf8')).version;
  }
  const guide = await readFile(join(repository,'docs/getting-started.md'),'utf8');
  const configText = [...guide.matchAll(/```yaml\n([\s\S]*?)```/g)].map(match=>match[1]).find(text=>text.startsWith('theme: syutoi'));
  assert(configText, 'Quick-start site YAML missing');
  const config = {...yaml.load(configText), permalink:':title/'};
  for (const path of ['source/_posts','source/about','source/images']) await mkdir(join(directory,path),{recursive:true});
  await writeFile(join(directory,'source/images/avatar.png'),await readFile(join(theme,'source/images/avatar.png')));
  await writeFile(join(directory,'source/_posts/welcome.md'),`---\ntitle: Installation check\ndate: 2026-09-23 00:00:00\ncategories: [Guide]\ntags: [Install]\n---\n## Section\n\nHello from an independent site.\n\n![Avatar](/images/avatar.png "Local caption"){width=100 height=100}\n\n> [!TIP]\n> Restart after configuration changes.\n\nFootnote.[^one]\n\n[^one]: Note body.\n\n- [x] Checked\n\n\`\`\`js\nconst value = 1;\n\`\`\`\n`);
  await writeFile(join(directory,'source/about/index.md'),'---\ntitle: About\n---\nIndependent Page.\n');
  for (const root of ['/', '/blog/']) {
    for (const extended of [false,true]) {
      const site = structuredClone(config);
      site.root=root; site.url='https://example.com'+root;
      if (extended) site.markdown.plugins.push(
        {name:'markdown-it-attrs',options:{allowedAttributes:['width','height']}},
        {name:'./themes/syutoi/lib/markdown-alerts.cjs'}
      );
      await writeFile(join(directory,'_config.yml'),yaml.dump(site));
      await writeFile(join(directory,'_config.syutoi.yml'),yaml.dump({lightbox:{enable:extended},search:{provider:extended?'pagefind':'none'}}));
      await run('pnpm',['exec','hexo','clean']);
      await run('pnpm',['exec','hexo','generate']);
      const routes=['index.html','welcome/index.html','about/index.html','archives/index.html','categories/index.html','categories/Guide/index.html','tags/index.html','tags/Install/index.html','404.html'];
      for(const path of routes) {
        const html=await readFile(join(directory,'public',path),'utf8');
        assert.match(html,/<!doctype html>/i);
        const dom=parseDocument(html);
        for (const node of DomUtils.findAll(node=>node.name==='script'||(node.name==='link'&&node.attribs.rel==='stylesheet'),dom.children)) {
          const url=node.attribs.src||node.attribs.href;
          if(!url)continue;
          assert(url.startsWith(root),`Invalid asset path: ${url}`);
          await access(join(directory,'public',new URL(url,'https://example.com').pathname.slice(root.length)));
        }
      }
      const html=await readFile(join(directory,'public/welcome/index.html'),'utf8');
      assert.match(html,/id="fn1"/); assert.match(html,/type="checkbox"/);
      assert.match(html,/code-block/); assert(!html.includes('/blog/blog/'));
      const dom=parseDocument(html);
      const img=DomUtils.findOne(node=>node.name==='img'&&node.attribs.alt==='Avatar',dom.children,true);
      assert.equal(img.attribs.src,root+'images/avatar.png');
      if(extended) {
        assert.match(html,/<figcaption>Local caption<\/figcaption>/);
        assert.equal(img.attribs.width,'100'); assert.equal(img.attribs.height,'100');
        assert.match(html,/markdown-alert-tip/); assert.match(html,/data-syutoi-lightbox/);
        await access(join(directory,'public/search/index.html'));
        assert.match(await readFile(join(directory,'public/index.html'),'utf8'),/search/);
      } else {
        assert.doesNotMatch(html,/class="markdown-alert/); assert.equal(img.attribs.width,undefined);
        await assert.rejects(access(join(directory,'public/search/index.html')));
      }
      report.scenarios.push({root,extended,pages:routes.length,passed:true});
    }
  }
  console.log('Verified four independent Git installation scenarios.');
} catch(error) {
  report.error=error.stack;
  process.exitCode=1;
  console.error(error);
} finally {
  await writeFile(join(directory,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(`Report: ${join(directory,'report.json')}`);
}
