'use strict';
const { safeUrl } = require('./view.cjs');
const { serverUrl } = require('./comments.cjs');
const { twitterHandle } = require('./seo.cjs');

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
    ? [{ name, url: entry.split('||')[0].trim() }] : entry && typeof entry === 'object' ? [{ ...entry, type: name }] : []);
}

const socialNames = { github: 'GitHub', gitlab: 'GitLab', email: 'Email', twitter: 'X', x: 'X', mastodon: 'Mastodon', bluesky: 'Bluesky', rss: 'RSS', website: 'Website', zhihu: '知乎', xiaohongshu: '小红书', bilibili: '哔哩哔哩', weibo: '微博', telegram: 'Telegram', youtube: 'YouTube', instagram: 'Instagram' };
function socialLinks(value) {
  return socialEntries(value).flatMap(entry => {
    const type = text(entry?.type).toLowerCase();
    return links([{
      name: text(entry?.name) || socialNames[type] || '',
      url: entry?.url
    }]).map(link => Object.hasOwn(socialNames, type) ? { ...link, icon: type === 'twitter' ? 'x' : type } : link);
  });
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
  const baidu = text(pick('analytics', 'baidu', ''));
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
    search: {
      provider: pick('search', 'provider', 'none') === 'pagefind' ? 'pagefind' : 'none'
    },
    analytics: {
      baidu: /^[a-f\d]{32}$/i.test(baidu) ? baidu : ''
    },
    seo: {
      open_graph: bool(pick('seo', 'open_graph', true)),
      twitter_card: bool(pick('seo', 'twitter_card', true)),
      default_image: safeUrl(pick('seo', 'default_image', ''), true),
      default_image_alt: text(pick('seo', 'default_image_alt', '')),
      twitter_site: twitterHandle(pick('seo', 'twitter_site', '')),
      noindex: bool(pick('seo', 'noindex', false), false)
    },
    comments: {
      provider: pick('comments', 'provider', 'none') === 'waline' ? 'waline' : 'none',
      server_url: serverUrl(pick('comments', 'server_url', ''))
    },
    lightbox: {
      enable: bool(pick('lightbox', 'enable', false), false)
    },
    navigation: {
      menu: links(pick('navigation', 'menu', [{ name: 'menu.home', url: '/' }], c => has(c, 'menu') ? legacyMenu(c.menu) : undefined))
    },
    social: socialLinks(pick('social', undefined, [])),
    sidebar: {
      enable: bool(pick('sidebar', 'enable', true)),
      statistics: bool(pick('sidebar', 'statistics', true)),
      categories: bool(pick('sidebar', 'categories', true)),
      toc: bool(pick('sidebar', 'toc', true)),
      toc_number: bool(pick('sidebar', 'toc_number', true))
    },
    footer: {
      since: Number.isInteger(since) && since > 0 ? since : null,
      powered: bool(pick('footer', 'powered', true)),
      rss: bool(pick('footer', 'rss', true))
    }
  };
}

module.exports = { normalizeConfig };
