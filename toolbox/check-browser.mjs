/* global window, document, innerWidth, getComputedStyle, matchMedia, location */
// Optional browser acceptance runner; not required by builds or CI.
// Supply an installed Puppeteer module and Chrome executable via environment.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const puppeteer = require(process.env.SYUTOI_PUPPETEER_PATH || 'puppeteer');
const base = process.env.SYUTOI_PREVIEW_URL || 'http://127.0.0.1:4000';
const output = process.env.SYUTOI_BROWSER_OUTPUT;
const paths = ['/', '/welcome/', '/archives/', '/categories/', '/categories/writing/', '/tags/', '/tags/写作/', '/friends/', '/404.html', '/examples/', '/examples/empty/', '/examples/english/', '/syutoi-long-read/', '/syutoi-minimal/', '/syutoi-boundaries/', '/no-title/', '/reading/', '/typography/', '/reading-elements/', '/code/', '/pictures/'];
const widths = [1440, 768, 390, 320];
const errors = [];
const external = new Set();
const report = {started:new Date().toISOString(), base, browser:'', node:process.version, platform:process.platform, paths, widths, modes:['light','dark'], matrix:[], noJS:[], checks:{}, externalBlocked:[], scriptErrors:errors};
if (output) await mkdir(output, {recursive:true});
const browser = await puppeteer.launch({executablePath:process.env.SYUTOI_CHROME || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
try {
  report.browser = await browser.version();
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (new URL(request.url()).origin === new URL(base).origin || request.url().startsWith('data:')) request.continue();
    else { external.add(`${request.resourceType()}: ${request.url()}`); request.abort(); }
  });
  await page.evaluateOnNewDocument(() => {
    localStorage.removeItem('syutoi.theme');
    localStorage.removeItem('theme');
    Object.defineProperty(navigator, 'clipboard', {value:{writeText:async text => {
      if (window.failCopy) throw new Error('Clipboard denied');
      window.copiedText = text;
    }}});
  });
  const visit = async path => {
    const response = await page.goto(base + path, {waitUntil:'load'});
    assert.equal(response.status(), 200, path);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Page overflow: ${path}`);
    assert(await page.$eval('main', element => element.getBoundingClientRect().height > 0), path);
  };
  for (const width of widths) {
    await page.setViewport({width,height:1000});
    for (const mode of report.modes) {
      await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:mode}]);
      for (const path of paths) {
        await visit(path);
        assert.equal(await page.$eval('html', element => element.dataset.theme), mode, `System theme: ${path}`);
        report.matrix.push({width,mode,path,passed:true});
        if (output && [1440,390].includes(width) && ['/', '/syutoi-long-read/'].includes(path)) {
          if (path !== '/') await page.$eval('.page-heading', element => element.scrollIntoView());
          await page.evaluate(async () => {
            for (const image of document.querySelectorAll('.hero-image, .article-cover')) await image.decode();
          });
          await page.screenshot({path:join(output, `${path === '/' ? 'home' : 'article'}-${width}-${mode}.png`)});
        }
      }
    }
  }
  // Keyboard disclosure, focus restoration and breakpoint transitions.
  await page.setViewport({width:390,height:1000});
  await visit('/');
  await page.keyboard.press('Tab');
  assert(await page.$eval('.skip-link', element => element === document.activeElement));
  await page.keyboard.press('Enter');
  assert(await page.$eval('main', element => element === document.activeElement && getComputedStyle(element).outlineStyle === 'solid'));
  await page.focus('[data-nav-toggle]');
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  assert(await page.$eval('#site-navigation a', element => element === document.activeElement));
  await page.keyboard.press('Escape');
  assert(await page.$eval('[data-nav-toggle]', element => element === document.activeElement && element.getAttribute('aria-expanded') === 'false'));
  await page.setViewport({width:1440,height:1000});
  await page.waitForFunction(() => document.activeElement === document.querySelector('#site-navigation a'));
  await page.setViewport({width:390,height:1000});
  await page.waitForFunction(() => document.activeElement === document.querySelector('[data-nav-toggle]'));
  await page.keyboard.press('Enter');
  await page.focus('#site-navigation a:last-child');
  await page.keyboard.press('Tab');
  assert(await page.$eval('[data-nav-toggle]', element => element.getAttribute('aria-expanded') === 'false'));
  report.checks.keyboardNavigation = true;

  await visit('/code/');
  const codeButton = await page.$eval('#whitespace-code', element => {
    element.closest('.code-block').querySelector('button').id = 'acceptance-copy';
    return '#acceptance-copy';
  });
  await page.focus(codeButton);
  await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(() => window.copiedText), '  first <tag> &\n\n\tsecond  \nlast\n');
  assert(await page.$eval(codeButton, element => element === document.activeElement));
  await page.evaluate(() => { window.failCopy = true; });
  await page.keyboard.press('Enter');
  assert(await page.$eval(codeButton, element => element.closest('.code-block').querySelector('.code-status').textContent.includes('复制失败')));
  await page.evaluate(() => { window.failCopy = false; });
  await page.keyboard.press('Enter');
  assert(await page.$eval(codeButton, element => element.closest('.code-block').querySelector('.code-status').textContent === '已复制'));
  report.checks.copyWhitespaceFailureRetryFocus = true;

  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  for (const path of ['/', '/reading-elements/', '/code/']) {
    await visit(path);
    assert(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches));
    const moving = await page.evaluate(() => [...document.querySelectorAll('*')].some(element => [null,'::before','::after'].some(pseudo => {
      const style = getComputedStyle(element,pseudo);
      return style.animationName !== 'none' || style.transitionDuration.split(',').some(value => parseFloat(value) > 0) || style.scrollBehavior !== 'auto';
    })));
    assert.equal(moving,false,`Reduced motion: ${path}`);
  }
  report.checks.reducedMotion = true;

  await page.setJavaScriptEnabled(false);
  for (const width of [1440,390,320]) {
    await page.setViewport({width,height:1000});
    for (const path of paths) {
      await visit(path);
      assert(await page.$eval('#site-navigation', element => getComputedStyle(element).display !== 'none'));
      assert(await page.$eval('[data-nav-toggle]', element => getComputedStyle(element).display === 'none'));
      assert(await page.$eval('[data-theme-toggle]', element => getComputedStyle(element).display === 'none'));
      report.noJS.push({width,path,passed:true});
    }
  }
  await visit('/archives/');
  await Promise.all([page.waitForNavigation({waitUntil:'load'}),page.click('a[href="/syutoi-long-read/"]')]);
  assert(page.url().endsWith('/syutoi-long-read/'));
  await visit('/syutoi-long-read/');
  await page.click('.mobile-toc summary');
  const contents = await page.$$('[data-toc="mobile"] a');
  await contents.at(-1).click();
  assert(await page.evaluate(() => !!document.getElementById(decodeURIComponent(location.hash.slice(1)))));
  await visit('/reading-elements/');
  await page.focus('.prose > details > summary');
  await page.keyboard.press('Enter');
  assert(await page.$eval('.prose > details', element => element.open));
  await page.keyboard.press('Space');
  assert(!(await page.$eval('.prose > details', element => element.open)));
  await page.click('.footnote-ref a');
  assert(page.url().endsWith('#fn1'));
  await page.click('.footnote-backref:last-child');
  assert(page.url().endsWith('#fnref1:1'));
  await page.focus('table[tabindex]');
  await page.keyboard.press('ArrowRight');
  await new Promise(resolve => setTimeout(resolve,250));
  assert(await page.$eval('table[tabindex]', element => element.scrollLeft > 0));
  await visit('/code/');
  assert.equal(await page.$$eval('.copy-button', elements => elements.length),0);
  assert.equal(await page.$$eval('.code-language', elements => elements.length),8);
  const scrolls = await page.$$('.code-scroll');
  const wide = [];
  for (const scroll of scrolls) if (await scroll.evaluate(element => element.scrollWidth > element.clientWidth)) wide.push(scroll);
  assert(wide.length > 0);
  await wide[0].focus();
  await page.keyboard.press('ArrowRight');
  await new Promise(resolve => setTimeout(resolve,250));
  assert(await wide[0].evaluate(element => element.scrollLeft > 0));
  report.checks.noJSNavigationTOCFootnotesDetailsTablesCode = true;

  const preferencePage = await browser.newPage();
  preferencePage.on('pageerror', error => errors.push(error.message));
  await preferencePage.emulateMediaFeatures([{name:'prefers-color-scheme',value:'light'}]);
  await preferencePage.goto(base+'/', {waitUntil:'load'});
  await preferencePage.focus('[data-theme-toggle]');
  await preferencePage.keyboard.press('Enter');
  await preferencePage.keyboard.press('Enter');
  assert.equal(await preferencePage.$eval('html', element => element.dataset.themePreference),'dark');
  await preferencePage.reload({waitUntil:'load'});
  assert.equal(await preferencePage.$eval('html', element => element.dataset.theme),'dark');
  await preferencePage.focus('[data-theme-toggle]');
  await preferencePage.keyboard.press('Enter');
  assert.equal(await preferencePage.$eval('html', element => element.dataset.theme),'light');
  await preferencePage.emulateMediaFeatures([{name:'prefers-color-scheme',value:'dark'}]);
  await preferencePage.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  const secondTab = await browser.newPage();
  await secondTab.goto(base+'/', {waitUntil:'load'});
  await preferencePage.keyboard.press('Enter');
  await secondTab.waitForFunction(() => document.documentElement.dataset.themePreference === 'light');
  await secondTab.close();
  await preferencePage.close();
  report.checks.themePersistenceSystemAndCrossTab = true;

  const restricted = await browser.newPage();
  restricted.on('pageerror', error => errors.push(error.message));
  await restricted.evaluateOnNewDocument(() => {
    Object.defineProperty(window,'localStorage',{get(){throw new Error('Storage blocked');}});
    Object.defineProperty(navigator,'clipboard',{value:undefined});
  });
  await restricted.setViewport({width:390,height:1000});
  await restricted.goto(base+'/code/', {waitUntil:'load'});
  assert.equal(await restricted.$$eval('.copy-button', elements => elements.length),0);
  await restricted.focus('[data-theme-toggle]');
  for (const mode of ['light','dark','auto']) {
    await restricted.keyboard.press('Enter');
    assert.equal(await restricted.$eval('html', element => element.dataset.themePreference),mode);
  }
  report.checks.restrictedStorageAndClipboard = true;
  assert.deepEqual(errors,[]);
  report.externalBlocked = [...external].sort();
  assert(!report.externalBlocked.some(value => /^(script|stylesheet|font):/.test(value)), 'Unexpected external runtime resources');
  report.finished = new Date().toISOString();
  if (output) await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({browser:report.browser,matrix:report.matrix.length,noJS:report.noJS.length,checks:report.checks,externalBlocked:report.externalBlocked,scriptErrors:errors,output}));
} finally { await browser.close(); }
