'use strict';
const {full_url_for} = require('hexo-util');
const {normalizeConfig} = require('../../lib/config.cjs');
const {categoryKey} = require('../../lib/columns.cjs');
const {columnHomes} = require('../../lib/column-homes.cjs');

hexo.extend.filter.register('after_init', function () {
  // Preserve Hexo's visibility rules and any previously registered getters.
  // The index files remain Post records for native rendering/watch lifecycle,
  // but are projected as Pages for generators, search and sitemap plugins.
  const getPosts = this.locals.getters.posts;
  const getPages = this.locals.getters.pages;
  let state = {homes:Object.create(null), excluded:new Set()};
  this.locals.set('posts', () => getPosts().filter(post => !state.excluded.has(post._id)));
  this.locals.set('pages', () => new (this.model('Page').Query)([...getPages().toArray(),...Object.values(state.homes)]));
  this.locals.set('column_homes', () => state.homes);
  const sitemap = this.extend.generator.get('sitemap');
  if (sitemap) this.extend.generator.register('sitemap', function (site) {
    const categories = site.categories.toArray();
    return sitemap.call(this, {...site, categories:site.categories.filter(category =>
      !site.column_homes[categoryKey(category,categories)])});
  });
  this.extend.filter.register('before_generate', function () {
    state = columnHomes(getPosts(),this.model('Category').toArray(),getPages(),
      normalizeConfig(this.theme.config,this.config.theme_config),this.config,path => full_url_for.call(this,path.replace(/(^|\/)index\.html$/, '$1')));
    this.locals.invalidate();
  }, 20); // Core post rendering runs at priority 10, including index Markdown.
});
