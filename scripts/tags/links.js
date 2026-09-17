'use strict';
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { escapeHTML, url_for } = require('hexo-util');
const { safeUrl } = require('../../lib/view.cjs');

function linkGrid(args, content) {
  if (args[0]) content = fs.readFileSync(path.join(hexo.source_dir, args[0]), 'utf8');
  const list = yaml.load(content || '') || [];
  const cards = list.flatMap(item => {
    const href = safeUrl(item.url);
    if (!href || !item.site) return [];
    const image = safeUrl(item.image, true);
    const local = value => escapeHTML(url_for.call(hexo, value));
    return [`<a class="link-card" href="${local(href)}">${image ? `<img src="${local(image)}" alt="" loading="lazy" decoding="async">` : ''}<span><strong>${escapeHTML(String(item.site))}</strong><span>${escapeHTML(String(item.desc || item.url))}</span></span></a>`];
  });
  return `<div class="links">${cards.join('')}</div>`;
}
hexo.extend.tag.register('links', linkGrid, { ends: true });
hexo.extend.tag.register('linksfile', linkGrid, { ends: false, async: true });
