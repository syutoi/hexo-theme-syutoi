'use strict';
const { parseDocument } = require('htmlparser2');
const { resolveLocale } = require('./locale.cjs');

function searchText(html) {
  const visit = node => {
    if (node.type === 'text') return node.data;
    const attrs = node.attribs || {};
    if (['script', 'style', 'template', 'svg'].includes(node.name) || Object.hasOwn(attrs, 'hidden') ||
      attrs['aria-hidden'] === 'true' || /(?:^|\s)gutter(?:\s|$)/.test(attrs.class || '')) return ' ';
    const value = (node.children || []).map(visit).join('');
    return /^(?:p|div|h[1-6]|li|pre|br|tr|td|th|section|figcaption)$/.test(node.name || '') ? ` ${value} ` : value;
  };
  return visit(parseDocument(typeof html === 'string' ? html : '')).replace(/\s+/g, ' ').trim();
}

function searchRecords(site, config, localUrl, untitled = 'Untitled') {
  const seen = new Set();
  const language = resolveLocale(null, config.language, []).lang.split('-')[0].toLowerCase();
  const records = [];
  for (const item of [...site.posts.toArray(), ...site.pages.toArray()]) {
    if (item.search === false || item.published === false || item.password ||
      (!config.future && item.date && +item.date > Date.now()) ||
      ['categories', 'tags', '404', 'search'].includes(item.type) ||
      ['categories', 'tags', '404', 'search'].includes(item.layout)) continue;
    const path = item.path;
    if (typeof path !== 'string' || !path || path.includes('..') || /^[a-z][a-z\d+.-]*:/i.test(path) || path.startsWith('//')) continue;
    const url = localUrl(path);
    if (seen.has(url)) continue;
    const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : untitled;
    const content = searchText(item.content);
    if (!content && title === untitled) continue;
    seen.add(url);
    records.push({url, language, content: `${title}\n${content}`, meta: {title}});
  }
  return {records, language};
}

// Pagefind 1.5.2 starts initialization from its constructor without consuming
// the rejection. It already saves initError and rejects search/getPtr correctly.
// Consume only that orphan promise; UI callers still receive the real error.
function pagefindAsset(file) {
  if (!['pagefind.js', 'pagefind-worker.js'].includes(file.path)) return Buffer.from(file.content);
  const source = Buffer.from(file.content).toString('utf8');
  const initialization = /this\.init\(\w+\?\.language\)/g;
  if ([...source.matchAll(initialization)].length !== 1) {
    throw new Error(`Re-evaluate the Pagefind initialization patch for ${file.path}`);
  }
  return Buffer.from('/* Syutoi: consume orphan Pagefind initialization rejection; search errors still propagate. */\n' +
    source.replace(initialization, '$&.catch(() => {})'));
}

// Build-provider contract: records + language -> Hexo route descriptors.
// Keep Pagefind's process lifecycle separate from Hexo and serialize service use.
let pending = Promise.resolve();
function buildPagefind(records, language) {
  const job = pending.then(async () => {
    if (!records.length) return [];
    const pagefind = await import('pagefind');
    let index;
    const check = result => {
      if (result.errors?.length) throw new Error(result.errors.join('\n'));
      return result;
    };
    try {
      index = check(await pagefind.createIndex({forceLanguage: language})).index;
      if (!index) throw new Error('Pagefind did not create an index');
      for (const record of records) check(await index.addCustomRecord(record));
      const files = check(await index.getFiles()).files;
      const entry = files.find(file => file.path === 'pagefind-entry.json');
      if (!entry || JSON.parse(Buffer.from(entry.content).toString('utf8')).version !== '1.5.2') {
        throw new Error('Re-evaluate the initialization patch before changing Pagefind versions');
      }
      return files
        .filter(file => /^(?:pagefind\.js|pagefind-worker\.js|pagefind-entry\.json)$/.test(file.path) || /\.(?:pf_meta|pf_fragment|pf_index|pf_filter|pagefind)$/.test(file.path))
        .map(file => ({path:`_syutoi/search/${file.path}`, data:pagefindAsset(file)}));
    } finally {
      try { await index?.deleteIndex(); } finally { await pagefind.close(); }
    }
  });
  pending = job.catch(() => {});
  return job;
}
const searchProviders = Object.freeze({pagefind: buildPagefind});
module.exports = {searchText, searchRecords, searchProviders};
