'use strict';
const { safeUrl } = require('./view.cjs');
const { plainText } = require('./text.cjs');

const text = value => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
const object = value => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

function twitterHandle(value) {
  const handle = text(value).replace(/^@/, '');
  return /^[a-z\d_]{1,15}$/i.test(handle) ? `@${handle}` : '';
}

function openGraphLocale(language) {
  try {
    const locale = new Intl.Locale(language);
    const region = locale.region || locale.maximize().region;
    return region ? `${locale.language}_${region}` : '';
  } catch { return ''; }
}

function metadata(context) {
  const { page, config } = context;
  const settings = context.syutoi_settings();
  const seo = settings.seo;
  const override = object(page.seo);
  const isArticle = context.is_post();
  const title = text(override.title) || text(context.syutoi_title());
  const pagedTitle = page.current > 1 ? `${title} · ${context.__('title.page_number', page.current)}` : title;
  const siteTitle = text(config.title);
  const description = [override.description, page.description, page.excerpt, page.content, config.description].map(value => plainText(value)).find(Boolean) || '';
  const absolute = value => {
    const safe = safeUrl(value, true);
    if (!safe) return '';
    try {
      const url = new URL(context.full_url_for(safe), config.url);
      return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
    } catch { return ''; }
  };
  const canonical = absolute(override.canonical) || absolute(page.path || '/');
  const candidates = [
    [override.image, override.image_alt],
    [page.cover, page.cover_alt],
    [seo.default_image, seo.default_image_alt],
    ...(!isArticle && !page.content ? [[settings.appearance.cover, '']] : [])
  ];
  let image = '';
  let imageAlt = '';
  if (override.image !== false) {
    for (const [value, alt] of candidates) {
      const url = absolute(value);
      if (url) { image = url; imageAlt = text(alt); break; }
    }
  }
  const timestamp = value => value && typeof value.toISOString === 'function' ? value.toISOString() : '';
  const names = collection => (collection?.toArray?.() || []).map(item => text(item.name)).filter(Boolean);
  return {
    title: pagedTitle,
    documentTitle: siteTitle && title !== siteTitle ? `${pagedTitle} · ${siteTitle}` : pagedTitle,
    description,
    canonical: canonical.split('#')[0],
    siteTitle, image, imageAlt,
    author: isArticle ? text(page.author || config.author) : '',
    published: isArticle ? timestamp(page.date) : '',
    modified: isArticle ? timestamp(page.updated) : '',
    type: isArticle ? 'article' : 'website',
    locale: openGraphLocale(page.lang),
    section: isArticle ? names(page.categories)[0] || '' : '',
    tags: isArticle ? [...new Set(names(page.tags))] : [],
    openGraph: seo.open_graph,
    twitterCard: seo.twitter_card,
    twitterSite: seo.twitter_site,
    twitterCreator: isArticle ? twitterHandle(override.twitter_creator) : '',
    noindex: seo.noindex || override.noindex === true || ['404', 'search'].includes(page.type)
  };
}

module.exports = { metadata, twitterHandle, openGraphLocale };
