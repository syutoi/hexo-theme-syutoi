'use strict';
const { enhanceLightbox } = require('../../lib/lightbox.cjs');
const { enhanceImages } = require('../../lib/images.cjs');
const { enhanceCode } = require('../../lib/code.cjs');
const { plainText } = require('../../lib/text.cjs');
const { readingTime } = require('../../lib/reading.cjs');
const { safeUrl, navigationItems } = require('../../lib/view.cjs');
const { normalizeConfig } = require('../../lib/config.cjs');
const { metadata } = require('../../lib/seo.cjs');

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
  if (page.type === 'search') return this.__('search.title');
  if (page.type === 'categories') return this.__('title.category');
  if (page.type === 'tags') return this.__('title.tag');
  if (page.type === '404') return this.__('desk.not_found');
  if (page.category) return this.__('title.category_page', page.category);
  if (page.tag) return this.__('title.tag_page', page.tag);
  if (page.archive) return [this.__('title.archive'), page.year, page.month, page.day].filter(Boolean).join(' / ');
  return page.title || (this.is_home() ? this.config.title : this.__('post.untitled'));
});
hexo.extend.helper.register('syutoi_excerpt', post => plainText(post.description || post.excerpt || post.content || ''));
hexo.extend.helper.register('syutoi_card_summary', function (post) {
  const settings = normalizeConfig(this.theme, hexo.config.theme_config).post_list;
  if (!settings.summary || post.summary === false) return '';
  const source = typeof post.summary === 'string' ? post.summary : post.description || post.excerpt || post.content || '';
  return plainText(source, settings.summary_length);
});
hexo.extend.helper.register('syutoi_cover', function (post) {
  const url = safeUrl(post.cover, true);
  return url ? this.url_for(url) : '';
});
hexo.extend.helper.register('syutoi_cover_alt', post => typeof post.cover_alt === 'string' ? post.cover_alt.trim() : '');
hexo.extend.helper.register('syutoi_reading_time', function (post) {
  if (!this.syutoi_settings().post.reading_time || post.reading_time === false) return '';
  const minutes = readingTime(post.content);
  return minutes ? this.__(minutes === 1 ? 'post.reading_minute' : 'post.reading_minutes', minutes) : '';
});
hexo.extend.helper.register('syutoi_feed', function (type) {
  const feed = this.config.feed?.[type];
  return feed?.enable ? this.url_for(feed.output || { rss: 'rss.xml', atom: 'atom.xml', jsonFeed: 'feed.json' }[type]) : '';
});

hexo.extend.helper.register('syutoi_year', () => new Date().getFullYear());


hexo.extend.helper.register('syutoi_metadata', function () {
  return metadata(this);
});

hexo.extend.helper.register('syutoi_content', function (content) {
  return enhanceCode(enhanceImages(content, value => this.url_for(value)), this.__('desk.code_block'));
});

hexo.extend.helper.register('syutoi_body', function () {
  const html = this.syutoi_content(this.page.content);
  return this.syutoi_settings().lightbox.enable && this.page.lightbox !== false
    ? enhanceLightbox(html, value => value.startsWith(this.config.root || '/') ? value : this.url_for(value), this.__('lightbox.open'))
    : { html, enabled: false };
});
