'use strict';
const { commentsSlot } = require('../../lib/comments.cjs');
const { htmlTag, url_for } = require('hexo-util');
const version = require('../../package.json').version;

hexo.extend.helper.register('syutoi_comments', function () {
  return commentsSlot(this.syutoi_settings().comments, this.page, this.is_post() || this.is_page(), path => this.url_for(path));
});
hexo.extend.helper.register('syutoi_comments_assets', function () {
  return htmlTag('script', {
    defer: true,
    src: url_for.call(this, `js/comments.min.js?v=${version}`),
    'data-comments-entry': '',
    'data-core': url_for.call(this, `js/waline.min.js?v=${version}`),
    'data-style': url_for.call(this, `css/waline.min.css?v=${version}`)
  }, '');
});
