'use strict';
const {categoryKey} = require('./columns.cjs');
const array = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const routePath = value => {
  const path = (value || '').replace(/^\/+/, '');
  return path.endsWith('/') ? `${path}index.html` : path;
};
const isIndex = post => /^_posts\/(?:[^/]+\/)+index\.(?:md|markdown)$/i.test(post.source || '') && post.column !== false;

// Resolve index posts before hiding them from ordinary post collections. Paths
// come from Hexo's permalink handling or the category's standard landing route.
function columnHomes(posts, categories, pages, settings, config, fullUrl) {
  const enabled = settings.columns.categories;
  const candidates = categories.map(category => ({category,key:categoryKey(category,categories)}))
    .filter(({key}) => enabled === 'all' || enabled.includes(key));
  const excluded = new Set();
  const homes = Object.create(null);
  const claimed = new Map();
  const sourcePosts = array(posts);
  for (const post of sourcePosts.filter(isIndex)) {
    let related;
    if (typeof post.column === 'string' && post.column.trim()) {
      related = candidates.filter(item => item.key === post.column.trim());
    } else {
      const ids = new Set(array(post.categories).map(item => item._id));
      related = candidates.filter(item => ids.has(item.category._id));
      const depth = Math.max(0,...related.map(item => item.key.split('/').length));
      related = related.filter(item => item.key.split('/').length === depth);
    }
    if (!related.length) {
      if (enabled === 'all' && !array(post.categories).length) throw new Error(`${post.source}: column index.md needs categories or column to identify its column.`);
      continue;
    }
    if (related.length > 1) throw new Error(`${post.source}: ambiguous column homepage; set column to one full category name.`);
    excluded.add(post._id);
    if (post.published === false || post.password || (!config.future && +post.date > Date.now())) continue;
    const {category,key} = related[0];
    if (homes[key]) throw new Error(`Multiple index.md files for column ${key}: ${homes[key].source}, ${post.source}`);
    const path = routePath(post.__permalink ? post.path : `${category.path}index.html`);
    const reserved = ['index.html', `${config.category_dir || 'categories'}/index.html`, `${config.tag_dir || 'tags'}/index.html`, `${config.archive_dir || 'archives'}/index.html`, 'search/index.html', '404.html'];
    if (!path || path.startsWith('/') || /[:?#\\]/.test(path) || path.split('/').includes('..') || reserved.includes(path)) throw new Error(`${post.source}: invalid or reserved homepage permalink ${path}`);
    if (claimed.has(path) || array(pages).some(page => routePath(page.path) === path) || sourcePosts.some(other => other._id !== post._id && routePath(other.path) === path) ||
        categories.some(other => other._id !== category._id && `${other.path}index.html` === path)) {
      throw new Error(`${post.source}: column homepage route conflicts with existing content: ${path}`);
    }
    claimed.set(path,key);
    homes[key] = {
      source:post.source, _id:post._id, title:post.title || category.name,
      content:post.content, excerpt:post.excerpt, description:post.description,
      date:post.date, updated:post.updated, lang:post.lang,
      path, permalink:fullUrl(path), layout:'category', __page:true,
      category:category.name, column_key:key, column_home:true,
      seo:{...post.seo, canonical:fullUrl(path)}, cover:post.cover, cover_alt:post.cover_alt,
      toc:post.toc, lightbox:post.lightbox, search:post.search, sitemap:post.sitemap,
      comments:false, current:1, total:1
    };
  }
  return {homes,excluded};
}
module.exports = {columnHomes,isIndex};
