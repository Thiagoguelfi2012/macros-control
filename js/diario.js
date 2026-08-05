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
  let fallbackFood = null; // reconstruído do snapshot quando o alimento foi excluído

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
      (async () => {
        let food = await MacroDB.getFood(entry.foodId);
        // alimento pode ter sido excluído (ex.: alimento próprio): reconstrói
        // um equivalente a partir do snapshot do registro
        if (!food && entry.gramas > 0) {
          const f100 = 100 / entry.gramas;
          food = {
            i: entry.foodId, n: entry.nome, f: 'p',
            kcal: entry.kcal * f100, p: entry.p * f100, c: entry.c * f100, g: entry.g * f100,
          };
          if (entry.medida !== 'g' && entry.qtd > 0) {
            food.m = [[entry.medida, entry.gramas / entry.qtd]];
          }
          fallbackFood = food;
        } else {
          fallbackFood = null;
        }
        if (food) tomSelect.addOption({ ...food });
        tomSelect.setValue(entry.foodId, true);
        await onFoodChange(entry.foodId);
        // restaura a medida usada no registro; se ela não existe mais,
        // preserva o total em gramas
        const opts = [...selMedida.options].map((o) => o.value);
        if (opts.includes(entry.medida)) {
          selMedida.value = entry.medida;
          inpQtd.value = entry.qtd;
        } else {
          selMedida.value = 'g';
          inpQtd.value = entry.gramas;
        }
        atualizarPreview();
      })();
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
    foodSelecionado = (await MacroDB.getFood(foodId)) || fallbackFood;
    selMedida.innerHTML = '<option value="g">gramas (g)</option>';
    if (foodSelecionado && foodSelecionado.m) {
      for (const [rotulo, gramas] of foodSelecionado.m) {
        const opt = document.createElement('option');
        opt.value = rotulo;
        // rótulos como "dose (30 g)" já trazem as gramas: não duplica
        opt.textContent = rotulo.includes('(') ? rotulo : `${rotulo} (${fmt(gramas)} g)`;
        selMedida.appendChild(opt);
      }
      // se o alimento tem medida em unidades, sugere 1 unidade como padrão
      selMedida.selectedIndex = 1;
      inpQtd.value = 1;
    } else {
      inpQtd.value = 100;
    }
    atualizarPreview();
    // facilita ajustar a quantidade logo após escolher o alimento
    if (backdrop.classList.contains('open')) {
      setTimeout(() => {
        inpQtd.focus();
        inpQtd.select();
      }, 60);
    }
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

  /* ---- Cadastro de alimento próprio ---- */

  const cadBackdrop = $('#modal-cadastro');

  async function renderMeusAlimentos() {
    const meus = await MacroDB.getCustomFoods();
    const wrap = $('#meus-alimentos-wrap');
    wrap.hidden = meus.length === 0;
    const lista = $('#meus-alimentos');
    lista.innerHTML = '';
    for (const f of meus) {
      const div = document.createElement('div');
      div.className = 'meu-alimento';
      div.innerHTML = `
        <div class="info">
          <div class="nm"></div>
          <div class="mt">${fmt(f.kcal, 0)} kcal · P ${fmt(f.p)} · C ${fmt(f.c)} · G ${fmt(f.g)} (100 g)${f.m && f.m.length ? ` · ${f.m[0][0]}` : ''}</div>
        </div>
        <button class="btn-ghost btn-icon btn-danger-text" title="Excluir" aria-label="Excluir">🗑️</button>`;
      div.querySelector('.nm').textContent = f.n;
      div.querySelector('button').addEventListener('click', async () => {
        if (confirm(`Excluir "${f.n}" dos seus alimentos? Registros já feitos não são alterados.`)) {
          await MacroDB.deleteCustomFood(f.i);
          FoodSearch.buildIndex(await MacroDB.ensureFoods());
          renderMeusAlimentos();
        }
      });
      lista.appendChild(div);
    }
  }

  function abrirCadastro() {
    backdrop.classList.remove('open');
    for (const id of ['cad-nome', 'cad-kcal', 'cad-p', 'cad-c', 'cad-g', 'cad-medida']) $('#' + id).value = '';
    $('#cad-porcao').value = 100;
    cadBackdrop.classList.add('open');
    renderMeusAlimentos();
    setTimeout(() => $('#cad-nome').focus(), 50);
  }

  async function salvarCadastro() {
    const nome = $('#cad-nome').value.trim();
    const porcao = parseFloat($('#cad-porcao').value) || 100;
    let kcal = parseFloat($('#cad-kcal').value);
    const p = parseFloat($('#cad-p').value) || 0;
    const c = parseFloat($('#cad-c').value) || 0;
    const g = parseFloat($('#cad-g').value) || 0;
    if (!nome) {
      $('#cad-nome').focus();
      return;
    }
    if (!Number.isFinite(kcal)) kcal = 4 * p + 4 * c + 9 * g; // calcula dos macros se vazio
    const f100 = 100 / porcao;
    const round1 = (x) => Math.round(x * 10) / 10;
    const medida = $('#cad-medida').value.trim();
    const food = {
      i: `p${Date.now()}`,
      n: nome,
      f: 'p',
      kcal: round1(kcal * f100),
      p: round1(p * f100),
      c: round1(c * f100),
      g: round1(g * f100),
      m: medida ? [[medida, porcao]] : porcao !== 100 ? [[`porção (${fmt(porcao)} g)`, porcao]] : [],
    };
    if (!food.m.length) delete food.m;
    await MacroDB.addCustomFood(food);
    FoodSearch.buildIndex(await MacroDB.ensureFoods());
    cadBackdrop.classList.remove('open');
    // reabre o modal de adição já com o alimento novo selecionado
    abrirModal();
    setTimeout(() => {
      tomSelect.addOption({ ...food });
      tomSelect.setValue(food.i, true);
      onFoodChange(food.i);
      tomSelect.blur();
    }, 80);
  }

  /* ---- Histórico ---- */

  const SVG_DEL =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6M14 11v6"/></svg>';
  const SVG_REPEAT =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 3v5h5"/></svg>';

  // "1 × dose (30 g)" — sem duplicar as gramas quando o rótulo da medida já as traz
  function qtdStr(e) {
    if (e.medida === 'g') return `${fmt(e.qtd)} g`;
    if (e.medida.includes('(')) return `${fmt(e.qtd)} × ${e.medida}`;
    return `${fmt(e.qtd)} × ${e.medida} (${fmt(e.gramas)} g)`;
  }

  function renderHoje(entries) {
    const hoje = new Date();
    const keyHoje = `${hoje.getFullYear()}-${pad(hoje.getMonth() + 1)}-${pad(hoje.getDate())}`;
    const doDia = entries.filter((e) => {
      const d = new Date(e.ts);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` === keyHoje;
    });
    const tot = doDia.reduce(
      (acc, e) => ({ kcal: acc.kcal + e.kcal, p: acc.p + e.p, c: acc.c + e.c, g: acc.g + e.g }),
      { kcal: 0, p: 0, c: 0, g: 0 }
    );
    const kcalHoje = tot.kcal;
    const { gastoDiario, metaKcal, metaP, metaC, metaG } = MacroDB.getSettings();
    // a barra acompanha a meta de calorias da dieta alvo; sem ela, o gasto diário
    const alvoKcal = metaKcal || gastoDiario;
    const alvoNome = metaKcal ? 'a meta' : 'o gasto diário';
    const card = document.createElement('section');
    card.className = 'hoje-card';
    if (!alvoKcal) {
      card.innerHTML = `
        <div class="hoje-top"><span class="hoje-label">Meta de hoje</span><span class="hoje-kcal"><b>${fmt(kcalHoje, 0)}</b> kcal</span></div>
        <div class="hoje-config">Defina sua dieta alvo ou gasto diário em <a href="relatorios.html">Relatórios</a> para acompanhar sua meta aqui.</div>`;
    } else {
      const pct = Math.min(100, (kcalHoje / alvoKcal) * 100);
      const over = kcalHoje > alvoKcal;
      card.innerHTML = `
        <div class="hoje-top"><span class="hoje-label">Meta de hoje</span><span class="hoje-kcal"><b>${fmt(kcalHoje, 0)}</b> / ${fmt(alvoKcal, 0)} kcal</span></div>
        <div class="hoje-bar"><div class="${over ? 'over' : ''}" style="width:${pct.toFixed(1)}%"></div></div>
        <div class="hoje-saldo">${over ? `${fmt(kcalHoje - alvoKcal, 0)} kcal acima d${alvoNome === 'a meta' ? 'a meta' : 'o gasto diário'}` : `faltam ${fmt(alvoKcal - kcalHoje, 0)} kcal para ${alvoNome}`}</div>`;
    }
    // progresso dos macros contra a dieta alvo, quando configurada
    if (metaP || metaC || metaG) {
      const barras = [
        ['P', tot.p, metaP, 'var(--s1)'],
        ['C', tot.c, metaC, 'var(--s2)'],
        ['G', tot.g, metaG, 'var(--s3)'],
      ]
        .filter(([, , alvo]) => alvo)
        .map(([l, v, alvo, cor]) => {
          const pctm = Math.min(100, (v / alvo) * 100);
          return `<div class="hm-row">
            <span class="hm-l">${l}</span>
            <div class="hm-bar"><div style="width:${pctm.toFixed(1)}%;background:${cor}"></div></div>
            <span class="hm-v">${fmt(v, 0)} / ${fmt(alvo, 0)} g</span>
          </div>`;
        })
        .join('');
      card.insertAdjacentHTML('beforeend', `<div class="hoje-macrobars">${barras}</div>`);
    }
    const link = card.querySelector('.hoje-config a');
    if (link) {
      link.addEventListener('click', (ev) => {
        // na versão de página única, troca de aba em vez de navegar
        const tab = document.querySelector('a[data-view="view-relatorios"]');
        if (tab) {
          ev.preventDefault();
          tab.click();
        }
      });
    }
    return card;
  }

  async function render() {
    const entries = await MacroDB.getAllEntries();
    historico.innerHTML = '';
    historico.appendChild(renderHoje(entries));
    if (!entries.length) {
      historico.insertAdjacentHTML(
        'beforeend',
        `<div class="empty-state">
          <h2>Nenhum alimento registrado ainda</h2>
          <p>Toque em “+ Adicionar alimento” para registrar sua primeira refeição.</p>
        </div>`
      );
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
        const div = document.createElement('div');
        div.className = 'entry';
        div.setAttribute('role', 'button');
        div.setAttribute('tabindex', '0');
        div.title = 'Toque para editar';
        div.innerHTML = `
          <div class="name"></div>
          <div class="kcal">${fmt(e.kcal, 0)} kcal</div>
          <div class="acts">
            <button class="icon-btn act-repeat" title="Registrar de novo agora" aria-label="Registrar de novo agora">${SVG_REPEAT}</button>
            <button class="icon-btn act-del" title="Excluir" aria-label="Excluir">${SVG_DEL}</button>
          </div>
          <div class="meta">${hora} · ${qtdStr(e)}</div>
          <div class="macros">P ${fmt(e.p)} · C ${fmt(e.c)} · G ${fmt(e.g)}</div>`;
        div.querySelector('.name').textContent = e.nome;
        div.addEventListener('click', (ev) => {
          if (!ev.target.closest('.icon-btn')) abrirModal(e);
        });
        div.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter' && !ev.target.closest('.icon-btn')) abrirModal(e);
        });
        div.querySelector('.act-repeat').addEventListener('click', async () => {
          const { id, ...resto } = e;
          await MacroDB.addEntry({ ...resto, ts: new Date().toISOString() });
          render();
        });
        div.querySelector('.act-del').addEventListener('click', async () => {
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
            { t: 'TACO', b: 'TBCA', i: 'IBGE', u: 'USDA', r: 'estimativa de rótulo', p: 'meu alimento' }[item.f] || '';
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
    $('#btn-abrir-cadastro').addEventListener('click', abrirCadastro);
    $('#btn-cad-cancelar').addEventListener('click', () => cadBackdrop.classList.remove('open'));
    $('#btn-cad-salvar').addEventListener('click', salvarCadastro);
    backdrop.addEventListener('click', (ev) => {
      if (ev.target === backdrop) fecharModal();
    });
    cadBackdrop.addEventListener('click', (ev) => {
      if (ev.target === cadBackdrop) cadBackdrop.classList.remove('open');
    });
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        if (cadBackdrop.classList.contains('open')) cadBackdrop.classList.remove('open');
        else if (backdrop.classList.contains('open')) fecharModal();
      }
    });
    inpQtd.addEventListener('input', atualizarPreview);
    selMedida.addEventListener('change', atualizarPreview);

    // versão de página única: re-renderiza ao voltar para a aba (configurações
    // podem ter mudado nos Relatórios)
    document.addEventListener('diario:refresh', render);

    render();
  }

  init().catch((e) => {
    historico.innerHTML = `<p class="loading">Erro ao iniciar: ${e.message}</p>`;
    console.error(e);
  });
})();
