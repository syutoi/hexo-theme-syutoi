'use strict';

function languageTags(value) {
  return (Array.isArray(value) ? value : [value]).flatMap(language => {
    if (typeof language !== 'string' || language === 'default') return [];
    try { return Intl.getCanonicalLocales(language.trim().replace(/_/g, '-')); }
    catch { return []; }
  });
}

function resolveLocale(pageLanguage, siteLanguage, available) {
  const tags = [...new Set([...languageTags(pageLanguage), ...languageTags(siteLanguage)])];
  const match = tag => {
    const aliases = /^zh-Hant(?:-|$)/i.test(tag) ? ['zh-TW'] : /^zh-Hans(?:-|$)/i.test(tag) ? ['zh-CN'] : [];
    return [tag, ...aliases, tag.split('-')[0]].find(candidate => available.includes(candidate));
  };
  const languages = [...new Set([...tags.map(match).filter(Boolean), 'en'])];
  return { lang: tags[0] || 'en', languages };
}

module.exports = { resolveLocale };
