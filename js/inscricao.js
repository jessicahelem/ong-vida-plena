// =====================================================
// INSCRIÇÃO — Formulário com busca por CPF
// =====================================================

const Inscricao = (() => {
  let _benefRec      = null;  // registro do beneficiário encontrado
  let _cpfAtual      = '';    // CPF formatado atual
  let _selecionados  = [];    // eventos selecionados [{recId, nome}]

  // ── Inicializar formulário ─────────────────────────
  function init() {
    _reset();
    _popularZonas();
    _popularBairros();
  }

  // ── Máscara de CPF no input ───────────────────────
  function onCPFInput(el) {
    el.value = Utils.mascaraCPF(el.value);
  }

  // ── Buscar beneficiário pelo CPF ──────────────────
  async function buscar() {
    const cpfRaw = document.getElementById('f-cpf').value;
    const cpf = Utils.normalizarCPF(cpfRaw);
    const fb = document.getElementById('cpf-feedback');

    if (cpf.length !== 11) {
      fb.textContent = '⚠️ CPF inválido. Digite 11 dígitos.';
      fb.style.color = '#E24B4A';
      return;
    }

    fb.textContent = '🔍 Buscando...';
    fb.style.color = '#888';
    _resetStep2();

    try {
      // Forçar dados frescos do Airtable
      API.invalidar('Beneficiários');
      API.invalidar('Inscrições');

      const [beneficiarios, inscricoes] = await Promise.all([
        API.listar('Beneficiários'),
        API.listar('Inscrições'),
      ]);

      // Buscar pelo campo CPF
      const encontrado = beneficiarios.find(r => {
        const cpfCampo = (r.fields['CPF'] || '').replace(/\D/g, '');
        return cpfCampo === cpf;
      });

      _cpfAtual = Utils.formatarCPF(cpf);

      if (encontrado) {
        _benefRec = encontrado;
        _preencherDadosEncontrados(encontrado.fields);
        document.getElementById('dados-encontrados').style.display = 'block';
        document.getElementById('dados-novo').style.display = 'none';
        fb.textContent = '';
      } else {
        _benefRec = null;
        document.getElementById('dados-encontrados').style.display = 'none';
        document.getElementById('dados-novo').style.display = 'block';
        fb.textContent = 'ℹ️ CPF não encontrado. Preencha seus dados para se cadastrar.';
        fb.style.color = '#1D9E75';
      }

      await _montarListaEventos(encontrado, inscricoes);
      document.getElementById('step-dados').style.display = 'block';
      document.getElementById('step-dados').scrollIntoView({ behavior: 'smooth' });

    } catch (e) {
      fb.textContent = '❌ Erro: ' + e.message;
      fb.style.color = '#E24B4A';
    }
  }

  // ── Preencher dados do beneficiário encontrado ────
  function _preencherDadosEncontrados(f) {
    document.getElementById('vw-nome').textContent   = f['Nome Completo'] || '—';
    document.getElementById('vw-idade').textContent  = (f['Idade'] || '—') + ' anos';
    document.getElementById('vw-email').textContent  = f['Email'] || '—';
    document.getElementById('vw-tel').textContent    = f['Telefone'] || '—';
    document.getElementById('vw-zona').textContent   = f['Região'] || '—';
    document.getElementById('vw-bairro').textContent = f['Bairro'] || '—';
  }

  // ── Montar lista de eventos com status de inscrição
  async function _montarListaEventos(benefRec, inscricoes) {
    const evs = await API.listar('Eventos');
    const container = document.getElementById('ev-list-inscricao');
    _selecionados = [];

    // Mapear eventos já inscritos
    const inscritosMap = {};
    if (benefRec) {
      inscricoes.forEach(r => {
        const benefs = r.fields['Beneficiários'] || [];
        if (benefs.indexOf(benefRec.id) >= 0) {
          (r.fields['Eventos'] || []).forEach(eid => {
            inscritosMap[eid] = {
              status:   r.fields['Status da Inscrição'] || 'Pendente',
              presenca: r.fields['Presença'] || 'Aguardando',
            };
          });
        }
      });
    }

    const TCOR = CONFIG.TIPO_CORES;
    let html = '';

    evs.forEach(r => {
      const f        = r.fields;
      const nome     = f['Nome do Evento'] || '—';
      const data     = Utils.formatarData(f['Data do Evento']);
      const local    = f['Local'] || '—';
      const tipo     = f['Tipo'] || 'Outro';
      const vagas    = f['Vagas'] || 0;
      const cor      = TCOR[tipo] || '#5F5E5A';
      const inscrito = inscritosMap[r.id];
      const disabled = !!inscrito;

      let badge = '', badgeCls = '';
      if (inscrito) {
        if (inscrito.presenca === 'Presente')       { badge = '✅ Presente';    badgeCls = 'bg'; }
        else if (inscrito.status === 'Confirmada')   { badge = '✓ Confirmado';  badgeCls = 'bg'; }
        else if (inscrito.status === 'Cancelada')    { badge = '✗ Cancelado';   badgeCls = 'br'; }
        else                                         { badge = '⏳ Pendente';   badgeCls = 'ba'; }
      }

      const nomeSafe    = nome.replace(/'/g, '').replace(/"/g, '');
      const disClass    = disabled ? 'ev-item-disabled' : '';
      const onclickAttr = disabled ? '' : `onclick="Inscricao.selecionar('${r.id}','${nomeSafe}')"`;
      const badgeHtml   = badge ? `<span class="badge ${badgeCls} ev-item-badge">${badge}</span>` : '';
      const checkHtml   = !disabled ? `<div class="ev-check" id="chk-${r.id}"></div>` : '';

      html += `<div class="ev-item ${disClass}" id="ev-item-${r.id}" ${onclickAttr} data-disabled="${disabled}">`;
      html += `<div style="width:8px;height:8px;border-radius:50%;background:${cor};flex-shrink:0;margin-right:8px"></div>`;
      html += `<div class="ev-item-info">`;
      html += `<div class="ev-item-nome">${nome}</div>`;
      html += `<div class="ev-item-meta">📅 ${data} · 📍 ${local} · 🎫 ${vagas} vagas</div>`;
      html += `</div>${badgeHtml}${checkHtml}</div>`;
    });

    container.innerHTML = html || '<div class="ebox">Nenhum evento disponível.</div>';
  }

  // ── Selecionar/deselecionar evento ────────────────
  function selecionar(recId, nome) {
    const el = document.getElementById('ev-item-' + recId);
    if (!el || el.dataset.disabled === 'true') return;
    const idx = _selecionados.findIndex(e => e.recId === recId);
    const chk = document.getElementById('chk-' + recId);
    if (idx >= 0) {
      _selecionados.splice(idx, 1);
      el.classList.remove('ev-item-selected');
      if (chk) chk.textContent = '';
    } else {
      _selecionados.push({ recId, nome });
      el.classList.add('ev-item-selected');
      if (chk) chk.textContent = '✓';
    }
  }

  // ── Mostrar formulário de novo beneficiário ───────
  function mostrarNovo() {
    _benefRec = null;
    document.getElementById('dados-encontrados').style.display = 'none';
    document.getElementById('dados-novo').style.display = 'block';
  }

  // ── Enviar inscrição(ões) ─────────────────────────
  async function enviar() {
    const alOk  = document.getElementById('al-ok');
    const alErr = document.getElementById('al-err');
    alOk.style.display  = 'none';
    alErr.style.display = 'none';

    if (_selecionados.length === 0) {
      document.getElementById('al-err-msg').textContent = 'Selecione pelo menos um evento.';
      alErr.style.display = 'flex';
      return;
    }

    let nome, email, regiao, bairro, telefone, idade, observacoes;

    if (_benefRec) {
      const f = _benefRec.fields;
      nome       = f['Nome Completo'] || '';
      email      = f['Email'] || '';
      regiao     = f['Região'] || '';
      bairro     = f['Bairro'] || '';
      telefone   = f['Telefone'] || '';
      idade      = f['Idade'] || 0;
      observacoes = '';
      if (!email) {
        document.getElementById('al-err-msg').textContent =
          'E-mail do beneficiário não cadastrado. Contate a equipe.';
        alErr.style.display = 'flex';
        return;
      }
    } else {
      nome       = document.getElementById('fn').value.trim();
      email      = document.getElementById('fe').value.trim();
      regiao     = document.getElementById('fr').value;
      bairro     = document.getElementById('fb').value;
      telefone   = document.getElementById('ft').value.trim();
      idade      = Number(document.getElementById('fi').value) || 0;
      observacoes = document.getElementById('fo').value.trim();
      if (!nome || !email || !regiao) {
        document.getElementById('al-err-msg').textContent =
          'Preencha todos os campos obrigatórios (*).';
        alErr.style.display = 'flex';
        return;
      }
    }

    const btn = document.getElementById('bsub');
    btn.disabled = true;
    btn.textContent = 'Enviando...';

    try {
      for (let i = 0; i < _selecionados.length; i++) {
        if (i > 0) await Utils.delay(800);
        const ev = _selecionados[i];
        await API.webhook({
          tipo:              'inscricao',
          id_inscricao:      Utils.gerarId(),
          nome_beneficiario: nome,
          email_beneficiario: email,
          telefone,
          idade,
          cpf:               _cpfAtual,
          regiao,
          bairro,
          nome_evento:       ev.nome,
          evento_rec_id:     ev.recId,
          data_inscricao:    new Date().toLocaleDateString('pt-BR'),
          observacoes,
          cidade:            'Teresina, PI',
          benef_rec_id:      _benefRec ? _benefRec.id : '',
        });
      }

      alOk.style.display = 'flex';
      alOk.scrollIntoView({ behavior: 'smooth' });

      setTimeout(() => {
        _reset();
        alOk.style.display = 'none';
      }, 3000);

    } catch (e) {
      console.error('Erro inscricao:', e);
      document.getElementById('al-err-msg').textContent =
        e.message || 'Erro ao enviar. Tente novamente.';
      alErr.style.display = 'flex';
    }

    btn.disabled = false;
    btn.textContent = 'Confirmar inscrição';
  }

  // ── Popular selects de zona e bairro ─────────────
  function _popularZonas() {
    const sel = document.getElementById('fr');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecione sua zona...</option>' +
      CONFIG.ZONAS.map(z => `<option>${z}</option>`).join('');
  }

  function _popularBairros() {
    const sel = document.getElementById('fb');
    if (!sel) return;
    sel.innerHTML = '<option value="">Selecione o bairro...</option>' +
      CONFIG.BAIRROS.map(b => `<option>${b}</option>`).join('');
  }

  // ── Reset completo do formulário ──────────────────
  function _reset() {
    _benefRec = null;
    _cpfAtual = '';
    _selecionados = [];
    const cpfInput = document.getElementById('f-cpf');
    if (cpfInput) cpfInput.value = '';
    const feedback = document.getElementById('cpf-feedback');
    if (feedback) feedback.textContent = '';
    const stepDados = document.getElementById('step-dados');
    if (stepDados) stepDados.style.display = 'none';
    ['fn', 'fi', 'fe', 'ft', 'fo'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    ['fr', 'fb'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    API.limparCache();
  }

  function _resetStep2() {
    _benefRec = null;
    _selecionados = [];
    document.getElementById('dados-encontrados').style.display = 'none';
    document.getElementById('dados-novo').style.display = 'none';
    document.getElementById('step-dados').style.display = 'none';
    document.getElementById('al-ok').style.display = 'none';
    document.getElementById('al-err').style.display = 'none';
    API.invalidar('Beneficiários');
    API.invalidar('Inscrições');
  }

  return { init, onCPFInput, buscar, selecionar, mostrarNovo, enviar };
})();
