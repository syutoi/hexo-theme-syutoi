export function initializeNavigation(): void {
  const root = document.documentElement;
  const button = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const navigation = document.getElementById('site-navigation');
  if (!button || !navigation) return;
  const desktop = window.matchMedia('(min-width: 761px)');
  let lastFocused: Element | null = document.activeElement;
  const setOpen = (open: boolean): void => {
    root.dataset.navigationOpen = String(open);
    button.setAttribute('aria-expanded', String(open));
  };
  const close = (): void => {
    if (desktop.matches) return;
    // Never leave keyboard focus inside a navigation that is about to disappear.
    if (navigation.contains(document.activeElement)) button.focus();
    setOpen(false);
  };
  root.classList.add('navigation-ready');
  setOpen(desktop.matches);
  button.hidden = false;
  button.addEventListener('click', () => setOpen(desktop.matches || button.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !desktop.matches && root.dataset.navigationOpen === 'true') {
      close();
    }
  });
  navigation.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('a')) close();
  });
  // This is a disclosure, not a modal: Tab can leave it normally.
  document.addEventListener('focusin', event => {
    lastFocused = event.target instanceof Element ? event.target : null;
    if (event.target instanceof Node && event.target !== button && !navigation.contains(event.target)) close();
  });
  document.addEventListener('click', event => {
    if (event.target instanceof Node && !button.contains(event.target) && !navigation.contains(event.target)) close();
  });
  desktop.addEventListener('change', () => {
    // CSS may hide a focused control before the media-query event fires.
    const previous = document.activeElement === document.body ? lastFocused : document.activeElement;
    if (desktop.matches) {
      setOpen(true);
      if (previous === button) navigation.querySelector<HTMLAnchorElement>('a')?.focus();
    } else {
      if (previous && navigation.contains(previous)) button.focus();
      close();
    }
  });
}
