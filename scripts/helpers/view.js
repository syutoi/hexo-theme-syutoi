'use strict';
const { plainText } = require('../../lib/text.cjs');
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
hexo.extend.helper.register('syutoi_feed', function (type) {
  const feed = this.config.feed?.[type];
  return feed?.enable ? this.url_for(feed.output || { rss: 'rss.xml', atom: 'atom.xml', jsonFeed: 'feed.json' }[type]) : '';
});

hexo.extend.helper.register('syutoi_year', () => new Date().getFullYear());


hexo.extend.helper.register('syutoi_metadata', function () {
  const { page, config } = this;
  const text = value => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  const title = text(this.syutoi_title());
  const pagedTitle = page.current > 1 ? `${title} · ${this.__('title.page_number', page.current)}` : title;
  const siteTitle = text(config.title);
  const description = [page.description, page.excerpt, page.content, config.description].map(value => plainText(value)).find(Boolean) || '';
  const absolute = value => {
    const safe = safeUrl(value, true);
    if (!safe) return '';
    try {
      const url = new URL(this.full_url_for(safe), config.url);
      return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const isArticle = this.is_post();
  const cover = page.cover || (!isArticle && !page.content ? this.syutoi_settings().appearance.cover : '');
  const timestamp = value => value && typeof value.toISOString === 'function' ? value.toISOString() : '';
  return {
    title: pagedTitle,
    documentTitle: siteTitle && title !== siteTitle ? `${pagedTitle} · ${siteTitle}` : pagedTitle,
    description,
    canonical: absolute(page.path || '/'),
    siteTitle,
    image: absolute(cover),
    author: isArticle ? text(page.author || config.author) : '',
    published: isArticle ? timestamp(page.date) : '',
    modified: isArticle ? timestamp(page.updated) : '',
    type: isArticle ? 'article' : 'website',
    notFound: page.type === '404'
  };
});
