// =====================================================
// UTILS — Funções utilitárias reutilizáveis
// =====================================================

const Utils = {

  // ── Formatar data YYYY-MM-DD → DD/MM/YYYY ─────────
  formatarData(s) {
    if (!s) return '—';
    const [y, m, d] = s.split('-');
    return `${d}/${m}/${y}`;
  },

  // ── Iniciais do nome ───────────────────────────────
  iniciais(nome) {
    return (nome || '?')
      .split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  },

  // ── Dias até o evento ──────────────────────────────
  diasParaEvento(dataStr) {
    if (!dataStr) return null;
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const ev = new Date(dataStr + 'T00:00:00');
    return Math.ceil((ev - hoje) / (1000 * 60 * 60 * 24));
  },

  // ── Label da contagem regressiva ──────────────────
  contagem(dataStr, status) {
    if (status === 'Cancelado') return 'Cancelado';
    const dias = Utils.diasParaEvento(dataStr);
    if (dias === null || dias < 0) return '';
    if (dias === 0) return 'Hoje!';
    return `Faltam ${dias} dia${dias > 1 ? 's' : ''}`;
  },

  // ── Badge HTML de status da inscrição ─────────────
  badgeStatus(s) {
    const map = { Confirmada: 'bg', Pendente: 'ba', Cancelada: 'br' };
    return `<span class="badge ${map[s] || 'bgr'}">${s || '—'}</span>`;
  },

  // ── Badge HTML de presença ────────────────────────
  badgePresenca(s) {
    const map = { Presente: 'bg', Ausente: 'br', Aguardando: 'bgr' };
    return `<span class="badge ${map[s] || 'bgr'}">${s || 'Aguardando'}</span>`;
  },

  // ── Gerar ID único de inscrição ───────────────────
  gerarId() {
    return 'INS-' + Date.now().toString().slice(-8);
  },

  // ── Máscara de CPF ────────────────────────────────
  mascaraCPF(valor) {
    let v = valor.replace(/\D/g, '');
    if (v.length > 3) v = v.slice(0, 3) + '.' + v.slice(3);
    if (v.length > 7) v = v.slice(0, 7) + '.' + v.slice(7);
    if (v.length > 11) v = v.slice(0, 11) + '-' + v.slice(11);
    return v.slice(0, 14);
  },

  // ── Normalizar CPF (só números) ───────────────────
  normalizarCPF(cpf) {
    return cpf.replace(/\D/g, '');
  },

  // ── Formatar CPF com máscara ──────────────────────
  formatarCPF(cpf) {
    const n = Utils.normalizarCPF(cpf);
    return n.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  },

  // ── Toast de notificação ──────────────────────────
  toast(msg, ok = true) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = (ok ? '✅ ' : '❌ ') + msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2800);
  },

  // ── Barra de progresso HTML ───────────────────────
  barraProgresso(label, valor, max, cls = '') {
    const pct = max ? Math.round((valor / max) * 100) : 0;
    return `
      <div class="brow">
        <div class="blbl"><span>${label}</span><span>${valor}</span></div>
        <div class="btrack"><div class="bfill ${cls}" style="width:${pct}%"></div></div>
      </div>`;
  },

  // ── Delay (ms) ────────────────────────────────────
  delay(ms) {
    return new Promise(r => setTimeout(r, ms));
  },

  // ── Exportar array para CSV ───────────────────────
  exportarCSV(dados, nomeArquivo = 'export.csv') {
    const csv = dados.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = nomeArquivo;
    a.click();
  },
};
