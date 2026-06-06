// =====================================================
// API — Funções de acesso ao Airtable e Make.com
// =====================================================

const API = (() => {
  // Cache de requisições
  const cache = {};

  // Headers padrão Airtable
  const headers = () => ({
    'Authorization': `Bearer ${CONFIG.AIRTABLE_TOKEN}`,
    'Content-Type': 'application/json',
  });

  // URL base Airtable
  const url = (tabela) =>
    `https://api.airtable.com/v0/${CONFIG.AIRTABLE_BASE}/${encodeURIComponent(tabela)}`;

  // ── GET todos os registros (com cache) ──────────────
  async function listar(tabela, forcar = false) {
    if (cache[tabela] && !forcar) return cache[tabela];
    const res = await fetch(`${url(tabela)}?pageSize=100`, { headers: headers() });
    if (!res.ok) throw new Error(`Erro ${res.status} ao buscar ${tabela}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error.message || 'Erro Airtable');
    cache[tabela] = data.records || [];
    return cache[tabela];
  }

  // ── POST — Criar registro ───────────────────────────
  async function criar(tabela, fields) {
    const res = await fetch(url(tabela), {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `Erro ${res.status}`);
    }
    invalidar(tabela);
    return res.json();
  }

  // ── PATCH — Atualizar registro ──────────────────────
  async function atualizar(tabela, id, fields) {
    const res = await fetch(`${url(tabela)}/${id}`, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ fields }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `Erro ${res.status}`);
    }
    invalidar(tabela);
    return res.json();
  }

  // ── Invalidar cache de uma tabela ──────────────────
  function invalidar(tabela) {
    delete cache[tabela];
  }

  // ── Invalidar todo o cache ─────────────────────────
  function limparCache() {
    Object.keys(cache).forEach(k => delete cache[k]);
  }

  // ── Enviar webhook Make.com ────────────────────────
  async function webhook(dados) {
    const res = await fetch(CONFIG.WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao enviar para o servidor');
    return res;
  }

  return { listar, criar, atualizar, invalidar, limparCache, webhook };
})();
