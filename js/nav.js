// =====================================================
// NAV — Navegação entre páginas
// =====================================================

const Nav = (() => {

  // Mapa página → função de carregamento
  const carregadores = {};

  function registrar(pagina, fn) {
    carregadores[pagina] = fn;
  }

  function ir(pagina, btnEl) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Desmarcar todos os links de nav
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));

    // Mostrar página alvo
    const page = document.getElementById(`page-${pagina}`);
    if (page) page.classList.add('active');

    // Marcar link ativo
    if (btnEl) btnEl.classList.add('active');

    // Executar carregador específico da página
    if (carregadores[pagina]) carregadores[pagina]();
  }

  return { ir, registrar };
})();
