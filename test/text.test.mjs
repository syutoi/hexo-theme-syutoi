import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { plainText } = require('../lib/text.cjs');

test('metadata text preserves Unicode and visible entities while removing markup and script/style bodies', () => {
  assert.equal(plainText('<p>A &amp; B</p><p>&lt;tag&gt;</p><style>hidden</style><script>ignored</script>'), 'A & B <tag>');
  assert.equal(plainText('春😀秋冬',3), '春😀秋…');
  assert.equal(plainText(null), '');
  assert.equal(plainText({description:'not text'}), '');
  assert.equal(plainText('   \n  '), '');
});
