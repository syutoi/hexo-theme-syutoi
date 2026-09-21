// Optional Lighthouse CLI runner. Install Lighthouse separately; build and serve
// example/public before running. Each navigation gets a fresh Chrome profile.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { cpus, totalmem, platform, release } from 'node:os';
import { createHash } from 'node:crypto';

const exec = promisify(execFile);
const cli = process.env.SYUTOI_LIGHTHOUSE_CLI;
assert(cli, 'Set SYUTOI_LIGHTHOUSE_CLI to an installed lighthouse/cli/index.js');
const base = process.env.SYUTOI_PREVIEW_URL || 'http://127.0.0.1:4173';
const chrome = process.env.SYUTOI_CHROME || '/usr/bin/google-chrome';
const output = resolve(process.env.SYUTOI_PERFORMANCE_OUTPUT || '/tmp/syutoi-performance');
await mkdir(output, { recursive: true });
const command = async (file, args) => (await exec(file, args, { maxBuffer: 10 * 1024 * 1024 })).stdout.trim();
const report = {
  started: new Date().toISOString(),
  commit: await command('git', ['rev-parse', 'HEAD']),
  environment: { node: process.version, os: `${platform()} ${release()}`, cpu: cpus()[0].model,
    logicalCPUs: cpus().length, memoryBytes: totalmem(),
    chrome: await command(chrome, ['--version']),
    lighthouse: await command(process.execPath, [cli, '--version']) },
  base, budget: JSON.parse(await command(process.execPath, ['toolbox/check-budget.mjs'])),
  runs: [], summary: []
};
const metrics = ['first-contentful-paint', 'largest-contentful-paint', 'cumulative-layout-shift', 'total-blocking-time', 'speed-index'];
// Invalidate a previous successful summary before starting a new measurement.
await writeFile(join(output, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
for (const [name, path] of [['home', '/'], ['article', '/syutoi-long-read/']]) {
  for (const mode of ['mobile', 'desktop']) {
    for (let iteration = 1; iteration <= 3; iteration++) {
      const filename = `${name}-${mode}-${iteration}.json`;
      const args = [cli, base + path, '--only-categories=performance', '--output=json',
        `--output-path=${join(output, filename)}`, '--throttling-method=simulate',
        '--chrome-flags=--headless --no-sandbox', '--quiet'];
      if (mode === 'desktop') args.push('--preset=desktop');
      console.log(`Measuring ${name} ${mode} ${iteration}/3`);
      await exec(process.execPath, args, { env: { ...process.env, CHROME_PATH: chrome },
        timeout: 180000, maxBuffer: 10 * 1024 * 1024 });
      const raw = await readFile(join(output, filename));
      const lhr = JSON.parse(raw);
      assert(!lhr.runtimeError, JSON.stringify(lhr.runtimeError));
      assert(lhr.categories.performance.score !== null, 'Missing performance score');
      for (const key of metrics) assert(Number.isFinite(lhr.audits[key].numericValue), `Missing ${key}`);
      report.runs.push({ name, path, mode, iteration, report: filename,
        sha256: createHash('sha256').update(raw).digest('hex'),
        fetchTime: lhr.fetchTime, lighthouseVersion: lhr.lighthouseVersion,
        environment: lhr.environment, settings: lhr.configSettings,
        warnings: lhr.runWarnings, score: lhr.categories.performance.score * 100,
        metrics: Object.fromEntries(metrics.map(key => [key, lhr.audits[key].numericValue])),
        diagnostics: Object.fromEntries(Object.entries(lhr.audits)
          .filter(([, audit]) => audit.score !== null && audit.score < 1 && !metrics.includes(audit.id))
          .map(([key, audit]) => [key, { title: audit.title, score: audit.score,
            displayValue: audit.displayValue, metricSavings: audit.metricSavings }])),
        requests: lhr.audits['network-requests'].details.items.map(item => ({
          url: item.url, resourceType: item.resourceType, statusCode: item.statusCode,
          transferSize: item.transferSize, resourceSize: item.resourceSize }))
      });
    }
    const runs = report.runs.filter(run => run.name === name && run.mode === mode);
    const stats = values => {
      const sorted = values.toSorted((a, b) => a - b);
      return { min: sorted[0], median: sorted[1], max: sorted[2] };
    };
    report.summary.push({ name, mode, score: stats(runs.map(run => run.score)),
      metrics: Object.fromEntries(metrics.map(key => [key, stats(runs.map(run => run.metrics[key]))])) });
    // Keep completed groups available if a later run fails; finished marks success.
    await writeFile(join(output, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
  }
}
report.finished = new Date().toISOString();
await writeFile(join(output, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report.summary, null, 2));
