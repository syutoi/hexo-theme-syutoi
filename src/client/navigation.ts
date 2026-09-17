export function initializeNavigation(): void {
  const root = document.documentElement;
  const button = document.querySelector<HTMLButtonElement>('[data-nav-toggle]');
  const navigation = document.getElementById('site-navigation');
  if (!button || !navigation) return;
  const setOpen = (open: boolean): void => {
    root.dataset.navigationOpen = String(open);
    button.setAttribute('aria-expanded', String(open));
  };
  root.classList.add('navigation-ready');
  setOpen(false);
  button.hidden = false;
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && root.dataset.navigationOpen === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  navigation.addEventListener('click', event => {
    if (event.target instanceof Element && event.target.closest('a')) setOpen(false);
  });
  window.matchMedia('(min-width: 761px)').addEventListener('change', () => setOpen(false));
}
