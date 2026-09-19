/* global document, window, innerWidth, getComputedStyle */
// Optional browser regression: use the same external Puppeteer/Chrome as D7.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const puppeteer = require(process.env.SYUTOI_PUPPETEER_PATH || 'puppeteer');
const base = process.env.SYUTOI_PREVIEW_URL || 'http://127.0.0.1:4000';
const output = process.env.SYUTOI_BROWSER_OUTPUT;
const browser = await puppeteer.launch({ executablePath:process.env.SYUTOI_CHROME || '/usr/bin/google-chrome', headless:true, args:['--no-sandbox'] });
const errors = [];
const report = { browser:await browser.version(), checks:[], errors };
if (output) await mkdir(output, {recursive:true});
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const visit = async path => {
    assert.equal((await page.goto(base+path,{waitUntil:'load'})).status(),200);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  };
  const scrollHeading = async index => {
    await page.evaluate(index => {
      const link = document.querySelectorAll('[data-toc="desktop"] a')[index];
      const heading = document.getElementById(decodeURIComponent(link.hash.slice(1)));
      window.scrollTo(0, window.scrollY + heading.getBoundingClientRect().top - 48);
    },index);
    await page.waitForFunction(index => document.querySelectorAll('[data-toc="desktop"] a')[index].getAttribute('aria-current') === 'location',{},index);
  };
  for (const mode of ['light','dark']) {
    await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:mode},{name:'prefers-reduced-motion',value:'reduce'}]);
    await page.setViewport({width:1440,height:800});
    await visit('/syutoi-long-read/');
    await scrollHeading(4);
    assert(await page.$eval('[data-toc="desktop"]', element => Math.abs(element.getBoundingClientRect().top-16)<2));
    assert.equal(await page.$$eval('[data-toc="desktop"] [aria-current]', elements => elements.length),1);
    assert(await page.evaluate(() => document.activeElement === document.body));
    if (output) await page.screenshot({path:join(output,`desktop-${mode}.png`)});
    await scrollHeading(1);
    await page.evaluate(() => window.scrollTo(0,0));
    await page.waitForFunction(() => !document.querySelector('[data-toc] [aria-current]'));
    report.checks.push(`sticky and scroll tracking up/down: ${mode}`);

    await page.setViewport({width:390,height:800});
    await visit('/syutoi-long-read/');
    assert(!(await page.$eval('.mobile-toc', element => element.open)));
    assert(await page.$eval('[data-toc="desktop"]', element => getComputedStyle(element).display === 'none'));
    await page.focus('.mobile-toc summary');
    await page.keyboard.press('Enter');
    assert(await page.$eval('.mobile-toc', element => element.open));
    await page.keyboard.press('Space');
    assert(!(await page.$eval('.mobile-toc', element => element.open)));
    await page.keyboard.press('Enter');
    if (output) {
      await page.$eval('.mobile-toc', element => element.scrollIntoView());
      await page.screenshot({path:join(output,`mobile-${mode}.png`)});
    }
    await page.focus('[data-toc="mobile"] a');
    await page.setViewport({width:1440,height:800});
    await page.waitForFunction(() => document.activeElement === document.querySelector('[data-toc="desktop"] a'));
    await page.setViewport({width:390,height:800});
    await page.waitForFunction(() => document.activeElement === document.querySelector('[data-toc="mobile"] a'));
    assert(await page.$eval('.mobile-toc', element => element.open));
    const href = await page.$eval('[data-toc="mobile"] a', element => element.getAttribute('href'));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => !!document.querySelector('[data-toc="mobile"] [aria-current="location"]'));
    assert(page.url().endsWith(href));
    await page.reload({waitUntil:'load'});
    await page.waitForFunction(() => !!document.querySelector('[data-toc="mobile"] [aria-current="location"]'));
    report.checks.push(`native disclosure, focus across breakpoints, hash navigation/reload: ${mode}`);
  }
  await page.setViewport({width:1440,height:800});
  await visit('/syutoi-long-read/');
  await scrollHeading(4);
  await page.evaluate(() => {
    document.documentElement.style.overflowAnchor = 'none';
    const spacer = document.createElement('div');
    spacer.style.height = '10000px';
    document.querySelector('[data-prose]').prepend(spacer);
  });
  await page.waitForFunction(() => !document.querySelector('[data-toc] [aria-current]'));
  report.checks.push('content resizing recomputes the current section without scrolling');
  await page.setViewport({width:1440,height:320});
  await visit('/reading-elements/');
  const count = await page.$$eval('[data-toc="desktop"] a', elements => elements.length);
  await scrollHeading(count-1);
  assert(await page.$eval('[data-toc="desktop"]', element => element.scrollHeight > element.clientHeight && element.scrollTop > 0));
  report.checks.push('long desktop TOC scrolls internally on standalone Page');
  await page.setViewport({width:320,height:800});
  await visit('/syutoi-boundaries/');
  await page.click('.mobile-toc summary');
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth+1));
  for (const path of ['/syutoi-minimal/','/examples/empty/']) {
    await visit(path);
    assert.equal(await page.$$eval('[data-toc]', elements => elements.length),0);
  }
  report.checks.push('long/duplicate titles and absent headings');

  await page.setJavaScriptEnabled(false);
  for (const width of [1440,390,320]) {
    await page.setViewport({width,height:800});
    await visit('/syutoi-long-read/');
    const target = width === 1440 ? 'desktop' : 'mobile';
    if (target === 'mobile') {
      await page.focus('.mobile-toc summary');
      await page.keyboard.press('Enter');
      assert(await page.$eval('.mobile-toc', element => element.open));
    }
    const selector = `[data-toc="${target}"] a`;
    await page.focus(selector);
    await page.keyboard.press('Enter');
    assert(await page.evaluate(() => !!document.getElementById(decodeURIComponent(window.location.hash.slice(1)))));
  }
  report.checks.push('no JS: desktop/mobile native navigation and disclosure');
  const fallback = await browser.newPage();
  fallback.on('pageerror', error => errors.push(error.message));
  await fallback.evaluateOnNewDocument(() => { window.ResizeObserver = undefined; });
  await fallback.goto(base+'/syutoi-long-read/',{waitUntil:'load'});
  await fallback.$eval('[data-prose] h2', element => element.scrollIntoView());
  await fallback.waitForFunction(() => !!document.querySelector('[data-toc] [aria-current]'));
  report.checks.push('scroll tracking without ResizeObserver');
  assert.deepEqual(errors,[]);
  report.finished = new Date().toISOString();
  if (output) await writeFile(join(output,'toc-report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
} finally { await browser.close(); }
