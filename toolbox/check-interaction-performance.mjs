/* global window */
// Optional lab interaction measurement. Never shipped in the theme bundle.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
const puppeteer = require(process.env.SYUTOI_PUPPETEER_PATH || 'puppeteer');
const vitalsPath = process.env.SYUTOI_WEB_VITALS_PATH;
assert(vitalsPath, 'Set SYUTOI_WEB_VITALS_PATH to web-vitals/dist/web-vitals.iife.js');
const vitals = await readFile(vitalsPath);
const base = process.env.SYUTOI_PREVIEW_URL || 'http://127.0.0.1:4173';
const output = process.env.SYUTOI_INTERACTION_OUTPUT || '/tmp/syutoi-interactions';
const report = {started:new Date().toISOString(), commit:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), node:process.version, base, library:{path:vitalsPath,sha256:createHash('sha256').update(vitals).digest('hex')}, runs:[], errors:[]};
await mkdir(output,{recursive:true});
await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
const pause = () => new Promise(resolve => setTimeout(resolve,700));
const browser = await puppeteer.launch({executablePath:process.env.SYUTOI_CHROME || '/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
try {
  report.browser = await browser.version();
  for (const mode of ['mobile','desktop']) for (const path of ['/','/syutoi-long-read/']) for (let iteration=1;iteration<=3;iteration++) {
    const context = await browser.createIncognitoBrowserContext();
    try {
      const page = await context.newPage();
      page.on('pageerror', error => report.errors.push(error.message));
      const mobile = mode === 'mobile';
      await page.setViewport({width:mobile?390:1440,height:1000,deviceScaleFactor:1});
      const session = await page.target().createCDPSession();
      await session.send('Emulation.setCPUThrottlingRate',{rate:mobile?4:1});
      const response = await page.goto(base+path,{waitUntil:'networkidle0'});
      assert.equal(response.status(),200);
      await page.addScriptTag({content:vitals.toString()});
      await page.evaluate(() => {
        window.labINP = null;
        window.webVitals.onINP(metric => {
          window.labINP = {value:metric.value,rating:metric.rating,entries:metric.entries.map(entry=>({name:entry.name,duration:entry.duration,interactionId:entry.interactionId,startTime:entry.startTime,processingStart:entry.processingStart,processingEnd:entry.processingEnd}))};
        },{reportAllChanges:true,durationThreshold:16});
      });
      const actions = [];
      const click = async (selector,name) => { await page.click(selector); actions.push(name); await pause(); };
      await click('[data-theme-toggle]','theme');
      if (mobile) {
        await click('[data-nav-toggle]','open menu');
        await page.keyboard.press('Escape'); actions.push('escape menu'); await pause();
        assert.equal(await page.$eval('[data-nav-toggle]',el=>el.getAttribute('aria-expanded')),'false');
      }
      if (path !== '/') {
        if (mobile) await click('.mobile-toc summary','open contents');
        await click(mobile?'[data-toc="mobile"] a':'[data-toc="desktop"] a','contents anchor');
        assert(await page.evaluate(()=>Boolean(window.location.hash)));
        await click('.copy-button','copy code');
        // Use the browser Clipboard API; require the visible success state.
        assert(await page.$eval('.code-status',el=>el.textContent.includes('已复制')));
      }
      await page.waitForFunction(()=>window.labINP !== null,{timeout:5000});
      const metric = await page.evaluate(()=>window.labINP);
      assert(Number.isFinite(metric.value) && metric.entries.length > 0,'Missing measured interaction');
      report.runs.push({mode,path,iteration,viewport:{width:mobile?390:1440,height:1000,dpr:1},cpuSlowdown:mobile?4:1,networkThrottling:'none; interactions after local page load',actions,inp:metric});
      console.log(`${mode} ${path} ${iteration}/3: ${metric.value} ms`);
    } finally { await context.close(); }
  }
  assert.deepEqual(report.errors,[]);
  report.finished = new Date().toISOString();
} finally {
  await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  await browser.close();
}
