import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { enhanceImages } = require('../lib/images.cjs');

test('standalone image titles become escaped captions without losing links or dimensions', () => {
  const source='<p><a href="/full.png"><img src="/small.png" alt="Photo" title="A &lt;b&gt; &amp; B" width="200" height="100"></a></p>';
  const result=enhanceImages(source,value=>'/blog'+value);
  assert.match(result, /^<figure><a href="\/full.png"><img src="\/blog\/small.png"/);
  assert.match(result, /width="200" height="100" loading="lazy" decoding="async"/);
  assert.match(result, /<figcaption>A &lt;b&gt; &amp; B<\/figcaption><\/figure>$/);
  assert.equal(enhanceImages(result), result);
});

test('image enhancement respects author hints, picture sources and existing captions', () => {
  const source='<figure><picture><source srcset="a.webp 1x, b.webp 2x"><img src="https://example.com/a.png" title="No second caption" loading="eager" decoding="sync" width="20" height="10"></picture><figcaption>Original</figcaption></figure>';
  assert.equal(enhanceImages(source),source);
  assert.match(enhanceImages('<img src="a.png" fetchpriority="high">'),/loading="eager" decoding="async"/);
  assert.match(enhanceImages('<img src="a.png" loading="lazy" fetchpriority="high">'),/loading="lazy"/);
});

test('inline images, code examples and grouped images do not become invalid figures', () => {
  const source='<p>Text <img src="a.png" title="Inline"> after</p><p><img src="b.png" title="B"><img src="c.png" title="C"></p><pre><img src="code.png"></pre>';
  const result=enhanceImages(source);
  assert.doesNotMatch(result,/<figure|figcaption/);
  assert.match(result,/<pre><img src="code.png"><\/pre>/);
  assert.equal((result.match(/loading="lazy"/g)||[]).length,3);
});
