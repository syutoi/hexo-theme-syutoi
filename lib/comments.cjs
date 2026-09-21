'use strict';

function serverUrl(value) {
  if (typeof value !== 'string' || !/^https?:\/\//i.test(value.trim())) return '';
  try {
    const url = new URL(value.trim());
    if (url.username || url.password || url.search || url.hash) return '';
    return url.href.replace(/\/$/, '');
  } catch { return ''; }
}

// Slot policy is independent of a particular comment system's implementation.
function commentsSlot(settings, page, isContent, urlFor) {
  if (!isContent || page.comments === false || page.password || page.published === false ||
      ['categories', 'tags', 'search', '404'].includes(page.type) ||
      settings.provider !== 'waline' || !settings.server_url) return null;
  return {
    provider: settings.provider,
    serverURL: settings.server_url,
    path: urlFor(page.path).replace(/index\.html$/, ''),
    lang: /^zh-(TW|HK|Hant)/i.test(page.lang || '') ? 'zh-TW' : /^zh/i.test(page.lang || '') ? 'zh-CN' : 'en'
  };
}

module.exports = { serverUrl, commentsSlot };
