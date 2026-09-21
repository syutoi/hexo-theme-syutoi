'use strict';
const { parseDocument, DomUtils } = require('htmlparser2');
const { escapeHTML } = require('hexo-util');
const { safeUrl } = require('./view.cjs');

// Only unambiguous image links participate. Never repurpose an author's link.
function enhanceLightbox(html, localUrl = value => value, openLabel = 'Open image') {
  if (typeof html !== 'string' || !/<img[\s>]/i.test(html)) return { html, enabled: false };
  const document = parseDocument(html, { withStartIndices: true, withEndIndices: true });
  const edits = [];
  const dimension = value => /^\d+$/.test(value || '') && Number(value) > 0 && Number(value) <= 100000;
  for (const img of DomUtils.getElementsByTagName('img', document.children)) {
    let skip = false;
    let link;
    for (let parent = img.parent; parent; parent = parent.parent) {
      if (['pre', 'code', 'template', 'svg', 'picture', 'button'].includes(parent.name)) skip = true;
      if (parent.name === 'a') link = parent;
    }
    const src = safeUrl(img.attribs.src, true);
    if (skip || !src || img.attribs.srcset || img.attribs['data-lightbox'] === 'false') continue;
    const tag = html.slice(img.startIndex, img.endIndex + 1);
    const label = !img.attribs.alt?.trim() ? ` aria-label="${escapeHTML(openLabel)}"` : '';
    if (link) {
      const attrs = link.attribs;
      const safeHref = safeUrl(attrs.href, true);
      const href = safeHref.startsWith('/') && !safeHref.startsWith('//') ? localUrl(safeHref) : safeHref;
      const width = attrs['data-lightbox-width'];
      const height = attrs['data-lightbox-height'];
      if (!href || Object.hasOwn(attrs, 'target') || Object.hasOwn(attrs, 'download') || attrs['data-lightbox'] === 'false') continue;
      if (!link.children.every(node => node === img || (node.type === 'text' && !node.data.trim()))) continue;
      // A different target requires explicit original-image dimensions and opt-in.
      if (href !== src && !(dimension(width) && dimension(height))) continue;
      // The first child starts after the complete opening tag, including any
      // quoted '>' characters. Preserve unrelated attribute source bytes.
      const end = link.children[0].startIndex;
      const opening = html.slice(link.startIndex, end)
        .replace(/(\s+)([^\s"'<>/=]+)(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?/g, (attribute, space, name) => {
          if (name.toLowerCase() === 'href') return `${space}href="${escapeHTML(href)}"`;
          return name.toLowerCase() === 'data-syutoi-lightbox' ? '' : attribute;
        })
        .replace(/\s*\/?>(\s*)$/, `${!attrs['aria-label'] && !attrs['aria-labelledby'] && !attrs.title ? label : ''} data-syutoi-lightbox>$1`);
      edits.push({ start: link.startIndex, end, value: opening });
    } else {
      edits.push({ start: img.startIndex, end: img.endIndex + 1,
        value: `<a href="${escapeHTML(src)}" data-syutoi-lightbox${label}>${tag}</a>` });
    }
  }
  for (const edit of edits.sort((a, b) => b.start - a.start)) html = html.slice(0, edit.start) + edit.value + html.slice(edit.end);
  return { html, enabled: edits.length > 0 };
}
module.exports = { enhanceLightbox };
