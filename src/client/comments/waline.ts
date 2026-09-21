// @waline/client 3.13.0, MIT. See /js/waline.LICENSE.txt for bundled licenses.
import { init } from '@waline/client';
import type { CommentsAdapter, CommentsWindow } from './types';

const adapter: CommentsAdapter = {
  mount(options) {
    const instance = init({
      ...options,
      dark: 'html[data-theme="dark"]',
      // Comment functionality only; no page counters or external media services.
      comment: false, pageview: false, reaction: false, emoji: false,
      search: false, imageUploader: false, highlighter: false, texRenderer: false
    });
    if (!instance) throw new Error('Unable to initialize Waline');
    return instance;
  }
};
const host = window as CommentsWindow;
host.SyutoiComments = { ...host.SyutoiComments, waline: adapter };
