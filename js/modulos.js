// =====================================================
// BENEFICIÁRIOS — Página admin
// =====================================================

const Beneficiarios = (() => {
  let _todos = [];

  async function carregar(forcar = false) {
    const list = document.getElementById('b-list');
    const total = document.getElementById('b-total');
    if (!list) return;
    list.innerHTML = '<div class="ld"><span class="spin"></span>Carregando...</div>';

    try {
      const [bes, ins] = await Promise.all([
        API.listar('Beneficiários', forcar),
        API.listar('Inscrições', forcar),
      ]);

      const sbe = document.getElementById('s-be');
      if (sbe) sbe.textContent = bes.length;
      if (total) total.textContent = bes.length + ' pessoas';

      const cnt = {};
      ins.forEach(r => (r.fields['Beneficiários'] || []).forEach(id => {
        cnt[id] = (cnt[id] || 0) + 1;
      }));

      _todos = bes.map(r => {
        const f = r.fields;
        return {
          id:     r.id,
          nome:   f['Nome Completo'] || '—',
          idade:  f['Idade'] || '—',
          tel:    f['Telefone'] || '—',
          email:  f['Email'] || '—',
          regiao: f['Região'] || '—',
          bairro: f['Bairro'] || '',
          cpf:    f['CPF'] || '',
          qtd:    cnt[r.id] || 0,
        };
      });

      _render(_todos);
    } catch (e) {
      list.innerHTML = `<div class="ebox">⚠️ ${e.message}</div>`;
    }
  }

  function _render(lista) {
    const list = document.getElementById('b-list');
    list.innerHTML = lista.map(b => `
      <div class="bitem">
        <div class="ava">${Utils.iniciais(b.nome)}</div>
        <div class="binfo">
          <div class="bname">${b.nome}</div>
          <div class="bmeta">${b.idade} anos · ${b.regiao}${b.bairro ? ' · ' + b.bairro : ''}</div>
          <div class="bmeta" style="color:#888">${b.tel} · ${b.email}</div>
          <div class="bmeta" style="color:#aaa;font-size:11px">CPF: ${b.cpf || '—'}</div>
          <div class="bevts">✓ ${b.qtd} evento${b.qtd !== 1 ? 's' : ''} inscrito${b.qtd !== 1 ? 's' : ''}</div>
        </div>
        <span class="badge bg">${b.regiao}</span>
      </div>`).join('') || '<div class="ebox">Nenhum beneficiário encontrado.</div>';
  }

  function filtrar() {
    const q = (document.getElementById('b-search')?.value || '').toLowerCase();
    const z = (document.getElementById('b-regiao')?.value || '').toLowerCase();
    _render(_todos.filter(b =>
      (!q || b.nome.toLowerCase().includes(q) || b.email.toLowerCase().includes(q) || b.regiao.toLowerCase().includes(q)) &&
      (!z || b.regiao.toLowerCase().includes(z))
    ));
  }

  return { carregar, filtrar };
})();


// =====================================================
// INSCRIÇÕES — Página admin
// =====================================================

const Inscricoes = (() => {
  let _todos = [];

  async function carregar(forcar = false) {
    const tbody = document.getElementById('i-body');
    const total = document.getElementById('i-total');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="7" class="ld"><span class="spin"></span>Carregando...</td></tr>';

    try {
      const [ins, evs, bes] = await Promise.all([
        API.listar('Inscrições', forcar),
        API.listar('Eventos', forcar),
        API.listar('Beneficiários', forcar),
      ]);

      const si = document.getElementById('s-in');
      if (si) si.textContent = ins.length;
      if (total) total.textContent = ins.length + ' registros';

      const eMap = Object.fromEntries(evs.map(r => [r.id, r.fields['Nome do Evento']]));
      const bMap = Object.fromEntries(bes.map(r => [r.id, r.fields['Nome Completo']]));

      _todos = ins.map(r => {
        const f = r.fields;
        return {
          recId:    r.id,
          idI:      f['ID da Inscrição'] || '—',
          nBe:      (f['Beneficiários'] || []).map(id => bMap[id] || '—').join(', ') || '—',
          nEv:      (f['Eventos'] || []).map(id => eMap[id] || '—').join(', ') || '—',
          data:     Utils.formatarData(f['Data da Inscrição']),
          status:   f['Status da Inscrição'] || 'Pendente',
          presenca: f['Presença'] || 'Aguardando',
        };
      });

      _render(_todos);
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="7" class="ebox">⚠️ ${e.message}</td></tr>`;
    }
  }

  function _render(lista) {
    const isAdmin = Auth.isAdmin();
    const tbody = document.getElementById('i-body');
    tbody.innerHTML = lista.map(i => {
      const acoes = isAdmin ? `<td>
        ${i.presenca !== 'Presente' ? `<button class="btn-action btn-presente" onclick="Inscricoes.marcarPresenca('${i.recId}','Presente')">✅ Presente</button>` : ''}
        ${i.presenca !== 'Ausente'  ? `<button class="btn-action btn-ausente"  onclick="Inscricoes.marcarPresenca('${i.recId}','Ausente')">❌ Ausente</button>` : ''}
      </td>` : '';
      return `<tr>
        <td><strong>${i.idI}</strong></td>
        <td>${i.nBe}</td>
        <td>${i.nEv}</td>
        <td>${i.data}</td>
        <td>${Utils.badgeStatus(i.status)}</td>
        <td>${Utils.badgePresenca(i.presenca)}</td>
        ${acoes}
      </tr>`;
    }).join('') || '<tr><td colspan="7" style="text-align:center;padding:20px;color:#888">Nenhuma inscrição.</td></tr>';
  }

  function filtrar() {
    const q  = (document.getElementById('i-search')?.value || '').toLowerCase();
    const st = document.getElementById('i-filtro-status')?.value || '';
    const ev = document.getElementById('i-filtro-evento')?.value || '';
    _render(_todos.filter(i =>
      (!q  || i.nBe.toLowerCase().includes(q) || i.idI.toLowerCase().includes(q)) &&
      (!st || i.status === st) &&
      (!ev || i.nEv.includes(ev))
    ));
  }

  async function marcarPresenca(recId, presenca) {
    try {
      await API.atualizar('Inscrições', recId, { 'Presença': presenca });
      await carregar(true);
      Utils.toast(presenca === 'Presente' ? 'Presença confirmada!' : 'Marcado como ausente');
    } catch (e) {
      Utils.toast('Erro ao salvar', false);
    }
  }

  function exportarCSV() {
    const q  = (document.getElementById('i-search')?.value || '').toLowerCase();
    const st = document.getElementById('i-filtro-status')?.value || '';
    const ev = document.getElementById('i-filtro-evento')?.value || '';
    const lista = _todos.filter(i =>
      (!q  || i.nBe.toLowerCase().includes(q) || i.idI.toLowerCase().includes(q)) &&
      (!st || i.status === st) &&
      (!ev || i.nEv.includes(ev))
    );
    Utils.exportarCSV(
      [['ID', 'Beneficiário', 'Evento', 'Data', 'Status', 'Presença'],
       ...lista.map(i => [i.idI, i.nBe, i.nEv, i.data, i.status, i.presenca])],
      'inscricoes-ong-vida-plena.csv'
    );
    Utils.toast(`CSV exportado! (${lista.length} registros)`);
  }

  return { carregar, filtrar, marcarPresenca, exportarCSV };
})();


// =====================================================
// DASHBOARD — Métricas em tempo real
// =====================================================

const Dashboard = (() => {

  async function carregar() {
    try {
      const [ins, evs, bes] = await Promise.all([
        API.listar('Inscrições'),
        API.listar('Eventos'),
        API.listar('Beneficiários'),
      ]);

      const total = ins.length;
      const conf  = ins.filter(r => r.fields['Status da Inscrição'] === 'Confirmada').length;
      const pend  = ins.filter(r => r.fields['Status da Inscrição'] === 'Pendente').length;
      const pres  = ins.filter(r => r.fields['Presença'] === 'Presente').length;
      const ause  = ins.filter(r => r.fields['Presença'] === 'Ausente').length;
      const vagas = evs.reduce((s, r) => s + (r.fields['Vagas'] || 0), 0);

      _set('d-in', total);
      _set('d-co', conf,  'd-co-p', total ? `${Math.round(conf/total*100)}% do total` : '—');
      _set('d-pe', pend,  'd-pe-p', total ? `${Math.round(pend/total*100)}% do total` : '—');
      _set('d-pr', pres,  'd-pr-p', conf  ? `${Math.round(pres/conf*100)}% dos confirmados` : '—');
      _set('d-au', ause,  'd-au-p', conf  ? `${Math.round(ause/conf*100)}% dos confirmados` : '—');
      _set('d-be', bes.length);
      _set('d-ev', evs.length);
      _set('d-vg', vagas);

      _renderGraficos(ins, evs, bes);
    } catch (e) {
      console.error('Dashboard:', e);
    }
  }

  function _set(id, val, subId, subVal) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
    if (subId) {
      const sub = document.getElementById(subId);
      if (sub) sub.textContent = subVal;
    }
  }

  function _renderGraficos(ins, evs, bes) {
    const eMap = Object.fromEntries(evs.map(r => [r.id, r.fields['Nome do Evento']]));

    // Taxa de presença por evento
    const ePres = {}, eConf = {};
    ins.forEach(r => {
      const f = r.fields;
      (f['Eventos'] || []).forEach(id => {
        if (f['Status da Inscrição'] === 'Confirmada') eConf[id] = (eConf[id] || 0) + 1;
        if (f['Presença'] === 'Presente')              ePres[id] = (ePres[id] || 0) + 1;
      });
    });
    const chPres = document.getElementById('ch-presenca');
    if (chPres) {
      chPres.innerHTML = Object.entries(eConf).map(([id, c]) => {
        const p = ePres[id] || 0;
        const pct = c ? Math.round(p / c * 100) : 0;
        return Utils.barraProgresso(`${eMap[id] || id} (${p}/${c})`, pct, 100, 'blue');
      }).join('') || '<p style="color:#888;font-size:13px">Aguardando confirmações</p>';
    }

    // Inscrições por evento
    const eCnt = {};
    ins.forEach(r => (r.fields['Eventos'] || []).forEach(id => { eCnt[id] = (eCnt[id] || 0) + 1; }));
    const maxE = Math.max(...Object.values(eCnt), 1);
    const chEv = document.getElementById('ch-ev');
    if (chEv) {
      chEv.innerHTML = Object.entries(eCnt).sort((a, b) => b[1] - a[1])
        .map(([id, n]) => Utils.barraProgresso(eMap[id] || id, n, maxE)).join('') ||
        '<p style="color:#888;font-size:13px">Sem dados</p>';
    }

    // Beneficiários por zona
    const rCnt = {};
    bes.forEach(r => {
      const reg = r.fields['Região'] || 'Sem zona';
      rCnt[reg] = (rCnt[reg] || 0) + 1;
    });
    const maxR = Math.max(...Object.values(rCnt), 1);
    const chRe = document.getElementById('ch-re');
    if (chRe) {
      chRe.innerHTML = Object.entries(rCnt).sort((a, b) => b[1] - a[1])
        .map(([reg, n]) => Utils.barraProgresso(reg, n, maxR, 'amber')).join('');
    }
  }

  return { carregar };
})();


// =====================================================
// ADMIN EVENTOS — Gerenciar eventos
// =====================================================

const AdminEventos = (() => {
  // Field IDs da tabela Eventos no Airtable
  const FIELDS = {
    nome:   'fldhcrhyORs8cPXcw',
    data:   'fldG6w0At1vp8pgwi',
    vagas:  'fld4seFwV7R27vaFe',
    local:  'fld6Gf0QlQjV5Tbv4',
    tipo:   'fldYAIfM5j13qhiVB',
    status: 'fldakCeT1Dn58Gcqy',
    desc:   'fldWhJMAZckyqQfhz',
  };

  async function carregar(forcar = false) {
    const list = document.getElementById('aev-list');
    if (!list) return;
    list.innerHTML = '<div class="ld"><span class="spin"></span>Carregando eventos...</div>';
    try {
      const evs = await API.listar('Eventos', forcar);
      list.innerHTML = evs.map(_renderCard).join('') ||
        '<div class="ebox">Nenhum evento cadastrado.</div>';
    } catch (e) {
      list.innerHTML = `<div class="ebox">⚠️ ${e.message}</div>`;
    }
  }

  function _renderCard(r) {
    const f      = r.fields;
    const nome   = f['Nome do Evento'] || '—';
    const data   = Utils.formatarData(f['Data do Evento']);
    const local  = f['Local'] || '—';
    const tipo   = f['Tipo'] || '—';
    const vagas  = f['Vagas'] || 0;
    const status = f['Status'] || 'Planejado';
    const desc   = f['Descrição'] || '';
    const cor    = CONFIG.TIPO_CORES[tipo] || '#5F5E5A';
    const sbCls  = status === 'Planejado' ? 'bg' : status === 'Cancelado' ? 'br' : 'bgr';

    // Serializar para edição (escapar aspas)
    const safe = v => (v || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
      <div class="aev-card">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
          <div style="width:10px;height:10px;border-radius:50%;background:${cor};flex-shrink:0"></div>
          <div class="aev-card-title">${nome}</div>
        </div>
        <div class="aev-card-meta">📅 ${data} · 📍 ${local}<br>🎫 ${vagas} vagas · ${tipo}</div>
        ${desc ? `<div style="font-size:12px;color:#666;margin:6px 0;line-height:1.4">${desc}</div>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:8px">
          <span class="badge ${sbCls}">${status}</span>
          <button class="btn-ev-edit"
            onclick="AdminEventos.abrirEdicao('${r.id}','${safe(nome)}','${f['Data do Evento']||''}',${vagas},'${safe(local)}','${safe(tipo)}','${safe(status)}','${safe(desc)}')">
            ✏️ Editar
          </button>
        </div>
      </div>`;
  }

  function novoEvento() {
    _limparForm();
    document.getElementById('ev-form-title').textContent = 'Novo Evento';
    document.getElementById('ev-form-wrap').style.display = 'block';
    document.getElementById('ev-form-wrap').scrollIntoView({ behavior: 'smooth' });
  }

  function abrirEdicao(id, nome, data, vagas, local, tipo, status, desc) {
    document.getElementById('ev-id').value     = id;
    document.getElementById('ev-nome').value   = nome;
    document.getElementById('ev-data').value   = data;
    document.getElementById('ev-vagas').value  = vagas;
    document.getElementById('ev-local').value  = local;
    document.getElementById('ev-tipo').value   = tipo;
    document.getElementById('ev-status').value = status;
    document.getElementById('ev-desc').value   = desc;
    document.getElementById('ev-form-title').textContent = 'Editar Evento';
    document.getElementById('ev-al-ok').style.display  = 'none';
    document.getElementById('ev-al-err').style.display = 'none';
    document.getElementById('ev-form-wrap').style.display = 'block';
    document.getElementById('ev-form-wrap').scrollIntoView({ behavior: 'smooth' });
  }

  function cancelar() {
    document.getElementById('ev-form-wrap').style.display = 'none';
  }

  async function salvar() {
    const id     = document.getElementById('ev-id').value;
    const nome   = document.getElementById('ev-nome').value.trim();
    const data   = document.getElementById('ev-data').value;
    const vagas  = Number(document.getElementById('ev-vagas').value);
    const local  = document.getElementById('ev-local').value.trim();
    const tipo   = document.getElementById('ev-tipo').value;
    const status = document.getElementById('ev-status').value;
    const desc   = document.getElementById('ev-desc').value.trim();

    document.getElementById('ev-al-ok').style.display  = 'none';
    document.getElementById('ev-al-err').style.display = 'none';

    if (!nome || !data || !vagas || !local || !tipo) {
      document.getElementById('ev-err-msg').textContent = 'Preencha todos os campos obrigatórios (*).';
      document.getElementById('ev-al-err').style.display = 'block';
      return;
    }

    const fields = {
      [FIELDS.nome]:   nome,
      [FIELDS.data]:   data,
      [FIELDS.vagas]:  vagas,
      [FIELDS.local]:  local,
      [FIELDS.tipo]:   tipo,
      [FIELDS.status]: status,
      [FIELDS.desc]:   desc,
    };

    try {
      if (id) {
        await API.atualizar('Eventos', id, fields);
      } else {
        await API.criar('Eventos', fields);
      }
      document.getElementById('ev-al-ok').style.display = 'block';
      document.getElementById('ev-id').value = '';
      document.getElementById('ev-form-title').textContent = 'Novo Evento';
      await carregar(true);
      await Eventos.carregar();
      Utils.toast(id ? 'Evento atualizado!' : 'Evento criado!');
    } catch (e) {
      document.getElementById('ev-err-msg').textContent = e.message;
      document.getElementById('ev-al-err').style.display = 'block';
    }
  }

  function _limparForm() {
    ['ev-id', 'ev-nome', 'ev-data', 'ev-vagas', 'ev-local', 'ev-desc'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const tipo = document.getElementById('ev-tipo');
    if (tipo) tipo.value = '';
    const status = document.getElementById('ev-status');
    if (status) status.value = 'Planejado';
    document.getElementById('ev-al-ok').style.display  = 'none';
    document.getElementById('ev-al-err').style.display = 'none';
  }

  return { carregar, novoEvento, abrirEdicao, cancelar, salvar };
})();
