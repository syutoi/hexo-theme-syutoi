/* global document, window */
// Isolated E4 feasibility probe, not the theme's lightbox implementation.
// Supply an extracted PhotoSwipe package and an existing Puppeteer installation.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { transform } from 'esbuild';
const require = createRequire(import.meta.url);
const library = process.env.SYUTOI_PHOTOSWIPE_DIR;
assert(library, 'Set SYUTOI_PHOTOSWIPE_DIR to an extracted photoswipe package');
const puppeteer = require(process.env.SYUTOI_PUPPETEER_PATH || 'puppeteer');
const output = process.env.SYUTOI_BROWSER_OUTPUT || '/tmp/syutoi-e4-probe';
await mkdir(output, {recursive:true});
const pkg = JSON.parse(await readFile(join(library,'package.json'),'utf8'));
assert.equal(pkg.version,'5.4.4', 'Re-evaluate assumptions before changing the candidate version');
const files = new Map();
const report = { package:pkg.name, version:pkg.version, license:pkg.license, gzipLevel:9, assets:[], checks:[], errors:[] };
for (const name of ['photoswipe-lightbox.esm.min.js','photoswipe.esm.min.js','photoswipe.css']) {
  let bytes = await readFile(join(library,'dist',name));
  if (name.endsWith('.css')) bytes = Buffer.from((await transform(bytes.toString(),{loader:'css',minify:true})).code);
  files.set(`/blog/${name}`,bytes);
  report.assets.push({name,bytes:bytes.length,gzipBytes:gzipSync(bytes,{level:9}).length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
for (const name of ['image-wide.svg','image-tall.svg']) files.set(`/blog/${name}`,await readFile(new URL(`../example/source/assets/${name}`,import.meta.url)));
files.set('/blog/fixture.js',Buffer.from(`
import PhotoSwipeLightbox from './photoswipe-lightbox.esm.min.js';
const lightbox = new PhotoSwipeLightbox({gallery:'#gallery',children:'a',
  pswpModule:()=>import('./photoswipe.esm.min.js'),
  showHideAnimationType:matchMedia('(prefers-reduced-motion: reduce)').matches?'none':'fade',
  trapFocus:true,returnFocus:true,escKey:true,arrowKeys:true,
  closeTitle:'Close image',zoomTitle:'Zoom image',arrowPrevTitle:'Previous image',arrowNextTitle:'Next image'});
lightbox.init(); window.fixtureLightbox=lightbox;
`));
const html = enabled => `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>E4 isolated probe</title>
<style>body{font:16px system-ui;margin:20px}#gallery img{max-width:100%;height:auto;max-height:180px}a{display:inline-block}:focus-visible{outline:3px solid blue}</style>
${enabled?'<link rel="stylesheet" href="/blog/photoswipe.css"><script type="module" src="/blog/fixture.js"></script>':''}
<h1>E4 isolated image probe</h1><div id="gallery">
<a href="/blog/image-wide.svg" data-pswp-width="1200" data-pswp-height="300"><img src="/blog/image-wide.svg" alt="Wide image"></a>
<a href="/blog/image-tall.svg" data-pswp-width="300" data-pswp-height="1600"><img src="/blog/image-tall.svg" alt="Tall image"></a>
</div><a href="/blog/disabled/">Outside link</a></html>`;
files.set('/blog/enabled/',Buffer.from(html(true)));
files.set('/blog/disabled/',Buffer.from(html(false)));
const server = createServer((req,res) => {
  const path = new URL(req.url,'http://localhost').pathname;
  const file = files.get(path);
  res.writeHead(file?200:404,{'Content-Type':path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':path.endsWith('.svg')?'image/svg+xml':'text/html'});
  res.end(file || 'Not found');
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await puppeteer.launch({executablePath:process.env.SYUTOI_CHROME || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
  report.browser = await browser.version();
  const page = await browser.newPage();
  page.on('pageerror',error=>report.errors.push(error.message));
  let requests = [];
  page.on('request',request=>requests.push(request.url()));
  await page.setCacheEnabled(false);
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  for (const width of [1440,390]) {
    await page.setViewport({width,height:900});
    requests=[];
    await page.goto(base+'/blog/disabled/',{waitUntil:'networkidle0'});
    assert(!requests.some(url=>/photoswipe|fixture\.js/.test(url)));
    await page.focus('#gallery a');
    await Promise.all([page.waitForNavigation(),page.keyboard.press('Enter')]);
    assert(page.url().endsWith('/blog/image-wide.svg'));
    report.checks.push({width,case:'disabled: zero optional assets and native image navigation',passed:true});

    requests=[];
    await page.goto(base+'/blog/enabled/',{waitUntil:'networkidle0'});
    assert(requests.some(url=>url.endsWith('/photoswipe-lightbox.esm.min.js')));
    assert(!requests.some(url=>url.endsWith('/photoswipe.esm.min.js')));
    await page.focus('#gallery a');
    await page.keyboard.press('Enter');
    await page.waitForSelector('.pswp--open');
    await page.waitForFunction(()=>document.querySelector('.pswp')?.contains(document.activeElement));
    const focusSamples = [];
    for(let i=0;i<8;i++) {
      await page.keyboard.press('Tab');
      const focus = await page.$eval('.pswp',element=>({inside:element.contains(document.activeElement),documentFocused:document.hasFocus(),active:document.activeElement.outerHTML.slice(0,160)}));
      focusSamples.push(focus);
    }
    report.checks.push({width,case:'strict Tab focus loop',passed:focusSamples.every(sample=>sample.inside),focusSamples});
    await page.focus('.pswp__button--close');
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(()=>window.fixtureLightbox.pswp.currIndex===1);
    await page.screenshot({path:join(output,`enabled-${width}.png`)});
    await page.keyboard.press('Escape');
    await page.waitForSelector('.pswp',{hidden:true});
    assert(await page.$eval('#gallery a',element=>element===document.activeElement));
    assert.equal(requests.filter(url=>url.endsWith('/photoswipe.esm.min.js')).length,1);
    report.checks.push({width,case:'enabled: delayed core, keyboard navigation, focus return, reduced motion',passed:true,requests});
  }
  await page.setJavaScriptEnabled(false);
  await page.goto(base+'/blog/enabled/',{waitUntil:'networkidle0'});
  await page.focus('#gallery a');
  await Promise.all([page.waitForNavigation(),page.keyboard.press('Enter')]);
  assert(page.url().endsWith('/blog/image-wide.svg'));
  report.checks.push({case:'no JS: native image navigation',passed:true});
  if (process.env.SYUTOI_PREVIEW_URL) {
    const baseline = await browser.newPage();
    const baselineRequests = [];
    baseline.on('request',request=>baselineRequests.push(request.url()));
    const response = await baseline.goto(process.env.SYUTOI_PREVIEW_URL+'/pictures/',{waitUntil:'networkidle0'});
    assert.equal(response.status(),200);
    assert(!baselineRequests.some(url=>/photoswipe|lightbox|fancybox/i.test(url)));
    report.checks.push({case:'current theme (no lightbox integration): zero lightbox assets',passed:true,requests:baselineRequests});
    await baseline.close();
  }
  const failed = await browser.newPage();
  const importErrors = [];
  failed.on('pageerror',error=>importErrors.push(error.message));
  await failed.setRequestInterception(true);
  failed.on('request',request=>request.url().endsWith('/photoswipe.esm.min.js')?request.abort():request.continue());
  await failed.goto(base+'/blog/enabled/',{waitUntil:'networkidle0'});
  await failed.click('#gallery a');
  await new Promise(resolve=>setTimeout(resolve,750));
  report.failureProbe = {scenario:'core import blocked',nativeNavigationRestored:failed.url().endsWith('/blog/image-wide.svg'),errors:importErrors};
  await failed.close();
  assert.deepEqual(report.errors,[]);
  report.finished = new Date().toISOString();
  await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report,null,2));
} finally {
  await browser?.close();
  await new Promise(resolve=>server.close(resolve));
}
