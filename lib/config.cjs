'use strict';
const { safeUrl } = require('./view.cjs');

const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const has = (value, key) => Object.prototype.hasOwnProperty.call(object(value), key);
const at = (value, group, key) => key === undefined ? value?.[group] : value?.[group]?.[key];
const owns = (value, group, key) => key === undefined ? has(value, group) : has(value?.[group], key);
const text = value => typeof value === 'string' ? value.trim() : '';
const bool = (value, fallback = true) => typeof value === 'boolean' ? value : fallback;

function legacyMenu(value) {
  const result = [];
  for (const [name, entry] of Object.entries(object(value))) {
    if (typeof entry === 'string') result.push({ name: `menu.${name}`, url: entry.split('||')[0].trim() });
    else if (entry && typeof entry === 'object') {
      const children = { ...entry };
      delete children.default;
      result.push(...legacyMenu(children));
    }
  }
  return result;
}

function socialEntries(value) {
  if (Array.isArray(value)) return value;
  return Object.entries(object(value)).flatMap(([name, entry]) => typeof entry === 'string'
    ? [{ name, url: entry.split('||')[0].trim() }] : []);
}

function links(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap(entry => {
    const name = text(entry?.name);
    const url = safeUrl(entry?.url);
    return name && url ? [{ name, url }] : [];
  });
}

function oldAvatar(config) {
  const avatar = safeUrl(config.sidebar?.avatar, true);
  if (!avatar || /^(?:[a-z][a-z\d+.-]*:|\/)/i.test(avatar)) return avatar;
  return safeUrl(`${text(config.images) || 'images'}/${avatar}`, true);
}

// Hexo has already merged defaults into theme. Inspect site overrides separately
// so a default new key cannot accidentally hide an explicitly configured old key.
function normalizeConfig(theme = {}, overrides = {}) {
  theme = object(theme);
  overrides = object(overrides);
  const pick = (group, key, fallback, legacy) => {
    for (const source of [overrides, theme]) {
      if (owns(source, group, key)) return at(source, group, key);
      if (legacy) {
        const value = legacy(source);
        if (value !== undefined) return value;
      }
    }
    return fallback;
  };
  const preference = pick('appearance', 'theme', 'auto', c => has(c, 'darkmode') ? (c.darkmode === true ? 'dark' : 'auto') : undefined);
  const since = pick('footer', 'since', null);
  const summaryLength = pick('post_list', 'summary_length', 160);
  return {
    branding: {
      name: text(pick('branding', 'name', '', c => c.alternate)),
      avatar: safeUrl(pick('branding', 'avatar', '', c => has(c.sidebar, 'avatar') ? oldAvatar(c) : undefined), true),
      logo: safeUrl(pick('branding', 'logo', ''), true),
      favicon: safeUrl(pick('branding', 'favicon', '/images/favicon.png'), true)
    },
    appearance: {
      theme: ['light', 'dark', 'auto'].includes(preference) ? preference : 'auto',
      cover: safeUrl(pick('appearance', 'cover', ''), true)
    },
    post_list: {
      summary: bool(pick('post_list', 'summary', true)),
      summary_length: Number.isInteger(summaryLength) && summaryLength >= 1 && summaryLength <= 1000 ? summaryLength : 160,
      cover: bool(pick('post_list', 'cover', true))
    },
    post: {
      reading_time: bool(pick('post', 'reading_time', true))
    },
    lightbox: {
      enable: bool(pick('lightbox', 'enable', false), false)
    },
    navigation: {
      menu: links(pick('navigation', 'menu', [{ name: 'menu.home', url: '/' }], c => has(c, 'menu') ? legacyMenu(c.menu) : undefined))
    },
    social: links(socialEntries(pick('social', undefined, []))),
    sidebar: {
      enable: bool(pick('sidebar', 'enable', true)),
      statistics: bool(pick('sidebar', 'statistics', true)),
      categories: bool(pick('sidebar', 'categories', true)),
      toc: bool(pick('sidebar', 'toc', true))
    },
    footer: {
      since: Number.isInteger(since) && since > 0 ? since : null,
      powered: bool(pick('footer', 'powered', true)),
      rss: bool(pick('footer', 'rss', true))
    }
  };
}

module.exports = { normalizeConfig };
