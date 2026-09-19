import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const { readingTime } = createRequire(import.meta.url)('../lib/reading.cjs');

test('reading estimates handle CJK, words, mixed text and minute boundaries', () => {
  assert.equal(readingTime('汉'.repeat(300)), 1);
  assert.equal(readingTime('汉'.repeat(301)), 2);
  assert.equal(readingTime('word '.repeat(200)), 1);
  assert.equal(readingTime('word '.repeat(201)), 2);
  assert.equal(readingTime('文'.repeat(150) + ' word'.repeat(100)), 1);
  assert.equal(readingTime('春𠀀秋 あいう 한글'), 1);
  assert.equal(readingTime('<p>' + '<em>read</em>ing '.repeat(200) + '</p>'), 1);
  assert.equal(readingTime("don't state-of-the-art ".repeat(100)), 1);
});

test('reading estimates exclude non-prose and decode entities without treating them as markup', () => {
  const huge = 'word '.repeat(2000);
  assert.equal(readingTime(`<pre>${huge}</pre><script>${huge}</script><style>${huge}</style><template>${huge}</template>`), 0);
  assert.equal(readingTime(`<figure class="highlight"><table>${huge}</table></figure><p hidden>${huge}</p><span aria-hidden="true">${huge}</span>`), 0);
  assert.equal(readingTime('&#x6587;'.repeat(301)), 2);
  assert.equal(readingTime('<p>&lt;tag&gt;</p><p>One <code>inline</code> word.</p>'), 1);
  assert.equal(readingTime(`<p>One</p><sup class="footnote-ref">${huge}</sup><a class="footnote-backref">${huge}</a>`), 1);
  for (const empty of ['', null, {}, '<img src="one.webp" alt="Photo">', '<!-- hidden --> !!! 😀', '<p>&nbsp;</p>']) assert.equal(readingTime(empty), 0);
});
