'use strict';

const array = value => Array.isArray(value) ? value : value?.toArray?.() || [];
const text = value => typeof value === 'string' ? value.trim() : '';

function categoryKey(category, categories) {
  const names = [category.name];
  const seen = new Set([category._id]);
  let parent = category.parent;
  while (parent && !seen.has(parent)) {
    seen.add(parent);
    const item = categories.find(entry => entry._id === parent);
    if (!item) break;
    names.unshift(item.name);
    parent = item.parent;
  }
  return names.join('/');
}

function columnPosts(category, config, now = Date.now()) {
  const order = post => typeof post.column_order === 'number' && Number.isFinite(post.column_order) ? post.column_order : Infinity;
  const date = post => Number.isFinite(+post.date) ? +post.date : 0;
  return array(category.posts).filter(post => post.published !== false && !post.password && post.column !== false &&
    (config.future || !post.date || +post.date <= now)).sort((a,b) => {
    if (order(a) !== order(b)) return order(a) < order(b) ? -1 : 1;
    return date(a) - date(b) || String(a.path).localeCompare(String(b.path), 'en');
  });
}

function columnForPage(site, page, settings, config, isPost = false) {
  const categories = array(site.categories);
  const enabled = settings.columns.categories;
  if (!enabled.length) return null;
  const candidates = categories.map(category => ({category, key:categoryKey(category,categories)}))
    .filter(({key}) => enabled === 'all' || enabled.includes(key));
  let selected;
  if (isPost) {
    if (page.column === false || page.password || page.published === false) return null;
    const belongs = ({category}) => columnPosts(category,config).some(post => post.path === page.path);
    if (text(page.column)) selected = candidates.find(entry => entry.key === text(page.column) && belongs(entry));
    else selected = candidates.filter(belongs).sort((a,b) => b.key.split('/').length - a.key.split('/').length || (enabled === 'all' ? a.key.localeCompare(b.key, 'en') : enabled.indexOf(a.key) - enabled.indexOf(b.key)))[0];
  } else if (page.category) {
    selected = candidates.find(({category,key}) => page.column_key ? key === page.column_key : page.path === `${category.path}index.html`);
  }
  if (!selected) return null;
  const posts = columnPosts(selected.category,config);
  if (isPost && !posts.length) return null;
  const index = isPost ? posts.findIndex(post => post.path === page.path) : -1;
  return {home:site.column_homes?.[selected.key] || null,name:selected.category.name,key:selected.key,path:site.column_homes?.[selected.key]?.path.replace(/(^|\/)index\.html$/, '$1') || selected.category.path,posts,index,position:index+1,total:posts.length,
    previous:index > 0 ? posts[index-1] : null,next:index >= 0 ? posts[index+1] || null : null};
}

module.exports = {categoryKey,columnPosts,columnForPage};
