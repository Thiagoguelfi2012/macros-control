/* Tela Diário: adicionar/editar/excluir registros, histórico agrupado por dia. */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const historico = $('#historico');
  const backdrop = $('#modal-backdrop');
  const inpQtd = $('#inp-qtd');
  const selMedida = $('#sel-medida');
  const inpDataHora = $('#inp-datahora');
  const preview = $('#preview');

  let tomSelect = null;
  let foodSelecionado = null;
  let editandoId = null; // id do registro em edição (null = novo)

  const fmt = (n, dec = 1) =>
    Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: dec });

  const pad = (n) => String(n).padStart(2, '0');
  const toLocalInput = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  const dayKey = (iso) => iso.slice(0, 10);

  function labelDia(key) {
    const hoje = dayKey(new Date().toISOString().slice(0, 10) + 'T00:00');
    const [y, m, d] = key.split('-').map(Number);
    const data = new Date(y, m - 1, d);
    const hojeData = new Date();
    hojeData.setHours(0, 0, 0, 0);
    const diff = Math.round((hojeData - data) / 86400000);
    const nome =
      diff === 0 ? 'Hoje' : diff === 1 ? 'Ontem' : data.toLocaleDateString('pt-BR', { weekday: 'long' });
    const dataStr = data.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    return { nome: nome.charAt(0).toUpperCase() + nome.slice(1), dataStr };
  }

  /* ---- Modal ---- */

  function abrirModal(entry = null) {
    editandoId = entry ? entry.id : null;
    $('#modal-titulo').textContent = entry ? 'Editar registro' : 'Adicionar alimento';
    backdrop.classList.add('open');
    if (entry) {
      inpDataHora.value = toLocalInput(new Date(entry.ts));
      tomSelect.clear(true);
      tomSelect.clearOptions();
      MacroDB.getFood(entry.foodId).then((food) => {
        if (food) tomSelect.addOption({ ...food });
        tomSelect.setValue(entry.foodId, true);
      });
      onFoodChange(entry.foodId).then(() => {
        // restaura a medida usada no registro
        const opts = [...selMedida.options].map((o) => o.value);
        selMedida.value = opts.includes(entry.medida) ? entry.medida : 'g';
        inpQtd.value = entry.qtd;
        atualizarPreview();
      });
    } else {
      tomSelect.clear(true);
      tomSelect.clearOptions();
      foodSelecionado = null;
      selMedida.innerHTML = '<option value="g">gramas (g)</option>';
      inpQtd.value = 100;
      inpDataHora.value = toLocalInput(new Date());
      preview.hidden = true;
      setTimeout(() => tomSelect.focus(), 50);
    }
  }

  function fecharModal() {
    backdrop.classList.remove('open');
  }

  async function onFoodChange(foodId) {
    foodSelecionado = await MacroDB.getFood(foodId);
    selMedida.innerHTML = '<option value="g">gramas (g)</option>';
    if (foodSelecionado && foodSelecionado.m) {
      for (const [rotulo, gramas] of foodSelecionado.m) {
        const opt = document.createElement('option');
        opt.value = rotulo;
        opt.textContent = `${rotulo} (${fmt(gramas)} g)`;
        selMedida.appendChild(opt);
      }
      // se o alimento tem medida em unidades, sugere 1 unidade como padrão
      selMedida.selectedIndex = 1;
      inpQtd.value = 1;
    } else {
      inpQtd.value = 100;
    }
    atualizarPreview();
  }

  function gramasPorMedida() {
    if (!foodSelecionado) return 0;
    const medida = selMedida.value;
    if (medida === 'g') return 1;
    const m = (foodSelecionado.m || []).find(([r]) => r === medida);
    return m ? m[1] : 1;
  }

  function calcular() {
    const qtd = parseFloat(inpQtd.value) || 0;
    const gramas = qtd * gramasPorMedida();
    const fator = gramas / 100;
    const f = foodSelecionado;
    return {
      qtd,
      gramas,
      kcal: f ? f.kcal * fator : 0,
      p: f ? f.p * fator : 0,
      c: f ? f.c * fator : 0,
      g: f ? f.g * fator : 0,
    };
  }

  function atualizarPreview() {
    if (!foodSelecionado) {
      preview.hidden = true;
      return;
    }
    const r = calcular();
    $('#pv-gramas').textContent = fmt(r.gramas);
    $('#pv-kcal').textContent = fmt(r.kcal, 0);
    $('#pv-p').textContent = fmt(r.p);
    $('#pv-c').textContent = fmt(r.c);
    $('#pv-g').textContent = fmt(r.g);
    preview.hidden = false;
  }

  async function salvar() {
    if (!foodSelecionado) {
      tomSelect.focus();
      return;
    }
    const r = calcular();
    if (r.qtd <= 0 || !inpDataHora.value) return;
    const entry = {
      ts: new Date(inpDataHora.value).toISOString(),
      foodId: foodSelecionado.i,
      nome: foodSelecionado.n,
      qtd: r.qtd,
      medida: selMedida.value,
      gramas: Math.round(r.gramas * 10) / 10,
      kcal: Math.round(r.kcal * 10) / 10,
      p: Math.round(r.p * 10) / 10,
      c: Math.round(r.c * 10) / 10,
      g: Math.round(r.g * 10) / 10,
    };
    if (editandoId != null) {
      entry.id = editandoId;
      await MacroDB.updateEntry(entry);
    } else {
      await MacroDB.addEntry(entry);
    }
    fecharModal();
    render();
  }

  /* ---- Histórico ---- */

  async function render() {
    const entries = await MacroDB.getAllEntries();
    if (!entries.length) {
      historico.innerHTML = `
        <div class="empty-state">
          <h2>Nenhum alimento registrado ainda</h2>
          <p>Toque em “+ Adicionar alimento” para registrar sua primeira refeição.</p>
        </div>`;
      return;
    }
    // agrupa por dia (desc); dentro do dia, mais recente primeiro
    const grupos = new Map();
    for (const e of entries) {
      const local = new Date(e.ts);
      const key = `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}`;
      if (!grupos.has(key)) grupos.set(key, []);
      grupos.get(key).push(e);
    }
    const keys = [...grupos.keys()].sort((a, b) => (a < b ? 1 : -1));
    historico.innerHTML = '';
    for (const key of keys) {
      const itens = grupos.get(key).sort((a, b) => (a.ts < b.ts ? 1 : -1));
      const tot = itens.reduce(
        (acc, e) => ({ kcal: acc.kcal + e.kcal, p: acc.p + e.p, c: acc.c + e.c, g: acc.g + e.g }),
        { kcal: 0, p: 0, c: 0, g: 0 }
      );
      const { nome, dataStr } = labelDia(key);
      const grupo = document.createElement('section');
      grupo.className = 'day-group';
      grupo.innerHTML = `
        <div class="day-head">
          <h3>${nome} <span class="day-date">${dataStr}</span></h3>
          <div class="day-macros">
            <span><b>${fmt(tot.kcal, 0)}</b> kcal</span>
            <span class="macro-chip"><span class="sw sw-p"></span>P <b>${fmt(tot.p)}</b> g</span>
            <span class="macro-chip"><span class="sw sw-c"></span>C <b>${fmt(tot.c)}</b> g</span>
            <span class="macro-chip"><span class="sw sw-g"></span>G <b>${fmt(tot.g)}</b> g</span>
          </div>
        </div>`;
      for (const e of itens) {
        const hora = new Date(e.ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const qtdStr =
          e.medida === 'g' ? `${fmt(e.qtd)} g` : `${fmt(e.qtd)} × ${e.medida} (${fmt(e.gramas)} g)`;
        const div = document.createElement('div');
        div.className = 'entry';
        div.innerHTML = `
          <span class="time">${hora}</span>
          <div class="what">
            <div class="name"></div>
            <div class="qty">${qtdStr}</div>
          </div>
          <div class="vals">
            <div class="kcal">${fmt(e.kcal, 0)} kcal</div>
            <div>P ${fmt(e.p)} · C ${fmt(e.c)} · G ${fmt(e.g)}</div>
          </div>
          <div class="actions">
            <button class="btn-ghost btn-icon" title="Editar (inclusive horário)" aria-label="Editar">✏️</button>
            <button class="btn-ghost btn-icon btn-danger-text" title="Excluir" aria-label="Excluir">🗑️</button>
          </div>`;
        div.querySelector('.name').textContent = e.nome;
        const [btnEditar, btnExcluir] = div.querySelectorAll('.actions button');
        btnEditar.addEventListener('click', () => abrirModal(e));
        btnExcluir.addEventListener('click', async () => {
          if (confirm(`Excluir "${e.nome}"?`)) {
            await MacroDB.deleteEntry(e.id);
            render();
          }
        });
        grupo.appendChild(div);
      }
      historico.appendChild(grupo);
    }
  }

  /* ---- Inicialização ---- */

  async function init() {
    const foods = await MacroDB.ensureFoods();
    FoodSearch.buildIndex(foods);

    tomSelect = new TomSelect('#sel-alimento', {
      valueField: 'i',
      labelField: 'n',
      searchField: [], // a filtragem é nossa (FoodSearch), não do Tom Select
      sortField: [{ field: '$order', direction: 'asc' }], // preserva a ordem de relevância do FoodSearch
      score: () => () => 1, // desativa o score interno (a filtragem/ordem é do FoodSearch)
      maxOptions: 50,
      placeholder: 'Digite para pesquisar… ex.: arroz, frango, banana',
      render: {
        option: (item, escape) => {
          const fonte =
            { t: 'TACO', b: 'TBCA', i: 'IBGE', u: 'USDA', r: 'estimativa de rótulo' }[item.f] || '';
          return `<div>
            <span class="opt-name">${escape(item.n)}</span>
            <span class="opt-meta">${fmt(item.kcal, 0)} kcal · P ${fmt(item.p)} · C ${fmt(item.c)} · G ${fmt(item.g)} (100 g) · ${fonte}</span>
          </div>`;
        },
        no_results: (data) =>
          `<div class="no-results" style="padding:8px 10px;">${
            data.input.length < 2 ? 'Digite ao menos 2 letras…' : 'Nenhum alimento encontrado'
          }</div>`,
      },
      closeAfterSelect: true,
      onChange: (value) => {
        if (value) onFoodChange(value);
      },
      // solta o foco após escolher: senão o Tom Select consome o primeiro
      // clique fora dele (ex.: direto no botão Salvar)
      onItemAdd: () => {
        tomSelect.blur();
      },
      // reconstrói as opções de forma síncrona a cada tecla: sem acúmulo entre
      // consultas nem corrida com carregamento assíncrono. As cópias ({...f})
      // são necessárias: o Tom Select grava $order no objeto e o reaproveitaria,
      // bagunçando a ordem de relevância nas buscas seguintes.
      onType: (query) => {
        tomSelect.clearOptions();
        if (query.length >= 2) tomSelect.addOptions(FoodSearch.search(query).map((f) => ({ ...f })));
        tomSelect.refreshOptions(false);
      },
    });

    $('#btn-adicionar').addEventListener('click', () => abrirModal());
    $('#btn-cancelar').addEventListener('click', fecharModal);
    $('#btn-salvar').addEventListener('click', salvar);
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) fecharModal();
    });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && backdrop.classList.contains('open')) fecharModal();
    });
    inpQtd.addEventListener('input', atualizarPreview);
    selMedida.addEventListener('change', atualizarPreview);

    render();
  }

  init().catch((e) => {
    historico.innerHTML = `<p class="loading">Erro ao iniciar: ${e.message}</p>`;
    console.error(e);
  });
})();
