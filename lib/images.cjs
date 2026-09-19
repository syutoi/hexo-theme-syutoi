'use strict';
const { parseDocument, DomUtils } = require('htmlparser2');
const { escapeHTML } = require('hexo-util');

function enhanceImages(html, localUrl = value => value) {
  if (typeof html !== 'string' || !/<img[\s>]/i.test(html)) return html;
  const document = parseDocument(html, {withStartIndices:true, withEndIndices:true});
  const edits = [];
  const onlyChild = (parent, child) => parent?.children?.every(node => node === child || (node.type === 'text' && !node.data.trim()));
  for (const img of DomUtils.getElementsByTagName('img', document.children)) {
    let skip = false;
    let inFigure = false;
    for (let parent = img.parent; parent; parent = parent.parent) {
      if (['pre','code','template','svg'].includes(parent.name)) skip = true;
      if (parent.name === 'figure') inFigure = true;
    }
    if (skip) continue;
    let tag = html.slice(img.startIndex, img.endIndex + 1);
    const { attribs } = img;
    if (attribs.src?.startsWith('/') && !attribs.src.startsWith('//')) {
      tag = tag.replace(/\ssrc\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/i, () => ` src="${escapeHTML(localUrl(attribs.src)).replace(/&#x2F;/g, '/')}"`);
    }
    let attributes = '';
    if (!Object.hasOwn(attribs, 'loading')) attributes += ` loading="${attribs.fetchpriority === 'high' ? 'eager' : 'lazy'}"`;
    if (!Object.hasOwn(attribs, 'decoding')) attributes += ' decoding="async"';
    tag = tag.replace(/\s*\/?>(\s*)$/, `${attributes}>$1`);
    let container = img;
    if (img.parent?.name === 'a' && onlyChild(img.parent, img)) container = img.parent;
    const paragraph = container.parent;
    const caption = attribs.title?.trim();
    if (caption && !inFigure && paragraph?.name === 'p' && onlyChild(paragraph, container)) {
      const content = html.slice(paragraph.startIndex, img.startIndex) + tag + html.slice(img.endIndex + 1, paragraph.endIndex + 1);
      // The outer paragraph becomes a figure; keep its attributes and linked image.
      const figure = content.replace(/^<p(?=[\s>])/i, '<figure').replace(/<\/p>$/i, '</figure>');
      edits.push({start:paragraph.startIndex, end:paragraph.endIndex + 1, value:figure.replace(/<\/figure>$/i, `<figcaption>${escapeHTML(caption)}</figcaption></figure>`)});
    } else edits.push({start:img.startIndex, end:img.endIndex + 1, value:tag});
  }
  for (const edit of edits.sort((a,b) => b.start-a.start)) html = html.slice(0,edit.start) + edit.value + html.slice(edit.end);
  return html;
}
module.exports = { enhanceImages };
