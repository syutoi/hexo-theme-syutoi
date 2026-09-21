'use strict';
const { url_for } = require('hexo-util');
const { normalizeConfig } = require('../../lib/config.cjs');
const { resolveLocale } = require('../../lib/locale.cjs');
const { searchRecords, searchProviders } = require('../../lib/search.cjs');

hexo.extend.generator.register('syutoi-search', async function (site) {
  const { provider } = normalizeConfig(this.theme.config, this.config.theme_config).search;
  if (provider === 'none') return [];
  for (const item of [...site.posts.toArray(), ...site.pages.toArray()]) {
    if (item.path === 'search/index.html' || item.path?.startsWith('_syutoi/search/')) {
      throw new Error('Syutoi search reserves search/index.html and _syutoi/search/. Rename the conflicting source or disable search.');
    }
  }
  const locale = resolveLocale(null, this.config.language, this.theme.i18n.list());
  const untitled = this.theme.i18n.__(locale.languages)('post.untitled');
  const { records, language } = searchRecords(site, this.config, value => url_for.call(this, value), untitled);
  try {
    const files = await searchProviders[provider](records, language);
    return [
      {path:'search/index.html', layout:['page'], data:{type:'search', lang:this.config.language}},
      {path:'_syutoi/search/manifest.json', data:JSON.stringify({provider, language, count:records.length})},
      ...files
    ];
  } catch (error) {
    throw new Error(`Syutoi search index failed: ${error.message}`, {cause:error});
  }
});
