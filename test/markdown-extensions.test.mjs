import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const rendererRequire = createRequire(require.resolve('../example/node_modules/hexo-renderer-markdown-it'));
const MarkdownIt = rendererRequire('markdown-it');
const alerts = require('../lib/markdown-alerts.cjs');

test('alert titles are escaped and nested markers stay ordinary quotes', () => {
  const md = new MarkdownIt().use(alerts, {titles:{tip:'<b>提示 & 建议</b>'}});
  const html = md.render('> [!TIP]\n> Outer\n>\n> > [!WARNING]\n> > Inner\n\nAfter\n\n> \\[!NOTE]\n> Literal\n');
  assert.match(html, /&lt;b&gt;提示 &amp; 建议&lt;\/b&gt;/);
  assert.doesNotMatch(html, /markdown-alert-warning|markdown-alert-note/);
  assert.match(html, /<blockquote>\s*<p>\[!WARNING\]/);
  assert.match(html, /<p>After<\/p>/);
  assert.match(html, /\[!NOTE\]/);
});

test('alerts do not consume following blocks and honor code fences and unknown types', () => {
  const md = new MarkdownIt().use(alerts);
  const html = md.render('> [!note]\n> First\n\n## Heading\n\n```markdown\n> [!TIP]\n> code\n```\n\n> [!CUSTOM]\n> Unknown\n');
  assert.equal((html.match(/class="markdown-alert markdown-alert-/g) || []).length, 1);
  assert.match(html, /<\/div>\s*<h2>Heading<\/h2>/);
  assert.match(html, /&gt; \[!TIP\]/);
  assert.match(html, /<blockquote>\s*<p>\[!CUSTOM\]/);
});
