import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { enhanceCode } = require('../lib/code.cjs');

test('code enhancement preserves source bytes, excludes gutters and is idempotent', () => {
  const figure='<figure class="highlight javascript"><table><tr><td class="gutter"><pre>1<br>2</pre></td><td class="code"><pre>  &lt;x&gt;<br>\t&amp;\n</pre></td></tr></table></figure>';
  const source=`<p title='keep quotes'>Before</p>${figure}<p>After</p>`;
  const result=enhanceCode(source,'Code block');
  assert(result.includes(figure));
  assert(result.startsWith("<p title='keep quotes'>Before</p>"));
  assert.equal((result.match(/data-code-block/g)||[]).length,1);
  assert.match(result,/tabindex="0" role="region" aria-label="Code block: javascript"/);
  assert.equal(enhanceCode(result,'Code block'),result);
});

test('plain code, empty code and unusual language labels remain safe', () => {
  const source='<PRE><code class="language-a&quot;b">&lt;tag&gt;</code></PRE><pre></pre><script>"<pre>not code</pre>"</script>';
  const result=enhanceCode(source,'Code & text');
  assert.equal((result.match(/data-code-block/g)||[]).length,2);
  assert.match(result,/Code &amp; text: a&quot;b/);
  assert.match(result,/class="code-language">plaintext</);
  assert(result.includes(source.slice(source.indexOf('<script>'))));
  assert.equal(enhanceCode('A paragraph','Code'),'A paragraph');
});
