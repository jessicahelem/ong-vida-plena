// =====================================================
// AUTH — Controle de acesso admin
// =====================================================

const Auth = (() => {
  let _isAdmin = false;

  // Elementos protegidos que só admins veem
  const ELEMENTOS_ADMIN = [
    'nav-beneficiarios',
    'nav-inscricoes',
    'nav-admin-ev',
  ];

  function login(senha) {
    if (senha !== CONFIG.ADMIN_SENHA) return false;
    _isAdmin = true;
    _atualizarUI();
    return true;
  }

  function logout() {
    _isAdmin = false;
    _atualizarUI();
    // Voltar para eventos se estiver em página protegida
    const paginasProtegidas = ['beneficiarios', 'inscricoes', 'admin-eventos'];
    const paginaAtual = document.querySelector('.page.active')?.id?.replace('page-', '');
    if (paginasProtegidas.includes(paginaAtual)) {
      Nav.ir('eventos');
    }
  }

  function isAdmin() {
    return _isAdmin;
  }

  function _atualizarUI() {
    // Mostrar/esconder itens de nav protegidos
    ELEMENTOS_ADMIN.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = _isAdmin ? 'block' : 'none';
    });

    // Barra admin
    const bar = document.getElementById('admin-bar');
    if (bar) bar.classList.toggle('open', _isAdmin);

    // Coluna de ações na tabela de inscrições
    const col = document.getElementById('col-acoes');
    if (col) col.style.display = _isAdmin ? '' : 'none';

    // Subtítulo da aba inscrições
    const sub = document.getElementById('insc-sub');
    if (sub) sub.textContent = _isAdmin
      ? 'Gerencie presenças — Modo Admin'
      : '🔒 Área restrita — somente administradores';
  }

  // Abrir modal de login
  function abrirModal() {
    if (_isAdmin) { Utils.toast('Você já está no modo admin!'); return; }
    const modal = document.getElementById('modal-admin');
    if (modal) modal.classList.add('open');
    setTimeout(() => document.getElementById('admin-senha')?.focus(), 100);
  }

  // Fechar modal de login
  function fecharModal() {
    const modal = document.getElementById('modal-admin');
    if (modal) modal.classList.remove('open');
    const inp = document.getElementById('admin-senha');
    if (inp) inp.value = '';
    const err = document.getElementById('modal-err');
    if (err) err.style.display = 'none';
  }

  // Tentar login pelo modal
  function tentarLogin() {
    const senha = document.getElementById('admin-senha')?.value || '';
    if (login(senha)) {
      fecharModal();
      Utils.toast('Modo admin ativado!');
      // Recarregar inscrições para mostrar botões de ação
      if (window.Inscricoes) Inscricoes.carregar(true);
    } else {
      const err = document.getElementById('modal-err');
      if (err) err.style.display = 'block';
    }
  }

  return { login, logout, isAdmin, abrirModal, fecharModal, tentarLogin };
})();
