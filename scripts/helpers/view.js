'use strict';
const { stripHTML, unescapeHTML } = require('hexo-util');
const { safeUrl, navigationItems } = require('../../lib/view.cjs');
const { normalizeConfig } = require('../../lib/config.cjs');

hexo.extend.helper.register('syutoi_settings', function () {
  return normalizeConfig(this.theme, hexo.config.theme_config);
});

hexo.extend.helper.register('syutoi_navigation', function () {
  return navigationItems(normalizeConfig(this.theme, hexo.config.theme_config), key => this.__(key));
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
  if (page.category) return this.__('title.category_page', page.category);
  if (page.tag) return this.__('title.tag_page', page.tag);
  if (page.archive) return [this.__('title.archive'), page.year, page.month, page.day].filter(Boolean).join(' / ');
  return page.title || (this.is_home() ? this.config.title : this.__('post.untitled'));
});
hexo.extend.helper.register('syutoi_excerpt', function (post) {
  const text = stripHTML(post.description || post.excerpt || post.content || '').replace(/\s+/g, ' ').trim();
  const characters = Array.from(text);
  return characters.length > 160 ? characters.slice(0, 160).join('') + '…' : text;
});
hexo.extend.helper.register('syutoi_card_summary', function (post) {
  const settings = normalizeConfig(this.theme, hexo.config.theme_config).post_list;
  if (!settings.summary || post.summary === false) return '';
  const source = typeof post.summary === 'string' ? post.summary : post.description || post.excerpt || post.content || '';
  const text = unescapeHTML(stripHTML((typeof source === 'string' ? source : '').replace(/<\/(?:p|div|h[1-6]|li|blockquote)>|<br\s*\/?>/gi, ' '))).replace(/\s+/g, ' ').trim();
  const characters = Array.from(text);
  return characters.length > settings.summary_length ? characters.slice(0, settings.summary_length).join('') + '…' : text;
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
