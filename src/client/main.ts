import { initializeTheme } from './theme';
import { initializeNavigation } from './navigation';
import { initializeCode } from './code';
import { initializeColumns } from './columns';
import { initializeToc } from './toc';

// Apply preference before the page and stylesheet are rendered.
initializeTheme();
document.addEventListener('DOMContentLoaded', () => {
  initializeNavigation();
  initializeCode();
  initializeColumns();
  initializeToc();
}, { once: true });
