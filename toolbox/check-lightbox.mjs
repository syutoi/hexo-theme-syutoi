/* global document, MouseEvent, getComputedStyle, innerWidth */
// Optional real-Hexo browser acceptance, isolated from the user's example config.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm, copyFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(new URL('../example/package.json', import.meta.url));
const Hexo = require('hexo');
const puppeteer = require(process.env.SYUTOI_PUPPETEER_PATH || 'puppeteer');
const directory = await mkdtemp(join(tmpdir(), 'syutoi-lightbox-'));
const output = process.env.SYUTOI_BROWSER_OUTPUT || '/tmp/syutoi-e4a';
const report = {started:new Date().toISOString(), browser:'', node:process.version, checks:[], metrics:[], errors:[]};
const hexo = new Hexo(directory, {silent:true});
let server;
let browser;
try {
  await mkdir(output, {recursive:true});
  await mkdir(join(directory,'themes'), {recursive:true});
  await mkdir(join(directory,'source/assets'), {recursive:true});
  await symlink(root, join(directory,'themes/syutoi'));
  await symlink(join(root,'example/node_modules'), join(directory,'node_modules'));
  await writeFile(join(directory,'package.json'), JSON.stringify({name:'lightbox-fixture',hexo:{version:'8.1.2'},dependencies:{'hexo-renderer-markdown-it':'7.1.1'}}));
  await writeFile(join(directory,'_config.yml'), 'title: Lightbox acceptance\ntheme: syutoi\nlanguage: en\nurl: http://localhost/blog\nroot: /blog/\nignore: ["**/node_modules/**", "**/themes/syutoi/example/**"]\n');
  await writeFile(join(directory,'_config.syutoi.yml'), 'lightbox:\n  enable: true\n');
  const content = `
<figure><img id="wide" src="/assets/image-wide.svg" alt="Wide &lt;b&gt;image&lt;/b&gt;" loading="eager" width="120" height="30"><figcaption>Caption &lt;b&gt;as text&lt;/b&gt;</figcaption></figure>
<figure><img id="tall" src="/assets/image-tall.svg" alt="Tall image" loading="eager"><figcaption>Tall caption</figcaption></figure>
<a id="original" href="/blog/assets/image-tall.svg" data-lightbox-width="300" data-lightbox-height="1600"><img src="/assets/image-wide.svg" alt="Original image link" loading="eager"></a>
<a id="failed-slide" href="/assets/missing-original.svg" data-lightbox-width="300" data-lightbox-height="1600"><img src="/assets/image-wide.svg" alt="Failed original" loading="eager"></a>
<a id="article-link" href="/blog/empty/"><img src="/assets/image-wide.svg" alt="Article link" loading="eager"></a>
<picture><source srcset="../assets/image-wide.svg"><img id="responsive" src="/assets/image-tall.svg" alt="Responsive image"></picture>
<img id="broken" src="/assets/broken.svg" alt="Broken image" loading="eager">
<img id="lazy" src="/assets/lazy.svg" alt="Lazy image" loading="lazy" style="margin-top:10000px">
`;
  for (const [name, front, body] of [['enabled','',''+content],['disabled','lightbox: false\n',content],['empty','','No pictures.']]) {
    await mkdir(join(directory,'source',name), {recursive:true});
    await writeFile(join(directory,'source',name,'index.md'), `---\ntitle: ${name}\n${front}---\n${body}`);
  }
  for (const name of ['image-wide.svg','image-tall.svg']) await copyFile(join(root,'example/source/assets',name),join(directory,'source/assets',name));
  await copyFile(join(root,'example/source/assets/image-wide.svg'),join(directory,'source/assets/lazy.svg'));
  await hexo.init();
  await hexo.call('generate');
  server = createServer(async (req,res) => {
    try {
      const path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
      if (!path.startsWith('/blog/') || path.includes('..')) throw new Error('Invalid path');
      const file = path.slice('/blog/'.length) + (path.endsWith('/') ? 'index.html' : '');
      const bytes = await readFile(join(directory,'public',file));
      res.writeHead(200, {'Content-Type': {'.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.html':'text/html'}[extname(file)] || 'application/octet-stream'});
      res.end(bytes);
    } catch { res.writeHead(404); res.end('Missing image or page'); }
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const base = `http://127.0.0.1:${server.address().port}/blog/`;
  browser = await puppeteer.launch({executablePath:process.env.SYUTOI_CHROME || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
  report.browser = await browser.version();
  const page = await browser.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  let requests = [];
  page.on('request', request => requests.push(request.url().replace(base,'/blog/')));
  await page.setCacheEnabled(false);
  for (const width of [1440,390]) for (const mode of ['light','dark']) {
    await page.setViewport({width,height:900});
    await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:mode},{name:'prefers-reduced-motion',value:'reduce'}]);
    let disabledGeometry;
    for (const state of ['disabled','empty','enabled']) {
      requests = [];
      await page.goto(base+state+'/', {waitUntil:'networkidle0'});
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1),false);
      if (state !== 'empty') {
        const geometry = await page.$$eval('#wide, #tall', images => images.map(image => { const rect = image.getBoundingClientRect(); return {width:rect.width,height:rect.height}; }));
        if (state === 'disabled') disabledGeometry = geometry;
        else assert.deepEqual(geometry, disabledGeometry, 'Image wrapping must preserve rendered dimensions');
      }
      if (state !== 'enabled') assert(!requests.some(url => /(?:lightbox|photoswipe)\.min/.test(url)));
      else {
        assert.equal(requests.filter(url => /lightbox.min.js/.test(url)).length,1);
        assert(!requests.some(url => /photoswipe.min.js|lightbox.min.css|lazy.svg/.test(url)));
        assert.equal(await page.$('#article-link[data-syutoi-lightbox]'),null);
        assert.equal(await page.$('#responsive').then(handle => handle.evaluate(el => el.parentElement.tagName)), 'PICTURE');
      }
      report.metrics.push({width,mode,state,resourcesBeforeClick:requests.slice(),navigation:await page.evaluate(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        return {domContentLoaded: navigation.domContentLoadedEventEnd,load:navigation.loadEventEnd};
      })});
    }
    const openStarted = Date.now();
    await page.focus('a:has(#wide)');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.pswp--open', {timeout:5000}).catch(async error => { console.error({url:page.url(),requests,errors:report.errors,body: (await page.content()).slice(-2500)}); throw error; });
    await page.waitForFunction(() => document.querySelector('.pswp')?.contains(document.activeElement));
    report.metrics.push({width,mode,state:'opened',openMilliseconds:Date.now()-openStarted});
    assert.equal(await page.$eval('.pswp__syutoi-caption',el=>el.textContent),'Caption <b>as text</b>');
    assert.equal(await page.$('.pswp__syutoi-caption b'),null);
    assert(await page.$eval('.site-layout',el=>el.inert));
    for (const key of ['Tab','Shift+Tab']) for (let i=0;i<12;i++) {
      if (key === 'Shift+Tab') await page.keyboard.down('Shift');
      await page.keyboard.press('Tab');
      if (key === 'Shift+Tab') await page.keyboard.up('Shift');
      assert(await page.$eval('.pswp',el=>el.contains(document.activeElement)),`${width}/${mode} ${key}`);
    }
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.querySelector('.pswp__syutoi-caption')?.textContent === 'Tall caption');
    assert.equal(await page.$eval('.pswp',el=>getComputedStyle(el).transitionDuration),'0s');
    await page.screenshot({path:join(output,`viewer-${width}-${mode}.png`)});
    await page.keyboard.press('Escape');
    await page.waitForSelector('.pswp',{hidden:true});
    assert(await page.$eval('a:has(#wide)',el=>el===document.activeElement));
    assert.equal(await page.$eval('.site-layout',el=>el.inert),false);
    await page.keyboard.press('Enter');
    await page.waitForSelector('.pswp--open');
    await page.click('.pswp__button--close');
    await page.waitForSelector('.pswp',{hidden:true});
    for (const asset of ['photoswipe.min.js','lightbox.min.css']) assert.equal(requests.filter(url=>url.includes(asset)).length,1);
    assert(!requests.some(url=>url.includes('lazy.svg')),'Opening the viewer must not eagerly load distant lazy images');
    report.checks.push({width,mode,case:'isolated resources, caption, dimensions, gallery, strict Tab/Shift+Tab, inert, Esc, return focus, repeated opening, reduced motion',passed:true});
  }
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
  await page.goto(base+'enabled/',{waitUntil:'networkidle0'});
  await page.click('#wide');
  await page.waitForSelector('.pswp--open');
  await page.waitForFunction(() => document.querySelector('.pswp')?.style.opacity === '1');
  await page.keyboard.press('Escape');
  await page.waitForSelector('.pswp',{hidden:true});
  assert(await page.$eval('a:has(#wide)',el=>el===document.activeElement));
  await page.click('#wide');
  await page.waitForSelector('.pswp--open');
  await page.$eval('.pswp__button--close', el => el.click());
  await page.waitForSelector('.pswp',{hidden:true});
  report.checks.push({case:'mouse opening, ordinary fade animation and early Escape/close button',passed:true});
  await page.goto(base+'disabled/',{waitUntil:'networkidle0'});
  await page.focus('#original');
  await Promise.all([page.waitForNavigation(),page.keyboard.press('Enter')]);
  assert(page.url().endsWith('/blog/assets/image-tall.svg'));
  report.checks.push({case:'disabled page preserves existing original link',passed:true});
  // Existing links and modifier clicks keep their native contract.
  await page.goto(base+'enabled/',{waitUntil:'networkidle0'});
  assert(await page.$eval('a:has(#wide)',el => {
    const event = new MouseEvent('click',{bubbles:true,cancelable:true,ctrlKey:true});
    el.dispatchEvent(event); return !event.defaultPrevented;
  }));
  await page.focus('#article-link');
  await Promise.all([page.waitForNavigation(),page.keyboard.press('Enter')]);
  assert.equal(page.url(),base+'empty/');
  report.checks.push({case:'author links and modifier click',passed:true});
  await page.goto(base+'enabled/',{waitUntil:'networkidle0'});
  await page.focus('#failed-slide');
  await page.keyboard.press('Enter');
  await page.waitForSelector('.pswp__error-msg-container a');
  assert((await page.$eval('.pswp__error-msg-container a',el=>el.href)).endsWith('/blog/assets/missing-original.svg'));
  await page.focus('.pswp__error-msg-container a');
  await Promise.all([page.waitForNavigation(),page.keyboard.press('Enter')]);
  assert(page.url().endsWith('/blog/assets/missing-original.svg'));
  report.checks.push({case:'gallery image failure offers a native original link',passed:true});
  for (const blocked of ['no-js','lightbox.min.js','lightbox.min.css','photoswipe.min.js','invalid-css','broken-image']) {
    const fallback = await browser.newPage();
    const errors = [];
    const network = [];
    fallback.on('pageerror',error=>errors.push(error.message));
    await fallback.setRequestInterception(true);
    fallback.on('request',request => {
      network.push(request.url());
      if (blocked === 'invalid-css' && request.url().includes('lightbox.min.css')) request.respond({status:200,contentType:'text/css',body:'/* empty response */'});
      else if (!['no-js','broken-image'].includes(blocked) && request.url().includes(blocked)) request.abort();
      else request.continue();
    });
    if (blocked === 'no-js') await fallback.setJavaScriptEnabled(false);
    await fallback.goto(base+'enabled/',{waitUntil:'networkidle0'});
    const selector = blocked === 'broken-image' ? 'a:has(#broken)' : 'a:has(#wide)';
    await fallback.focus(selector);
    await Promise.all([fallback.waitForNavigation({timeout:20000}),fallback.keyboard.press('Enter')]);
    assert(fallback.url().endsWith(blocked === 'broken-image' ? '/blog/assets/broken.svg' : '/blog/assets/image-wide.svg'),blocked);
    assert.deepEqual(errors,[],blocked);
    if (blocked === 'no-js') assert(!network.some(url=>/photoswipe.min.js|lightbox.min.css/.test(url)));
    report.checks.push({case:`native fallback: ${blocked}`,passed:true});
    await fallback.close();
  }
  assert.deepEqual(report.errors,[]);
  report.finished = new Date().toISOString();
  await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({checks:report.checks,report:join(output,'report.json')},null,2));
} finally {
  await browser?.close();
  if (server) await new Promise(resolve=>server.close(resolve));
  await hexo.exit();
  await rm(directory,{recursive:true,force:true});
}
