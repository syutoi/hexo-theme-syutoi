'use strict';
const pagination = require('hexo-pagination');

hexo.extend.generator.register('index', function (locals) {
  const options = hexo.config.index_generator || {};
  const posts = locals.posts.sort(options.order_by || '-date');
  // Sticky posts remain in normal pagination, so each post appears exactly once.
  const ordered = posts.toArray().sort((a, b) => Number(Boolean(b.sticky)) - Number(Boolean(a.sticky)));
  const perPage = options.per_page ?? hexo.config.per_page ?? 10;
  return pagination(options.path || '', new (this.model('Post').Query)(ordered), {
    perPage: ordered.length ? perPage : 0,
    layout: ['index'],
    format: (hexo.config.pagination_dir || 'page') + '/%d/',
    data: { __index: true }
  });
});
