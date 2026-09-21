/* global document, innerWidth, getComputedStyle */
// Local-only acceptance: real Waline client, mock API; never posts to a live service.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, writeFile, readFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(new URL('../example/package.json', import.meta.url));
const Hexo = require('hexo');
const puppeteer = require(process.env.SYUTOI_PUPPETEER_PATH || 'puppeteer');
const directory = await mkdtemp(join(tmpdir(), 'syutoi-comments-browser-'));
const output = process.env.SYUTOI_BROWSER_OUTPUT || '/tmp/syutoi-f2';
const report = {started:new Date().toISOString(), browser:'', checks:[], errors:[], requests:[]};
const hexo = new Hexo(directory, {silent:true});
let browser;
let server;
let failure = '';
let posted;
try {
  await mkdir(output, {recursive:true});
  server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      report.requests.push({path:url.pathname, method:req.method});
      if (failure && url.pathname.includes(failure)) { res.writeHead(503); res.end('Injected outage'); return; }
      if (url.pathname === '/service/api/comment') {
        res.setHeader('Content-Type', 'application/json');
        if (req.method === 'POST') {
          let body = '';
          for await (const chunk of req) body += chunk;
          posted = JSON.parse(body);
          res.end(JSON.stringify({errno:0,data:{...posted,objectId:'local-comment',comment:'<p>Local acceptance comment</p>',insertedAt:'2026-09-22T00:00:00Z',children:[],like:0}}));
        } else res.end(JSON.stringify({errno:0,data:{count:0,totalPages:0,page:1,pageSize:10,data:[]}}));
        return;
      }
      if (!url.pathname.startsWith('/blog/') || url.pathname.includes('..')) throw new Error('Invalid route');
      const path = decodeURIComponent(url.pathname.slice(6)) + (url.pathname.endsWith('/') ? 'index.html' : '');
      const bytes = await readFile(join(directory, 'public', path));
      res.writeHead(200, {'Content-Type':{'.js':'text/javascript','.css':'text/css','.html':'text/html','.png':'image/png'}[extname(path)] || 'application/octet-stream'});
      res.end(bytes);
    } catch { res.writeHead(404); res.end('Not found'); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const base = `${origin}/blog/`;
  await mkdir(join(directory, 'themes'), {recursive:true});
  await mkdir(join(directory, 'source/_posts'), {recursive:true});
  await symlink(root, join(directory, 'themes/syutoi'));
  await symlink(join(root, 'example/node_modules'), join(directory, 'node_modules'));
  await writeFile(join(directory, 'package.json'), JSON.stringify({name:'comments-browser', hexo:{version:'8.1.2'}, dependencies:{'hexo-renderer-markdown-it':'7.1.1'}}));
  await writeFile(join(directory, '_config.yml'), 'title: Comments fixture\ntheme: syutoi\nlanguage: zh-CN\npermalink: :title/\nurl: '+base+'\nroot: /blog/\nignore: ["**/node_modules/**", "**/themes/syutoi/example/**"]\n');
  await writeFile(join(directory, '_config.syutoi.yml'), `comments:\n  provider: waline\n  server_url: ${origin}/service\n`);
  for (const [name, extra] of [['article',''],['disabled','comments: false']]) await writeFile(join(directory, `source/_posts/${name}.md`), `---\ntitle: ${name}\ndate: 2020-01-01\n${extra}\n---\n## Reading\nArticle text remains readable.\n`);
  await hexo.init();
  await hexo.call('generate');
  browser = await puppeteer.launch({executablePath:process.env.SYUTOI_CHROME || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
  report.browser = await browser.version();
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  page.on('pageerror', error => report.errors.push(error.message));
  const external = [];
  await page.setRequestInterception(true);
  page.on('request', req => {
    if (req.url().startsWith(origin) || req.url().startsWith('data:') || req.url()==='about:blank') req.continue();
    else { external.push(req.url()); req.abort(); }
  });
  const visit = async (path='article/') => {
    await page.goto('about:blank');
    report.requests = [];
    await page.goto(base+path, {waitUntil:'networkidle0'});
  };
  const mount = async () => {
    await page.focus('[data-comments-load]');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.wl-editor');
    await page.waitForFunction(() => document.querySelector('.wl-empty')?.getClientRects().length);
  };
  for (const width of [1440,390,320]) for (const mode of ['light','dark']) {
    await page.setViewport({width,height:1000});
    await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:mode}]);
    await visit('article/?utm_source=test#comments-title');
    assert(!report.requests.some(r=>/waline.min|\/service\//.test(r.path)));
    await mount();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth+1), false);
    assert.equal(await page.$eval('[data-comments-content]', el => el===document.activeElement), true);
    assert.equal(await page.$eval('.comments-slot', el => getComputedStyle(el).getPropertyValue('--waline-color').trim()), mode==='light'?'#333744':'#e9eaf0');
    assert.equal(await page.$eval('[data-comments-slot]', el => el.dataset.path), '/blog/article/');
    assert(report.requests.some(r=>r.path==='/service/api/comment'));
    assert(!report.requests.some(r=>r.path==='/service/api/article'));
    await page.$eval('.comments-slot', el => el.scrollIntoView());
    await page.screenshot({path:join(output,`comments-${width}-${mode}.png`)});
    await mount();
    assert.equal((await page.$$('.wl-editor')).length,1);
    assert.equal(report.requests.filter(r=>r.path.endsWith('/waline.min.js')).length,1,JSON.stringify(report.requests));
    report.checks.push({width,mode,case:'click-only assets, keyboard, stable path, theme, width and remount',passed:true});
  }
  for (const resource of ['waline.min.css','waline.min.js']) {
    failure = resource;
    await visit();
    await page.click('[data-comments-load]');
    await page.waitForFunction(() => document.querySelector('[data-comments-status]').textContent.includes('失败'));
    assert.equal(await page.$eval('[data-comments-load]', el => el===document.activeElement && !el.disabled), true);
    failure = '';
    await mount();
    report.checks.push({case:`retry after ${resource} failure`,passed:true});
  }
  failure = '/service/api/comment';
  await visit();
  await page.click('[data-comments-load]');
  await page.waitForSelector('.wl-operation button', {visible:true});
  failure = '';
  await mount();
  report.checks.push({case:'API failure and reload',passed:true});
  await page.type('input[name="nick"]', 'Local reader');
  await page.type('.wl-editor', 'Local acceptance comment');
  await page.click('.wl-btn.primary');
  await page.waitForFunction(() => document.querySelector('.wl-content')?.textContent.includes('Local acceptance comment'));
  assert.equal(posted.url, '/blog/article/');
  report.checks.push({case:'comment submission to local mock API only',passed:true});
  failure = 'comments.min.js';
  await visit();
  assert(await page.$eval('[data-comments-load]', el => el.hidden));
  assert(await page.$eval('[data-comments-status]', el => el.textContent.includes('JavaScript')));
  assert(!report.requests.some(r=>/waline.min|\/service\//.test(r.path)));
  failure = '';
  report.checks.push({case:'entry script failure preserves readable fallback',passed:true});
  await page.setJavaScriptEnabled(false);
  await visit();
  assert(await page.$eval('[data-comments-load]', el => el.hidden));
  assert(await page.$eval('[data-comments-status]', el => el.textContent.includes('JavaScript')));
  assert(!report.requests.some(r=>/waline.min|\/service\//.test(r.path)));
  await page.setJavaScriptEnabled(true);
  for (const path of ['', 'disabled/']) {
    await visit(path);
    assert.equal(await page.$('[data-comments-slot]'),null);
    assert(!report.requests.some(r=>/comments.min|waline.min|\/service\//.test(r.path)));
  }
  hexo.config.theme_config.comments.provider = 'none';
  await hexo.call('generate');
  await visit();
  assert.equal(await page.$('[data-comments-slot]'),null);
  assert(!report.requests.some(r=>/comments.min|waline.min|\/service\//.test(r.path)));
  report.checks.push({case:'no JS, disabled page, lists and global disable make no vendor or service requests',passed:true});
  assert.deepEqual(external, []);
  assert.deepEqual(report.errors, []);
  await writeFile(join(output,'browser.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({checks:report.checks,errors:report.errors,output},null,2));
} finally {
  await browser?.close();
  if (server) await new Promise(resolve=>server.close(resolve));
  await hexo.exit();
  await rm(directory,{recursive:true,force:true});
}
