import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
import { readFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { enhanceLightbox } = require('../lib/lightbox.cjs');
const { normalizeConfig } = require('../lib/config.cjs');

test('lightbox requires a boolean opt-in', () => {
  for (const value of [undefined, false, 'true', 1, {}, null]) {
    assert.equal(normalizeConfig({}, {lightbox:{enable:value}}).lightbox.enable, false);
  }
  assert.equal(normalizeConfig({}, {lightbox:{enable:true}}).lightbox.enable, true);
});

test('lightbox preserves source and native links, including subdirectory targets', () => {
  const url = value => value.startsWith('/images/') ? `/blog${value}` : value;
  const html = '<figure><img src="/blog/images/a.svg" alt="A &amp; B"><figcaption>Caption</figcaption></figure>\n<a href="/images/a.svg"><img src="/blog/images/a.svg"></a>';
  const result = enhanceLightbox(html, url);
  assert.equal(result.enabled, true);
  assert.match(result.html, /<a href="&#x2F;blog&#x2F;images&#x2F;a.svg" data-syutoi-lightbox><img/);
  assert.equal((result.html.match(/data-syutoi-lightbox/g) || []).length, 2);
  assert.match(result.html, /alt="A &amp; B"><\/a><figcaption>Caption<\/figcaption>/);
  const original = '<a href="/original.jpg" data-lightbox-width="1920" data-lightbox-height="1080"><img src="/thumb.jpg" width="100" height="100"></a>';
  assert.equal(enhanceLightbox(original).enabled, true);
  const unusual = `<a title="before > after href='shadow'" href="/a.svg"><img src="/a.svg"></a>`;
  const enhanced = enhanceLightbox(unusual);
  assert.match(enhanced.html, /title="before > after href='shadow'"/);
  assert.equal((enhanced.html.match(/data-syutoi-lightbox/g) || []).length, 1);
  assert.deepEqual(enhanceLightbox(enhanced.html), enhanced);
  assert.match(enhanceLightbox('<img src="a.svg" alt="">', value => value, '查看图片').html, /aria-label="查看图片"/);
});

test('unsupported and author-controlled images remain byte-for-byte native', () => {
  for (const html of [
    '<a href="/article/"><img src="/image.jpg"></a>',
    '<a href="/original.jpg"><img src="/thumb.jpg" width="100" height="100"></a>',
    '<a href="/image.jpg" target="_blank"><img src="/image.jpg"></a>',
    '<a href="/image.jpg" download><img src="/image.jpg"></a>',
    '<a href="/image.jpg">Text<img src="/image.jpg"></a>',
    '<picture><source srcset="a.webp"><img src="a.jpg"></picture>',
    '<img src="a.jpg" srcset="a.jpg 1x, b.jpg 2x">',
    '<img src="a.jpg" data-lightbox="false">',
    '<a href="a.jpg" data-lightbox="false"><img src="a.jpg"></a>',
    '<pre><code><img src="a.jpg"></code></pre>',
    '<button><img src="a.jpg"></button>',
    '<img src="javascript:alert(1)">',
    '<img src="data:image/svg+xml,test">',
    '<p>Without images.</p>'
  ]) assert.deepEqual(enhanceLightbox(html), {html, enabled:false});
});

test('distributed PhotoSwipe license matches the pinned build dependency', async () => {
  assert.equal(await readFile(new URL('../source/js/photoswipe.LICENSE.txt', import.meta.url), 'utf8'),
    (await readFile(new URL('../node_modules/photoswipe/LICENSE', import.meta.url), 'utf8')).replaceAll('\r\n', '\n'));
});
