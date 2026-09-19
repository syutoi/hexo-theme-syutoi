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
      button.textContent = article.dataset.copyLabel;
      let copying = false;
      button.addEventListener('click', async () => {
        if (copying) return;
        copying = true;
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
