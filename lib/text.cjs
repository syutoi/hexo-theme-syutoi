'use strict';
const { stripHTML, unescapeHTML } = require('hexo-util');

function plainText(value, limit = 160) {
  if (typeof value !== 'string') return '';
  const html = value.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<\/(?:p|div|h[1-6]|li|blockquote)>|<br\s*\/?>/gi, ' ');
  const text = unescapeHTML(stripHTML(html)).replace(/\s+/g, ' ').trim();
  const characters = Array.from(text);
  return characters.length > limit ? characters.slice(0, limit).join('') + '…' : text;
}

module.exports = { plainText };
