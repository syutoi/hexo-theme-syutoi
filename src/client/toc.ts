export function initializeToc(): void {
  const desktopToc = document.querySelector<HTMLElement>('[data-toc="desktop"]');
  const mobileToc = document.querySelector<HTMLElement>('[data-toc="mobile"]');
  const disclosure = mobileToc?.closest('details');
  const summary = disclosure?.querySelector('summary');
  const prose = document.querySelector<HTMLElement>('[data-prose]');
  if (!desktopToc || !mobileToc || !disclosure || !summary || !prose) return;

  const links = Array.from(desktopToc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const mobileLinks = Array.from(mobileToc.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
  const entries = links.flatMap((link, index) => {
    let id: string;
    try { id = decodeURIComponent(link.hash.slice(1)); } catch { return []; }
    const heading = document.getElementById(id);
    return heading && prose.contains(heading) ? [{ heading, link, mobile: mobileLinks[index] }] : [];
  });
  const first = entries[0];
  if (!first) return;
  const desktop = window.matchMedia('(min-width: 761px)');
  let active: typeof entries[number] | undefined;
  let pending = false;
  const update = (): void => {
    pending = false;
    const visible = entries.filter(entry => entry.heading.getClientRects().length);
    let current: typeof active;
    for (const entry of visible) {
      if (entry.heading.getBoundingClientRect().top <= 96) current = entry;
    }
    // At the end of a short last section, its heading may never reach the top.
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      current = visible[visible.length - 1];
    }
    if (current === active) return;
    for (const entry of entries) {
      for (const link of [entry.link, entry.mobile]) {
        if (entry === current) link?.setAttribute('aria-current', 'location');
        else link?.removeAttribute('aria-current');
      }
    }
    active = current;
    // Scroll only the sidebar panel; never move page focus or the document.
    if (active && desktop.matches && !desktopToc.contains(document.activeElement)) {
      const panel = desktopToc.getBoundingClientRect();
      const link = active.link.getBoundingClientRect();
      if (link.top < panel.top + 8) desktopToc.scrollTop += link.top - panel.top - 8;
      else if (link.bottom > panel.bottom - 8) desktopToc.scrollTop += link.bottom - panel.bottom + 8;
    }
  };
  const schedule = (): void => {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(update);
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  window.addEventListener('hashchange', schedule);
  document.addEventListener('load', schedule, true);
  document.addEventListener('toggle', schedule, true);
  // Images, font changes and expanded content can move headings without a scroll.
  if (typeof ResizeObserver === 'function') new ResizeObserver(schedule).observe(prose);

  let lastFocused: Element | null = document.activeElement;
  document.addEventListener('focusin', event => {
    lastFocused = event.target instanceof Element ? event.target : null;
  });
  desktop.addEventListener('change', () => {
    const previous = document.activeElement === document.body ? lastFocused : document.activeElement;
    if (desktop.matches && previous && disclosure.contains(previous)) {
      const entry = entries.find(item => item.mobile === previous);
      (entry?.link || active?.link || first.link).focus({ preventScroll: true });
    } else if (!desktop.matches && previous && desktopToc.contains(previous)) {
      const entry = entries.find(item => item.link === previous);
      disclosure.open = true;
      (entry?.mobile || summary).focus({ preventScroll: true });
    }
    schedule();
  });
  schedule();
}
