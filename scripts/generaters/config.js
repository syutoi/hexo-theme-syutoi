'use strict';
const { deepMerge } = require('hexo-util');

hexo.extend.filter.register('before_generate', () => {
  const languages = hexo.locals.get('data').languages;
  if (!languages) return;
  for (const [language, values] of Object.entries(languages)) {
    hexo.theme.i18n.set(language, deepMerge(hexo.theme.i18n.get([language]), values));
  }
});
