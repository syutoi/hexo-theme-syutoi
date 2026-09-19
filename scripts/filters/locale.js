'use strict';
const { resolveLocale } = require('../../lib/locale.cjs');

// Run after Hexo resolves the page language (including language-prefixed routes).
hexo.extend.filter.register('template_locals', locals => {
  const { i18n } = hexo.theme;
  const locale = resolveLocale(locals.page.lang || locals.page.language, hexo.config.language, i18n.list());
  locals.page.lang = locale.lang;
  locals.__ = i18n.__(locale.languages);
  locals._p = i18n._p(locale.languages);
}, 20);
