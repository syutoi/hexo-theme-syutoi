const READING_TAB_KEY = 'syutoi-reading-tab';

export function initializeColumns(): void {
  const desktopNav = document.querySelector<HTMLElement>('[data-column="desktop"]');
  const mobileNav = document.querySelector<HTMLElement>('[data-column="mobile"]');
  const disclosure = mobileNav?.closest('details');
  if (desktopNav && mobileNav && disclosure) {
    let lastFocused: Element | null = document.activeElement;
    document.addEventListener('focusin', event => {
      lastFocused = event.target instanceof Element ? event.target : null;
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
      const previous = document.activeElement === document.body ? lastFocused : document.activeElement;
      if (!previous) return;
      const source = event.matches ? disclosure : desktopNav;
      const onTab = !event.matches && previous.matches('[data-reading-tabs] button');
      if (!source?.contains(previous) && !onTab) return;
      const target = event.matches ? desktopNav : mobileNav;
      if (event.matches) desktopNav.dispatchEvent(new Event('syutoi:show-column', { bubbles: true }));
      else disclosure.open = true;
      const href = previous.closest('a')?.getAttribute('href');
      const links = Array.from(target.querySelectorAll<HTMLAnchorElement>('a'));
      (links.find(link => link.getAttribute('href') === href) || target.querySelector<HTMLAnchorElement>('[aria-current="page"]') || links[0])?.focus({preventScroll:true});
    });
  }
  const container = document.querySelector<HTMLElement>('[data-reading-navigation]');
  const tabs = container?.querySelector<HTMLElement>('[data-reading-tabs]');
  if (!container || !tabs) return;
  const buttons = Array.from(tabs.querySelectorAll<HTMLButtonElement>('button'));
  const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls') || ''));
  if (panels.some(panel => !panel)) return;
  tabs.setAttribute('role', 'tablist');
  const select = (index: number, remember = false): void => {
    if (remember) {
      try { localStorage.setItem(READING_TAB_KEY, buttons[index]!.id); } catch { /* Storage may be disabled. */ }
    }
    buttons.forEach((button, i) => {
      button.setAttribute('aria-selected', String(i === index));
      button.tabIndex = i === index ? 0 : -1;
      panels[i]!.hidden = i !== index;
    });
  };
  buttons.forEach((button, index) => {
    button.setAttribute('role', 'tab');
    panels[index]!.setAttribute('role', 'tabpanel');
    panels[index]!.setAttribute('aria-labelledby', button.id);
    button.addEventListener('click', () => select(index, true));
    button.addEventListener('keydown', event => {
      let next: number;
      if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
      else if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = buttons.length - 1;
      else return;
      event.preventDefault();
      select(next, true);
      buttons[next]?.focus();
    });
  });
  // If responsive TOC focus transfer targets the article panel, reveal it first.
  container.addEventListener('syutoi:show-article', () => select(0));
  container.addEventListener('syutoi:show-column', () => select(1));
  let preferred = 0;
  try {
    const saved = localStorage.getItem(READING_TAB_KEY);
    preferred = Math.max(0, buttons.findIndex(button => button.id === saved));
  } catch { /* Keep the default when storage is unavailable. */ }
  select(preferred);
  container.classList.add('is-tabbed');
  tabs.hidden = false;

  // Account for the panel's actual position, including the author card above it.
  let pending = false;
  const fit = (): void => {
    pending = false;
    if (!container.getClientRects().length) return;
    const top = Math.max(16, container.getBoundingClientRect().top);
    const available = window.innerHeight - top - 16;
    // Off-screen panels retain their natural size until they enter the viewport.
    container.style.setProperty('--reading-height', `${available > 120 ? available : window.innerHeight - 32}px`);
  };
  const schedule = (): void => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(fit);
  };
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', schedule);
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(schedule);
    observer.observe(tabs);
    const author = document.querySelector('.author-panel');
    if (author) observer.observe(author);
  }
  fit();
}
