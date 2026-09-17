'use strict';

function safeUrl(value, image = false) {
  if (typeof value !== 'string') return '';
  const result = value.trim();
  if (!result || /[\u0000-\u001f\u007f\\]/.test(result)) return '';
  const scheme = result.match(/^([a-z][a-z\d+.-]*):/i)?.[1]?.toLowerCase();
  if (scheme && !(image ? ['http', 'https'] : ['http', 'https', 'mailto']).includes(scheme)) return '';
  return result;
}

// Keep old menu configurations usable until the configuration migration (B6).
function navigationItems(theme, translate) {
  const entries = [];
  const append = (label, value) => {
    const url = safeUrl(value);
    if (url && label) entries.push({ label: String(label), url });
  };
  if (Array.isArray(theme.navigation?.menu)) {
    for (const item of theme.navigation.menu) {
      if (item && typeof item === 'object') append(item.name, item.url);
    }
  } else {
    const visit = menu => {
      for (const [name, value] of Object.entries(menu || {})) {
        if (typeof value === 'string') {
          const key = `menu.${name}`;
          const label = translate(key);
          append(label === key ? name : label, value.split('||')[0]);
        } else if (value && typeof value === 'object') {
          visit(Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'default')));
        }
      }
    };
    visit(theme.menu);
  }
  return entries;
}

module.exports = { safeUrl, navigationItems };
