export function initializeCode(): void {
  document.querySelectorAll<HTMLElement>('[data-prose]').forEach(article => {
    article.querySelectorAll<HTMLElement>('[data-code-block]').forEach(block => {
      const pre = block.querySelector<HTMLElement>('.code pre') || block.querySelector<HTMLElement>('pre');
      const toolbar = block.querySelector('.code-toolbar');
      const status = block.querySelector<HTMLElement>('.code-status');
      if (!pre || !toolbar || !status || block.querySelector('.copy-button')) return;
      if (!navigator.clipboard?.writeText || !article.dataset.copyLabel) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'copy-button';
      const copyIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg>';
      const doneIcon = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>';
      button.innerHTML = copyIcon;
      button.setAttribute('aria-label', article.dataset.copyLabel);
      button.title = article.dataset.copyLabel;
      let resetTimer: number | undefined;
      let copying = false;
      button.addEventListener('click', async () => {
        if (copying) return;
        copying = true;
        window.clearTimeout(resetTimer);
        button.innerHTML = copyIcon;
        button.removeAttribute('data-copied');
        button.setAttribute('aria-disabled', 'true');
        button.setAttribute('aria-busy', 'true');
        status.textContent = '';
        try {
          // textContent preserves indentation even inside a closed details element.
          // Highlight.js represents line breaks with <br> in some configurations.
          const clone = pre.cloneNode(true) as HTMLElement;
          clone.querySelectorAll('br').forEach(br => br.replaceWith('\n'));
          await navigator.clipboard.writeText(clone.textContent || '');
          status.textContent = article.dataset.copiedLabel || '';
          button.innerHTML = doneIcon;
          button.setAttribute('data-copied', 'true');
          resetTimer = window.setTimeout(() => {
            button.innerHTML = copyIcon;
            button.removeAttribute('data-copied');
            status.textContent = '';
          }, 2000);
        } catch {
          status.textContent = article.dataset.copyFailedLabel || '';
        } finally {
          copying = false;
          button.removeAttribute('aria-disabled');
          button.removeAttribute('aria-busy');
        }
      });
      toolbar.append(button);
    });
  });
}
