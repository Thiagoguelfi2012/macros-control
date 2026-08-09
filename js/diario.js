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
    $('#modal-titulo').textContent = entry ? 'Editar registro' : 'Adicionar alimentos';
    backdrop.classList.add('open');
    $('#impacto').hidden = true;
    $('#btn-incluir').hidden = true;
    renderCesta(); // refeição montada sobrevive a fechar/reabrir o modal
    if (entry) {
      inpDataHora.value = toLocalInput(new Date(entry.ts));
      tomSelect.clear(true);
      tomSelect.clearOptions();
      (async () => {
        let food = await MacroDB.getFood(entry.foodId);
        // trava de segurança: se o id apontar para outro alimento (ids antigos
        // eram posicionais e mudavam a cada atualização da base), ignora e usa
        // o snapshot do registro
        if (food && food.n !== entry.nome) food = null;
        // alimento pode ter sido excluído (ex.: alimento próprio): reconstrói
        // um equivalente a partir do snapshot do registro
        if (!food && entry.gramas > 0) {
          const f100 = 100 / entry.gramas;
          food = {
            i: entry.foodId, n: entry.nome, f: 'p',
            kcal: entry.kcal * f100, p: entry.p * f100, c: entry.c * f100, g: entry.g * f100,
          };
          if (entry.ml) food.l = 1;
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
        atualizarTotaisDia();
      })();
    } else {
      tomSelect.clear(true);
      tomSelect.clearOptions();
      foodSelecionado = null;
      fallbackFood = null;
      selMedida.innerHTML = '<option value="g">gramas (g)</option>';
      inpQtd.value = 100;
      inpDataHora.value = toLocalInput(new Date());
      preview.hidden = true;
      atualizarTotaisDia();
      setTimeout(() => tomSelect.focus(), 50);
    }
  }

  function fecharModal() {
    backdrop.classList.remove('open');
  }

  async function onFoodChange(foodId) {
    // o alimento sintetizado do snapshot tem prioridade: o id pode apontar
    // para outro alimento (ids antigos posicionais) ou não existir mais
    foodSelecionado =
      fallbackFood && fallbackFood.i === foodId
        ? fallbackFood
        : (await MacroDB.getFood(foodId)) || fallbackFood;
    // líquidos são medidos em ml (1 ml ≈ 1 g nas tabelas)
    selMedida.innerHTML = `<option value="g">${foodSelecionado && foodSelecionado.l ? 'mililitros (ml)' : 'gramas (g)'}</option>`;
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

  /* ---- Refeição: vários alimentos de uma vez ---- */

  let cesta = []; // itens já "incluídos na refeição", salvos todos juntos

  // Celular em segundo plano descarta a página e a recarrega na volta: a
  // refeição em montagem é persistida e restaurada (expira em 12 h).
  const LS_CESTA = 'cestaRefeicao';

  function salvarCesta() {
    try {
      if (cesta.length) localStorage.setItem(LS_CESTA, JSON.stringify({ t: Date.now(), itens: cesta }));
      else localStorage.removeItem(LS_CESTA);
    } catch {
      /* sem persistência da cesta */
    }
  }

  function restaurarCesta() {
    try {
      const salvo = JSON.parse(localStorage.getItem(LS_CESTA) || 'null');
      if (salvo && Array.isArray(salvo.itens) && Date.now() - salvo.t < 12 * 3600000) {
        cesta = salvo.itens;
      } else {
        localStorage.removeItem(LS_CESTA);
      }
    } catch {
      /* sem persistência da cesta */
    }
  }

  const somaCesta = () =>
    cesta.reduce(
      (acc, it) => ({ kcal: acc.kcal + it.kcal, p: acc.p + it.p, c: acc.c + it.c, g: acc.g + it.g }),
      { kcal: 0, p: 0, c: 0, g: 0 }
    );

  function itemAtual() {
    const r = calcular();
    if (!foodSelecionado || r.qtd <= 0) return null;
    const item = {
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
    if (foodSelecionado.l) item.ml = 1;
    return item;
  }

  function limparSelecao() {
    tomSelect.clear(true);
    tomSelect.clearOptions();
    foodSelecionado = null;
    selMedida.innerHTML = '<option value="g">gramas (g)</option>';
    inpQtd.value = 100;
    atualizarPreview();
  }

  function atualizarBotaoSalvar() {
    const n = cesta.length + (foodSelecionado && editandoId == null ? 1 : 0);
    $('#btn-salvar').textContent = editandoId != null ? 'Salvar' : n > 1 ? `Salvar (${n} itens)` : 'Salvar';
  }

  function renderCesta() {
    const wrap = $('#cesta-wrap');
    if (!cesta.length || editandoId != null) {
      wrap.hidden = true;
      return;
    }
    wrap.hidden = false;
    const lista = $('#cesta-itens');
    lista.innerHTML = '';
    cesta.forEach((it, idx) => {
      const row = document.createElement('div');
      row.className = 'cesta-item';
      row.innerHTML = `
        <span class="ci-nome"></span>
        <span class="ci-qtd">${qtdStr(it)}</span>
        <span class="ci-kcal">${fmt(it.kcal, 0)} kcal</span>
        <button class="icon-btn act-del" title="Remover da refeição" aria-label="Remover">${SVG_DEL}</button>`;
      row.querySelector('.ci-nome').textContent = it.nome;
      row.querySelector('button').addEventListener('click', () => {
        cesta.splice(idx, 1);
        salvarCesta();
        renderCesta();
        atualizarPreview();
      });
      lista.appendChild(row);
    });
    const t = somaCesta();
    $('#cesta-total').innerHTML =
      `Total: <b>${fmt(t.kcal, 0)}</b> kcal · P <b>${fmt(t.p)}</b> · C <b>${fmt(t.c)}</b> · G <b>${fmt(t.g)}</b> g`;
  }

  function incluirNaRefeicao() {
    const item = itemAtual();
    if (!item) {
      tomSelect.focus();
      return;
    }
    cesta.push(item);
    salvarCesta();
    renderCesta();
    limparSelecao();
    setTimeout(() => tomSelect.focus(), 50);
  }

  // totais do dia escolhido no modal (sem o registro em edição), para o impacto
  let totaisDia = { kcal: 0, p: 0, c: 0, g: 0 };

  async function atualizarTotaisDia() {
    const base = inpDataHora.value ? new Date(inpDataHora.value) : new Date();
    const key = `${base.getFullYear()}-${pad(base.getMonth() + 1)}-${pad(base.getDate())}`;
    const entries = await MacroDB.getAllEntries();
    totaisDia = entries.reduce(
      (acc, e) => {
        if (e.id === editandoId) return acc;
        const d = new Date(e.ts);
        if (`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` !== key) return acc;
        return { kcal: acc.kcal + e.kcal, p: acc.p + e.p, c: acc.c + e.c, g: acc.g + e.g };
      },
      { kcal: 0, p: 0, c: 0, g: 0 }
    );
    atualizarPreview();
  }

  function renderImpacto(r) {
    const impacto = $('#impacto');
    const { gastoDiario, metaKcal, metaP, metaC, metaG } = MacroDB.getSettings();
    // o impacto considera a refeição inteira: itens já incluídos + o item atual
    const sc = editandoId == null ? somaCesta() : { kcal: 0, p: 0, c: 0, g: 0 };
    const linhas = [
      ['Calorias', metaKcal || gastoDiario, totaisDia.kcal, r.kcal + sc.kcal, 'var(--accent)', 'kcal'],
      ['Proteínas', metaP, totaisDia.p, r.p + sc.p, 'var(--s1)', 'g'],
      ['Carboidratos', metaC, totaisDia.c, r.c + sc.c, 'var(--s2)', 'g'],
      ['Gorduras', metaG, totaisDia.g, r.g + sc.g, 'var(--s3)', 'g'],
    ].filter(([, meta]) => meta);
    if (!linhas.length) {
      impacto.hidden = true;
      return;
    }
    const hoje = new Date();
    const dia = inpDataHora.value ? new Date(inpDataHora.value) : hoje;
    const ehHoje = dia.toDateString() === hoje.toDateString();
    impacto.querySelector('.imp-title').textContent = ehHoje
      ? 'Impacto na meta de hoje'
      : `Impacto na meta de ${dia.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
    const rows = $('#impacto-rows');
    rows.innerHTML = '';
    for (const [nome, meta, atual, add, cor, un] of linhas) {
      const novo = atual + add;
      const pctBase = Math.min(100, (atual / meta) * 100);
      const pctAdd = Math.max(0, Math.min(100 - pctBase, (add / meta) * 100));
      const estoura = novo > meta;
      const row = document.createElement('div');
      row.className = 'imp-row';
      row.innerHTML = `
        <div class="imp-head">
          <span>${nome}</span>
          <span class="imp-vals${estoura ? ' over' : ''}">+${fmt(add, 0)} → <b>${fmt(novo, 0)}</b> / ${fmt(meta, 0)} ${un} · ${fmt((novo / meta) * 100, 0)}%</span>
        </div>
        <div class="imp-bar">
          <i style="width:${pctBase.toFixed(1)}%;background:${cor}"></i>
          <i class="add" style="width:${pctAdd.toFixed(1)}%;background:${cor}"></i>
        </div>`;
      rows.appendChild(row);
    }
    impacto.hidden = false;
  }

  function atualizarPreview() {
    atualizarBotaoSalvar();
    if (!foodSelecionado) {
      preview.hidden = true;
      $('#btn-incluir').hidden = true;
      // com refeição montada, o impacto continua visível (soma da cesta)
      if (cesta.length && editandoId == null) renderImpacto({ kcal: 0, p: 0, c: 0, g: 0 });
      else $('#impacto').hidden = true;
      return;
    }
    $('#btn-incluir').hidden = editandoId != null;
    const r = calcular();
    if (foodSelecionado.l && r.gramas >= 1000) {
      $('#pv-gramas').textContent = fmt(r.gramas / 1000, 2);
      $('#pv-un').textContent = 'L';
    } else {
      $('#pv-gramas').textContent = fmt(r.gramas);
      $('#pv-un').textContent = foodSelecionado.l ? 'ml' : 'g';
    }
    $('#pv-kcal').textContent = fmt(r.kcal, 0);
    $('#pv-p').textContent = fmt(r.p);
    $('#pv-c').textContent = fmt(r.c);
    $('#pv-g').textContent = fmt(r.g);
    preview.hidden = false;
    renderImpacto(r);
  }

  async function salvar() {
    if (!inpDataHora.value) return;
    const ts = new Date(inpDataHora.value).toISOString();
    // edição: sempre um único registro
    if (editandoId != null) {
      const item = itemAtual();
      if (!item) {
        tomSelect.focus();
        return;
      }
      await MacroDB.updateEntry({ id: editandoId, ts, ...item });
      fecharModal();
      render();
      return;
    }
    // adição: refeição (itens incluídos) + item em configuração, tudo junto
    const itens = [...cesta];
    const atual = itemAtual();
    if (atual) itens.push(atual);
    if (!itens.length) {
      tomSelect.focus();
      return;
    }
    for (const item of itens) {
      await MacroDB.addEntry({ ts, ...item });
    }
    cesta = [];
    salvarCesta();
    renderCesta();
    fecharModal();
    render();
  }

  /* Confirmação em dois toques (diálogos nativos são bloqueados quando o app
     roda dentro de um iframe, ex.: página hospedada): o primeiro toque arma o
     botão ("Excluir?"), o segundo confirma; desarma sozinho em 3 s. */
  function confirmarDoisToques(btn, onConfirm) {
    if (btn.dataset.armado) {
      clearTimeout(btn._timerConf);
      onConfirm();
      return;
    }
    btn.dataset.armado = '1';
    btn._htmlOriginal = btn.innerHTML;
    btn.innerHTML = '<span class="conf-txt">Excluir?</span>';
    btn.classList.add('confirming');
    btn._timerConf = setTimeout(() => {
      delete btn.dataset.armado;
      btn.innerHTML = btn._htmlOriginal;
      btn.classList.remove('confirming');
    }, 3000);
  }

  /* ---- Cadastro de alimento próprio ---- */

  const cadBackdrop = $('#modal-cadastro');
  let editandoAlimentoId = null; // id do alimento próprio em edição (null = novo)

  function resetFormCadastro() {
    editandoAlimentoId = null;
    $('#cadastro-titulo').textContent = 'Cadastrar alimento próprio';
    $('#btn-cad-salvar').textContent = 'Cadastrar';
    for (const id of ['cad-nome', 'cad-kcal', 'cad-p', 'cad-c', 'cad-g', 'cad-medida']) $('#' + id).value = '';
    $('#cad-porcao').value = 100;
    $('#cad-liquido').checked = false;
  }

  // carrega um alimento próprio no formulário, convertendo os valores por
  // 100 g de volta para a porção de referência
  function carregarCadastro(f) {
    editandoAlimentoId = f.i;
    $('#cadastro-titulo').textContent = 'Editar alimento próprio';
    $('#btn-cad-salvar').textContent = 'Salvar alterações';
    const m = f.m && f.m.length ? f.m[0] : null;
    const porcao = m ? m[1] : 100;
    const fator = porcao / 100;
    const r1 = (x) => Math.round(x * 10) / 10;
    $('#cad-nome').value = f.n;
    $('#cad-porcao').value = porcao;
    $('#cad-kcal').value = r1(f.kcal * fator);
    $('#cad-p').value = r1(f.p * fator);
    $('#cad-c').value = r1(f.c * fator);
    $('#cad-g').value = r1(f.g * fator);
    $('#cad-medida').value = m && !/^porção \(/.test(m[0]) ? m[0].replace(/\s*\(.*\)$/, '') : '';
    $('#cad-liquido').checked = !!f.l;
    $('#cad-nome').focus();
    cadBackdrop.querySelector('.modal').scrollTop = 0;
  }

  async function renderMeusAlimentos() {
    const meus = await MacroDB.getCustomFoods();
    const wrap = $('#meus-alimentos-wrap');
    wrap.hidden = meus.length === 0;
    const lista = $('#meus-alimentos');
    lista.innerHTML = '';
    for (const f of meus) {
      const div = document.createElement('div');
      div.className = 'meu-alimento';
      div.title = 'Toque para editar';
      div.innerHTML = `
        <div class="info">
          <div class="nm"></div>
          <div class="mt">${fmt(f.kcal, 0)} kcal · P ${fmt(f.p)} · C ${fmt(f.c)} · G ${fmt(f.g)} (100 g)${f.m && f.m.length ? ` · ${f.m[0][0]}` : ''}</div>
        </div>
        <button class="icon-btn act-del" title="Excluir" aria-label="Excluir">${SVG_DEL}</button>`;
      div.querySelector('.nm').textContent = f.n;
      div.addEventListener('click', (ev) => {
        if (!ev.target.closest('.icon-btn')) carregarCadastro(f);
      });
      div.querySelector('button').addEventListener('click', (ev) => {
        ev.stopPropagation();
        confirmarDoisToques(ev.currentTarget, async () => {
          await MacroDB.deleteCustomFood(f.i);
          if (editandoAlimentoId === f.i) resetFormCadastro();
          FoodSearch.buildIndex(await MacroDB.ensureFoods());
          renderMeusAlimentos();
        });
      });
      lista.appendChild(div);
    }
  }

  function abrirCadastro() {
    backdrop.classList.remove('open');
    resetFormCadastro();
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
    const liquido = $('#cad-liquido').checked;
    const editando = editandoAlimentoId != null;
    const un = liquido ? 'ml' : 'g';
    const food = {
      i: editando ? editandoAlimentoId : `p${Date.now()}`,
      n: nome,
      f: 'p',
      kcal: round1(kcal * f100),
      p: round1(p * f100),
      c: round1(c * f100),
      g: round1(g * f100),
      m: medida ? [[medida, porcao]] : porcao !== 100 ? [[`porção (${fmt(porcao)} ${un})`, porcao]] : [],
    };
    if (liquido) food.l = 1;
    if (!food.m.length) delete food.m;
    await MacroDB.addCustomFood(food);
    FoodSearch.buildIndex(await MacroDB.ensureFoods());
    if (editando) {
      // permanece no modal para conferir a lista atualizada
      resetFormCadastro();
      renderMeusAlimentos();
      return;
    }
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

  // volumes: até 999 ml em ml, a partir de 1 litro em L ("1,2 L")
  const fmtVol = (ml) => (ml >= 1000 ? `${fmt(ml / 1000, 2)} L` : `${fmt(ml)} ml`);

  // "1 × dose (30 g)" — sem duplicar as gramas quando o rótulo da medida já as
  // traz; líquidos exibem ml/L
  function qtdStr(e) {
    if (e.medida === 'g') return e.ml ? fmtVol(e.qtd) : `${fmt(e.qtd)} g`;
    if (e.medida.includes('(')) return `${fmt(e.qtd)} × ${e.medida}`;
    return `${fmt(e.qtd)} × ${e.medida} (${e.ml ? fmtVol(e.gramas) : `${fmt(e.gramas)} g`})`;
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
    // accordion de macronutrientes: uma barra de progresso para cada macro
    const macros = [
      ['Proteínas', 'sw-p', tot.p, metaP, 'var(--s1)'],
      ['Carboidratos', 'sw-c', tot.c, metaC, 'var(--s2)'],
      ['Gorduras', 'sw-g', tot.g, metaG, 'var(--s3)'],
    ];
    const temMetaMacro = metaP || metaC || metaG;
    const rows = macros
      .map(([nome, sw, v, alvo, cor]) => {
        if (!alvo) {
          return `<div class="alvo-row">
            <div class="alvo-head">
              <span class="macro-chip"><span class="sw ${sw}"></span>${nome}</span>
              <span class="alvo-vals"><b>${fmt(v, 0)}</b> g · sem alvo</span>
            </div>
          </div>`;
        }
        const pctm = (v / alvo) * 100;
        return `<div class="alvo-row">
          <div class="alvo-head">
            <span class="macro-chip"><span class="sw ${sw}"></span>${nome}</span>
            <span class="alvo-vals"><b>${fmt(v, 0)}</b> / ${fmt(alvo, 0)} g · ${fmt(pctm, 0)}%</span>
          </div>
          <div class="alvo-bar${pctm > 110 ? ' over' : ''}">
            <div style="width:${Math.min(100, pctm).toFixed(1)}%;background:${cor}"></div>
          </div>
        </div>`;
      })
      .join('');
    const conteudo = temMetaMacro
      ? rows
      : `<div class="hoje-config">Defina os alvos de macros na seção "Dieta alvo" dos <a href="relatorios.html" class="link-rel">Relatórios</a>.</div>`;
    const aberto = localStorage.getItem('hojeMacrosAberto') !== '0';
    card.insertAdjacentHTML(
      'beforeend',
      `<button class="hoje-acc-toggle${aberto ? '' : ' closed'}" type="button" aria-expanded="${aberto}">
        Macronutrientes
        <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div class="hoje-acc"${aberto ? '' : ' hidden'}>${conteudo}</div>`
    );
    const toggle = card.querySelector('.hoje-acc-toggle');
    const acc = card.querySelector('.hoje-acc');
    toggle.addEventListener('click', () => {
      const abrir = acc.hidden;
      acc.hidden = !abrir;
      toggle.classList.toggle('closed', !abrir);
      toggle.setAttribute('aria-expanded', String(abrir));
      localStorage.setItem('hojeMacrosAberto', abrir ? '1' : '0');
    });
    // na versão de página única, links para Relatórios trocam de aba
    for (const link of card.querySelectorAll('.hoje-config a')) {
      link.addEventListener('click', (ev) => {
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
        div.querySelector('.act-repeat').addEventListener('click', async (ev) => {
          ev.stopPropagation(); // não deixa o clique abrir a edição da linha
          const { id, ...resto } = e;
          await MacroDB.addEntry({ ...resto, ts: new Date().toISOString() });
          render();
        });
        div.querySelector('.act-del').addEventListener('click', (ev) => {
          ev.stopPropagation(); // não deixa o clique abrir a edição da linha
          confirmarDoisToques(ev.currentTarget, async () => {
            await MacroDB.deleteEntry(e.id);
            render();
          });
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
            { t: 'TACO', b: 'TBCA', i: 'IBGE', u: 'USDA', r: 'estimativa', m: 'rótulo da marca', p: 'meu alimento' }[item.f] || '';
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
    $('#btn-incluir').addEventListener('click', incluirNaRefeicao);
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
    inpDataHora.addEventListener('input', atualizarTotaisDia); // muda o dia → recalcula o impacto

    // versão de página única: re-renderiza ao voltar para a aba (configurações
    // podem ter mudado nos Relatórios)
    document.addEventListener('diario:refresh', render);

    restaurarCesta();
    render();
    // refeição recuperada de uma recarga: reabre o modal onde o usuário parou
    if (cesta.length) abrirModal();
  }

  init().catch((e) => {
    historico.innerHTML = `<p class="loading">Erro ao iniciar: ${e.message}</p>`;
    console.error(e);
  });
})();
