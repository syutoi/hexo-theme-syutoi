'use strict';
const { parseDocument, DomUtils } = require('htmlparser2');

// Tables can overflow at narrow widths; keep keyboard access without client JS.
function enhanceTables(html) {
  if (typeof html !== 'string' || !/<table[\s>]/i.test(html)) return html;
  const document = parseDocument(html, {withStartIndices:true});
  const positions = DomUtils.getElementsByTagName('table', document.children).flatMap(table => {
    if (Object.hasOwn(table.attribs, 'tabindex')) return [];
    for (let node = table.parent; node; node = node.parent) {
      if (['pre','code'].includes(node.name) || /(?:^|\s)(?:highlight|code-block)(?:\s|$)/.test(node.attribs?.class || '')) return [];
    }
    return [table.startIndex + '<table'.length];
  }).sort((a,b) => b-a);
  for (const position of positions) html = html.slice(0,position) + ' tabindex="0"' + html.slice(position);
  return html;
}
module.exports = { enhanceTables };
