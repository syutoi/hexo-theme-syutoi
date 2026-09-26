import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseDocument, DomUtils } from 'htmlparser2';
import { guides } from './example-manual.mjs';

const output = new URL('../example/public/', import.meta.url);
for (const path of ['docs/', ...guides.map(guide => guide.path), 'categories/docs/']) {
  const html = await readFile(new URL(path + 'index.html', output), 'utf8');
  assert.match(html, /href="\/docs\/"/);
  const dom = parseDocument(html);
  const prose = DomUtils.findOne(node => (node.attribs?.class || '').split(' ').includes('prose'), dom.children, true);
  if (!prose) continue;
  for (const link of DomUtils.getElementsByTagName('a', prose.children)) {
    const href = link.attribs.href;
    if (!href || !(href.startsWith('/') || href.startsWith('#'))) continue;
    const url = new URL(href, `https://example.com/${path}`);
    const targetPath = decodeURIComponent(url.pathname.slice(1));
    const file = targetPath.endsWith('/') ? targetPath + 'index.html' : targetPath;
    const target = parseDocument(await readFile(new URL(file, output), 'utf8'));
    if (url.hash) {
      const id = decodeURIComponent(url.hash.slice(1));
      assert(DomUtils.findOne(node => node.attribs?.id === id, target.children, true), `${path}: missing anchor ${href}`);
    }
  }
}
console.log(`Verified documentation hub, ${guides.length} guides, category and all local prose links/anchors.`);
