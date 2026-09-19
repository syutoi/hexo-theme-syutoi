'use strict';
const { parseDocument } = require('htmlparser2');
const excluded = new Set(['script', 'style', 'template', 'pre', 'svg', 'math']);
const blocks = new Set(['p', 'div', 'section', 'article', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'dt', 'dd', 'blockquote', 'tr', 'td', 'th', 'figcaption', 'br', 'hr']);
const cjk = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu;

// A coarse text-reading estimate, not time spent understanding code or images.
function readingTime(html) {
  if (typeof html !== 'string' || !html.trim()) return 0;
  const text = node => {
    if (node.type === 'text') return node.data;
    const attrs = node.attribs || {};
    if (excluded.has(node.name) || Object.hasOwn(attrs, 'hidden') || attrs['aria-hidden'] === 'true' ||
      /(?:^|\s)(?:highlight|footnote-backref|footnote-ref)(?:\s|$)/.test(attrs.class || '')) return ' ';
    const content = (node.children || []).map(text).join('');
    return blocks.has(node.name) ? ` ${content} ` : content;
  };
  const content = text(parseDocument(html));
  const characters = (content.match(cjk) || []).length;
  const words = (content.replace(cjk, ' ').match(/[\p{L}\p{N}]+(?:['’\u002D][\p{L}\p{N}]+)*/gu) || []).length;
  return Math.ceil(characters / 300 + words / 200);
}
module.exports = { readingTime };
