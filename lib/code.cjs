'use strict';
const { parseDocument, DomUtils } = require('htmlparser2');
const { escapeHTML } = require('hexo-util');
const classes = node => (node.attribs?.class || '').split(/\s+/);

function enhanceCode(html, label) {
  if (typeof html !== 'string' || !/<pre[\s>]/i.test(html)) return html;
  const document = parseDocument(html, {withStartIndices:true, withEndIndices:true});
  const blocks = new Set();
  for (const pre of DomUtils.getElementsByTagName('pre', document.children)) {
    let block = pre;
    let skip = false;
    for (let node = pre.parent; node; node = node.parent) {
      if (classes(node).includes('gutter') || classes(node).includes('code-block')) skip = true;
      if (node.name === 'figure' && classes(node).includes('highlight')) block = node;
    }
    if (!skip) blocks.add(block);
  }
  // Insert around original source slices; never reserialize code or author HTML.
  const edits = [...blocks].map(block => {
    const pre = block.name === 'pre' ? block : DomUtils.getElementsByTagName('pre', block.children).find(node => !classes(node.parent).includes('gutter'));
    const code = pre && DomUtils.getElementsByTagName('code', pre.children)[0];
    const languageClass = [...classes(code || {}), ...classes(pre || {})].find(name => name.startsWith('language-'));
    const language = languageClass?.slice(9) || (block.name === 'figure' ? classes(block).find(name => name !== 'highlight') : '') || 'plaintext';
    const start = block.startIndex;
    const end = block.endIndex + 1;
    return {start, end, value:`<div class="code-block" data-code-block><div class="code-toolbar"><span class="code-language">${escapeHTML(language)}</span></div><div class="code-scroll" tabindex="0" role="region" aria-label="${escapeHTML(label + ': ' + language)}">${html.slice(start,end)}</div><p class="code-status" role="status" aria-atomic="true"></p></div>`};
  }).sort((a,b) => b.start-a.start);
  for (const edit of edits) html = html.slice(0,edit.start) + edit.value + html.slice(edit.end);
  return html;
}
module.exports = { enhanceCode };
