import {
  THEME_STORAGE_KEY,
  nextPreference,
  parsePreference,
  readPreference,
  resolveTheme
} from '../shared/theme';

export function initializeTheme(): void {
  const root = document.documentElement;
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  const fallback = parsePreference(root.dataset.themeDefault) ?? 'auto';
  let preference = readPreference(key => window.localStorage.getItem(key), fallback);

  const apply = (): void => {
    const resolved = resolveTheme(preference, system.matches);
    root.dataset.theme = resolved;
    root.dataset.themePreference = preference;
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', resolved === 'dark' ? '#20232c' : '#f6f7f9'
    );
    document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach(button => {
      const label = button.dataset[`${preference}Label`];
      if (label) {
        button.setAttribute('aria-label', label);
        button.title = label;
      }
      button.hidden = false;
    });
  };

  apply();
  document.addEventListener('DOMContentLoaded', apply, { once: true });
  system.addEventListener('change', () => {
    if (preference === 'auto') apply();
  });
  window.addEventListener('storage', event => {
    if (event.key === THEME_STORAGE_KEY || event.key === 'theme' || event.key === null) {
      preference = readPreference(key => window.localStorage.getItem(key), fallback);
      apply();
    }
  });
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-theme-toggle]')) return;
    preference = nextPreference(preference);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    } catch {
      // Private/restricted storage must not prevent switching in this tab.
    }
    apply();
  });
}
