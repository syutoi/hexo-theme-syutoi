'use strict';
const { stripHTML } = require('hexo-util');
const { safeUrl, navigationItems } = require('../../lib/view.cjs');

hexo.extend.helper.register('syutoi_navigation', function () {
  return navigationItems(this.theme, key => this.__(key));
});
hexo.extend.helper.register('syutoi_url', function (value, image = false) {
  const url = safeUrl(value, image);
  return url ? this.url_for(url) : '';
});
hexo.extend.helper.register('syutoi_title', function () {
  const { page } = this;
  if (page.type === 'categories') return this.__('title.category');
  if (page.type === 'tags') return this.__('title.tag');
  if (page.type === '404') return this.__('desk.not_found');
  if (page.category) return `${this.__('title.category')}: ${page.category}`;
  if (page.tag) return `${this.__('title.tag')}: ${page.tag}`;
  if (page.archive) return [this.__('title.archive'), page.year, page.month].filter(Boolean).join(' / ');
  return page.title || (this.is_home() ? this.config.title : this.__('post.untitled'));
});
hexo.extend.helper.register('syutoi_excerpt', function (post) {
  const text = stripHTML(post.description || post.excerpt || post.content || '').replace(/\s+/g, ' ').trim();
  const characters = Array.from(text);
  return characters.length > 160 ? characters.slice(0, 160).join('') + '…' : text;
});
hexo.extend.helper.register('syutoi_cover', function (post) {
  const url = safeUrl(post.cover, true);
  return url ? this.url_for(url) : '';
});
hexo.extend.helper.register('syutoi_feed', function (type) {
  const feed = this.config.feed?.[type];
  return feed?.enable ? this.url_for(feed.output || { rss: 'rss.xml', atom: 'atom.xml', jsonFeed: 'feed.json' }[type]) : '';
});

hexo.extend.helper.register('syutoi_year', () => new Date().getFullYear());
