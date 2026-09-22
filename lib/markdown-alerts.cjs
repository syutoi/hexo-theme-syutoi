'use strict';

// Hexo's renderer expects a callable CommonJS plugin, while @mdit exports `alert`.
// Keep the version compatible with the renderer's markdown-it 13 dependency.
const { alert } = require('@mdit/plugin-alert');
module.exports = function markdownAlerts(md, options = {}) {
  const titles = options.titles || {};
  md.use(alert, {
    deep: false,
    titleRender(tokens, index) {
      const name = tokens[index].markup;
      const title = typeof titles[name] === 'string' ? titles[name] : name[0].toUpperCase() + name.slice(1);
      return `<p class="markdown-alert-title">${md.utils.escapeHtml(title)}</p>\n`;
    }
  });
};
