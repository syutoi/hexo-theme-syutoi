import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createAssetContext } from '../toolbox/assets.mjs';

test('a failed build preserves assets and a corrected source recovers', async t => {
  const fixture = await mkdtemp(join(tmpdir(), 'syutoi-build-'));
  let context = null;
  t.after(async () => {
    await context?.dispose();
    await rm(fixture, { recursive: true, force: true });
  });
  await mkdir(join(fixture, 'src/client'), { recursive: true });
  await mkdir(join(fixture, 'src/styles'), { recursive: true });
  const entry = join(fixture, 'src/client/main.ts');
  const tokens = join(fixture, 'src/styles/tokens.css');
  await writeFile(entry, 'console.log("first build");');
  await writeFile(tokens, ':root { --syutoi-color-bg: #f8f6f2; }');
  await writeFile(join(fixture, 'src/styles/main.css'), '@import "./tokens.css";');
  await writeFile(join(fixture, 'src/client/lightbox.ts'), 'console.log("optional adapter");');
  await writeFile(join(fixture, 'src/client/photoswipe.ts'), 'console.log("optional viewer");');
  await writeFile(join(fixture, 'src/styles/lightbox.css'), '.viewer { color: white; }');
  context = await createAssetContext(fixture);
  await context.rebuild();
  const jsPath = join(fixture, 'source/js/syutoi.min.js');
  const cssPath = join(fixture, 'source/css/syutoi.min.css');
  const js = await readFile(jsPath, 'utf8');
  const css = await readFile(cssPath, 'utf8');
  assert.match(css, /--syutoi-color-bg:\s*#f8f6f2/);
  assert.doesNotMatch(css, /@import/);

  await writeFile(entry, 'export const broken = ;');
  await assert.rejects(context.rebuild());
  assert.equal(await readFile(jsPath, 'utf8'), js);
  assert.equal(await readFile(cssPath, 'utf8'), css);

  await writeFile(entry, 'console.log("recovered build");');
  await writeFile(tokens, ':root { --syutoi-color-bg: #242321; }');
  await context.rebuild();
  assert.match(await readFile(jsPath, 'utf8'), /recovered build/);
  assert.match(await readFile(cssPath, 'utf8'), /--syutoi-color-bg:\s*#242321/);
});
