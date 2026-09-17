export function initializeCode(): void {
  document.querySelectorAll<HTMLElement>('[data-prose]').forEach(article => {
    const status = document.createElement('span');
    status.className = 'sr-only';
    status.setAttribute('role', 'status');
    article.append(status);
    article.querySelectorAll<HTMLElement>('pre').forEach(pre => {
      if (pre.closest('.gutter')) return;
      const figure = pre.closest<HTMLElement>('figure.highlight');
      const block = figure || pre;
      if (block.parentElement?.classList.contains('code-block')) return;
      const wrapper = document.createElement('div');
      wrapper.className = 'code-block';
      block.before(wrapper);
      wrapper.append(block);
      const toolbar = document.createElement('div');
      toolbar.className = 'code-toolbar';
      const label = document.createElement('span');
      const code = pre.querySelector('code');
      const languageClass = Array.from(code?.classList || pre.classList).find(name => name.startsWith('language-'));
      label.textContent = languageClass?.slice(9) || Array.from(figure?.classList || []).find(name => name !== 'highlight') || '';
      toolbar.append(label);
      if (navigator.clipboard?.writeText && article.dataset.copyLabel) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'copy-button';
        button.textContent = article.dataset.copyLabel;
        button.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(pre.innerText);
            status.textContent = article.dataset.copiedLabel || '';
          } catch {
            status.textContent = article.dataset.copyFailedLabel || '';
          }
        });
        toolbar.append(button);
      }
      wrapper.prepend(toolbar);
    });
  });
}
