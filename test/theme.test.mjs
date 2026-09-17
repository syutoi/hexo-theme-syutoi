import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL('../src/shared/theme.ts', import.meta.url))],
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false
});
const { parsePreference, resolveTheme, nextPreference, readPreference, THEME_STORAGE_KEY } =
  await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].contents).toString('base64')}`);

// Exercise the TypeScript source without relying on stale compiled artifacts.
test('only supported preferences are accepted', () => {
  for (const mode of ['light', 'dark', 'auto']) assert.equal(parsePreference(mode), mode);
  for (const value of [null, undefined, '', 'system', 'DARK']) assert.equal(parsePreference(value), undefined);
});

test('explicit choices take precedence over OS changes', () => {
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('auto', true), 'dark');
  assert.equal(resolveTheme('auto', false), 'light');
});

test('the toggle includes a return to automatic mode', () => {
  assert.equal(nextPreference('auto'), 'light');
  assert.equal(nextPreference('light'), 'dark');
  assert.equal(nextPreference('dark'), 'auto');
});

test('saved choice overrides site configuration and legacy storage', () => {
  const values = new Map([[THEME_STORAGE_KEY, 'auto'], ['theme', 'dark']]);
  assert.equal(readPreference(key => values.get(key) ?? null, 'light'), 'auto');
});

test('legacy explicit preferences are preserved during migration', () => {
  assert.equal(readPreference(key => key === 'theme' ? 'dark' : null, 'auto'), 'dark');
});

test('absent, malformed or unavailable storage falls back to site configuration', () => {
  assert.equal(readPreference(() => null, 'dark'), 'dark');
  assert.equal(readPreference(() => 'invalid', 'auto'), 'auto');
  assert.equal(readPreference(() => { throw new Error('Storage denied'); }, 'light'), 'light');
});
