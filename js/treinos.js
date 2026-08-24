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

  /* ---- Miniatura do exercício e link para o vídeo ---- */

  // Uma cor por grupo muscular: a miniatura fica reconhecível de relance e
  // funciona nos dois temas (fundo é a mesma cor bem diluída).
  const COR_GRUPO = {
    Peito: '#2a78d6', Costas: '#1baf7a', Ombros: '#eb6834', Bíceps: '#8b5cf6',
    Tríceps: '#d946a6', Antebraço: '#0891b2', Trapézio: '#16a34a',
    Quadríceps: '#ca8a04', 'Posterior de coxa': '#ea580c', Glúteos: '#db2777',
    Adutores: '#7c3aed', Panturrilha: '#0d9488', Abdômen: '#dc2626',
    Lombar: '#65a30d', 'Corpo inteiro': '#4f46e5', Cardio: '#0ea5e9',
  };

  // Desenhos de linha por tipo de equipamento (viewBox 48x48).
  const DESENHO = {
    Barra: '<path d="M6 24h36M10 17v14M14 19v10M38 17v14M34 19v10"/>',
    Halteres: '<path d="M14 24h20M10 18v12M17 20v8M31 20v8M38 18v12"/>',
    Máquina: '<path d="M10 40V10h6v30M16 16h14a8 8 0 0 1 0 16H16M34 40h6V26"/><path d="M10 16h6M10 22h6M10 28h6"/>',
    Polia: '<circle cx="24" cy="11" r="4"/><path d="M24 15v13M18 28h12l-2 8H20z"/><path d="M20 40h8"/>',
    Smith: '<path d="M12 8v32M36 8v32M8 22h32M14 18v8M34 18v8"/>',
    'Peso corporal': '<circle cx="24" cy="11" r="4"/><path d="M24 15v13M14 20l10 4 10-4M18 40l6-12 6 12"/>',
    Kettlebell: '<path d="M19 18a5 5 0 0 1 10 0"/><path d="M17 18h14a10 10 0 0 1 4 8v8a4 4 0 0 1-4 4H17a4 4 0 0 1-4-4v-8a10 10 0 0 1 4-8z"/>',
    Anilha: '<circle cx="24" cy="24" r="14"/><circle cx="24" cy="24" r="5"/>',
    Funcional: '<path d="M6 30c6-12 12 12 18 0s12 12 18 0"/><path d="M6 20c6-12 12 12 18 0"/>',
    Cardio: '<circle cx="13" cy="33" r="7"/><circle cx="35" cy="33" r="7"/><path d="M13 33l8-14h8M21 19l8 14M29 19h6"/>',
  };

  const svgExercicio = (grupo, equipamento) => {
    const cor = COR_GRUPO[grupo] || '#2a78d6';
    const traco = DESENHO[equipamento] || DESENHO.Máquina;
    return `<svg class="ex-thumb-svg" viewBox="0 0 48 48" aria-hidden="true"
      style="--cor-ex:${cor}"><g fill="none" stroke="${cor}" stroke-width="2.4"
      stroke-linecap="round" stroke-linejoin="round">${traco}</g></svg>`;
  };

  const linkYoutube = (nome) =>
    `https://www.youtube.com/results?search_query=${encodeURIComponent(`${nome} execução correta`)}`;

  // miniatura clicável: abre a busca do exercício no YouTube
  const thumbExercicio = (e) => `
    <a class="ex-thumb" href="${linkYoutube(e.nome)}" target="_blank" rel="noopener noreferrer"
       title="Ver ${esc(e.nome)} no YouTube" aria-label="Ver ${esc(e.nome)} no YouTube"
       style="--cor-ex:${COR_GRUPO[e.grupo] || '#2a78d6'}">
      ${svgExercicio(e.grupo, e.equipamento)}
      <span class="ex-play" aria-hidden="true">▶</span>
    </a>`;

  const minutos = (seg) => {
    if (!seg) return '';
    const m = Math.round(seg / 60);
    if (m < 60) return `${m} min`;
    return `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
  };

  /* ---- Estado ---- */

  let treinos = [];
  let sessoes = [];
  let emEdicao = null; // treino sendo editado no modal
  let execucao = null; // { treinoId, treinoNome, ts, itens: [...] }
  let cronometro = null;
  let chartsEvo = [];
  // gravações feitas pela própria tela não devem redesenhar a lista por baixo
  // do usuário (ele pode estar com o dedo no campo de carga)
  let ignorarRecarga = false;
  const CHAVE_EXEC = 'sessaoEmAndamento';

  /* ---- Treino pré-configurado ---- */

  // O treino atual do usuário (MFIT Personal, professor Gustavo Gomes Soncin):
  // "Treino de força na academia — redução de gordura/hipertrofia — avançado".
  // Serve como ponto de partida na primeira abertura; depois é só editar.
  const SEMEADURA = 3; // subir aqui quando a ficha mudar
  // [exercicioId, séries, repMín, repMáx, carga, intervalo, unidade]
  const TREINOS_INICIAIS = [
    {
      nome: 'Treino 1',
      foco: 'P \\ Del \\ T',
      exercicios: [
        ['supino-inclinado-com-barra-reta', 3, 10, 12, 25, 60],
        ['supino-reto-com-halteres', 3, 10, 12, 12, 60],
        ['crossover-polia-alta', 3, 10, 12, 11, 60],
        ['desenvolvimento-maquina-pegada-neutra', 3, 10, 12, 18, 60],
        ['elevacao-lateral-unilateral-com-halteres', 3, 10, 12, 8, 60],
        ['triceps-testa-na-polia-com-corda', 3, 10, 12, 9, 60],
        ['triceps-paralelas-no-graviton', 3, 10, 12, 40, 60],
        ['prancha-alta', 3, 30, 45, 60, 60, 'seg', 'seg'],
        ['bicicleta', 1, 15, 15, 6, 0, 'min'],
      ],
    },
    {
      nome: 'Treino 2',
      foco: 'D \\ Trap \\ B',
      exercicios: [
        ['puxada-fechada-com-barra-reta', 3, 10, 12, 39, 60],
        ['remada-maquina-pegada-neutra', 3, 10, 12, 38, 60],
        ['crucifixo-inverso-na-maquina', 3, 10, 12, 38, 60],
        ['pulldown-barra-aberta', 3, 10, 12, 20, 60],
        ['rosca-direta-com-barra-h', 3, 10, 12, 12, 60],
        ['rosca-inversa-com-barra-w', 3, 10, 12, 20, 60],
        ['rosca-concentrada', 3, 10, 12, 10, 60],
        ['rosca-de-punho-pegada-supinada', 3, 10, 12, 20, 60],
        ['bicicleta', 1, 15, 15, 7, 0, 'min'],
      ],
    },
    {
      nome: 'Treino 3',
      foco: 'MMII \\ Abs',
      exercicios: [
        ['leg-press-45', 3, 10, 12, 120, 60],
        ['panturrilha-no-leg-press', 3, 10, 12, 100, 60],
        ['cadeira-extensora-unilateral', 3, 10, 12, 18, 60],
        ['mesa-flexora', 3, 10, 12, 23, 60],
        ['aducao-de-quadril-na-maquina-cadeira-adutora', 3, 10, 12, 36, 60],
        ['abducao-de-quadril-na-maquina-cadeira-abdutora', 3, 10, 12, 50, 60],
        ['abdominal-dead-bug', 3, 12, 14, null, 60],
        ['abdominal-na-maquina', 3, 14, 16, 48, 60],
        ['bicicleta', 1, 15, 15, 6, 0, 'min'],
      ],
    },
  ];

  // como as repetições são contadas: vezes, segundos (isometria) ou minutos (cardio)
  const UNIDADES = { rep: 'rep', seg: 'seg', min: 'min' };
  // a carga é o que o usuário registra para acompanhar a progressão: quilos na
  // maioria dos exercícios, segundos numa isometria, nível numa máquina de cardio
  const UNIDADES_CARGA = { kg: 'kg', seg: 'seg', min: 'min', nivel: 'nível' };
  const unCarga = (e) => UNIDADES_CARGA[e.unidadeCarga] || 'kg';
  const comCarga = (e, valor) => `${fmt(valor)} ${unCarga(e)}`;
  const rotuloCampoCarga = (e) =>
    ({ seg: 'Tempo (seg)', min: 'Tempo (min)', nivel: 'Nível' })[e.unidadeCarga] || 'Carga (kg)';
  const rotuloSerie = (e) => {
    const faixa = e.repMin === e.repMax ? `${e.repMin}` : `${e.repMin}-${e.repMax}`;
    const un = e.unidadeRep && e.unidadeRep !== 'rep' ? ` ${UNIDADES[e.unidadeRep]}` : '';
    return `${e.series}x${faixa}${un}`;
  };
  const rotuloAlvo = (e) => {
    const faixa = e.repMin === e.repMax ? `${e.repMin}` : `${e.repMin} a ${e.repMax}`;
    const un = e.unidadeRep && e.unidadeRep !== 'rep' ? ` ${UNIDADES[e.unidadeRep]}` : '';
    return `${e.series} x ${faixa}${un}`;
  };

  function montarItemTreino(exercicioId, series, repMin, repMax, carga, intervalo, unidadeRep, unidadeCarga) {
    const base = acharExercicio(exercicioId);
    return {
      id: MacroDB.novoId(),
      exercicioId,
      nome: base ? base.nome : exercicioId,
      grupo: base ? base.grupo : '',
      equipamento: base ? base.equipamento : '',
      series: series ?? 3,
      repMin: repMin ?? 10,
      repMax: repMax ?? 12,
      unidadeRep: unidadeRep || 'rep',
      unidadeCarga: unidadeCarga || 'kg',
      carga: carga ?? null,
      intervalo: intervalo ?? 60,
      obs: '',
    };
  }

  /* ---- Histórico de cargas vindo do MFIT Personal ---- */

  // Execuções anteriores ao app, lidas da tela "Progresso de Cargas" do MFIT.
  // As datas são as colunas; cada exercício traz a carga daquela coluna (null
  // quando não foi registrado naquele dia). Os ids das execuções são
  // determinísticos, então reimportar nunca duplica.
  const HISTORICO_VERSAO = 2;
  const HISTORICO_MFIT = {
    'Treino 1': {
      // 01/08 aparece duas vezes no MFIT: foram duas execuções no mesmo dia
      datas: [
        '2026-08-01T07:00', '2026-08-01T19:00', '2026-08-05T19:00', '2026-08-08T19:00',
        '2026-08-13T19:00', '2026-08-16T19:00', '2026-08-20T19:00',
      ],
      cargas: {
        'supino-inclinado-com-barra-reta': [20, 20, 20, 25, 25, 25, 25],
        'supino-reto-com-halteres': [8, 8, 8, 8, 10, 10, 12],
        'crossover-polia-alta': [9, 9, 9, 9, 11, 11, 11],
        'desenvolvimento-maquina-pegada-neutra': [16, 16, 16, 16, 16, 18, 18],
        'elevacao-lateral-unilateral-com-halteres': [6, 6, 6, 6, 6, 8, 8],
        'triceps-testa-na-polia-com-corda': [null, null, null, null, null, null, 9],
        'triceps-paralelas-no-graviton': [50, null, 50, 50, 50, 40, 40],
        'prancha-alta': [null, null, null, null, null, 60, 60],
        bicicleta: [5, null, 5, 5, 5, 6, 6],
      },
    },
    'Treino 2': {
      datas: [
        '2026-07-31T19:00', '2026-08-04T19:00', '2026-08-08T19:00', '2026-08-12T19:00',
        '2026-08-15T19:00', '2026-08-19T19:00', '2026-08-22T19:00',
      ],
      cargas: {
        'puxada-fechada-com-barra-reta': [29, 35, 37, 37, 39, 39, 39],
        'pulldown-barra-aberta': [14, 15, 15, 15, 18, 18, 20],
        'rosca-direta-com-barra-h': [null, 12, 12, 12, 12, 12, 12],
        'rosca-inversa-com-barra-w': [12.5, 12.5, 15, 15, 17, 20, 20],
        'remada-maquina-pegada-neutra': [29, 33, 34, 36, 38, 38, 38],
        'crucifixo-inverso-na-maquina': [23, 25, 28, 28, 31, 36, 38],
        'rosca-de-punho-pegada-supinada': [10, 10, 10, 10, 20, 20, 20],
        'rosca-concentrada': [6, 6, 6, 6, 8, 8, 10],
        bicicleta: [null, null, null, null, null, 7, 7],
      },
    },
    'Treino 3': {
      datas: [
        '2026-07-30T19:00', '2026-08-02T19:00', '2026-08-06T19:00', '2026-08-11T19:00',
        '2026-08-14T19:00', '2026-08-17T19:00', '2026-08-21T19:00',
      ],
      cargas: {
        'cadeira-extensora-unilateral': [14, 14, 14, 18, 18, 18, 18],
        'mesa-flexora': [18, 15, 15, 17, 18, 18, 23],
        'leg-press-45': [63, 75, 86, 100, 100, 100, 120],
        'panturrilha-no-leg-press': [52, 55, 68, 80, 80, 80, 100],
        'abdominal-na-maquina': [36, 36, 36, 43, 48, 48, 48],
        'aducao-de-quadril-na-maquina-cadeira-adutora': [29, 29, 29, 34, 34, 36, 36],
        'abducao-de-quadril-na-maquina-cadeira-abdutora': [29, 29, 36, 43, 43, 43, 50],
        bicicleta: [5, 5, 6, 6, 6, 6, 6],
      },
    },
  };

  async function importarHistorico() {
    if (Number(localStorage.getItem('historicoMfit') || 0) >= HISTORICO_VERSAO) return;
    const lista = await MacroDB.getTreinos();
    let sessoesCriadas = 0;
    ignorarRecarga = true;
    try {
      for (const [nomeTreino, h] of Object.entries(HISTORICO_MFIT)) {
        const treino = lista.find((t) => t.nome === nomeTreino);
        if (!treino) continue;
        for (const [i, quando] of h.datas.entries()) {
          const itens = [];
          for (const [exId, valores] of Object.entries(h.cargas)) {
            const carga = valores[i];
            if (carga == null) continue;
            const doTreino = (treino.exercicios || []).find((e) => e.exercicioId === exId);
            const base = doTreino || acharExercicio(exId);
            itens.push({
              exercicioId: exId,
              nome: base ? base.nome : exId,
              grupo: base ? base.grupo : '',
              unidadeCarga: (doTreino && doTreino.unidadeCarga) || 'kg',
              carga,
              reps: '',
              feito: true,
            });
          }
          if (!itens.length) continue;
          await MacroDB.saveSessao({
            id: `mfit-${treino.id}-${i}`,
            treinoId: treino.id,
            treinoNome: treino.nome,
            ts: new Date(quando).toISOString(),
            origem: 'MFIT Personal',
            itens,
          });
          sessoesCriadas++;
        }
      }
    } finally {
      ignorarRecarga = false;
    }
    localStorage.setItem('historicoMfit', String(HISTORICO_VERSAO));
    return sessoesCriadas;
  }

  async function semearTreinos() {
    const versao = Number(localStorage.getItem('treinosSemeados') || 0);
    if (versao >= SEMEADURA) return;
    const atuais = await MacroDB.getTreinos();
    if (atuais.length) {
      // já existe treino no aparelho: só substitui a semeadura antiga, e apenas
      // enquanto nenhuma execução foi registrada (aí o usuário já está usando)
      const jaUsou = (await MacroDB.getSessoes()).length > 0;
      const soSemeados = atuais.every((t) => TREINOS_INICIAIS.some((s) => s.nome === t.nome));
      if (versao === 0 || jaUsou || !soSemeados) {
        localStorage.setItem('treinosSemeados', String(SEMEADURA));
        return;
      }
      for (const t of atuais) await MacroDB.deleteTreino(t.id);
    }
    for (const [i, t] of TREINOS_INICIAIS.entries()) {
      await MacroDB.saveTreino({
        nome: t.nome,
        foco: t.foco,
        ordem: i,
        exercicios: t.exercicios.map((e) => montarItemTreino(...e)),
      });
    }
    localStorage.setItem('treinosSemeados', String(SEMEADURA));
  }

  /* ---- Aba: lista de treinos ---- */

  const sessoesDe = (treinoId) => sessoes.filter((s) => s.treinoId === treinoId);

  function resumoExecucoes(treinoId) {
    const lista = sessoesDe(treinoId);
    if (!lista.length) return 'Ainda não executado';
    const ultima = lista[lista.length - 1];
    const dur = ultima.duracaoSeg ? ` · ${minutos(ultima.duracaoSeg)}` : '';
    return `Executado ${lista.length} ${lista.length === 1 ? 'vez' : 'vezes'}, última em ${dataBr(ultima.ts)}${dur}`;
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
          ${qtd ? `<ul class="treino-previa">${t.exercicios
            .map((e) => `
              <li class="ex-linha" data-ex="${esc(e.id)}">
                ${thumbExercicio(e)}
                <span class="ex-info">
                  <span class="ex-nome">${esc(e.nome)}</span>
                  <span class="ex-serie">${rotuloSerie(e)}</span>
                </span>
                <span class="ex-carga-campo">
                  <input type="number" class="card-carga" min="0" step="${(e.unidadeCarga || 'kg') === 'kg' ? '0.5' : '1'}"
                    value="${e.carga ?? ''}" placeholder="—" inputmode="decimal"
                    aria-label="Carga de ${esc(e.nome)} em ${unCarga(e)}" />
                  <span class="ex-un">${unCarga(e)}</span>
                </span>
              </li>`)
            .join('')}</ul>` : '<p class="sub">Sem exercícios — toque em Editar para montar.</p>'}
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
        series: e.series,
        repMin: e.repMin,
        repMax: e.repMax,
        unidadeRep: e.unidadeRep || 'rep',
        unidadeCarga: e.unidadeCarga || 'kg',
        intervalo: e.intervalo,
        carga: ultimaCarga(e.exercicioId, treino.id) ?? e.carga ?? null,
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
      if (seg % 30 === 0) atualizarResumoExecucao();
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
        const un = it.unidadeRep && it.unidadeRep !== 'rep' ? UNIDADES[it.unidadeRep] : '';
        return `
        <div class="exec-item${it.feito ? ' feito' : ''}" data-i="${i}">
          <div class="exec-item-head">
            ${thumbExercicio(it)}
            <label class="exec-check">
              <input type="checkbox" class="ex-feito" ${it.feito ? 'checked' : ''} aria-label="Marcar ${esc(it.nome)} como feito" />
              <span class="exec-nome">${esc(it.nome)}</span>
            </label>
            <span class="exec-alvo">${rotuloAlvo(it)}</span>
          </div>
          <div class="exec-campos">
            <div class="field">
              <label>${rotuloCampoCarga(it)}</label>
              <input type="number" class="ex-carga" min="0" step="${it.unidadeCarga && it.unidadeCarga !== 'kg' ? '1' : '0.5'}" value="${it.carga ?? ''}" inputmode="decimal" placeholder="—" />
            </div>
            <div class="field">
              <label>${un === 'seg' ? 'Tempo feito' : un === 'min' ? 'Minutos feitos' : 'Repetições feitas'}</label>
              <input type="text" class="ex-reps" value="${esc(it.reps)}" placeholder="${un ? `ex.: ${it.repMax}` : 'ex.: 12/10/8'}" />
            </div>
            ${it.intervalo ? `<button class="btn ex-descanso" type="button" data-seg="${it.intervalo}">Descanso ${it.intervalo}s</button>` : ''}
          </div>
          ${anterior != null ? `<p class="exec-anterior">Última vez: ${comCarga(it, anterior)}</p>` : ''}
        </div>`;
      })
      .join('');
    atualizarResumoExecucao();
  }

  function atualizarResumoExecucao() {
    const feitos = execucao.itens.filter((i) => i.feito).length;
    const seg = Math.max(0, Math.floor((Date.now() - new Date(execucao.ts).getTime()) / 1000));
    $('#exec-resumo').textContent =
      `${feitos} de ${execucao.itens.length} exercícios concluídos · ${minutos(seg) || 'menos de 1 min'} de treino`;
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
      unidadeCarga: i.unidadeCarga || 'kg',
      carga: i.carga == null || i.carga === '' ? null : Number(i.carga),
      reps: i.reps || '',
      feito: !!i.feito,
    }));
    if (!itens.some((i) => i.feito || i.carga != null)) {
      alert('Marque pelo menos um exercício ou informe uma carga antes de finalizar.');
      return;
    }
    const fim = new Date();
    const duracaoSeg = Math.max(0, Math.round((fim.getTime() - new Date(execucao.ts).getTime()) / 1000));
    await MacroDB.saveSessao({
      treinoId: execucao.treinoId,
      treinoNome: execucao.treinoNome,
      ts: execucao.ts,
      fimTs: fim.toISOString(),
      duracaoSeg,
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
          <div class="field"><label>Rep. mín.</label><input type="number" class="c-repmin" min="1" max="1000" value="${e.repMin}" /></div>
          <div class="field"><label>Rep. máx.</label><input type="number" class="c-repmax" min="1" max="1000" value="${e.repMax}" /></div>
          <div class="field"><label>Un. da série</label>
            <select class="c-unidade">
              <option value="rep"${(e.unidadeRep || 'rep') === 'rep' ? ' selected' : ''}>reps</option>
              <option value="seg"${e.unidadeRep === 'seg' ? ' selected' : ''}>seg</option>
              <option value="min"${e.unidadeRep === 'min' ? ' selected' : ''}>min</option>
            </select>
          </div>
          <div class="field"><label>Carga</label><input type="number" class="c-carga" min="0" step="${(e.unidadeCarga || 'kg') === 'kg' ? '0.5' : '1'}" value="${e.carga ?? ''}" /></div>
          <div class="field"><label>Un. da carga</label>
            <select class="c-uncarga">
              <option value="kg"${(e.unidadeCarga || 'kg') === 'kg' ? ' selected' : ''}>kg</option>
              <option value="seg"${e.unidadeCarga === 'seg' ? ' selected' : ''}>seg</option>
              <option value="min"${e.unidadeCarga === 'min' ? ' selected' : ''}>min</option>
              <option value="nivel"${e.unidadeCarga === 'nivel' ? ' selected' : ''}>nível</option>
            </select>
          </div>
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
      const campoUn = $('.c-unidade', el);
      if (campoUn) ex.unidadeRep = campoUn.value;
      const campoUnCarga = $('.c-uncarga', el);
      if (campoUnCarga) ex.unidadeCarga = campoUnCarga.value;
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
        if (!porExercicio.has(it.exercicioId))
          porExercicio.set(it.exercicioId, { nome: it.nome, unidadeCarga: it.unidadeCarga || 'kg', pontos: [] });
        const alvo = porExercicio.get(it.exercicioId);
        if (it.unidadeCarga) alvo.unidadeCarga = it.unidadeCarga;
        alvo.pontos.push({ ts: s.ts, carga: it.carga });
      }
    }

    const totalSessoes = relevantes.length;
    const evoluiram = [...porExercicio.values()].filter(
      (e) => e.pontos.length > 1 && e.pontos[e.pontos.length - 1].carga > e.pontos[0].carga
    ).length;
    // duração: execuções esquecidas abertas (> 4 h) ficam fora das contas
    const LIMITE_DUR = 4 * 3600;
    const comDuracao = relevantes.filter((x) => x.duracaoSeg > 0 && x.duracaoSeg <= LIMITE_DUR);
    const somaDur = comDuracao.reduce((n, x) => n + x.duracaoSeg, 0);
    const tempoTotal = comDuracao.length ? minutos(somaDur) : '—';
    const tempoMedio = comDuracao.length ? minutos(somaDur / comDuracao.length) : '—';
    $('#evo-resumo').innerHTML = `
      <div class="tiles">
        <div class="tile"><div class="t-label">Execuções</div><div class="t-value">${totalSessoes}</div><div class="t-sub">no período</div></div>
        <div class="tile"><div class="t-label">Tempo treinado</div><div class="t-value">${tempoTotal}</div><div class="t-sub">${comDuracao.length ? `média de ${tempoMedio} por treino` : 'sem tempo registrado'}</div></div>
        <div class="tile"><div class="t-label">Exercícios com carga</div><div class="t-value">${porExercicio.size}</div><div class="t-sub">registrados</div></div>
        <div class="tile"><div class="t-label">Com evolução</div><div class="t-value">${evoluiram}</div><div class="t-sub">carga maior que a primeira</div></div>
      </div>`;

    const wrap = $('#evo-graficos');
    const blocoDuracao = comDuracao.length > 1
      ? `<div class="chart-card">
           <div class="evo-head">
             <h3>Duração do treino</h3>
             <span class="evo-delta igual">último: ${minutos(comDuracao[comDuracao.length - 1].duracaoSeg)}</span>
           </div>
           <p class="sub">Tempo entre iniciar e finalizar cada treino · média de ${tempoMedio}</p>
           <div class="chart-wrap small"><canvas id="evo-duracao"></canvas></div>
         </div>`
      : '';
    wrap.innerHTML = blocoDuracao + [...porExercicio.entries()]
      .map(([id, e]) => {
        const ini = e.pontos[0].carga;
        const fim = e.pontos[e.pontos.length - 1].carga;
        const dif = fim - ini;
        const sinal = dif > 0 ? 'sobe' : dif < 0 ? 'desce' : 'igual';
        const un = unCarga(e);
        const rotulo = dif === 0 ? 'mantida' : `${dif > 0 ? '+' : '−'}${fmt(Math.abs(dif))} ${un}`;
        return `
        <div class="chart-card">
          <div class="evo-head">
            <h3>${esc(e.nome)}</h3>
            <span class="evo-delta ${sinal}">${rotulo}</span>
          </div>
          <p class="sub">${fmt(ini)} ${un} → ${fmt(fim)} ${un} · ${e.pontos.length} ${e.pontos.length === 1 ? 'registro' : 'registros'}</p>
          <div class="chart-wrap small"><canvas id="evo-${esc(id)}"></canvas></div>
        </div>`;
      })
      .join('');

    if (typeof Chart === 'undefined') return;
    const ink2 = cssVar('--ink-2');
    const muted = cssVar('--muted');
    const grid = cssVar('--grid');
    const eixos = (sufixo) => ({
      x: { grid: { display: false }, ticks: { color: muted, font: { size: 11 }, maxRotation: 0, autoSkip: true } },
      y: {
        grid: { color: grid, drawTicks: false },
        border: { display: false },
        ticks: { color: muted, font: { size: 11 }, maxTicksLimit: 5, callback: (v) => `${v} ${sufixo}` },
      },
    });

    const cvDur = document.getElementById('evo-duracao');
    if (cvDur) {
      chartsEvo.push(
        new Chart(cvDur, {
          type: 'bar',
          data: {
            labels: comDuracao.map((x) => dataBr(x.ts)),
            datasets: [{
              label: 'Duração (min)',
              data: comDuracao.map((x) => Math.round(x.duracaoSeg / 60)),
              backgroundColor: cssVar('--accent'),
              borderWidth: 0,
              maxBarThickness: 28,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.parsed.y} min`,
                  afterLabel: (ctx) => comDuracao[ctx.dataIndex].treinoNome || '',
                },
              },
            },
            scales: eixos('min'),
          },
        })
      );
    }
    for (const [id, e] of porExercicio.entries()) {
      const cv = document.getElementById(`evo-${id}`);
      if (!cv) continue;
      const un = unCarga(e);
      chartsEvo.push(
        new Chart(cv, {
          type: 'line',
          data: {
            labels: e.pontos.map((p) => dataBr(p.ts)),
            datasets: [
              {
                label: `Carga (${un})`,
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
              tooltip: { callbacks: { label: (ctx) => ` ${fmt(ctx.parsed.y)} ${un}` } },
            },
            scales: eixos(un),
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
          .map((i) => `${i.nome}${i.carga != null ? `: ${comCarga(i, i.carga)}` : ''}${i.reps ? ` (${i.reps})` : ''}`)
          .join('\n  ');
        const extra = s.duracaoSeg ? ` · ${minutos(s.duracaoSeg)}` : s.origem ? ` · importado do ${s.origem}` : '';
        return `${dataBr(s.ts)}${extra}\n  ${itens || 'sem cargas registradas'}`;
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
    await importarHistorico();
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

    // a carga do cartão grava direto no treino, sem abrir o editor
    let gravando = null;
    $('#lista-treinos').addEventListener('change', async (ev) => {
      const campo = ev.target.closest('.card-carga');
      if (!campo) return;
      const card = campo.closest('.treino-card');
      const linha = campo.closest('.ex-linha');
      const treino = treinos.find((t) => t.id === card.dataset.id);
      const ex = treino && (treino.exercicios || []).find((x) => x.id === linha.dataset.ex);
      if (!ex) return;
      const novo = campo.value === '' ? null : Number(campo.value);
      if (novo === ex.carga) return;
      ex.carga = novo;
      clearTimeout(gravando);
      campo.classList.add('salvo');
      setTimeout(() => campo.classList.remove('salvo'), 900);
      gravando = setTimeout(async () => {
        ignorarRecarga = true;
        try {
          await MacroDB.saveTreino(treino);
        } finally {
          ignorarRecarga = false;
        }
        if (!$('#aba-evolucao').hidden) renderEvolucao();
      }, 250);
    });

    $('#lista-treinos').addEventListener('click', async (ev) => {
      // links e campos do cartão não devem virar ação do cartão
      if (ev.target.closest('.ex-thumb, .card-carga')) return;
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
    $('#mt-exercicios').addEventListener('change', (ev) => {
      if (ev.target.classList.contains('c-unidade')) lerEditor();
      if (ev.target.classList.contains('c-uncarga')) {
        lerEditor();
        renderEditor(); // o passo do campo de carga muda com a unidade
      }
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
      if (ignorarRecarga) return;
      if (tipo === 'limpeza' || tipo === 'treino' || tipo === 'sessao') carregar();
    });
  }

  if (document.getElementById('lista-treinos')) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  }
})();
