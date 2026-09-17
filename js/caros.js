/* Alimentos caros: os que fazem o dia estourar.

   Não é "alimento calórico" — é o alimento que aparece nos SEUS dias caros e
   quase não aparece nos outros. Ovo mexido tem caloria e aparece todo dia,
   inclusive nos estourados: ele não explica nada. Banoffee aparece seis vezes
   e cinco delas são dias estourados: esse explica.

   Por isso a régua tem três partes — o alimento precisa pesar (uma porção que
   move o dia), aparecer nos dias caros, e estar concentrado neles. */
const AlimentosCaros = (() => {
  // dia caro: o déficit do dia não chegou a 200 kcal, incluindo os dias que
  // passaram do gasto. Mesma régua do cartão "O que mudou".
  const DEFICIT_MINIMO = 200;
  // abaixo disso a porção não derruba um dia sozinha
  const KCAL_MINIMA = 200;
  // a maioria das aparições precisa cair em dia caro, senão é comida do dia a dia
  const CONCENTRACAO = 0.6;
  // duas aparições para não confundir coincidência com padrão — a exceção é a
  // porção enorme, que estoura o dia sozinha já na primeira vez
  const KCAL_DE_UMA_VEZ = 400;
  // a lista fica curta de propósito: aviso que dispara à toa vira aviso ignorado
  const MAXIMO = 12;
  const JANELA_DIAS = 90;

  const ehAgua = (e) =>
    typeof AguaAviso !== 'undefined'
      ? AguaAviso.ehAgua(e)
      : !!e.ml && (e.kcal || 0) <= 2;

  const chaveDia = (ts) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  // Agrupa por dia LOCAL: em UTC a ceia da meia-noite cairia no dia seguinte.
  function porDia(entries) {
    const mapa = new Map();
    for (const e of entries) {
      if (ehAgua(e)) continue;
      const k = chaveDia(e.ts);
      if (!mapa.has(k)) mapa.set(k, { ts: k, kcal: 0, p: 0, c: 0, g: 0, itens: [] });
      const b = mapa.get(k);
      b.kcal += e.kcal || 0;
      b.p += e.p || 0;
      b.c += e.c || 0;
      b.g += e.g || 0;
      b.itens.push(e);
    }
    const lista = [...mapa.values()].sort((a, b) => a.ts - b.ts);
    // dia meio registrado (o jantar que ninguém anotou, ou hoje de manhã) não
    // pode entrar: ele entraria como jejum e inventaria déficit
    const ord = lista.map((d) => d.kcal).sort((a, b) => a - b);
    const mediana = ord.length ? ord[Math.floor(ord.length / 2)] : 0;
    for (const d of lista) d.parcial = d.kcal < mediana * 0.5;
    return lista;
  }

  const ehDiaCaro = (dia, gastoDiario) => gastoDiario - dia.kcal < DEFICIT_MINIMO;

  // Lista ordenada pelo que cada alimento somou nos dias caros.
  function alimentosDe(dias, gastoDiario) {
    const uteis = dias.filter((d) => !d.parcial);
    const caros = uteis.filter((d) => ehDiaCaro(d, gastoDiario));
    if (!caros.length) return [];
    const mapa = new Map();
    for (const d of uteis) {
      const caro = ehDiaCaro(d, gastoDiario);
      for (const e of d.itens) {
        const nome = String(e.nome || '').trim();
        if (!nome) continue;
        if (!mapa.has(nome))
          mapa.set(nome, { nome, kcalCaros: 0, kcalTotal: 0, vezes: 0, vezesCaras: 0, dias: new Set() });
        const a = mapa.get(nome);
        a.kcalTotal += e.kcal || 0;
        a.vezes++;
        if (caro) {
          a.kcalCaros += e.kcal || 0;
          a.vezesCaras++;
          a.dias.add(d.ts);
        }
      }
    }
    return [...mapa.values()]
      .map((a) => ({
        ...a,
        diasCaros: a.dias.size,
        kcalMedia: a.vezes ? a.kcalTotal / a.vezes : 0,
        concentracao: a.vezes ? a.vezesCaras / a.vezes : 0,
      }))
      .filter(
        (a) =>
          a.kcalMedia >= KCAL_MINIMA &&
          a.concentracao >= CONCENTRACAO &&
          (a.vezesCaras >= 2 || a.kcalMedia >= KCAL_DE_UMA_VEZ)
      )
      .sort((a, b) => b.kcalCaros - a.kcalCaros)
      .slice(0, MAXIMO);
  }

  function analisar(entries, gastoDiario) {
    const dias = porDia(entries);
    const uteis = dias.filter((d) => !d.parcial);
    const caros = uteis.filter((d) => ehDiaCaro(d, gastoDiario));
    return {
      dias,
      uteis,
      caros,
      normais: uteis.filter((d) => !ehDiaCaro(d, gastoDiario)),
      parciais: dias.filter((d) => d.parcial),
      alimentos: gastoDiario ? alimentosDe(dias, gastoDiario) : [],
    };
  }

  /* ---- Cache para o Diário consultar na hora de incluir um alimento ---- */

  let cache = null; // { mapa: Map<nome, info>, total: n, quando: ts }

  // O aviso só existe quando a dieta alvo é menor que o gasto: quem não está em
  // déficit não tem dia caro, tem dia normal.
  const emDeficit = () => {
    const { metaKcal, gastoDiario } = MacroDB.getSettings();
    return !!(metaKcal && gastoDiario && metaKcal < gastoDiario);
  };

  async function carregar() {
    if (!emDeficit()) {
      cache = { mapa: new Map(), total: 0, quando: Date.now() };
      return cache;
    }
    const fim = new Date();
    fim.setHours(0, 0, 0, 0);
    fim.setDate(fim.getDate() + 1);
    const inicio = new Date(fim);
    inicio.setDate(inicio.getDate() - JANELA_DIAS);
    const entries = await MacroDB.getEntriesBetween(inicio.toISOString(), fim.toISOString());
    const { gastoDiario } = MacroDB.getSettings();
    const r = analisar(entries, gastoDiario);
    const mapa = new Map();
    for (const a of r.alimentos) mapa.set(a.nome, a);
    cache = { mapa, total: r.caros.length, dias: r.uteis.length, quando: Date.now() };
    return cache;
  }

  const invalidar = () => {
    cache = null;
  };

  // null quando o alimento não é caro (ou quando não há déficit configurado)
  const consultar = (nome) => {
    if (!cache || !nome) return null;
    return cache.mapa.get(String(nome).trim()) || null;
  };

  const resumo = () => cache;

  return {
    analisar,
    alimentosDe,
    porDia,
    ehDiaCaro,
    carregar,
    invalidar,
    consultar,
    resumo,
    emDeficit,
    DEFICIT_MINIMO,
    KCAL_MINIMA,
    CONCENTRACAO,
    MAXIMO,
    JANELA_DIAS,
  };
})();
