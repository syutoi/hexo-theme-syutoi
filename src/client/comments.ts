import type { CommentsInstance, CommentsWindow } from './comments/types';

const entry = document.querySelector<HTMLScriptElement>('[data-comments-entry]');
const slot = document.querySelector<HTMLElement>('[data-comments-slot]');
const button = slot?.querySelector<HTMLButtonElement>('[data-comments-load]');
const status = slot?.querySelector<HTMLElement>('[data-comments-status]');
const content = slot?.querySelector<HTMLElement>('[data-comments-content]');
let instance: CommentsInstance | undefined;
let styleReady = false;

function load(element: HTMLScriptElement | HTMLLinkElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const finish = (failed: boolean) => {
      clearTimeout(timeout);
      element.onload = element.onerror = null;
      if (failed) { element.remove(); reject(new Error('Comments resource unavailable')); }
      else resolve();
    };
    const timeout = window.setTimeout(() => finish(true), 15000);
    element.onload = () => finish(false);
    element.onerror = () => finish(true);
    document.head.append(element);
  });
}

if (entry && slot && button && status && content) {
  button.hidden = false;
  status.textContent = slot.dataset.prompt || '';
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    button.disabled = true;
    content.setAttribute('aria-busy', 'true');
    status.textContent = slot.dataset.loading || '';
    try {
      instance?.destroy();
      instance = undefined;
      content.replaceChildren();
      if (!styleReady) {
        const style = document.createElement('link');
        style.rel = 'stylesheet';
        style.href = entry.dataset.style!;
        await load(style);
        styleReady = getComputedStyle(slot).getPropertyValue('--syutoi-comments-ready').trim() === '1';
        if (!styleReady) { style.remove(); throw new Error('Invalid comments styles'); }
      }
      const provider = slot.dataset.provider!;
      const host = window as CommentsWindow;
      if (!host.SyutoiComments?.[provider]) {
        const script = document.createElement('script');
        script.src = entry.dataset.core!;
        await load(script);
        script.remove();
      }
      const adapter = host.SyutoiComments?.[provider];
      if (!adapter) throw new Error('Missing comments adapter');
      instance = adapter.mount({ el: content, serverURL: slot.dataset.serverUrl!, path: slot.dataset.path!, lang: slot.dataset.lang! });
      status.textContent = '';
      button.textContent = slot.dataset.reload || '';
      content.focus({ preventScroll: true });
    } catch {
      content.replaceChildren();
      status.textContent = slot.dataset.error || '';
      button.disabled = false;
      button.focus({ preventScroll: true });
    } finally {
      button.disabled = false;
      content.removeAttribute('aria-busy');
    }
  });
  window.addEventListener('pagehide', event => {
    if (!event.persisted) instance?.destroy();
  });
}
