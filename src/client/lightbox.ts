import type PhotoSwipe from 'photoswipe';
import type { SlideData } from 'photoswipe';

type ViewerWindow = typeof window & { SyutoiPhotoSwipe?: typeof PhotoSwipe };
type ImageItem = SlideData & { link: HTMLAnchorElement; caption: string };
const entry = document.querySelector<HTMLScriptElement>('script[data-lightbox-entry]');
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-prose] a[data-syutoi-lightbox]'));
let resources: Promise<typeof PhotoSwipe> | undefined;
let busy = false;
let active: PhotoSwipe | undefined;

function loadElement(element: HTMLScriptElement | HTMLLinkElement): Promise<void> {
  return new Promise((resolve, reject) => {
    const finish = (failed: boolean) => {
      clearTimeout(timeout);
      element.onload = element.onerror = null;
      if (failed) { element.remove(); reject(new Error('Lightbox resource unavailable')); }
      else resolve();
    };
    const timeout = window.setTimeout(() => finish(true), 10000);
    element.onload = () => finish(false);
    element.onerror = () => finish(true);
    document.head.append(element);
  });
}

function loadViewer(): Promise<typeof PhotoSwipe> {
  if (!resources) {
    resources = (async () => {
      if (!entry?.dataset.style || !entry.dataset.core) throw new Error('Missing lightbox resources');
      const style = document.createElement('link');
      style.rel = 'stylesheet';
      style.href = entry.dataset.style;
      const script = document.createElement('script');
      script.src = entry.dataset.core;
      await Promise.all([loadElement(style), loadElement(script)]);
      // Reject an HTML/empty response that happened to fire load successfully.
      const probe = document.createElement('div');
      probe.className = 'pswp';
      probe.hidden = true;
      document.body.append(probe);
      const styled = getComputedStyle(probe).getPropertyValue('--syutoi-lightbox-ready').trim() === '1';
      probe.remove();
      const Viewer = (window as ViewerWindow).SyutoiPhotoSwipe;
      if (!styled || !Viewer) throw new Error('Invalid lightbox resources');
      return Viewer;
    })();
  }
  return resources;
}

function imageItem(link: HTMLAnchorElement): ImageItem | undefined {
  const image = link.querySelector('img');
  if (!image) return;
  const validDimension = (value: string | undefined) => Number.isSafeInteger(Number(value)) && Number(value) > 0 && Number(value) <= 100000;
  const explicit = validDimension(link.dataset.lightboxWidth) && validDimension(link.dataset.lightboxHeight);
  const sameSource = link.href === image.src && !image.srcset && !image.closest('picture');
  const width = explicit ? Number(link.dataset.lightboxWidth) : sameSource && image.complete ? image.naturalWidth : 0;
  const height = explicit ? Number(link.dataset.lightboxHeight) : sameSource && image.complete ? image.naturalHeight : 0;
  if (!(width > 0 && height > 0)) return;
  return { src: link.href, width, height, alt: image.alt, link,
    caption: link.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || image.alt };
}

// Resolve only the clicked image. Never fetch the entire lazy gallery for dimensions.
function resolveImage(link: HTMLAnchorElement): Promise<void> {
  if (imageItem(link)) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const image = new Image();
    const finish = (failed: boolean) => {
      clearTimeout(timeout);
      image.onload = image.onerror = null;
      if (failed) reject(new Error('Image unavailable'));
      else {
        link.dataset.lightboxWidth = String(image.naturalWidth);
        link.dataset.lightboxHeight = String(image.naturalHeight);
        resolve();
      }
    };
    const timeout = window.setTimeout(() => finish(true), 10000);
    image.onload = () => finish(!image.naturalWidth || !image.naturalHeight);
    image.onerror = () => finish(true);
    image.src = link.href;
  });
}

function openViewer(Viewer: typeof PhotoSwipe, origin: HTMLAnchorElement) {
  const items = links.flatMap(link => { const item = imageItem(link); return item ? [item] : []; });
  const index = items.findIndex(item => item.link === origin);
  if (index < 0) throw new Error('Missing image dimensions');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const viewer = new Viewer({
    dataSource: items, index, preload: [0, 0], loop: false,
    showHideAnimationType: reducedMotion ? 'none' : 'fade',
    zoomAnimationDuration: reducedMotion ? 0 : 333,
    trapFocus: false, returnFocus: false,
    closeTitle: entry?.dataset.close, zoomTitle: entry?.dataset.zoom,
    arrowPrevTitle: entry?.dataset.previous, arrowNextTitle: entry?.dataset.next,
    errorMsg: entry?.dataset.error
  });
  active = viewer;
  let closeAfterOpening = false;
  const backgrounds = new Map<HTMLElement, boolean>();
  const focusable = () => Array.from(viewer.element?.querySelectorAll<HTMLElement>('button, a[href], [tabindex="0"]') || [])
    .filter(element => !element.hasAttribute('disabled') && element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden');
  const focusFirst = () => (focusable()[0] || viewer.element)?.focus({ preventScroll: true });
  const trapTab = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (viewer.opener.isOpen) viewer.close();
      else closeAfterOpening = true;
      return;
    }
    if (event.key !== 'Tab') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const elements = focusable();
    const current = elements.indexOf(document.activeElement as HTMLElement);
    const next = event.shiftKey ? (current <= 0 ? elements.length - 1 : current - 1) : (current + 1) % elements.length;
    (elements[next] || viewer.element)?.focus({ preventScroll: true });
  };
  const trapFocus = (event: FocusEvent) => {
    if (viewer.element && !viewer.element.contains(event.target as Node)) focusFirst();
  };
  const restore = () => {
    document.removeEventListener('keydown', trapTab, true);
    document.removeEventListener('focusin', trapFocus, true);
    for (const [element, inert] of backgrounds) element.inert = inert;
    backgrounds.clear();
    active = undefined;
    if (origin.isConnected) origin.focus({ preventScroll: true });
  };
  viewer.on('destroy', restore);
  viewer.on('openingAnimationEnd', () => {
    // PhotoSwipe ignores close() while opening. Honor an early Escape/click once
    // its own opening listeners have finished binding events.
    if (closeAfterOpening) queueMicrotask(() => viewer.close());
  });
  viewer.on('afterInit', () => {
    for (const child of Array.from(document.body.children)) {
      if (child instanceof HTMLElement && child !== viewer.element && !['SCRIPT', 'STYLE'].includes(child.tagName)) {
        backgrounds.set(child, child.inert);
        child.inert = true;
      }
    }
    viewer.element?.querySelector('.pswp__button--close')?.addEventListener('click', event => {
      if (!viewer.opener.isOpen) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeAfterOpening = true;
      }
    }, true);
    viewer.element?.setAttribute('aria-label', entry?.dataset.title || 'Image viewer');
    document.addEventListener('keydown', trapTab, true);
    document.addEventListener('focusin', trapFocus, true);
    focusFirst();
  });
  viewer.on('uiRegister', () => {
    viewer.ui?.registerElement({ name: 'syutoi-caption', order: 9, appendTo: 'root',
      onInit: element => {
        element.tabIndex = 0;
        viewer.on('change', () => { element.textContent = items[viewer.currIndex]?.caption || ''; });
      }
    });
  });
  viewer.addFilter('contentErrorElement', (_element, content) => {
    const message = document.createElement('a');
    message.href = String(content.data.src);
    message.textContent = entry?.dataset.error || 'Unable to load image. Open original.';
    return message;
  });
  try {
    if (!viewer.init()) throw new Error('Unable to open image viewer');
  } catch (error) {
    viewer.animations.stopAll();
    viewer.isDestroying = true;
    try { viewer.destroy(); } finally { restore(); }
    throw error;
  }
}

if (entry && links.length) {
  for (const link of links) link.addEventListener('click', async event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download')) return;
    if (active || busy) { event.preventDefault(); return; }
    event.preventDefault();
    busy = true;
    link.setAttribute('aria-busy', 'true');
    try {
      const [Viewer] = await Promise.all([loadViewer(), resolveImage(link)]);
      openViewer(Viewer, link);
    } catch {
      // Keep the same destination as the original anchor, including under root.
      window.location.assign(link.href);
    } finally {
      busy = false;
      link.removeAttribute('aria-busy');
    }
  });
}
