import { searchProviders } from './search/provider';
import type { SearchHit } from './search/provider';

const container = document.querySelector<HTMLElement>('[data-search]');
if (container) initializeSearch(container);

function timeout<T>(promise: Promise<T>): Promise<T> {
  let timer: number;
  return Promise.race([promise, new Promise<never>((_resolve, reject) => {
    timer = window.setTimeout(() => reject(new Error('Search timed out')), 15000);
  })]).finally(() => clearTimeout(timer));
}

function initializeSearch(container: HTMLElement) {
  const form = container.querySelector('form');
  const input = container.querySelector<HTMLInputElement>('input[type="search"]');
  const status = container.querySelector<HTMLElement>('[data-search-status]');
  const results = container.querySelector<HTMLOListElement>('[data-search-results]');
  const more = container.querySelector<HTMLButtonElement>('[data-search-more]');
  const factory = searchProviders[container.dataset.provider || ''];
  if (!form || !input || !status || !results || !more || !factory || !container.dataset.index) return;
  const provider = factory(container.dataset.index);
  const rootPath = new URL(container.dataset.root || '/', location.origin).pathname;
  const pageSize = 10;
  let revision = 0;
  let hits: SearchHit[] = [];
  let shown = 0;
  let composing = false;
  const message = (name: string) => container.dataset[name] || '';
  const clear = () => {
    revision++;
    hits = [];
    shown = 0;
    results.replaceChildren();
    more.hidden = true;
    more.disabled = false;
    container.removeAttribute('aria-busy');
    status.textContent = message('prompt');
  };
  const fail = () => {
    provider.reset();
    hits = [];
    shown = 0;
    results.replaceChildren();
    more.hidden = true;
    container.removeAttribute('aria-busy');
    status.textContent = message('error');
  };
  const show = async (id: number) => {
    more.disabled = true;
    const items = await timeout(Promise.all(hits.slice(shown, shown + pageSize).map(hit => hit.data())));
    if (id !== revision) return;
    const fragment = document.createDocumentFragment();
    for (const item of items) {
      const url = new URL(item.url, location.origin);
      if (url.origin !== location.origin || !url.pathname.startsWith(rootPath)) throw new Error('Invalid search result URL');
      const li = document.createElement('li');
      const title = document.createElement('h2');
      const link = document.createElement('a');
      link.href = url.href;
      link.textContent = item.title;
      title.append(link);
      const excerpt = document.createElement('p');
      excerpt.textContent = item.excerpt;
      li.append(title, excerpt);
      fragment.append(li);
    }
    results.append(fragment);
    shown += items.length;
    more.hidden = shown >= hits.length;
    more.disabled = false;
    container.removeAttribute('aria-busy');
    status.textContent = hits.length ? message('count').replace('%s', String(hits.length)) : message('empty');
  };
  for (const control of Array.from(form.querySelectorAll<HTMLInputElement | HTMLButtonElement>('input, button'))) control.disabled = false;
  status.textContent = message('prompt');
  input.addEventListener('input', clear);
  input.addEventListener('compositionstart', () => { composing = true; });
  input.addEventListener('compositionend', () => { composing = false; });
  form.addEventListener('reset', () => { clear(); input.focus(); });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (composing) return;
    clear();
    const query = input.value.trim();
    if (!query) return;
    const id = revision;
    container.setAttribute('aria-busy', 'true');
    status.textContent = message('loading');
    try {
      const response = await timeout(provider.search(query));
      if (id !== revision) return;
      hits = response.results;
      await show(id);
    } catch { if (id === revision) fail(); }
  });
  more.addEventListener('click', async () => {
    const id = revision;
    const firstNewResult = shown;
    container.setAttribute('aria-busy', 'true');
    status.textContent = message('loading');
    try {
      await show(id);
      if (id === revision) results.children[firstNewResult]?.querySelector('a')?.focus();
    } catch { if (id === revision) fail(); }
  });
}
