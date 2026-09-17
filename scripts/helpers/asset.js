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
