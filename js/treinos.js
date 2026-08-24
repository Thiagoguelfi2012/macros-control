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
  // eixo com uma data por execução: dia/mês cabe onde a data cheia não caberia
  const dataCurta = (iso) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

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
    // cardio se acompanha por tempo e frequência cardíaca, não só por carga
    const cardio = !!base && base.equipamento === 'Cardio';
    return {
      registraTempo: cardio,
      registraBpm: cardio,
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

  // Frequência da semana corrente, no alto da aba Treinos: um círculo por dia
  // (segunda a domingo), marcado quando houve treino — inclusive os importados.
  const DIAS_SIGLA = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
  let semanaOffset = 0; // 0 = semana atual, -1 = anterior, e assim por diante

  const segundaDe = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
  };

  // até onde dá para voltar: a semana do primeiro registro
  function offsetMinimo() {
    if (!sessoes.length) return 0;
    const atual = segundaDe(new Date());
    const primeira = segundaDe(new Date(sessoes[0].ts));
    return -Math.round((atual - primeira) / (7 * 86400000));
  }

  function renderFreqSemana() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const segunda = new Date(hoje);
    segunda.setDate(segunda.getDate() - ((segunda.getDay() + 6) % 7) + semanaOffset * 7);

    const chave = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    const treinados = new Map();
    for (const s of sessoes) {
      const d = new Date(s.ts);
      d.setHours(0, 0, 0, 0);
      const k = chave(d);
      if (!treinados.has(k)) treinados.set(k, []);
      treinados.get(k).push(s.treinoNome || 'Treino');
    }

    const dias = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(segunda);
      d.setDate(d.getDate() + i);
      return { data: d, nomes: treinados.get(chave(d)) || [], hoje: d.getTime() === hoje.getTime(), futuro: d > hoje };
    });
    const feitos = dias.filter((d) => d.nomes.length).length;

    // ritmo das 4 semanas anteriores à exibida, para dar contexto ao número
    const semanas = [];
    for (let i = 1; i <= 4; i++) {
      const ini = new Date(segunda);
      ini.setDate(ini.getDate() - 7 * i);
      const fim = new Date(ini);
      fim.setDate(fim.getDate() + 7);
      const n = new Set(
        sessoes
          .map((s) => {
            const d = new Date(s.ts);
            d.setHours(0, 0, 0, 0);
            return d;
          })
          .filter((d) => d >= ini && d < fim)
          .map(chave)
      ).size;
      semanas.push(n);
    }
    const anteriores = semanas.filter((n) => n > 0);
    const media = anteriores.length
      ? Math.round((anteriores.reduce((a, b) => a + b, 0) / anteriores.length) * 10) / 10
      : null;

    const domingo = new Date(segunda);
    domingo.setDate(domingo.getDate() + 6);
    const dm = (d) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    const quando =
      semanaOffset === 0 ? 'esta semana' : semanaOffset === -1 ? 'semana passada' : `${-semanaOffset} semanas atrás`;


    $('#freq-semana').innerHTML = `
      <div class="semana-card">
        <div class="semana-topo">
          <button class="btn btn-ghost sem-nav" data-passo="-1" aria-label="Semana anterior"
            ${semanaOffset <= offsetMinimo() ? 'disabled' : ''}>‹</button>
          <div class="semana-tit">
            <h3>Frequência da semana</h3>
            <span class="semana-periodo">${dm(segunda)} a ${dm(domingo)} · ${quando}</span>
          </div>
          <button class="btn btn-ghost sem-nav" data-passo="1" aria-label="Próxima semana"
            ${semanaOffset >= 0 ? 'disabled' : ''}>›</button>
        </div>
        <div class="semana-dias">
          ${dias.map((d, i) => `
            <div class="semana-dia${d.nomes.length ? ' treinou' : ''}${d.hoje ? ' hoje' : ''}${d.futuro ? ' futuro' : ''}"
                 title="${d.data.toLocaleDateString('pt-BR')}${d.nomes.length ? ` — ${esc(d.nomes.join(', '))}` : ''}">
              <span class="sd-bola">${d.nomes.length ? (d.nomes.length > 1 ? d.nomes.length : '✓') : ''}</span>
              <span class="sd-letra">${DIAS_SIGLA[i]}</span>
              <span class="sd-num">${d.data.getDate()}</span>
            </div>`).join('')}
        </div>
        <p class="semana-sub">
          <b>${feitos}</b> ${feitos === 1 ? 'dia' : 'dias'} com treino${media != null
            ? ` · média de ${fmt(media)} ${anteriores.length === 1 ? 'na semana anterior' : `nas ${anteriores.length} semanas anteriores`}`
            : ''}
        </p>
        <p class="semana-dica">Arraste para o lado para ver outras semanas</p>
      </div>`;
  }

  function andarSemana(passo) {
    const antes = semanaOffset;
    semanaOffset = Math.min(0, Math.max(offsetMinimo(), semanaOffset + passo));
    if (semanaOffset !== antes) renderFreqSemana();
  }

  function renderLista() {
    renderFreqSemana();
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
            <button class="btn act-evolucao">Evolução</button>
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

  // Último valor registrado para aquele exercício, em qualquer treino — é ele
  // que aparece pronto no campo ao executar. A execução em andamento fica de
  // fora, senão o campo se referenciaria a si mesmo.
  function ultimoValor(exercicioId, campo, exceto) {
    for (let i = sessoes.length - 1; i >= 0; i--) {
      const s = sessoes[i];
      if (exceto && s.id === exceto) continue;
      const item = (s.itens || []).find(
        (x) => x.exercicioId === exercicioId && x[campo] != null && x.feito !== false
      );
      if (item) return item[campo];
    }
    return null;
  }
  const ultimaCarga = (exercicioId, exceto) => ultimoValor(exercicioId, 'carga', exceto);

  function iniciarTreino(treino) {
    execucao = {
      id: MacroDB.novoId(),
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
        registraTempo: !!e.registraTempo,
        registraBpm: !!e.registraBpm,
        carga: ultimaCarga(e.exercicioId) ?? e.carga ?? null,
        tempoMin: e.registraTempo
          ? ultimoValor(e.exercicioId, 'tempoMin') ?? (e.unidadeRep === 'min' ? e.repMax : null)
          : null,
        bpm: e.registraBpm ? ultimoValor(e.exercicioId, 'bpm') ?? null : null,
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
        const anterior = ultimaCarga(it.exercicioId, execucao.id);
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
            ${it.registraTempo ? `<div class="field">
              <label>Tempo (min)</label>
              <input type="number" class="ex-tempo" min="0" step="1" value="${it.tempoMin ?? ''}" inputmode="numeric" placeholder="—" />
            </div>` : ''}
            ${it.registraBpm ? `<div class="field">
              <label>BPM médio</label>
              <input type="number" class="ex-bpm" min="0" max="250" step="1" value="${it.bpm ?? ''}" inputmode="numeric" placeholder="—" />
            </div>` : ''}
            ${it.registraTempo && un
              ? '' /* o campo de tempo já cobre a série medida em minutos/segundos */
              : `<div class="field">
              <label>${un === 'seg' ? 'Tempo feito' : un === 'min' ? 'Minutos feitos' : 'Repetições feitas'}</label>
              <input type="text" class="ex-reps" value="${esc(it.reps)}" placeholder="${un ? `ex.: ${it.repMax}` : 'ex.: 12/10/8'}" />
            </div>`}
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

  // Monta os itens da execução: a carga só conta como registro quando o
  // exercício está marcado; o valor digitado sem marcar fica em cargaAnotada.
  const itensDaExecucao = () =>
    execucao.itens.map((i) => {
      const valor = i.carga == null || i.carga === '' ? null : Number(i.carga);
      return {
        exercicioId: i.exercicioId,
        nome: i.nome,
        grupo: i.grupo,
        unidadeCarga: i.unidadeCarga || 'kg',
        carga: i.feito ? valor : null,
        cargaAnotada: valor,
        tempoMin: i.feito && i.tempoMin != null && i.tempoMin !== '' ? Number(i.tempoMin) : null,
        bpm: i.feito && i.bpm != null && i.bpm !== '' ? Number(i.bpm) : null,
        reps: i.reps || '',
        feito: !!i.feito,
      };
    });

  // Marcar um exercício já grava o registro daquele dia, sem esperar o
  // Finalizar: se o app fechar no meio, o que foi feito não se perde.
  let gravandoSessao = null;
  function gravarParcial() {
    clearTimeout(gravandoSessao);
    gravandoSessao = setTimeout(async () => {
      if (!execucao) return;
      const itens = itensDaExecucao();
      const sessao = {
        id: execucao.id,
        treinoId: execucao.treinoId,
        treinoNome: execucao.treinoNome,
        ts: execucao.ts,
        emAndamento: true,
        itens,
      };
      ignorarRecarga = true;
      try {
        await MacroDB.saveSessao(sessao);
      } finally {
        ignorarRecarga = false;
      }
      // mantém a lista em memória coerente para o "última vez" dos próximos
      const i = sessoes.findIndex((x) => x.id === sessao.id);
      if (i >= 0) sessoes[i] = sessao;
      else sessoes.push(sessao);
    }, 300);
  }

  async function finalizarTreino() {
    clearTimeout(gravandoSessao);
    const itens = itensDaExecucao();
    const feitos = itens.filter((i) => i.feito).length;
    if (!feitos && !confirm('Nenhum exercício foi marcado como concluído. Finalizar assim? O treino ainda conta para a frequência e para o tempo treinado, mas nenhuma carga entra nos gráficos.')) return;
    const fim = new Date();
    const duracaoSeg = Math.max(0, Math.round((fim.getTime() - new Date(execucao.ts).getTime()) / 1000));
    await MacroDB.saveSessao({
      id: execucao.id,
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
        const feito = itens.find((i) => i.exercicioId === ex.exercicioId && i.feito && i.carga != null);
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
        <div class="mt-ex-registra">
          <span>Registrar também:</span>
          <label><input type="checkbox" class="c-reg-tempo" ${e.registraTempo ? 'checked' : ''} /> tempo (min)</label>
          <label><input type="checkbox" class="c-reg-bpm" ${e.registraBpm ? 'checked' : ''} /> BPM</label>
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
      const cTempo = $('.c-reg-tempo', el);
      if (cTempo) ex.registraTempo = cTempo.checked;
      const cBpm = $('.c-reg-bpm', el);
      if (cBpm) ex.registraBpm = cBpm.checked;
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

  // Escreve o valor de cada ponto (ou barra). Quando dois rótulos vizinhos
  // colidiriam, o segundo desce para baixo do ponto em vez de sumir: a ideia é
  // que todo ponto mostre o seu número.
  const rotulosDePonto = (sufixo) => ({
    id: 'rotulosDePonto',
    afterDatasetsDraw(chart) {
      const { ctx, chartArea } = chart;
      const ALTURA = 13;
      ctx.save();
      ctx.font = '600 11px ui-sans-serif, system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillStyle = cssVar('--ink');
      const desenhados = [];
      const bate = (r) =>
        desenhados.some((d) => r.x1 > d.x0 - 6 && r.x0 < d.x1 + 6 && r.y1 > d.y0 - 2 && r.y0 < d.y1 + 2);
      let pares = [];
      chart.data.datasets.forEach((ds, di) => {
        const meta = chart.getDatasetMeta(di);
        if (meta.hidden) return;
        const cor = chart.data.datasets.length > 1 ? ds.borderColor : null;
        const sfx = ds.sufixoRotulo || sufixo;
        const comValor = [];
        meta.data.forEach((ponto, i) => {
          const v = ds.data[i];
          if (v != null) comValor.push({ ponto, v, cor, sufixo: sfx });
        });
        // muitos pontos não cabem rotulados: fica só o que muda (mais o
        // primeiro e o último), que é justamente onde a progressão acontece;
        // se ainda for demais, sobram as pontas e os extremos
        let escolhidos = comValor;
        if (comValor.length * chart.data.datasets.length > 14) {
          escolhidos = comValor.filter(
            (x, i) => i === 0 || i === comValor.length - 1 || x.v !== comValor[i - 1].v
          );
          if (escolhidos.length > 8) {
            const vals = comValor.map((x) => x.v);
            const min = Math.min(...vals);
            const max = Math.max(...vals);
            escolhidos = comValor
              .filter((x, i) => i === 0 || i === comValor.length - 1 || x.v === min || x.v === max)
              .filter((x, i, arr) => i === 0 || x.v !== arr[i - 1].v);
          }
        }
        pares = pares.concat(escolhidos);
      });
      pares.forEach(({ ponto, v, cor, sufixo: sfx }) => {
        const texto = `${fmt(v)}${sfx ? ` ${sfx}` : ''}`;
        ctx.fillStyle = cor || cssVar('--ink');
        const meia = ctx.measureText(texto).width / 2;
        // sem vazar pelas laterais do gráfico
        const x = Math.min(Math.max(ponto.x, chartArea.left + meia), chartArea.right - meia);
        // sempre acima do ponto; se colidir com um rótulo já escrito, sobe um
        // degrau — assim todo ponto mostra o seu valor sem sobreposição
        let y = ponto.y - 9;
        let livre = false;
        for (let passo = 0; passo < 5; passo++) {
          const r = { x0: x - meia, x1: x + meia, y0: y - ALTURA, y1: y };
          if (!bate(r)) {
            livre = true;
            break;
          }
          y -= ALTURA;
        }
        // não escreve fora da área do gráfico: melhor faltar um rótulo do que
        // ele aparecer solto por cima do título
        if (!livre || y - ALTURA < chartArea.top - 22) return;
        desenhados.push({ x0: x - meia, x1: x + meia, y0: y - ALTURA, y1: y });
        ctx.fillText(texto, x, y);
      });
      ctx.restore();
    },
  });

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
      $('#evo-frequencia').innerHTML = '';
      $('#evo-graficos').innerHTML =
        '<div class="empty-state"><p>Nenhuma execução registrada neste período.</p><p class="sub">Inicie um treino e informe a carga de cada exercício para ver a progressão aqui.</p></div>';
      return;
    }

    // série de carga por exercício, na ordem em que apareceram no treino
    const porExercicio = new Map();
    for (const s of relevantes) {
      for (const it of s.itens || []) {
        if (it.feito === false) continue;
        const temAlgo = it.carga != null || it.tempoMin != null || it.bpm != null;
        if (!temAlgo) continue;
        if (!porExercicio.has(it.exercicioId))
          porExercicio.set(it.exercicioId, { nome: it.nome, unidadeCarga: it.unidadeCarga || 'kg', pontos: [] });
        const alvo = porExercicio.get(it.exercicioId);
        if (it.unidadeCarga) alvo.unidadeCarga = it.unidadeCarga;
        alvo.pontos.push({ ts: s.ts, carga: it.carga, tempoMin: it.tempoMin ?? null, bpm: it.bpm ?? null });
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

    // dias distintos com treino no período, e o ritmo por semana
    const diasComTreino = new Set(
      relevantes.map((x) => {
        const d = new Date(x.ts);
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      })
    );
    const primeiro = new Date(relevantes[0].ts);
    primeiro.setHours(0, 0, 0, 0);
    // a janela começa no filtro ou no primeiro registro, o que for mais recente:
    // dias anteriores ao início do uso não devem diluir a média
    const hojeMeiaNoite = new Date();
    hojeMeiaNoite.setHours(0, 0, 0, 0);
    const inicioFiltro = new Date(hojeMeiaNoite);
    if (dias) inicioFiltro.setDate(inicioFiltro.getDate() - (dias - 1));
    const inicioJanela = new Date(Math.max(dias ? inicioFiltro.getTime() : primeiro.getTime(), primeiro.getTime()));
    const diasJanela = Math.max(1, Math.round((hojeMeiaNoite - inicioJanela) / 86400000) + 1);
    const desdeOInicio = !dias || inicioJanela.getTime() === primeiro.getTime();
    const porSemana = Math.round((diasComTreino.size / diasJanela) * 7 * 10) / 10;

    // últimas semanas do período, cada uma com quantos dias tiveram treino
    const chaveSemana = (d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); // segunda-feira
      return x;
    };
    const semanas = new Map();
    for (const dia of diasComTreino) {
      const [y, m, dd] = dia.split('-').map(Number);
      const seg = chaveSemana(new Date(y, m, dd));
      const k = seg.getTime();
      if (!semanas.has(k)) semanas.set(k, { inicio: seg, dias: 0 });
      semanas.get(k).dias++;
    }
    const listaSemanas = [...semanas.values()].sort((a, b) => a.inicio - b.inicio).slice(-12);
    const maxSemana = Math.max(1, ...listaSemanas.map((x) => x.dias));
    $('#evo-frequencia').innerHTML = `
      <div class="chart-card freq-card">
        <h3>Frequência de treinos</h3>
        <p class="sub">Dias em que houve treino${desdeOInicio ? ', contados desde o primeiro registro' : ' no período'}</p>
        <div class="freq-numero">
          <b>${diasComTreino.size}</b>
          <span>${diasComTreino.size === 1 ? 'dia' : 'dias'} de ${diasJanela} · média de ${fmt(porSemana)} por semana</span>
        </div>
        ${listaSemanas.length > 1 ? `
        <div class="freq-semanas">
          ${listaSemanas.map((sem) => `
            <div class="freq-sem" title="Semana de ${sem.inicio.toLocaleDateString('pt-BR')}: ${sem.dias} ${sem.dias === 1 ? 'dia' : 'dias'}">
              <span class="freq-qtd">${sem.dias}</span>
              <span class="freq-barra" style="height:${Math.round((sem.dias / maxSemana) * 100)}%"></span>
              <span class="freq-rot">${sem.inicio.getDate()}/${sem.inicio.getMonth() + 1}</span>
            </div>`).join('')}
        </div>
        <p class="freq-legenda">Dias com treino por semana (segunda a domingo)</p>` : ''}
      </div>`;

    const wrap = $('#evo-graficos');
    const blocoDuracao = comDuracao.length > 1
      ? `<div class="chart-card">
           <div class="evo-head">
             <h3>Duração do treino</h3>
             <span class="evo-delta igual">último: ${minutos(comDuracao[comDuracao.length - 1].duracaoSeg)}</span>
           </div>
           <p class="sub">Tempo entre iniciar e finalizar cada treino · média de ${tempoMedio}</p>
           <div class="chart-wrap evo"><canvas id="evo-duracao"></canvas></div>
         </div>`
      : '';
    wrap.innerHTML = blocoDuracao + [...porExercicio.entries()]
      .map(([id, e]) => {
        const un = unCarga(e);
        // séries disponíveis para este exercício, na ordem de importância
        const series = [
          { campo: 'carga', rotulo: 'Carga', sufixo: un },
          { campo: 'tempoMin', rotulo: 'Tempo', sufixo: 'min' },
          { campo: 'bpm', rotulo: 'BPM', sufixo: 'bpm' },
        ].filter((sr) => e.pontos.some((p) => p[sr.campo] != null));
        e.series = series;
        const principal = series[0];
        const comValor = e.pontos.filter((p) => p[principal.campo] != null);
        const ini = comValor[0][principal.campo];
        const fim = comValor[comValor.length - 1][principal.campo];
        const dif = fim - ini;
        const sinal = dif > 0 ? 'sobe' : dif < 0 ? 'desce' : 'igual';
        const rotulo = dif === 0 ? 'mantida' : `${dif > 0 ? '+' : '−'}${fmt(Math.abs(dif))} ${principal.sufixo}`;
        const resumoOutras = series
          .slice(1)
          .map((sr) => {
            const vals = e.pontos.filter((p) => p[sr.campo] != null);
            const a2 = vals[0][sr.campo];
            const b2 = vals[vals.length - 1][sr.campo];
            return `${sr.rotulo} ${fmt(a2)} → ${fmt(b2)} ${sr.sufixo}`;
          })
          .join(' · ');
        return `
        <div class="chart-card">
          <div class="evo-head">
            <h3>${esc(e.nome)}</h3>
            <span class="evo-delta ${sinal}">${rotulo}</span>
          </div>
          <p class="sub">${principal.rotulo} ${fmt(ini)} ${principal.sufixo} → ${fmt(fim)} ${principal.sufixo}${resumoOutras ? ` · ${resumoOutras}` : ''} · ${e.pontos.length} ${e.pontos.length === 1 ? 'registro' : 'registros'}</p>
          <div class="chart-wrap evo"><canvas id="evo-${esc(id)}"></canvas></div>
        </div>`;
      })
      .join('');

    if (typeof Chart === 'undefined') return;
    const ink2 = cssVar('--ink-2');
    const muted = cssVar('--muted');
    const grid = cssVar('--grid');
    // Eixo X: uma marca por execução, sem pular nenhuma data.
    // Eixo Y: uma marca em cada carga que existe de fato, com uma folga em
    // cima e embaixo para os rótulos dos pontos não encostarem na borda.
    const eixos = (sufixo, valores) => {
      const unicos = valores ? [...new Set(valores)].sort((a, b) => a - b) : null;
      const min = unicos ? unicos[0] : 0;
      const max = unicos ? unicos[unicos.length - 1] : 0;
      const folga = Math.max((max - min) * 0.18, max * 0.05, 0.5);
      const nPontos = valores ? valores.length : 0;
      return {
        x: {
          grid: { color: grid, drawTicks: false },
          border: { display: false },
          ticks: {
            color: muted,
            font: { size: nPontos > 14 ? 9 : 10 },
            autoSkip: false,
            maxRotation: nPontos > 10 ? 90 : 45,
            minRotation: nPontos > 10 ? 90 : 45,
          },
        },
        y: {
          grid: { color: grid, drawTicks: false },
          border: { display: false },
          ...(unicos ? { min: min - folga, max: max + folga } : {}),
          ticks: {
            color: muted,
            font: { size: 11 },
            callback: (v) => `${fmt(v)} ${sufixo}`,
            ...(unicos ? { autoSkip: false } : { maxTicksLimit: 5 }),
          },
          ...(unicos
            ? {
                afterBuildTicks: (eixo) => {
                  eixo.ticks = unicos.map((v) => ({ value: v }));
                },
              }
            : {}),
        },
      };
    };

    const cvDur = document.getElementById('evo-duracao');
    if (cvDur) {
      chartsEvo.push(
        new Chart(cvDur, {
          type: 'bar',
          data: {
            labels: comDuracao.map((x) => dataCurta(x.ts)),
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
                  title: (itens) => dataBr(comDuracao[itens[0].dataIndex].ts),
                  label: (ctx) => ` ${ctx.parsed.y} min`,
                  afterLabel: (ctx) => comDuracao[ctx.dataIndex].treinoNome || '',
                },
              },
            },
            layout: { padding: { top: 24 } },
            scales: eixos('min', comDuracao.map((x) => Math.round(x.duracaoSeg / 60))),
          },
          plugins: [rotulosDePonto('min')],
        })
      );
    }
    for (const [id, e] of porExercicio.entries()) {
      const cv = document.getElementById(`evo-${id}`);
      if (!cv) continue;
      const un = unCarga(e);
      const CORES = { carga: cssVar('--accent'), tempoMin: cssVar('--s3'), bpm: cssVar('--s2') };
      const EIXO = { carga: 'y', tempoMin: 'yTempo', bpm: 'yBpm' };
      const series = e.series || [{ campo: 'carga', rotulo: 'Carga', sufixo: un }];
      const escalas = { x: eixos(un, e.pontos.map((p) => p.carga)).x };
      for (const [n, sr] of series.entries()) {
        const valores = e.pontos.map((p) => p[sr.campo]).filter((v) => v != null);
        const base = eixos(sr.sufixo, valores).y;
        escalas[EIXO[sr.campo]] = {
          ...base,
          position: n === 0 ? 'left' : 'right',
          grid: { ...base.grid, display: n === 0 },
          ticks: { ...base.ticks, color: series.length > 1 ? CORES[sr.campo] : base.ticks.color },
        };
      }
      chartsEvo.push(
        new Chart(cv, {
          type: 'line',
          data: {
            labels: e.pontos.map((p) => dataCurta(p.ts)),
            datasets: series.map((sr) => ({
              label: `${sr.rotulo} (${sr.sufixo})`,
              data: e.pontos.map((p) => p[sr.campo]),
              yAxisID: EIXO[sr.campo],
              sufixoRotulo: sr.sufixo,
              borderColor: CORES[sr.campo],
              backgroundColor: CORES[sr.campo],
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6,
              tension: 0,
              spanGaps: true,
              fill: false,
            })),
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: {
                display: series.length > 1,
                labels: { color: ink2, usePointStyle: true, pointStyleWidth: 10, boxHeight: 8, font: { size: 11 } },
              },
              tooltip: {
                callbacks: {
                  title: (itens) => dataBr(e.pontos[itens[0].dataIndex].ts),
                  label: (ctx) => ` ${ctx.dataset.label.split(' (')[0]}: ${fmt(ctx.parsed.y)} ${ctx.dataset.sufixoRotulo}`,
                },
              },
            },
            layout: { padding: { top: 30, bottom: 4 } },
            scales: escalas,
          },
          plugins: [rotulosDePonto()],
        })
      );
      void ink2;
    }
  }

  /* ---- Abas ---- */

  // O botão do cartão leva para a Evolução já filtrada naquele treino, em vez
  // de abrir um alerta com o histórico em texto.
  function verEvolucao(treino) {
    const sel = $('#sel-evo-treino');
    if ([...sel.options].some((o) => o.value === treino.id)) sel.value = treino.id;
    trocarAba('evolucao');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

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
    semanaOffset = Math.min(0, Math.max(offsetMinimo(), semanaOffset));
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
        if (!execucao.id) execucao.id = MacroDB.novoId(); // execução iniciada antes da gravação parcial
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
      else if (ev.target.closest('.act-evolucao')) verEvolucao(treino);
    });

    // navegação entre semanas: botões e arrasto lateral no cartão
    $('#freq-semana').addEventListener('click', (ev) => {
      const b = ev.target.closest('.sem-nav');
      if (b && !b.disabled) andarSemana(Number(b.dataset.passo));
    });
    let toque = null;
    $('#freq-semana').addEventListener(
      'touchstart',
      (ev) => {
        if (ev.touches.length !== 1) return;
        toque = { x: ev.touches[0].clientX, y: ev.touches[0].clientY };
      },
      { passive: true }
    );
    $('#freq-semana').addEventListener(
      'touchend',
      (ev) => {
        if (!toque || !ev.changedTouches.length) return;
        const dx = ev.changedTouches[0].clientX - toque.x;
        const dy = ev.changedTouches[0].clientY - toque.y;
        toque = null;
        // só gesto claramente horizontal, para não brigar com a rolagem
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
        andarSemana(dx > 0 ? -1 : 1); // arrastar para a direita volta no tempo
      },
      { passive: true }
    );

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
      if (ev.target.classList.contains('ex-tempo')) it.tempoMin = ev.target.value === '' ? null : Number(ev.target.value);
      if (ev.target.classList.contains('ex-bpm')) it.bpm = ev.target.value === '' ? null : Number(ev.target.value);
      if (ev.target.classList.contains('ex-reps')) it.reps = ev.target.value;
      salvarExecucaoLocal();
      if (it.feito) gravarParcial(); // mudou a carga de um já marcado: regrava
    });
    $('#exec-itens').addEventListener('change', (ev) => {
      const bloco = ev.target.closest('.exec-item');
      if (!bloco || !ev.target.classList.contains('ex-feito')) return;
      const it = execucao.itens[Number(bloco.dataset.i)];
      it.feito = ev.target.checked;
      bloco.classList.toggle('feito', it.feito);
      atualizarResumoExecucao();
      salvarExecucaoLocal();
      gravarParcial(); // marcar o exercício já cria o registro do dia
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
    $('#exec-descartar').addEventListener('click', async () => {
      if (!confirm('Descartar esta execução? Os exercícios já marcados também serão apagados.')) return;
      clearTimeout(gravandoSessao);
      const id = execucao.id;
      execucao = null;
      salvarExecucaoLocal();
      fecharExecucao();
      if (id) {
        await MacroDB.deleteSessao(id);
        const i = sessoes.findIndex((x) => x.id === id);
        if (i >= 0) sessoes.splice(i, 1);
      }
      await carregar();
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
