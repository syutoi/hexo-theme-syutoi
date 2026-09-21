/* global document, window, innerWidth, getComputedStyle */
// Optional local acceptance tool. Supply Puppeteer, axe-core and Chrome externally.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const puppeteer = require(process.env.SYUTOI_PUPPETEER_PATH || 'puppeteer');
const axePath = process.env.SYUTOI_AXE_PATH || require.resolve('axe-core/axe.min.js');
const axe = await readFile(axePath, 'utf8');
const base = process.env.SYUTOI_PREVIEW_URL || 'http://127.0.0.1:4000';
const output = process.env.SYUTOI_A11Y_OUTPUT || '/tmp/syutoi-accessibility';
const paths = ['/', '/syutoi-long-read/', '/examples/', '/archives/', '/categories/', '/categories/writing/', '/tags/', '/tags/写作/', '/404.html'];
const report = {started:new Date().toISOString(), node:process.version, base, browser:'', axe:'', paths, scans:[], textResize:[], keyboard:[], errors:[], externalBlocked:[], completed:false};
const external = new Set();
await mkdir(output, {recursive:true});
const browser = await puppeteer.launch({executablePath:process.env.SYUTOI_CHROME || '/usr/bin/google-chrome', headless:true, args:['--no-sandbox']});
try {
  report.browser = await browser.version();
  const page = await browser.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (new URL(request.url()).origin === new URL(base).origin || request.url().startsWith('data:')) request.continue();
    else { external.add(request.url()); request.abort(); }
  });
  const visit = async path => {
    const response = await page.goto(base + path, {waitUntil:'load'});
    assert.equal(response.status(), 200, path);
    // No font-ready promise here: disabled page scripts cannot settle it.
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `Overflow: ${path}`);
  };
  for (const javascript of [true, false]) {
    await page.setJavaScriptEnabled(javascript);
    for (const width of javascript ? [1440,768,390,320] : [1440,320]) {
      await page.setViewport({width,height:1000});
      for (const mode of javascript ? ['light','dark'] : ['light']) {
        await page.emulateMediaFeatures([{name:'prefers-color-scheme',value:mode}]);
        for (const path of paths) {
          await visit(path);
          if (javascript && width === 390 && mode === 'light') {
            if (path !== '/') await page.$eval('main', element => element.scrollIntoView());
            await page.screenshot({path:join(output, `page-${paths.indexOf(path)}-390.png`)});
            await page.evaluate(() => window.scrollTo(0,0));
          }
          // Re-enable execution only after loading the no-JS DOM so axe timers work.
          // Already skipped theme scripts are not rerun.
          if (!javascript) {
            assert(await page.$eval('[data-theme-toggle]', element => getComputedStyle(element).display === 'none'));
            await page.setJavaScriptEnabled(true);
          }
          await page.evaluate(axe);
          const result = await page.evaluate(async () => {
            const result = await window.axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa','best-practice']}});
            const compact = issues => issues.map(({id,impact,help,nodes}) => ({id,impact,help,nodes:nodes.map(({target,failureSummary})=>({target,failureSummary}))}));
            return {version:window.axe.version, violations:compact(result.violations), incomplete:compact(result.incomplete), passes:result.passes.length};
          });
          if (!javascript) await page.setJavaScriptEnabled(false);
          report.axe = result.version;
          report.scans.push({path,width,mode,javascript,...result});
          console.log(`${javascript ? 'JS' : 'noJS'} ${width} ${mode} ${path}: ${result.violations.length} violations`);
        }
      }
    }
  }
  // Real keyboard scrolling of an ordinary Markdown table with JS disabled.
  await page.setViewport({width:320,height:1000});
  await visit('/syutoi-long-read/');
  await page.focus('.prose > table');
  await page.keyboard.press('ArrowRight');
  await new Promise(resolve => setTimeout(resolve,250));
  assert(await page.$eval('.prose > table', element => element.scrollLeft > 0));
  report.noJSTableKeyboard = true;
  await page.setJavaScriptEnabled(true);
  for (const width of [1440,320]) {
    await page.setViewport({width,height:1000});
    for (const path of paths) {
      await visit(path);
      await page.keyboard.press('Tab');
      assert(await page.$eval('.skip-link', element => element === document.activeElement), `Skip link: ${path}`);
      await page.keyboard.press('Enter');
      assert(await page.$eval('main', element => element === document.activeElement && getComputedStyle(element).outlineStyle !== 'none'), `Main focus: ${path}`);
      report.keyboard.push({path,width,passed:true});
      // Text-only resize, separate from the 320 CSS-pixel reflow matrix above.
      await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `200% text overflow: ${path} at ${width}`);
      report.textResize.push({path,width,scale:2,passed:true});
    }
  }
  assert.deepEqual(report.errors, []);
  report.completed = true;
} finally {
  report.externalBlocked = [...external].sort();
  report.finished = new Date().toISOString();
  await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
}
assert.equal(report.scans.filter(scan=>scan.violations.length).length,0,`Accessibility violations: see ${output}/report.json`);
console.log(`Passed ${report.scans.length} axe scans, ${report.keyboard.length} keyboard and ${report.textResize.length} text resize checks; manual review required for incomplete results.`);
