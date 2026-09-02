/* Sugestão de refeição: o que comer agora, olhando a hora, a dieta alvo, o que
   já foi consumido no dia e o histórico da própria pessoa.

   A ideia não é acertar "a" comida certa, e sim oferecer três opções plausíveis
   e diferentes a cada toque: o placar ordena, mas a escolha final é sorteada
   entre os melhores colocados. Quando o dia já estourou (ou está por estourar),
   o critério troca: passa a valer o que dá mais saciedade por caloria. */
const Sugestao = (() => {
  const REFEICOES = [
    { chave: 'madrugada', nome: 'Madrugada', art: 'na', ate: 5, peso: 0.05 },
    { chave: 'cafe', nome: 'Café da manhã', art: 'no', ate: 10.5, peso: 0.2 },
    { chave: 'lanche-manha', nome: 'Lanche da manhã', art: 'no', ate: 12, peso: 0.07 },
    { chave: 'almoco', nome: 'Almoço', art: 'no', ate: 15, peso: 0.3 },
    { chave: 'lanche-tarde', nome: 'Lanche da tarde', art: 'no', ate: 18.5, peso: 0.12 },
    { chave: 'jantar', nome: 'Jantar', art: 'no', ate: 22, peso: 0.24 },
    { chave: 'ceia', nome: 'Ceia', art: 'na', ate: 24, peso: 0.07 },
  ];

  const refeicaoDe = (data) => {
    const h = data.getHours() + data.getMinutes() / 60;
    return REFEICOES.find((r) => h < r.ate) || REFEICOES[REFEICOES.length - 1];
  };

  // Catálogo por refeição: [termo de busca, quantidade, medida].
  // A medida é um pedaço do rótulo da medida caseira ("unidade", "fatia"…) ou
  // null para gramas. `fibra` marca o que segura a fome por volume e fibra —
  // entra no cálculo de saciedade, que as tabelas não trazem.
  const F = (b, q, med, fibra) => ({ b, q, med, fibra: !!fibra });
  const CATALOGO = {
    cafe: [
      F('Ovo de galinha cozido', 2, 'unidade'),
      F('Ovo, galinha, mexido, com margarina, sem sal', 2, 'unidade'),
      F('Pão, trigo, francês', 1, 'unidade'),
      F('Pão de forma integral', 2, 'fatia', 1),
      F('Tapioca goma hidratada', 60, null),
      F('Aveia em flocos', 40, null, 1),
      F('Iogurte natural integral', 170, null),
      F('Iogurte grego Danone tradicional', 1, 'pote'),
      F('Queijo minas frescal', 50, null),
      F('Requeijão cremoso', 30, null),
      F('Mamão, Papaia, cru', 180, null, 1),
      F('Banana prata', 1, 'unidade', 1),
      F('Café com leite', 200, null),
      F('Leite desnatado', 200, null),
      F('Whey protein concentrado', 30, null),
      F('Cuscuz de milho cozido', 120, null, 1),
      F('Crepioca', 1, 'unidade'),
      F('Pão de queijo Forno de Minas (congelado, assado)', 2, 'unidade'),
      F('Abacate', 100, null, 1),
      F('Granola tradicional', 40, null, 1),
    ],
    'lanche-manha': [
      F('Banana prata', 1, 'unidade', 1),
      F('Maçã, Fuji, com casca, crua', 1, 'unidade', 1),
      F('Iogurte natural desnatado', 170, null),
      F('Castanha de caju', 25, null, 1),
      F('Amêndoa', 25, null, 1),
      F('Ovo de galinha cozido', 2, 'unidade'),
      F('Queijo minas frescal', 40, null),
      F('Barra de proteína', 1, 'unidade'),
      F('Mexerica', 1, 'unidade', 1),
      F('Whey protein concentrado', 30, null),
      F('Pasta de amendoim integral', 20, null),
      F('Biscoito de arroz integral', 4, 'unidade', 1),
    ],
    almoco: [
      F('Arroz branco cozido', 130, null),
      F('Arroz integral cozido', 130, null, 1),
      F('Feijão carioca cozido', 100, null, 1),
      F('Feijão preto cozido', 100, null, 1),
      F('Peito de frango grelhado', 150, null),
      F('Carne, bovina, patinho, sem gordura, refogada, sem sal', 130, null),
      F('Filé de tilápia grelhado', 150, null),
      F('Salmão, filé, com pele, fresco,  grelhado', 1, 'filé'),
      F('Ovo frito', 2, 'unidade'),
      F('Batata doce cozida', 150, null, 1),
      F('Purê de batata', 130, null),
      F('Macarrão cozido', 130, null),
      F('Salada de alface e tomate', 120, null, 1),
      F('Brócolis cozido', 100, null, 1),
      F('Abobrinha refogada', 120, null, 1),
      F('Couve refogada', 80, null, 1),
      F('Farofa', 30, null),
      F('Strogonoff de frango', 180, null),
      F('Carne de panela', 150, null),
      F('Lentilha cozida', 100, null, 1),
    ],
    'lanche-tarde': [
      F('Iogurte grego Danone tradicional', 1, 'pote'),
      F('Whey protein concentrado', 30, null),
      F('Banana prata', 1, 'unidade', 1),
      F('Maçã, Fuji, com casca, crua', 1, 'unidade', 1),
      F('Pão de forma integral', 2, 'fatia', 1),
      F('Pasta de amendoim integral', 20, null),
      F('Ovo de galinha cozido', 2, 'unidade'),
      F('Sanduíche natural de frango', 1, 'unidade'),
      F('Castanha do Pará', 20, null, 1),
      F('Pipoca, com óleo de soja, sem sal', 30, null, 1),
      F('Tapioca goma hidratada', 60, null),
      F('Queijo minas frescal', 40, null),
      F('Café com leite', 200, null),
      F('Barra de proteína', 1, 'unidade'),
      F('Mamão, Papaia, cru', 180, null, 1),
      F('Bolo de cenoura com cobertura', 1, 'fatia'),
    ],
    jantar: [
      F('Peito de frango grelhado', 150, null),
      F('Filé de tilápia grelhado', 150, null),
      F('Omelete', 150, null),
      F('Sopa de legumes', 300, null, 1),
      F('Salada de alface e tomate', 150, null, 1),
      F('Arroz integral cozido', 100, null, 1),
      F('Batata doce cozida', 130, null, 1),
      F('Legumes refogados', 150, null, 1),
      F('Carne, boi, acém moída, cozida, com óleo, cebola e alho, sem sal', 130, null),
      F('Sanduíche natural de frango', 1, 'unidade'),
      F('Panqueca de carne', 2, 'unidade'),
      F('Feijão carioca cozido', 90, null, 1),
      F('Ovo de galinha, cozido', 3, 'unidade'),
      F('Wrap de frango', 1, 'unidade'),
      F('Combinado de sushi e sashimi (média)', 200, null),
    ],
    ceia: [
      F('Iogurte natural desnatado', 170, null),
      F('Leite desnatado', 200, null),
      F('Queijo cottage', 100, null),
      F('Whey protein concentrado', 25, null),
      F('Ovo de galinha cozido', 2, 'unidade'),
      F('Gelatina diet preparada', 200, null),
      F('Chá de camomila', 200, null),
      F('Maçã, Fuji, com casca, crua', 1, 'unidade', 1),
      F('Castanha de caju', 15, null, 1),
      F('Iogurte grego Danone tradicional', 1, 'pote'),
    ],
  };
  CATALOGO.madrugada = CATALOGO.ceia;

  // O que segura a fome: proteína por caloria e comida "grande" para pouca
  // caloria (densidade baixa). É o critério que assume quando o dia estourou.
  function saciedade(f, fibra) {
    const kcal = Math.max(f.kcal, 1);
    const prot = Math.min((f.p * 4) / kcal, 0.6) / 0.6;
    const leveza = 1 - Math.min(kcal / 300, 1);
    return 0.45 * prot + 0.4 * leveza + (fibra ? 0.15 : 0);
  }

  const gramasDa = (food, med) => {
    if (!med || !food.m) return null;
    const alvo = (food.m || []).find(([r]) => r.toLowerCase().includes(med));
    return alvo || null;
  };

  // Um candidato pronto para pontuar: alimento + porção + macros daquela porção
  function montar(food, qtd, med, extra = {}) {
    if (!food) return null;
    const medida = gramasDa(food, med);
    const gramas = medida ? qtd * medida[1] : qtd;
    if (!(gramas > 0)) return null;
    const fator = gramas / 100;
    return {
      food,
      qtd,
      medida: medida ? medida[0] : 'g',
      gramas,
      kcal: food.kcal * fator,
      p: food.p * fator,
      c: food.c * fator,
      g: food.g * fator,
      ...extra,
    };
  }

  // Ajusta a porção para caber no alvo da refeição, sem virar migalha nem
  // banquete: gramas variam livre, unidades andam de meia em meia
  function ajustar(cand, alvoKcal, tetoKcal) {
    if (!(cand.kcal > 0) || !(alvoKcal > 0)) return cand;
    const teto = tetoKcal != null ? Math.min(alvoKcal * 1.35, tetoKcal) : alvoKcal * 1.35;
    if (cand.kcal <= teto) return cand;
    const passo = cand.medida === 'g' ? 0.05 : 0.5;
    const bruto = (teto / cand.kcal) * cand.qtd;
    let novo = Math.max(passo, Math.round(bruto / passo) * passo);
    if (cand.medida === 'g') novo = Math.max(10, Math.round(bruto / 5) * 5);
    if (novo >= cand.qtd) return cand;
    const k = novo / cand.qtd;
    return {
      ...cand,
      qtd: Math.round(novo * 100) / 100,
      gramas: cand.gramas * k,
      kcal: cand.kcal * k,
      p: cand.p * k,
      c: cand.c * k,
      g: cand.g * k,
      reduzido: true,
    };
  }

  const chaveDia = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  /* ---- Contexto: metas, o que já foi consumido e o histórico ---- */

  async function contexto(quando) {
    const data = quando || new Date();
    const ref = refeicaoDe(data);
    const s = MacroDB.getSettings();
    const metas = {
      kcal: s.metaKcal || s.gastoDiario || null,
      p: s.metaP || null,
      c: s.metaC || null,
      g: s.metaG || null,
    };
    const entries = await MacroDB.getAllEntries();
    const hoje = chaveDia(data);
    const consumido = { kcal: 0, p: 0, c: 0, g: 0 };
    const comidosHoje = new Set();
    const recentes = new Map(); // foodId → dias desde a última vez
    const frequencia = new Map(); // foodId → vezes
    const naRefeicao = new Map(); // foodId → vezes nesta mesma refeição
    const porcao = new Map(); // foodId → última porção usada
    for (const e of entries) {
      const d = new Date(e.ts);
      if (chaveDia(d) === hoje) {
        if (d <= data) {
          consumido.kcal += e.kcal;
          consumido.p += e.p;
          consumido.c += e.c;
          consumido.g += e.g;
        }
        comidosHoje.add(e.foodId);
      }
      frequencia.set(e.foodId, (frequencia.get(e.foodId) || 0) + 1);
      if (refeicaoDe(d).chave === ref.chave)
        naRefeicao.set(e.foodId, (naRefeicao.get(e.foodId) || 0) + 1);
      const dias = Math.floor((data - d) / 86400000);
      if (dias >= 0 && (!recentes.has(e.foodId) || dias < recentes.get(e.foodId)))
        recentes.set(e.foodId, dias);
      if (!porcao.has(e.foodId) || new Date(porcao.get(e.foodId).ts) < d)
        porcao.set(e.foodId, { ts: e.ts, qtd: e.qtd, medida: e.medida });
    }
    const restante = {
      kcal: metas.kcal ? metas.kcal - consumido.kcal : null,
      p: metas.p ? metas.p - consumido.p : null,
      c: metas.c ? metas.c - consumido.c : null,
      g: metas.g ? metas.g - consumido.g : null,
    };
    // quanto desta refeição ainda cabe: o que sobrou do dia, dividido entre as
    // refeições que ainda faltam, na proporção de cada uma
    const idx = REFEICOES.indexOf(ref);
    const pesoRestante = REFEICOES.slice(idx).reduce((n, r) => n + r.peso, 0) || ref.peso;
    const fatia = ref.peso / pesoRestante;
    // o que sobrou do dia cai na refeição atual na proporção dela, mas com
    // teto: a última refeição do dia não vira jantar de 1.800 kcal só porque
    // ninguém comeu nada até aqui
    const teto = metas.kcal ? metas.kcal * ref.peso * 1.8 : 700;
    const alvoKcal =
      restante.kcal != null ? Math.max(80, Math.min(restante.kcal * fatia, teto)) : Math.min(450, teto);
    // "no limite": sobrou menos de 12% da meta, ou algum macro já estourou
    const estourou =
      (restante.kcal != null && restante.kcal <= 0) ||
      (metas.p && restante.p <= 0) ||
      (metas.c && restante.c <= 0) ||
      (metas.g && restante.g <= 0);
    const apertado =
      estourou || (metas.kcal && restante.kcal < Math.max(0.12 * metas.kcal, alvoKcal * 0.5));
    return {
      data, ref, metas, consumido, restante, alvoKcal, apertado, estourou,
      comidosHoje, recentes, frequencia, naRefeicao, porcao,
    };
  }

  /* ---- Placar ---- */

  // Direção dos macros que faltam, em calorias: um vetor para comparar com o
  // que o alimento oferece (assim proteína em falta puxa comida proteica)
  function alvoMacros(ctx) {
    const { restante, metas } = ctx;
    if (!metas.p && !metas.c && !metas.g) return { p: 0.3, c: 0.45, g: 0.25 };
    const v = {
      p: Math.max(0, (restante.p || 0) * 4),
      c: Math.max(0, (restante.c || 0) * 4),
      g: Math.max(0, (restante.g || 0) * 9),
    };
    const soma = v.p + v.c + v.g;
    if (!soma) return { p: 0.4, c: 0.3, g: 0.3 };
    return { p: v.p / soma, c: v.c / soma, g: v.g / soma };
  }

  function pontuar(cand, ctx, alvo) {
    const kcal = Math.max(cand.kcal, 1);
    const perfil = {
      p: (cand.p * 4) / kcal,
      c: (cand.c * 4) / kcal,
      g: (cand.g * 9) / kcal,
    };
    // o quanto o alimento aponta para os macros que faltam (cosseno)
    const dot = perfil.p * alvo.p + perfil.c * alvo.c + perfil.g * alvo.g;
    const norma =
      Math.hypot(perfil.p, perfil.c, perfil.g) * Math.hypot(alvo.p, alvo.c, alvo.g) || 1;
    const macro = dot / norma;
    // tamanho da porção perto do que cabe nesta refeição
    const dif = (cand.kcal - ctx.alvoKcal) / Math.max(ctx.alvoKcal * 0.6, 1);
    const tamanho = Math.exp(-dif * dif);
    const sac = saciedade(cand.food, cand.fibra);
    const freq = ctx.frequencia.get(cand.food.i) || 0;
    const naRef = ctx.naRefeicao.get(cand.food.i) || 0;
    const habito = Math.min(Math.log1p(freq) / 3, 0.5) + Math.min(naRef * 0.08, 0.3);
    const dias = ctx.recentes.has(cand.food.i) ? ctx.recentes.get(cand.food.i) : 99;
    const enjoo = ctx.comidosHoje.has(cand.food.i) ? 1.1 : dias <= 1 ? 0.35 : dias <= 3 ? 0.12 : 0;
    // estourando o que resta: cada caloria a mais dói
    const excesso = ctx.restante.kcal != null ? Math.max(0, cand.kcal - Math.max(ctx.restante.kcal, 0)) : 0;
    const puni = ctx.restante.kcal != null ? excesso / Math.max(ctx.alvoKcal, 120) : 0;
    if (ctx.apertado) {
      return sac * 2.2 + macro * 0.5 + habito * 0.3 - puni * 1.6 - enjoo;
    }
    return macro * 1.5 + tamanho * 1.1 + habito + sac * 0.5 - puni * 0.8 - enjoo;
  }

  /* ---- Candidatos ---- */

  function doCatalogo(ctx) {
    const lista = CATALOGO[ctx.ref.chave] || CATALOGO.almoco;
    const saida = [];
    for (const item of lista) {
      const achados = FoodSearch.search(item.b, 3);
      const food = achados[0];
      if (!food) continue;
      const cand = montar(food, item.q, item.med, { fibra: item.fibra, origem: 'catalogo' });
      if (cand) saida.push(cand);
    }
    return saida;
  }

  // O que a própria pessoa costuma comer nesta refeição, na porção que ela usa
  async function doHistorico(ctx) {
    const saida = [];
    for (const [foodId, vezes] of ctx.naRefeicao.entries()) {
      if (vezes < 1) continue;
      const food = await MacroDB.getFood(foodId);
      if (!food) continue;
      const p = ctx.porcao.get(foodId);
      const cand = montar(food, p ? p.qtd : 100, p && p.medida !== 'g' ? p.medida.toLowerCase() : null, {
        origem: 'historico',
      });
      if (cand) saida.push(cand);
    }
    return saida;
  }

  // Sorteio proporcional ao placar entre os melhores: a lista muda a cada
  // toque sem deixar de fazer sentido
  function sortear(ranked, n) {
    const pool = ranked.slice(0, Math.max(n * 4, 12));
    const escolhidos = [];
    const usados = new Set();
    while (escolhidos.length < n && pool.length) {
      const livres = pool.filter((c) => !usados.has(c.food.i) && !usados.has(c.food.n));
      if (!livres.length) break;
      const min = Math.min(...livres.map((c) => c.placar));
      const pesos = livres.map((c) => Math.pow(c.placar - min + 0.25, 2));
      const total = pesos.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let i = 0;
      while (i < livres.length - 1 && r > pesos[i]) {
        r -= pesos[i];
        i++;
      }
      escolhidos.push(livres[i]);
      usados.add(livres[i].food.i);
      usados.add(livres[i].food.n);
    }
    return escolhidos;
  }

  function motivoDe(cand, ctx) {
    if (ctx.estourou) return 'O dia já fechou a conta: isto sacia com o mínimo de estrago';
    if (ctx.apertado) return 'Sobrou pouco para hoje: enche bastante para poucas calorias';
    if (cand.origem === 'historico')
      return `Você costuma comer isto ${ctx.ref.art} ${ctx.ref.nome.toLowerCase()}`;
    const alvo = alvoMacros(ctx);
    const maior = alvo.p >= alvo.c && alvo.p >= alvo.g ? 'p' : alvo.c >= alvo.g ? 'c' : 'g';
    const perfil = { p: cand.p * 4, c: cand.c * 4, g: cand.g * 9 };
    const dom = perfil.p >= perfil.c && perfil.p >= perfil.g ? 'p' : perfil.c >= perfil.g ? 'c' : 'g';
    if (dom === maior && maior === 'p' && ctx.restante.p > 0)
      return `Faltam ${Math.round(ctx.restante.p)} g de proteína hoje`;
    if (dom === maior && maior === 'c' && ctx.restante.c > 0)
      return `Ainda cabem ${Math.round(ctx.restante.c)} g de carboidrato`;
    if (dom === maior && maior === 'g' && ctx.restante.g > 0)
      return `Ainda cabem ${Math.round(ctx.restante.g)} g de gordura`;
    return 'Cabe no que ainda sobra para hoje';
  }

  /* ---- API ---- */

  async function sugerir(quando, opcoes = {}) {
    const n = opcoes.n || 3;
    const ctx = await contexto(quando);
    const alvo = alvoMacros(ctx);
    const teto = ctx.restante.kcal != null && ctx.restante.kcal > 0 ? ctx.restante.kcal : null;
    const brutos = [...(await doHistorico(ctx)), ...doCatalogo(ctx)];
    const vistos = new Set();
    const cands = [];
    for (const c of brutos) {
      const chave = c.food.n.toLowerCase();
      if (vistos.has(chave)) continue;
      vistos.add(chave);
      const ajustado = ctx.apertado
        ? ajustar(c, Math.max(ctx.alvoKcal * 0.6, 90), teto)
        : ajustar(c, ctx.alvoKcal, null);
      if (!(ajustado.kcal > 0)) continue;
      ajustado.placar = pontuar(ajustado, ctx, alvo);
      cands.push(ajustado);
    }
    cands.sort((a, b) => b.placar - a.placar);
    const escolhidos = sortear(cands, n).map((c) => ({ ...c, motivo: motivoDe(c, ctx) }));
    return { ctx, sugestoes: escolhidos };
  }

  return { sugerir, contexto, refeicaoDe, REFEICOES, CATALOGO };
})();

if (typeof window !== 'undefined') window.Sugestao = Sugestao;
