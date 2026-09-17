'use strict';
const yaml = require('js-yaml');
const { escapeHTML, url_for } = require('hexo-util');
const { safeUrl } = require('../../lib/view.cjs');

// Preserve authored playlists as ordinary links without a third-party player.
function postMedia(args, content) {
  if (!['audio', 'video'].includes(args[0])) return '';
  const render = items => (Array.isArray(items) ? items : []).map(item => {
    if (item && Array.isArray(item.list)) return `<li>${escapeHTML(String(item.title || ''))}<ul>${render(item.list)}</ul></li>`;
    const url = safeUrl(typeof item === 'string' ? item : item?.url);
    return url ? `<li><a href="${escapeHTML(url_for.call(hexo, url))}">${escapeHTML(String(item?.name || url))}</a></li>` : '';
  }).join('');
  return `<ul class="media-links">${render(yaml.load(content || ''))}</ul>`;
}
hexo.extend.tag.register('media', postMedia, { ends: true });
