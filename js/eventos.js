// =====================================================
// EVENTOS — Página pública de eventos
// =====================================================

const Eventos = (() => {

  async function carregar() {
    const grid = document.getElementById('ev-grid');
    if (!grid) return;
    grid.innerHTML = '<div class="ld"><span class="spin"></span>Carregando eventos...</div>';

    try {
      const evs = await API.listar('Eventos');
      _atualizarEstatisticas(evs);
      _popularSelectFormulario(evs);
      _popularFiltroInscricoes(evs);
      grid.innerHTML = evs.map(_renderCard).join('') ||
        '<div class="ebox">Nenhum evento cadastrado.</div>';
    } catch (e) {
      grid.innerHTML = `<div class="ebox">⚠️ ${e.message}</div>`;
    }
  }

  function _atualizarEstatisticas(evs) {
    const total = evs.length;
    const vagas = evs.reduce((s, r) => s + (r.fields['Vagas'] || 0), 0);
    const el = document.getElementById('s-ev');
    if (el) el.textContent = total;
    const elV = document.getElementById('s-vg');
    if (elV) elV.textContent = vagas;
  }

  function _popularSelectFormulario(evs) {
    const sel = document.getElementById('fev-inscricao');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecione o evento...</option>';
    evs.forEach(r => {
      const nome = r.fields['Nome do Evento'] || '—';
      const data = Utils.formatarData(r.fields['Data do Evento']);
      sel.innerHTML += `<option value="${nome} — ${data}">${nome} — ${data}</option>`;
    });
  }

  function _popularFiltroInscricoes(evs) {
    const sel = document.getElementById('i-filtro-evento');
    if (!sel) return;
    sel.innerHTML = '<option value="">Todos os eventos</option>';
    evs.forEach(r => {
      const nome = r.fields['Nome do Evento'] || '—';
      sel.innerHTML += `<option value="${nome}">${nome}</option>`;
    });
  }

  function _renderCard(r) {
    const f = r.fields;
    const nome   = f['Nome do Evento'] || '—';
    const data   = Utils.formatarData(f['Data do Evento']);
    const local  = f['Local'] || '—';
    const tipo   = f['Tipo'] || 'Outro';
    const vagas  = f['Vagas'] || 0;
    const status = f['Status'] || 'Planejado';
    const desc   = f['Descrição'] || '';
    const cor    = CONFIG.TIPO_CORES[tipo] || '#5F5E5A';
    const ico    = CONFIG.TIPO_ICONS[tipo] || '📋';
    const cd     = Utils.contagem(f['Data do Evento'], status);

    return `
      <div class="card">
        <div class="card-top" style="background:${cor}">
          ${cd ? `<span class="countdown">${cd}</span>` : ''}
          <div class="card-ico">${ico}</div>
          <div class="card-title">${nome}</div>
          ${desc ? `<div class="card-desc">${desc}</div>` : ''}
        </div>
        <div class="card-body">
          <div class="meta">📅 ${data}</div>
          <div class="meta">📍 ${local} — Teresina, PI</div>
          <div class="card-foot">
            <span class="badge" style="background:rgba(0,0,0,0.08);color:#333">${tipo}</span>
            <div style="display:flex;align-items:center;gap:8px">
              <span class="vagas">${vagas} vagas</span>
              <button class="btn-ins" onclick="Nav.ir('formulario')">Inscrever-se</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  return { carregar };
})();
