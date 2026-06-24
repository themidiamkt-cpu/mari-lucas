// ============================================================
//  script.js — Site de Casamento Mari & Lucas
// ============================================================

// ── Supabase client (via fetch, sem SDK) ───────────────────
const sb = {
  url: CONFIG.SUPABASE_URL,
  key: CONFIG.SUPABASE_ANON_KEY,

  async from(table) {
    return {
      table,
      _filters: [],
      _order: null,
      _limit: null,

      eq(col, val)   { this._filters.push(`${col}=eq.${val}`); return this; },
      order(col, { ascending = true } = {}) {
        this._order = `${col}.${ascending ? 'asc' : 'desc'}`;
        return this;
      },
      limit(n) { this._limit = n; return this; },

      async select(cols = '*') {
        let query = `${sb.url}/rest/v1/${this.table}?select=${cols}`;
        if (this._filters.length) query += '&' + this._filters.join('&');
        if (this._order)          query += `&order=${this._order}`;
        if (this._limit)          query += `&limit=${this._limit}`;

        const res = await fetch(query, {
          headers: {
            apikey: sb.key,
            Authorization: `Bearer ${sb.key}`,
            'Content-Type': 'application/json',
          }
        });
        const data = await res.json();
        return { data, error: res.ok ? null : data };
      },

      async insert(obj) {
        const res = await fetch(`${sb.url}/rest/v1/${this.table}`, {
          method: 'POST',
          headers: {
            apikey: sb.key,
            Authorization: `Bearer ${sb.key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(obj)
        });
        const data = await res.json();
        return { data, error: res.ok ? null : data };
      },

      async update(obj) {
        let query = `${sb.url}/rest/v1/${this.table}`;
        if (this._filters.length) query += '?' + this._filters.join('&');
        const res = await fetch(query, {
          method: 'PATCH',
          headers: {
            apikey: sb.key,
            Authorization: `Bearer ${sb.key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(obj)
        });
        const data = await res.json();
        return { data, error: res.ok ? null : data };
      },

      async delete() {
        let query = `${sb.url}/rest/v1/${this.table}`;
        if (this._filters.length) query += '?' + this._filters.join('&');
        const res = await fetch(query, {
          method: 'DELETE',
          headers: {
            apikey: sb.key,
            Authorization: `Bearer ${sb.key}`,
          }
        });
        return { error: res.ok ? null : await res.json() };
      }
    };
  }
};

// Helper: from(table) sem await aninhado
const db = {
  async select(table, cols = '*', filters = [], orderCol = null, asc = true) {
    let query = `${CONFIG.SUPABASE_URL}/rest/v1/${table}?select=${cols}`;
    if (filters.length)  query += '&' + filters.join('&');
    if (orderCol)        query += `&order=${orderCol}.${asc ? 'asc' : 'desc'}`;
    const res = await fetch(query, { headers: { apikey: CONFIG.SUPABASE_ANON_KEY, Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}` } });
    return res.ok ? await res.json() : [];
  },
  async insert(table, obj) {
    const res = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { apikey: CONFIG.SUPABASE_ANON_KEY, Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(obj)
    });
    return { ok: res.ok, data: await res.json() };
  }
};

// ── Loader ─────────────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 1000);
});

// ── Nav ────────────────────────────────────────────────────
const nav = document.getElementById('nav');
const burger = document.querySelector('.nav-burger');
const navLinks = document.querySelector('.nav-links');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
}, { passive: true });

burger?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Sistema de Abas ────────────────────────────────────────
let presentesCarregados = false;

function switchTab(tabName) {
  // Atualiza painéis
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabName}`);
  });

  // Atualiza botões de aba (nav desktop + mobile hero)
  document.querySelectorAll('.nav-tab, .hero-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
    btn.setAttribute('aria-selected', btn.dataset.tab === tabName ? 'true' : 'false');
  });

  // Mostra/oculta links internos da home
  const homeLinks = document.getElementById('nav-links-home');
  if (homeLinks) homeLinks.style.display = tabName === 'home' ? '' : 'none';

  // Rola para o topo
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Carrega presentes na primeira vez que a aba abre
  if (tabName === 'presentes' && !presentesCarregados) {
    carregarPresentes();
    presentesCarregados = true;
  }
}

// Conecta todos os botões de aba
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
});

// ── Countdown ──────────────────────────────────────────────
function updateCountdown() {
  const target = new Date(CONFIG.WEDDING_DATE).getTime();
  const now    = new Date().getTime();
  const diff   = target - now;

  if (diff <= 0) {
    document.querySelectorAll('.countdown-number').forEach(el => el.textContent = '00');
    return;
  }

  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = n => String(n).padStart(2, '0');
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = pad(val); };
  set('cd-days', days);
  set('cd-hours', hours);
  set('cd-minutes', minutes);
  set('cd-seconds', seconds);
}

updateCountdown();
setInterval(updateCountdown, 1000);

// ── Reveal on scroll ───────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ── Toast ──────────────────────────────────────────────────
function showToast(msg, type = 'success', duration = 3000) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${type} show`;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ── Presentes ──────────────────────────────────────────────
let presentes = [];
let presenteSelecionado = null;

async function carregarPresentes() {
  const grid = document.getElementById('presentes-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="presentes-loading">Carregando presentes com amor... 💝</div>';

  const data = await db.select('presentes', '*', [], 'ordem', true);
  presentes = Array.isArray(data) ? data : [];

  if (!presentes.length) {
    grid.innerHTML = '<div class="presentes-empty">Nenhum presente cadastrado ainda.</div>';
    return;
  }

  grid.innerHTML = presentes.map(p => `
    <div class="presente-card ${p.status === 'dado' ? 'dado' : ''}" data-id="${p.id}" onclick="abrirModalPresente('${p.id}')">
      <div class="presente-img">
        ${p.imagem_url
          ? `<img src="${p.imagem_url}" alt="${p.nome}" loading="lazy" onerror="this.parentElement.innerHTML='🎁'">`
          : '🎁'}
      </div>
      <div class="presente-body">
        <div class="presente-nome">${p.nome}</div>
        ${p.descricao ? `<div class="presente-desc">${p.descricao}</div>` : ''}
        ${p.preco ? `<div class="presente-preco">R$ ${parseFloat(p.preco).toFixed(2).replace('.', ',')}</div>` : '<div class="presente-preco" style="color:var(--rose-dark)">Qualquer valor</div>'}
        <div class="presente-status-badge ${p.status === 'dado' ? 'dado' : ''}">${p.status === 'dado' ? '✓ Presenteado' : '💝 Disponível'}</div>
      </div>
    </div>
  `).join('');

  // Reveal nos cards
  document.querySelectorAll('.presente-card').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
    setTimeout(() => {
      el.style.opacity = el.classList.contains('dado') ? '0.55' : '1';
      el.style.transform = 'translateY(0)';
    }, 100);
  });
}

// ── Modal de presente ──────────────────────────────────────
function abrirModalPresente(id) {
  const presente = presentes.find(p => p.id === id);
  if (!presente || presente.status === 'dado') return;

  presenteSelecionado = presente;
  const overlay = document.getElementById('modal-overlay');
  const step1 = document.getElementById('modal-step-1');
  const step2 = document.getElementById('modal-step-2');
  const step3 = document.getElementById('modal-step-3');

  // Preencher step 1
  document.getElementById('modal-nome').textContent    = presente.nome;
  document.getElementById('modal-valor').textContent   = presente.preco
    ? `R$ ${parseFloat(presente.preco).toFixed(2).replace('.', ',')}`
    : 'Qualquer valor';
  document.getElementById('modal-pix-key').textContent = CONFIG.PIX_KEY;
  document.getElementById('modal-pix-nome').textContent = CONFIG.PIX_NOME || 'Mari e Lucas';
  document.getElementById('modal-presente-nome-form').value = presente.nome;
  document.getElementById('modal-presente-valor-form').value = presente.preco || '';
  document.getElementById('modal-payment-method').value = 'pix';

  const asaasConfigured = Boolean(
    CONFIG.ASAAS_ENABLED &&
    (CONFIG.ASAAS_CREATE_PAYMENT_FUNCTION_URL || CONFIG.ASAAS_PAYMENT_URL)
  );
  const asaasBtn = document.getElementById('btn-pagar-asaas');
  const asaasStatus = document.getElementById('asaas-status');
  if (asaasBtn) asaasBtn.disabled = !asaasConfigured;
  if (asaasStatus) {
    asaasStatus.textContent = asaasConfigured
      ? 'Ao finalizar o pagamento, volte aqui para confirmar o presente.'
      : 'Pagamento por cartão em configuração.';
  }

  // Reset
  step1.classList.add('active');
  step2.classList.remove('active');
  step3.classList.remove('active');
  document.getElementById('modal-form').reset();

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function fecharModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  presenteSelecionado = null;
}

document.getElementById('modal-overlay')?.addEventListener('click', (e) => {
  if (e.target === document.getElementById('modal-overlay')) fecharModal();
});

// Copiar chave Pix
document.getElementById('btn-copy-pix')?.addEventListener('click', function() {
  const key = CONFIG.PIX_KEY;
  navigator.clipboard.writeText(key).then(() => {
    this.textContent = '✓ Copiado!';
    this.classList.add('copied');
    setTimeout(() => {
      this.textContent = 'Copiar';
      this.classList.remove('copied');
    }, 2500);
    showToast('Chave Pix copiada! 💛 Agora vá ao seu app de banco.');
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = key;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    this.textContent = '✓ Copiado!';
    this.classList.add('copied');
    setTimeout(() => { this.textContent = 'Copiar'; this.classList.remove('copied'); }, 2500);
  });
});

// Ir para step 2 (form de confirmação)
document.getElementById('btn-ja-fiz-pix')?.addEventListener('click', () => {
  document.getElementById('modal-payment-method').value = 'pix';
  document.getElementById('modal-step-1').classList.remove('active');
  document.getElementById('modal-step-2').classList.add('active');
});

document.getElementById('btn-pagar-asaas')?.addEventListener('click', async function() {
  if (!CONFIG.ASAAS_ENABLED) {
    showToast('Pagamento por cartão ainda será configurado.', 'error');
    return;
  }

  document.getElementById('modal-payment-method').value = 'asaas';

  const fallbackUrl = CONFIG.ASAAS_PAYMENT_URL;
  const functionUrl = CONFIG.ASAAS_CREATE_PAYMENT_FUNCTION_URL;
  const originalText = this.textContent;

  try {
    this.disabled = true;
    this.textContent = 'Abrindo checkout...';

    let checkoutUrl = fallbackUrl;

    if (functionUrl) {
      const res = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: CONFIG.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          presente_id: presenteSelecionado?.id || null,
          presente_nome: presenteSelecionado?.nome || '',
          presente_valor: presenteSelecionado?.preco || null,
        })
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Erro ao criar pagamento no cartão.');
      checkoutUrl = data.url || data.invoiceUrl || data.paymentLinkUrl;
    }

    if (!checkoutUrl) throw new Error('Link de pagamento não configurado.');

    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    showToast('Abrimos o checkout em outra aba. Depois volte aqui para confirmar.', 'success', 4500);
  } catch (error) {
    showToast(error.message || 'Não foi possível abrir o pagamento agora.', 'error', 4500);
  } finally {
    this.disabled = false;
    this.textContent = originalText;
  }
});

// Voltar para step 1
document.getElementById('btn-voltar-pix')?.addEventListener('click', () => {
  document.getElementById('modal-step-2').classList.remove('active');
  document.getElementById('modal-step-1').classList.add('active');
});

// Enviar confirmação de Pix
document.getElementById('modal-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-confirmar-pix');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const nome     = document.getElementById('modal-nome-pessoa').value.trim();
  const telefone = document.getElementById('modal-telefone').value.trim();
  const mensagem = document.getElementById('modal-mensagem-pix').value.trim();
  const paymentMethod = document.getElementById('modal-payment-method').value || 'pix';
  const presenteNome  = presenteSelecionado?.nome || '';
  const presenteValor = presenteSelecionado?.preco || null;
  const presenteId    = presenteSelecionado?.id || null;

  const payload = {
    presente_id:    presenteId,
    presente_nome:  presenteNome,
    presente_valor: presenteValor,
    nome_pessoa:    nome,
    telefone,
    mensagem,
    status:         paymentMethod === 'asaas' ? 'asaas_declarado' : 'pix_declarado',
    enviado_em:     new Date().toISOString(),
  };

  const { ok } = await db.insert('presenteadores', payload);

  if (ok) {
    // Dispara webhook n8n
    if (CONFIG.N8N_WEBHOOK_URL && !CONFIG.N8N_WEBHOOK_URL.includes('COLE_AQUI')) {
      fetch(CONFIG.N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    }

    // Mostra sucesso
    document.getElementById('modal-step-2').classList.remove('active');
    document.getElementById('modal-step-3').classList.add('active');
    showToast('Presente registrado! 💕 Muito obrigados!', 'success');
  } else {
    showToast('Erro ao registrar. Tente novamente.', 'error');
    btn.disabled = false;
    btn.textContent = 'Confirmar presente';
  }
});

// Fechar modal após sucesso
document.getElementById('btn-fechar-modal')?.addEventListener('click', fecharModal);

// ── RSVP ───────────────────────────────────────────────────
let convidadoCount = 1;

function addConvidado() {
  convidadoCount++;
  const container = document.getElementById('convidados-container');
  const row = document.createElement('div');
  row.className = 'convidado-row';
  row.innerHTML = `
    <input type="text" class="form-input convidado-nome" placeholder="Nome completo" required>
    <select class="convidado-faixa">
      <option value="adulto">Adulto</option>
      <option value="crianca">Criança (≤12)</option>
    </select>
    <button type="button" class="btn-remove-convidado" onclick="removeConvidado(this)">×</button>
  `;
  container.appendChild(row);
  row.querySelector('input').focus();
}

function removeConvidado(btn) {
  const row = btn.closest('.convidado-row');
  const container = document.getElementById('convidados-container');
  if (container.querySelectorAll('.convidado-row').length > 1) {
    row.remove();
  } else {
    showToast('Precisa ter pelo menos um convidado.', 'error');
  }
}

document.getElementById('btn-add-convidado')?.addEventListener('click', addConvidado);

document.getElementById('rsvp-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('btn-rsvp-submit');
  btn.disabled = true;
  btn.textContent = 'Enviando...';

  const responsavel = document.getElementById('rsvp-responsavel').value.trim();
  const telefone    = document.getElementById('rsvp-telefone').value.trim();
  const email       = document.getElementById('rsvp-email').value.trim();
  const mensagem    = document.getElementById('rsvp-mensagem').value.trim();

  const rows = document.querySelectorAll('#convidados-container .convidado-row');
  const convidados = [];
  rows.forEach(row => {
    const nome  = row.querySelector('.convidado-nome')?.value.trim();
    const faixa = row.querySelector('.convidado-faixa')?.value || 'adulto';
    if (nome) convidados.push({ nome, faixa });
  });

  const payload = {
    responsavel,
    telefone,
    email: email || null,
    mensagem: mensagem || null,
    convidados,
    total_convidados: convidados.length,
  };

  const { ok } = await db.insert('rsvp', payload);

  if (ok) {
    // Oculta formulário e mostra sucesso (com botão para presentes)
    document.getElementById('rsvp-form').style.display = 'none';
    document.getElementById('rsvp-success').classList.add('show');
    showToast('Presença confirmada! Mal podemos esperar! 💕');
  } else {
    showToast('Erro ao confirmar presença. Tente novamente.', 'error');
    btn.disabled = false;
    btn.textContent = 'Confirmar presença';
  }
});

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Não carrega presentes logo de inicio — só quando a aba for aberta
  // (carregarPresentes é chamado pelo switchTab quando necessário)
});
