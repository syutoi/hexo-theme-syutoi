'use strict';
const {normalizeConfig} = require('../../lib/config.cjs');
const {categoryKey} = require('../../lib/columns.cjs');

// Keep the installed category generator for explicitly excluded categories. Columns use
// one complete directory rather than date-based category pagination.
hexo.extend.filter.register('after_init', function () {
  const original = this.extend.generator.get('category');
  this.extend.generator.register('category', async function (site) {
    const settings = normalizeConfig(this.theme.config,this.config.theme_config);
    const categories = site.categories.toArray();
    const columns = categories.filter(category => settings.columns.categories === 'all' || settings.columns.categories.includes(categoryKey(category,categories)));
    const routes = original ? await original.call(this,site) : [];
    const pagination = this.config.pagination_dir || 'page';
    return routes.filter(route => !columns.some(category => (route.path === category.path || route.path === `${category.path}index.html`) || route.path.startsWith(`${category.path}${pagination}/`)))
      .concat(columns.flatMap(category => {
        const key = categoryKey(category,categories);
        const home = site.column_homes?.[key];
        const path = `${category.path}index.html`;
        // The native page generator owns a homepage at its canonical path.
        if (home?.path === path) return [];
        return [{path,layout:['category'],data:home ? {...home, path} : {category:category.name,column_key:key,posts:category.posts,current:1,total:1}}];
      }));
  });
});
