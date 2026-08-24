/* Tela de Treino: lista de treinos, execução com registro de carga,
   evolução de carga por exercício e biblioteca de exercícios da academia. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = (v, casas = 1) =>
    Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas });
  const esc = (t) =>
    String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const cssVar = (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const dataBr = (iso) => new Date(iso).toLocaleDateString('pt-BR');

  const BIBLIOTECA = () => (window.EXERCICIOS || []);
  const acharExercicio = (id) => BIBLIOTECA().find((e) => e.id === id) || null;

  const semAcento = (t) =>
    String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

  // busca por prefixo de token: "sup inc" acha "Supino Inclinado"
  function filtrarExercicios({ termo = '', grupo = '', equipamento = '' }) {
    const tokens = semAcento(termo).split(/\s+/).filter(Boolean);
    return BIBLIOTECA().filter((e) => {
      if (grupo && e.grupo !== grupo) return false;
      if (equipamento && e.equipamento !== equipamento) return false;
      if (!tokens.length) return true;
      const alvo = semAcento(`${e.nome} ${e.grupo} ${e.equipamento}`);
      const partes = alvo.split(/[^a-z0-9]+/).filter(Boolean);
      return tokens.every((t) => partes.some((p) => p.startsWith(t)));
    });
  }

  /* ---- Estado ---- */

  let treinos = [];
  let sessoes = [];
  let emEdicao = null; // treino sendo editado no modal
  let execucao = null; // { treinoId, treinoNome, ts, itens: [...] }
  let cronometro = null;
  let chartsEvo = [];
  const CHAVE_EXEC = 'sessaoEmAndamento';

  /* ---- Treino pré-configurado ---- */

  // O treino atual do usuário (MFIT Personal, professor Gustavo Gomes Soncin).
  // Serve como ponto de partida na primeira abertura do app; depois é só editar.
  const TREINOS_INICIAIS = [
    {
      nome: 'Treino 1',
      foco: 'P \\ Del \\ T',
      exercicios: [
        ['supino-inclinado-com-barra-reta', 3, 10, 12, 25, 60],
        ['supino-reto-com-halteres', 3, 10, 12, 12, 60],
        ['crossover-polia-alta', 3, 10, 12, 11, 60],
      ],
    },
    { nome: 'Treino 2', foco: 'D \\ Trap \\ B', exercicios: [] },
    { nome: 'Treino 3', foco: 'MMII \\ Abs', exercicios: [] },
  ];

  function montarItemTreino(exercicioId, series, repMin, repMax, carga, intervalo) {
    const base = acharExercicio(exercicioId);
    return {
      id: MacroDB.novoId(),
      exercicioId,
      nome: base ? base.nome : exercicioId,
      grupo: base ? base.grupo : '',
      equipamento: base ? base.equipamento : '',
      semCarga: base ? !!base.semCarga : false,
      series: series ?? 3,
      repMin: repMin ?? 10,
      repMax: repMax ?? 12,
      carga: carga ?? null,
      intervalo: intervalo ?? 60,
      obs: '',
    };
  }

  async function semearTreinos() {
    if (localStorage.getItem('treinosSemeados') === '1') return;
    const atuais = await MacroDB.getTreinos();
    if (atuais.length) {
      localStorage.setItem('treinosSemeados', '1');
      return;
    }
    for (const [i, t] of TREINOS_INICIAIS.entries()) {
      await MacroDB.saveTreino({
        nome: t.nome,
        foco: t.foco,
        ordem: i,
        exercicios: t.exercicios.map((e) => montarItemTreino(...e)),
      });
    }
    localStorage.setItem('treinosSemeados', '1');
  }

  /* ---- Aba: lista de treinos ---- */

  const sessoesDe = (treinoId) => sessoes.filter((s) => s.treinoId === treinoId);

  function resumoExecucoes(treinoId) {
    const lista = sessoesDe(treinoId);
    if (!lista.length) return 'Ainda não executado';
    const ultima = lista[lista.length - 1];
    return `Executado ${lista.length} ${lista.length === 1 ? 'vez' : 'vezes'}, última em ${dataBr(ultima.ts)}`;
  }

  function renderLista() {
    const wrap = $('#lista-treinos');
    if (!treinos.length) {
      wrap.innerHTML = `
        <div class="empty-state">
          <p>Nenhum treino cadastrado ainda.</p>
          <p class="sub">Toque em “+ Novo treino” para montar o seu com os aparelhos da academia.</p>
        </div>`;
      return;
    }
    wrap.innerHTML = treinos
      .map((t) => {
        const qtd = (t.exercicios || []).length;
        const grupos = [...new Set((t.exercicios || []).map((e) => e.grupo).filter(Boolean))];
        return `
        <div class="treino-card" data-id="${t.id}">
          <div class="treino-head">
            <div>
              <h3>${esc(t.nome)}</h3>
              ${t.foco ? `<p class="treino-foco">${esc(t.foco)}</p>` : ''}
            </div>
            <button class="btn btn-ghost act-editar" title="Editar treino" aria-label="Editar ${esc(t.nome)}">Editar</button>
          </div>
          <p class="treino-meta">${qtd} ${qtd === 1 ? 'exercício' : 'exercícios'}${grupos.length ? ` · ${esc(grupos.join(', '))}` : ''}</p>
          <p class="treino-exec">${esc(resumoExecucoes(t.id))}</p>
          ${qtd ? `<ol class="treino-previa">${t.exercicios
            .map((e) => `<li><span>${esc(e.nome)}</span><span class="prev-serie">${e.series}x${e.repMin === e.repMax ? e.repMin : `${e.repMin}-${e.repMax}`}${e.semCarga ? '' : ` · ${e.carga ? `${fmt(e.carga)} kg` : 'sem carga definida'}`}</span></li>`)
            .join('')}</ol>` : '<p class="sub">Sem exercícios — toque em Editar para montar.</p>'}
          <div class="treino-acoes">
            <button class="btn act-historico">Histórico</button>
            <button class="btn btn-primary act-iniciar"${qtd ? '' : ' disabled'}>Iniciar treino</button>
          </div>
        </div>`;
      })
      .join('');
  }

  /* ---- Execução ---- */

  function salvarExecucaoLocal() {
    if (execucao) localStorage.setItem(CHAVE_EXEC, JSON.stringify(execucao));
    else localStorage.removeItem(CHAVE_EXEC);
  }

  function ultimaCarga(exercicioId, treinoId) {
    for (let i = sessoes.length - 1; i >= 0; i--) {
      const s = sessoes[i];
      if (treinoId && s.treinoId !== treinoId) continue;
      const item = (s.itens || []).find((x) => x.exercicioId === exercicioId && x.carga != null);
      if (item) return item.carga;
    }
    return null;
  }

  function iniciarTreino(treino) {
    execucao = {
      treinoId: treino.id,
      treinoNome: treino.nome,
      treinoFoco: treino.foco || '',
      ts: new Date().toISOString(),
      itens: (treino.exercicios || []).map((e) => ({
        exercicioId: e.exercicioId,
        nome: e.nome,
        grupo: e.grupo,
        semCarga: !!e.semCarga,
        series: e.series,
        repMin: e.repMin,
        repMax: e.repMax,
        intervalo: e.intervalo,
        carga: e.semCarga ? null : (ultimaCarga(e.exercicioId, treino.id) ?? e.carga ?? null),
        reps: '',
        feito: false,
      })),
    };
    salvarExecucaoLocal();
    abrirExecucao();
  }

  function abrirExecucao() {
    if (!execucao) return;
    $('#exec-nome').textContent = `${execucao.treinoNome}${execucao.treinoFoco ? ` · ${execucao.treinoFoco}` : ''}`;
    $('#execucao').hidden = false;
    document.body.classList.add('sem-rolagem');
    renderExecucao();
    iniciarCronometro();
  }

  function fecharExecucao() {
    $('#execucao').hidden = true;
    document.body.classList.remove('sem-rolagem');
    pararCronometro();
  }

  function iniciarCronometro() {
    pararCronometro();
    const tick = () => {
      const seg = Math.max(0, Math.floor((Date.now() - new Date(execucao.ts).getTime()) / 1000));
      const h = Math.floor(seg / 3600);
      const m = Math.floor((seg % 3600) / 60);
      const s = seg % 60;
      const p2 = (n) => String(n).padStart(2, '0');
      $('#exec-cronometro').textContent = h ? `${h}:${p2(m)}:${p2(s)}` : `${p2(m)}:${p2(s)}`;
    };
    tick();
    cronometro = setInterval(tick, 1000);
  }

  function pararCronometro() {
    if (cronometro) clearInterval(cronometro);
    cronometro = null;
  }

  function renderExecucao() {
    const wrap = $('#exec-itens');
    wrap.innerHTML = execucao.itens
      .map((it, i) => {
        const anterior = ultimaCarga(it.exercicioId, execucao.treinoId);
        const reps = it.repMin === it.repMax ? `${it.repMin}` : `${it.repMin} a ${it.repMax}`;
        return `
        <div class="exec-item${it.feito ? ' feito' : ''}" data-i="${i}">
          <div class="exec-item-head">
            <label class="exec-check">
              <input type="checkbox" class="ex-feito" ${it.feito ? 'checked' : ''} aria-label="Marcar ${esc(it.nome)} como feito" />
              <span class="exec-nome">${esc(it.nome)}</span>
            </label>
            <span class="exec-alvo">${it.series} x ${reps}</span>
          </div>
          <div class="exec-campos">
            ${it.semCarga
              ? '<div class="exec-sem-carga">Sem carga externa</div>'
              : `<div class="field">
                   <label>Carga (kg)</label>
                   <input type="number" class="ex-carga" min="0" step="0.5" value="${it.carga ?? ''}" inputmode="decimal" />
                 </div>`}
            <div class="field">
              <label>Repetições feitas</label>
              <input type="text" class="ex-reps" value="${esc(it.reps)}" placeholder="ex.: 12/10/8" />
            </div>
            ${it.intervalo ? `<button class="btn ex-descanso" type="button" data-seg="${it.intervalo}">Descanso ${it.intervalo}s</button>` : ''}
          </div>
          ${!it.semCarga && anterior != null ? `<p class="exec-anterior">Última vez: ${fmt(anterior)} kg</p>` : ''}
        </div>`;
      })
      .join('');
    atualizarResumoExecucao();
  }

  function atualizarResumoExecucao() {
    const feitos = execucao.itens.filter((i) => i.feito).length;
    $('#exec-resumo').textContent = `${feitos} de ${execucao.itens.length} exercícios concluídos`;
  }

  function descanso(botao, segundos) {
    if (botao.dataset.rodando === '1') return;
    botao.dataset.rodando = '1';
    let resta = segundos;
    const rotulo = botao.textContent;
    const tick = () => {
      botao.textContent = `${resta}s`;
      if (resta <= 0) {
        clearInterval(t);
        botao.dataset.rodando = '0';
        botao.textContent = rotulo;
        botao.classList.remove('descansando');
        if (navigator.vibrate) navigator.vibrate(200);
        return;
      }
      resta--;
    };
    botao.classList.add('descansando');
    tick();
    const t = setInterval(tick, 1000);
  }

  async function finalizarTreino() {
    const itens = execucao.itens.map((i) => ({
      exercicioId: i.exercicioId,
      nome: i.nome,
      grupo: i.grupo,
      carga: i.carga == null || i.carga === '' ? null : Number(i.carga),
      reps: i.reps || '',
      feito: !!i.feito,
    }));
    if (!itens.some((i) => i.feito || i.carga != null)) {
      alert('Marque pelo menos um exercício ou informe uma carga antes de finalizar.');
      return;
    }
    await MacroDB.saveSessao({
      treinoId: execucao.treinoId,
      treinoNome: execucao.treinoNome,
      ts: execucao.ts,
      fimTs: new Date().toISOString(),
      itens,
    });
    // a carga do dia vira a carga padrão do treino para a próxima vez
    const treino = treinos.find((t) => t.id === execucao.treinoId);
    if (treino) {
      let mudou = false;
      for (const ex of treino.exercicios || []) {
        const feito = itens.find((i) => i.exercicioId === ex.exercicioId && i.carga != null);
        if (feito && feito.carga !== ex.carga) {
          ex.carga = feito.carga;
          mudou = true;
        }
      }
      if (mudou) await MacroDB.saveTreino(treino);
    }
    execucao = null;
    salvarExecucaoLocal();
    fecharExecucao();
    await carregar();
  }

  /* ---- Editor de treino ---- */

  function abrirEditor(treino) {
    emEdicao = treino
      ? JSON.parse(JSON.stringify(treino))
      : { nome: '', foco: '', exercicios: [] };
    $('#mt-titulo').textContent = treino ? 'Editar treino' : 'Novo treino';
    $('#mt-nome').value = emEdicao.nome || '';
    $('#mt-foco').value = emEdicao.foco || '';
    $('#mt-excluir').hidden = !treino;
    renderEditor();
    $('#modal-treino').classList.add('open');
  }

  function fecharEditor() {
    $('#modal-treino').classList.remove('open');
    emEdicao = null;
  }

  function renderEditor() {
    const wrap = $('#mt-exercicios');
    if (!emEdicao.exercicios.length) {
      wrap.innerHTML = '<p class="sub">Nenhum exercício ainda. Use o botão abaixo para escolher da lista da academia.</p>';
      return;
    }
    wrap.innerHTML = emEdicao.exercicios
      .map(
        (e, i) => `
      <div class="mt-ex" data-i="${i}">
        <div class="mt-ex-head">
          <span class="mt-ex-nome">${esc(e.nome)}</span>
          <span class="mt-ex-tag">${esc(e.grupo)}${e.equipamento ? ` · ${esc(e.equipamento)}` : ''}</span>
          <span class="mt-ex-acoes">
            <button class="btn btn-ghost act-sobe" type="button" ${i === 0 ? 'disabled' : ''} aria-label="Subir">↑</button>
            <button class="btn btn-ghost act-desce" type="button" ${i === emEdicao.exercicios.length - 1 ? 'disabled' : ''} aria-label="Descer">↓</button>
            <button class="btn btn-ghost btn-danger-text act-remove" type="button" aria-label="Remover">×</button>
          </span>
        </div>
        <div class="mt-ex-campos">
          <div class="field"><label>Séries</label><input type="number" class="c-series" min="1" max="20" value="${e.series}" /></div>
          <div class="field"><label>Rep. mín.</label><input type="number" class="c-repmin" min="1" max="100" value="${e.repMin}" /></div>
          <div class="field"><label>Rep. máx.</label><input type="number" class="c-repmax" min="1" max="100" value="${e.repMax}" /></div>
          ${e.semCarga ? '' : `<div class="field"><label>Carga (kg)</label><input type="number" class="c-carga" min="0" step="0.5" value="${e.carga ?? ''}" /></div>`}
          <div class="field"><label>Intervalo (s)</label><input type="number" class="c-intervalo" min="0" step="15" value="${e.intervalo ?? 60}" /></div>
        </div>
      </div>`
      )
      .join('');
  }

  function lerEditor() {
    $$('#mt-exercicios .mt-ex').forEach((el) => {
      const ex = emEdicao.exercicios[Number(el.dataset.i)];
      const num = (sel, padrao) => {
        const campo = $(sel, el);
        if (!campo) return padrao;
        const v = Number(campo.value);
        return Number.isFinite(v) && campo.value !== '' ? v : padrao;
      };
      ex.series = num('.c-series', ex.series);
      ex.repMin = num('.c-repmin', ex.repMin);
      ex.repMax = num('.c-repmax', ex.repMax);
      ex.intervalo = num('.c-intervalo', ex.intervalo);
      const campoCarga = $('.c-carga', el);
      if (campoCarga) ex.carga = campoCarga.value === '' ? null : Number(campoCarga.value);
    });
    emEdicao.nome = $('#mt-nome').value.trim();
    emEdicao.foco = $('#mt-foco').value.trim();
  }

  /* ---- Escolher exercício ---- */

  let aoEscolher = null;

  function abrirEscolher(callback) {
    aoEscolher = callback;
    $('#me-busca').value = '';
    $('#me-grupo').value = '';
    $('#me-equip').value = '';
    renderEscolher();
    $('#modal-escolher').classList.add('open');
    setTimeout(() => $('#me-busca').focus(), 50);
  }

  function renderEscolher() {
    const achados = filtrarExercicios({
      termo: $('#me-busca').value,
      grupo: $('#me-grupo').value,
      equipamento: $('#me-equip').value,
    });
    $('#me-resultados').innerHTML = achados.length
      ? achados
          .slice(0, 120)
          .map(
            (e) => `<button class="escolher-item" type="button" data-id="${e.id}">
              <span class="ei-nome">${esc(e.nome)}</span>
              <span class="ei-tag">${esc(e.grupo)} · ${esc(e.equipamento)}</span>
            </button>`
          )
          .join('')
      : '<p class="sub">Nenhum exercício encontrado com esses filtros.</p>';
  }

  /* ---- Biblioteca (aba) ---- */

  function renderBiblioteca() {
    const achados = filtrarExercicios({
      termo: $('#inp-busca-ex').value,
      grupo: $('#sel-grupo-ex').value,
      equipamento: $('#sel-equip-ex').value,
    });
    $('#biblioteca-sub').textContent = `${achados.length} de ${BIBLIOTECA().length} exercícios disponíveis na academia`;
    const porGrupo = new Map();
    for (const e of achados) {
      if (!porGrupo.has(e.grupo)) porGrupo.set(e.grupo, []);
      porGrupo.get(e.grupo).push(e);
    }
    $('#lista-exercicios').innerHTML = [...porGrupo.entries()]
      .map(
        ([grupo, itens]) => `
      <div class="bib-grupo">
        <h3>${esc(grupo)} <span class="bib-qtd">${itens.length}</span></h3>
        <div class="bib-itens">
          ${itens.map((e) => `<div class="bib-item"><span>${esc(e.nome)}</span><span class="ei-tag">${esc(e.equipamento)}</span></div>`).join('')}
        </div>
      </div>`
      )
      .join('') || '<p class="sub">Nenhum exercício com esses filtros.</p>';
  }

  /* ---- Evolução ---- */

  function destruirCharts() {
    for (const c of chartsEvo) c.destroy();
    chartsEvo = [];
  }

  function renderEvolucao() {
    destruirCharts();
    const treinoId = $('#sel-evo-treino').value;
    const dias = Number($('#sel-evo-periodo').value);
    const limite = dias ? Date.now() - dias * 86400000 : 0;
    const relevantes = sessoes.filter(
      (s) => (!treinoId || s.treinoId === treinoId) && new Date(s.ts).getTime() >= limite
    );

    if (!relevantes.length) {
      $('#evo-resumo').innerHTML = '';
      $('#evo-graficos').innerHTML =
        '<div class="empty-state"><p>Nenhuma execução registrada neste período.</p><p class="sub">Inicie um treino e informe a carga de cada exercício para ver a progressão aqui.</p></div>';
      return;
    }

    // série de carga por exercício, na ordem em que apareceram no treino
    const porExercicio = new Map();
    for (const s of relevantes) {
      for (const it of s.itens || []) {
        if (it.carga == null) continue;
        if (!porExercicio.has(it.exercicioId)) porExercicio.set(it.exercicioId, { nome: it.nome, pontos: [] });
        porExercicio.get(it.exercicioId).pontos.push({ ts: s.ts, carga: it.carga });
      }
    }

    const totalSessoes = relevantes.length;
    const evoluiram = [...porExercicio.values()].filter(
      (e) => e.pontos.length > 1 && e.pontos[e.pontos.length - 1].carga > e.pontos[0].carga
    ).length;
    $('#evo-resumo').innerHTML = `
      <div class="tiles">
        <div class="tile"><div class="t-label">Execuções</div><div class="t-value">${totalSessoes}</div><div class="t-sub">no período</div></div>
        <div class="tile"><div class="t-label">Exercícios com carga</div><div class="t-value">${porExercicio.size}</div><div class="t-sub">registrados</div></div>
        <div class="tile"><div class="t-label">Com evolução</div><div class="t-value">${evoluiram}</div><div class="t-sub">carga maior que a primeira</div></div>
      </div>`;

    const wrap = $('#evo-graficos');
    wrap.innerHTML = [...porExercicio.entries()]
      .map(([id, e]) => {
        const ini = e.pontos[0].carga;
        const fim = e.pontos[e.pontos.length - 1].carga;
        const dif = fim - ini;
        const sinal = dif > 0 ? 'sobe' : dif < 0 ? 'desce' : 'igual';
        const rotulo = dif === 0 ? 'mantida' : `${dif > 0 ? '+' : '−'}${fmt(Math.abs(dif))} kg`;
        return `
        <div class="chart-card">
          <div class="evo-head">
            <h3>${esc(e.nome)}</h3>
            <span class="evo-delta ${sinal}">${rotulo}</span>
          </div>
          <p class="sub">${fmt(ini)} kg → ${fmt(fim)} kg · ${e.pontos.length} ${e.pontos.length === 1 ? 'registro' : 'registros'}</p>
          <div class="chart-wrap small"><canvas id="evo-${esc(id)}"></canvas></div>
        </div>`;
      })
      .join('');

    if (typeof Chart === 'undefined') return;
    const ink2 = cssVar('--ink-2');
    const muted = cssVar('--muted');
    const grid = cssVar('--grid');
    for (const [id, e] of porExercicio.entries()) {
      const cv = document.getElementById(`evo-${id}`);
      if (!cv) continue;
      chartsEvo.push(
        new Chart(cv, {
          type: 'line',
          data: {
            labels: e.pontos.map((p) => dataBr(p.ts)),
            datasets: [
              {
                label: 'Carga (kg)',
                data: e.pontos.map((p) => p.carga),
                borderColor: cssVar('--accent'),
                backgroundColor: cssVar('--accent'),
                borderWidth: 2,
                pointRadius: 3,
                tension: 0.2,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: { callbacks: { label: (ctx) => ` ${fmt(ctx.parsed.y)} kg` } },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: muted, font: { size: 11 }, maxRotation: 0, autoSkip: true } },
              y: {
                grid: { color: grid, drawTicks: false },
                border: { display: false },
                ticks: { color: muted, font: { size: 11 }, maxTicksLimit: 5, callback: (v) => `${v} kg` },
              },
            },
          },
        })
      );
      void ink2;
    }
  }

  /* ---- Histórico de um treino ---- */

  function mostrarHistorico(treino) {
    const lista = sessoesDe(treino.id).slice().reverse();
    if (!lista.length) {
      alert(`${treino.nome} ainda não foi executado.`);
      return;
    }
    const linhas = lista
      .slice(0, 12)
      .map((s) => {
        const itens = (s.itens || [])
          .filter((i) => i.carga != null || i.feito)
          .map((i) => `${i.nome}${i.carga != null ? `: ${fmt(i.carga)} kg` : ''}${i.reps ? ` (${i.reps})` : ''}`)
          .join('\n  ');
        return `${dataBr(s.ts)}\n  ${itens || 'sem cargas registradas'}`;
      })
      .join('\n\n');
    alert(`${treino.nome} — ${lista.length} ${lista.length === 1 ? 'execução' : 'execuções'}\n\n${linhas}`);
  }

  /* ---- Abas ---- */

  function trocarAba(aba) {
    $$('#subnav-treino button').forEach((b) => b.classList.toggle('active', b.dataset.aba === aba));
    $('#aba-lista').hidden = aba !== 'lista';
    $('#aba-evolucao').hidden = aba !== 'evolucao';
    $('#aba-biblioteca').hidden = aba !== 'biblioteca';
    $('#btn-novo-treino').hidden = aba !== 'lista';
    if (aba === 'evolucao') renderEvolucao();
    if (aba === 'biblioteca') renderBiblioteca();
  }

  /* ---- Carregamento ---- */

  function preencherSelects() {
    const grupos = [...new Set(BIBLIOTECA().map((e) => e.grupo))];
    const equips = [...new Set(BIBLIOTECA().map((e) => e.equipamento))].sort();
    const opcoes = (lista) => lista.map((g) => `<option value="${esc(g)}">${esc(g)}</option>`).join('');
    $('#sel-grupo-ex').innerHTML = `<option value="">Todos</option>${opcoes(grupos)}`;
    $('#sel-equip-ex').innerHTML = `<option value="">Todos</option>${opcoes(equips)}`;
    $('#me-grupo').innerHTML = `<option value="">Todos</option>${opcoes(grupos)}`;
    $('#me-equip').innerHTML = `<option value="">Todos</option>${opcoes(equips)}`;
  }

  function preencherSelectTreinos() {
    const atual = $('#sel-evo-treino').value;
    $('#sel-evo-treino').innerHTML =
      `<option value="">Todos os treinos</option>` +
      treinos.map((t) => `<option value="${esc(t.id)}">${esc(t.nome)}${t.foco ? ` · ${esc(t.foco)}` : ''}</option>`).join('');
    if (atual) $('#sel-evo-treino').value = atual;
  }

  async function carregar() {
    [treinos, sessoes] = await Promise.all([MacroDB.getTreinos(), MacroDB.getSessoes()]);
    renderLista();
    preencherSelectTreinos();
    if (!$('#aba-evolucao').hidden) renderEvolucao();
  }

  async function init() {
    preencherSelects();
    await semearTreinos();
    await carregar();

    // execução interrompida (app minimizado, aba fechada) volta de onde parou
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_EXEC) || 'null');
      if (salvo && salvo.itens && Date.now() - new Date(salvo.ts).getTime() < 12 * 3600 * 1000) {
        execucao = salvo;
        abrirExecucao();
      } else if (salvo) {
        localStorage.removeItem(CHAVE_EXEC);
      }
    } catch {
      localStorage.removeItem(CHAVE_EXEC);
    }

    $('#subnav-treino').addEventListener('click', (ev) => {
      const b = ev.target.closest('button[data-aba]');
      if (b) trocarAba(b.dataset.aba);
    });

    $('#lista-treinos').addEventListener('click', async (ev) => {
      const card = ev.target.closest('.treino-card');
      if (!card) return;
      const treino = treinos.find((t) => t.id === card.dataset.id);
      if (!treino) return;
      if (ev.target.closest('.act-editar')) abrirEditor(treino);
      else if (ev.target.closest('.act-iniciar')) iniciarTreino(treino);
      else if (ev.target.closest('.act-historico')) mostrarHistorico(treino);
    });

    $('#btn-novo-treino').addEventListener('click', () => abrirEditor(null));

    /* editor */
    $('#mt-cancelar').addEventListener('click', fecharEditor);
    $('#modal-treino').addEventListener('click', (ev) => {
      if (ev.target === $('#modal-treino')) fecharEditor();
    });
    $('#mt-add').addEventListener('click', () => {
      lerEditor();
      abrirEscolher((ex) => {
        emEdicao.exercicios.push(montarItemTreino(ex.id));
        renderEditor();
      });
    });
    $('#mt-exercicios').addEventListener('click', (ev) => {
      const bloco = ev.target.closest('.mt-ex');
      if (!bloco) return;
      const i = Number(bloco.dataset.i);
      lerEditor();
      if (ev.target.closest('.act-remove')) emEdicao.exercicios.splice(i, 1);
      else if (ev.target.closest('.act-sobe') && i > 0)
        emEdicao.exercicios.splice(i - 1, 0, emEdicao.exercicios.splice(i, 1)[0]);
      else if (ev.target.closest('.act-desce') && i < emEdicao.exercicios.length - 1)
        emEdicao.exercicios.splice(i + 1, 0, emEdicao.exercicios.splice(i, 1)[0]);
      else return;
      renderEditor();
    });
    $('#mt-salvar').addEventListener('click', async () => {
      lerEditor();
      if (!emEdicao.nome) {
        alert('Dê um nome ao treino.');
        return;
      }
      for (const e of emEdicao.exercicios) {
        if (e.repMax < e.repMin) e.repMax = e.repMin;
      }
      await MacroDB.saveTreino(emEdicao);
      fecharEditor();
      await carregar();
    });
    $('#mt-excluir').addEventListener('click', async () => {
      if (!emEdicao || !emEdicao.id) return;
      if (!confirm(`Excluir “${emEdicao.nome}”? As execuções já registradas continuam no histórico.`)) return;
      await MacroDB.deleteTreino(emEdicao.id);
      fecharEditor();
      await carregar();
    });

    /* escolher exercício */
    for (const sel of ['#me-busca', '#me-grupo', '#me-equip']) {
      $(sel).addEventListener('input', renderEscolher);
    }
    $('#me-cancelar').addEventListener('click', () => $('#modal-escolher').classList.remove('open'));
    $('#modal-escolher').addEventListener('click', (ev) => {
      if (ev.target === $('#modal-escolher')) $('#modal-escolher').classList.remove('open');
    });
    $('#me-resultados').addEventListener('click', (ev) => {
      const b = ev.target.closest('.escolher-item');
      if (!b) return;
      const ex = acharExercicio(b.dataset.id);
      if (ex && aoEscolher) aoEscolher(ex);
      $('#modal-escolher').classList.remove('open');
    });

    /* biblioteca */
    for (const sel of ['#inp-busca-ex', '#sel-grupo-ex', '#sel-equip-ex']) {
      $(sel).addEventListener('input', renderBiblioteca);
    }

    /* evolução */
    $('#sel-evo-treino').addEventListener('change', renderEvolucao);
    $('#sel-evo-periodo').addEventListener('change', renderEvolucao);

    /* execução */
    $('#exec-itens').addEventListener('input', (ev) => {
      const bloco = ev.target.closest('.exec-item');
      if (!bloco) return;
      const it = execucao.itens[Number(bloco.dataset.i)];
      if (ev.target.classList.contains('ex-carga')) it.carga = ev.target.value === '' ? null : Number(ev.target.value);
      if (ev.target.classList.contains('ex-reps')) it.reps = ev.target.value;
      salvarExecucaoLocal();
    });
    $('#exec-itens').addEventListener('change', (ev) => {
      const bloco = ev.target.closest('.exec-item');
      if (!bloco || !ev.target.classList.contains('ex-feito')) return;
      const it = execucao.itens[Number(bloco.dataset.i)];
      it.feito = ev.target.checked;
      bloco.classList.toggle('feito', it.feito);
      atualizarResumoExecucao();
      salvarExecucaoLocal();
    });
    $('#exec-itens').addEventListener('click', (ev) => {
      const b = ev.target.closest('.ex-descanso');
      if (b) descanso(b, Number(b.dataset.seg));
    });
    $('#exec-sair').addEventListener('click', () => {
      fecharExecucao(); // a execução fica guardada para retomar
    });
    $('#exec-finalizar').addEventListener('click', finalizarTreino);
    $('#exec-finalizar-2').addEventListener('click', finalizarTreino);
    $('#exec-descartar').addEventListener('click', () => {
      if (!confirm('Descartar esta execução? Nada será salvo.')) return;
      execucao = null;
      salvarExecucaoLocal();
      fecharExecucao();
    });

    document.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Escape') return;
      if ($('#modal-escolher').classList.contains('open')) $('#modal-escolher').classList.remove('open');
      else if ($('#modal-treino').classList.contains('open')) fecharEditor();
      else if (!$('#execucao').hidden) fecharExecucao();
    });

    document.addEventListener('treinos:refresh', carregar);
    MacroDB.onChange((tipo) => {
      if (tipo === 'limpeza' || tipo === 'treino' || tipo === 'sessao') carregar();
    });
  }

  if (document.getElementById('lista-treinos')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
