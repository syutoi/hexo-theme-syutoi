import assert from 'node:assert/strict';
import { test } from 'node:test';
import { rewriteDocumentLinks } from '../toolbox/example-docs.mjs';

test('documentation links resolve locally, preserve fragments and leave code samples intact', () => {
  const source = '[配置](configuration.md#本地搜索)\n[记录](../CHANGELOG.md)\n[外链](https://example.com)\n```md\n[示例](configuration.md)\n```\n[迁移](migration-from-shoka.md)';
  const output = rewriteDocumentLinks(source, 'docs/features.md');
  assert.match(output, /\[配置\]\(\/docs\/configuration\/#本地搜索\)/);
  assert.match(output, /https:\/\/github.com\/syutoi\/hexo-theme-syutoi\/blob\/main\/CHANGELOG.md/);
  assert.match(output, /\[外链\]\(https:\/\/example.com\)/);
  assert.match(output, /```md\n\[示例\]\(configuration.md\)\n```/);
  assert.match(output, /\[迁移\]\(\/docs\/migration-from-shoka\/\)/);
});
