import { initializeTheme } from './theme';
import { initializeNavigation } from './navigation';
import { initializeCode } from './code';

// Apply preference before the page and stylesheet are rendered.
initializeTheme();
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  initializeCode();
}, { once: true });
