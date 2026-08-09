/* Pull-to-refresh: arrastar para baixo no topo da página recarrega os dados.
   Necessário porque dentro de um iframe (página hospedada) o gesto nativo do
   navegador não dispara; aqui ele re-renderiza as telas a partir do banco. */
(() => {
  if (!('ontouchstart' in window)) return; // só faz sentido no toque

  const LIMIAR = 70; // px de puxada para disparar
  const MAX = 110;

  const ind = document.createElement('div');
  ind.className = 'ptr';
  ind.innerHTML =
    '<svg class="ptr-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v14M6 12l6 6 6-6"/></svg>' +
    '<svg class="ptr-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.2-8.56"/></svg>';
  document.body.appendChild(ind);

  let startY = null;
  let dist = 0;
  let atualizando = false;

  const modalAberto = () => !!document.querySelector('.modal-backdrop.open');

  function refresh() {
    atualizando = true;
    ind.classList.add('spinning');
    ind.style.transform = `translate(-50%, ${LIMIAR * 0.75}px)`;
    // re-renderiza as telas a partir do IndexedDB/localStorage
    document.dispatchEvent(new Event('diario:refresh'));
    document.dispatchEvent(new Event('relatorios:refresh'));
    setTimeout(() => {
      ind.classList.remove('spinning', 'visible', 'armed');
      ind.style.transform = '';
      atualizando = false;
    }, 650);
  }

  document.addEventListener(
    'touchstart',
    (ev) => {
      if (atualizando || modalAberto() || window.scrollY > 0) return;
      startY = ev.touches[0].clientY;
      dist = 0;
    },
    { passive: true }
  );

  document.addEventListener(
    'touchmove',
    (ev) => {
      if (startY == null || atualizando) return;
      const dy = ev.touches[0].clientY - startY;
      if (dy <= 0 || window.scrollY > 0 || modalAberto()) {
        dist = 0;
        ind.classList.remove('visible', 'armed');
        ind.style.transform = '';
        return;
      }
      dist = Math.min(MAX, dy * 0.45); // puxada amortecida
      ind.classList.add('visible');
      ind.classList.toggle('armed', dist >= LIMIAR);
      ind.style.transform = `translate(-50%, ${dist}px)`;
    },
    { passive: true }
  );

  document.addEventListener('touchend', () => {
    if (startY == null || atualizando) return;
    startY = null;
    if (dist >= LIMIAR) {
      refresh();
    } else {
      ind.classList.remove('visible', 'armed');
      ind.style.transform = '';
    }
    dist = 0;
  });
})();
