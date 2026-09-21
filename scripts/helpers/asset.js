'use strict';
const { htmlTag, url_for } = require('hexo-util');
const version = require('../../package.json').version;

// Core assets are always local. Legacy vendor/CDN configuration is retired.
hexo.extend.helper.register('_css', function (name) {
  return htmlTag('link', { rel: 'stylesheet', href: url_for.call(this, `css/${name}?v=${version}`) });
});
hexo.extend.helper.register('_js', function (name) {
  return htmlTag('script', { src: url_for.call(this, `js/${name}?v=${version}`) }, '');
});

hexo.extend.helper.register('syutoi_lightbox_assets', function () {
  const attributes = {
    defer: true,
    src: url_for.call(this, `js/lightbox.min.js?v=${version}`),
    'data-lightbox-entry': '',
    'data-style': url_for.call(this, `css/lightbox.min.css?v=${version}`),
    'data-core': url_for.call(this, `js/photoswipe.min.js?v=${version}`)
  };
  for (const key of ['title', 'close', 'zoom', 'previous', 'next', 'error']) attributes[`data-${key}`] = this.__(`lightbox.${key}`);
  return htmlTag('script', attributes, '');
});

hexo.extend.helper.register('syutoi_search_assets', function () {
  return htmlTag('script', {defer: true, src: url_for.call(this, `js/search.min.js?v=${version}`)}, '');
});
