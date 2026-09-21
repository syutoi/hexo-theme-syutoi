/* global document, innerWidth */
// Real Hexo + Pagefind acceptance. No user configuration is changed.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';
const root = fileURLToPath(new URL('../',import.meta.url));
const require = createRequire(new URL('../example/package.json',import.meta.url));
const Hexo = require('hexo');
const puppeteer = require(process.env.SYUTOI_PUPPETEER_PATH || 'puppeteer');
const directory = await mkdtemp(join(tmpdir(),'syutoi-search-browser-'));
const output = process.env.SYUTOI_BROWSER_OUTPUT || '/tmp/syutoi-f1';
const report = {started:new Date().toISOString(),browser:'',node:process.version,checks:[],resources:[],assets:[],errors:[]};
const hexo = new Hexo(directory,{silent:true});
let server;
let browser;
let blockedAsset = '';
let delayManifest = false;
try {
  await mkdir(output,{recursive:true});
  await mkdir(join(directory,'themes'),{recursive:true});
  await mkdir(join(directory,'source/_posts'),{recursive:true});
  await symlink(root,join(directory,'themes/syutoi'));
  await symlink(join(root,'example/node_modules'),join(directory,'node_modules'));
  await writeFile(join(directory,'package.json'),JSON.stringify({name:'search-browser',hexo:{version:'8.1.2'},dependencies:{'hexo-renderer-markdown-it':'7.1.1'}}));
  await writeFile(join(directory,'_config.yml'),'title: Search fixture\ntheme: syutoi\nlanguage: zh-CN\nurl: http://localhost/blog\nroot: /blog/\nignore: ["**/node_modules/**", "**/themes/syutoi/example/**"]\n');
  await writeFile(join(directory,'_config.syutoi.yml'),'search:\n  provider: pagefind\n');
  for (let index=0;index<12;index++) await writeFile(join(directory,`source/_posts/article-${index}.md`),`---\ntitle: Notebook ${index}\ndate: 2020-01-01\n---\nEnglish notebook writing notes.\n`);
  await writeFile(join(directory,'source/_posts/chinese.md'),'---\ntitle: 中文搜索体验\ndate: 2020-01-01\n---\n阅读体验，中文全文搜索。\n');
  await writeFile(join(directory,'source/_posts/hidden.md'),'---\ntitle: Hidden\ndate: 2020-01-01\nsearch: false\n---\nExcludedsecretword.');
  await mkdir(join(directory,'source/guide'),{recursive:true});
  await writeFile(join(directory,'source/guide/index.md'),'---\ntitle: "Literal <img src=x onerror=alert(1)> title"\nlang: en\n---\nStandalone guideword &lt;script&gt;text&lt;/script&gt;.');
  await hexo.init();
  await hexo.call('generate');
  for (const path of hexo.route.list().filter(path=>path.startsWith('_syutoi/search/'))) {
    const bytes = await readFile(join(directory,'public',path));
    report.assets.push({path,bytes:bytes.length,gzipBytes:gzipSync(bytes,{level:9}).length});
  }
  server = createServer(async (req,res)=>{
    try {
      const path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if (!path.startsWith('/blog/') || path.includes('..')) throw new Error('Invalid path');
      if (blockedAsset && path.includes(blockedAsset)) {res.writeHead(503);res.end('Injected outage');return;}
      if (delayManifest && path.endsWith('manifest.json')) await new Promise(resolve=>setTimeout(resolve,500));
      const file=path.slice(6)+(path.endsWith('/')?'index.html':'');
      const bytes=await readFile(join(directory,'public',file));
      res.writeHead(200,{'Content-Type':{'.js':'text/javascript','.css':'text/css','.json':'application/json','.html':'text/html'}[extname(file)] || 'application/octet-stream'});res.end(bytes);
    } catch {res.writeHead(404);res.end('Not found');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}/blog/`;
  browser=await puppeteer.launch({executablePath:process.env.SYUTOI_CHROME || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
  report.browser=await browser.version();
  const page=await browser.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  let requests=[];
  page.on('request',request=>requests.push(request.url().replace(base,'/blog/')));
  const query=async term=>{
    await page.$eval('#search-query',(input,value)=>{input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));},term);
    await page.focus('#search-query');
    await page.keyboard.press('Enter');
    await page.waitForFunction(()=>!document.querySelector('[data-search]').hasAttribute('aria-busy'));
    assert.notEqual(await page.$eval('[data-search-status]',el=>el.textContent),'搜索暂时不可用，请重试。');
  };
  for (const width of [1440,390,320]) for (const mode of ['light','dark']) {
    await page.setViewport({width,height:900});
    await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:mode}]);
    requests=[];
    await page.goto(base,{waitUntil:'networkidle0'});
    assert(!requests.some(url=>url.includes('search.min') || url.includes('_syutoi/search')));
    await page.goto(base+'search/',{waitUntil:'networkidle0'});
    assert(!requests.some(url=>url.includes('_syutoi/search')),'No index or engine before a query');
    await page.focus('#search-query');
    await page.keyboard.press('Enter');
    await page.$eval('#search-query',el=>{el.value='notebook';el.dispatchEvent(new Event('compositionstart'));});
    await page.keyboard.press('Enter');
    assert(!requests.some(url=>url.includes('_syutoi/search')),'Empty and composing queries do not load the engine');
    await page.$eval('#search-query',el=>el.dispatchEvent(new Event('compositionend')));
    await query('阅读');
    assert.equal(await page.$$eval('.search-results li',items=>items.length),1,'Chinese segmentation/prefix search');
    assert((await page.$eval('.search-results a',el=>el.href)).includes('/blog/'));
    await query('notebook');
    assert.equal(await page.$$eval('.search-results li',items=>items.length),10);
    await page.click('[data-search-more]');
    await page.waitForFunction(()=>document.querySelectorAll('.search-results li').length===12);
    assert(await page.$eval('.search-results li:nth-child(11) a',el=>el===document.activeElement));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
    await page.$eval('.search-form',el=>el.scrollIntoView());
    await page.screenshot({path:join(output,`search-${width}-${mode}.png`)});
    await query('excludedsecretword');
    assert.equal(await page.$$eval('.search-results li',items=>items.length),0);
    await query('guideword');
    assert.equal(await page.$('.search-results img'),null);
    assert((await page.$eval('.search-results a',el=>el.textContent)).includes('<img'));
    assert([base+'guide/',base+'guide/index.html'].includes(await page.$eval('.search-results a',el=>el.href)));
    await page.click('button[type="reset"]');
    assert.equal(await page.$eval('#search-query',el=>el.value),'');
    assert(await page.$eval('#search-query',el=>el===document.activeElement));
    assert.equal(await page.$$eval('.search-results li',items=>items.length),0);
    report.resources.push({width,mode,requests:requests.slice()});
    report.checks.push({width,mode,case:'lazy assets, Chinese/English/Page search, pagination, opt-out, inert snippets, root URLs, keyboard and clear',passed:true});
  }
  blockedAsset='search.min.js';
  const noEntry=await browser.newPage();
  await noEntry.goto(base+'search/',{waitUntil:'networkidle0'});
  assert(await noEntry.$eval('#search-query',el=>el.disabled));
  assert((await noEntry.$eval('[data-search-status]',el=>el.textContent)).includes('JavaScript'));
  report.checks.push({case:'entry download failure preserves the archive fallback',passed:true});
  await noEntry.close();
  blockedAsset='';
  for (const blocked of ['manifest.json','pagefind.js','wasm.']) {
    const failed=await browser.newPage();
    const errors=[];
    blockedAsset=blocked;
    failed.on('pageerror',error=>errors.push(error.message));
    await failed.goto(base+'search/',{waitUntil:'networkidle0'});
    await failed.type('#search-query','notebook');
    await failed.keyboard.press('Enter');
    await failed.waitForFunction(()=>document.querySelector('[data-search-status]').textContent.includes('暂时不可用'),{timeout:20000});
    blockedAsset='';
    await failed.focus('#search-query');
    await failed.keyboard.press('Enter');
    await failed.waitForSelector('.search-results li',{timeout:20000}).catch(async error=>{ console.error({blocked,errors,status:await failed.$eval('[data-search-status]',el=>el.textContent)});throw error; });
    assert.deepEqual(errors,[],blocked);
    report.checks.push({case:`error and retry: ${blocked}`,passed:true});
    await failed.close();
  }
  const stale=await browser.newPage();
  delayManifest=true;
  await stale.goto(base+'search/',{waitUntil:'networkidle0'});
  await stale.type('#search-query','notebook');await stale.keyboard.press('Enter');
  await stale.click('button[type="reset"]');
  await new Promise(resolve=>setTimeout(resolve,1500));
  assert.equal(await stale.$$eval('.search-results li',items=>items.length),0);
  report.checks.push({case:'late response cannot restore cleared results',passed:true});
  await stale.close();
  delayManifest=false;
  const nojs=await browser.newPage();await nojs.setJavaScriptEnabled(false);
  const nojsRequests=[];nojs.on('request',request=>nojsRequests.push(request.url()));
  await nojs.goto(base+'search/',{waitUntil:'networkidle0'});
  assert(await nojs.$eval('#search-query',el=>el.disabled));
  assert((await nojs.$eval('[data-search-status]',el=>el.textContent)).includes('JavaScript'));
  assert(!nojsRequests.some(url=>url.includes('_syutoi/search')));
  report.checks.push({case:'no JavaScript: archive fallback and no search engine requests',passed:true});
  assert.deepEqual(report.errors,[]);
  report.finished=new Date().toISOString();
  await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({checks:report.checks,output},null,2));
} finally {
  await browser?.close();
  if (server) await new Promise(resolve=>server.close(resolve));
  await hexo.exit();await rm(directory,{recursive:true,force:true});
}
