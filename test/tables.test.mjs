import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const { enhanceTables } = createRequire(import.meta.url)('../lib/tables.cjs');

test('body tables gain keyboard access without changing cells or authored attributes', () => {
  const source = '<TABLE class="wide"><caption>A &amp; B</caption><tr><td>  Text\n</td></tr></TABLE>';
  const result = enhanceTables(source);
  assert.equal(result, source.replace('<TABLE', '<TABLE tabindex="0"'));
  assert.equal(enhanceTables(result), result);
  const authored = '<table tabindex="0" aria-label="Data"></table>';
  assert.equal(enhanceTables(authored), authored);
});

test('highlight layout and literal code tables remain untouched', () => {
  const source = '<figure class="highlight js"><table><tr><td><pre>x</pre></td></tr></table></figure><pre><code>&lt;table&gt;</code></pre><script>"<table>"</script>';
  assert.equal(enhanceTables(source), source);
  assert.equal(enhanceTables('No table'), 'No table');
  assert.equal(enhanceTables(undefined), undefined);
});
