export interface SearchItem { url: string; title: string; excerpt: string }
export interface SearchHit { data(): Promise<SearchItem> }
export interface SearchResponse { results: SearchHit[] }
export interface SearchProvider { search(query: string): Promise<SearchResponse>; reset(): void }
interface PagefindItem { url: string; meta: {title?: string}; excerpt: string }
interface PagefindInstance {
  search(query: string): Promise<{results: {data(): Promise<PagefindItem>}[]}>;
  destroy(): Promise<void>;
}
interface PagefindModule { createInstance(options: {basePath: string; baseUrl: string}): PagefindInstance }

export function pagefindProvider(basePath: string): SearchProvider {
  let ready: Promise<PagefindInstance | null> | undefined;
  let current: PagefindInstance | null = null;
  let attempt = 0;
  const initialize = () => {
    if (ready) return ready;
    const generation = attempt;
    ready = (async () => {
      const response = await fetch(`${basePath}manifest.json`, {cache: 'no-store'});
      if (!response.ok) throw new Error('Search manifest unavailable');
      const manifest = await response.json() as {provider?: string; count?: number};
      if (manifest.provider !== 'pagefind' || typeof manifest.count !== 'number' || !Number.isSafeInteger(manifest.count) || manifest.count < 0) throw new Error('Invalid search manifest');
      if (!manifest.count) return null;
      const moduleUrl = `${basePath}pagefind.js${attempt ? `?retry=${attempt}` : ''}`;
      const engine = await import(moduleUrl) as PagefindModule;
      if (generation !== attempt) throw new Error('Search initialization cancelled');
      current = engine.createInstance({basePath, baseUrl: '/'});
      return current;
    })().catch(error => {
      if (generation === attempt) { ready = undefined; attempt++; }
      throw error;
    });
    return ready;
  };
  return {
    async search(query) {
      const engine = await initialize();
      if (!engine) return {results: []};
      const response = await engine.search(query);
      return {results: response.results.map(hit => ({async data() {
        const item = await hit.data();
        // Pagefind excerpts contain highlight markup. Keep author text inert.
        const template = document.createElement('template');
        template.innerHTML = item.excerpt;
        return {url:item.url, title:item.meta.title || item.url, excerpt:template.content.textContent || ''};
      }}))};
    },
    reset() {
      if (current) void current.destroy().catch(() => {});
      current = null;
      ready = undefined;
      attempt++;
    }
  };
}

export const searchProviders: Readonly<Record<string, (basePath: string) => SearchProvider>> = {pagefind: pagefindProvider};
