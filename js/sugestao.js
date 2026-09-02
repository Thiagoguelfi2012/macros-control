/* Sugestão de refeição: monta um prato para agora.

   Não é repetir uma refeição do passado: o histórico serve para saber *quais
   alimentos* a pessoa come em cada refeição; o prato em si é montado na hora,
   escolhendo um item para cada papel (proteína, carboidrato, legume…) e
   **ajustando as porções** até bater com os macros que ainda faltam.

   O alvo da refeição sai do que falta no dia dividido entre as refeições que
   ainda vêm pela frente — às 11h o almoço leva a sua fatia, não o dia inteiro.
   Quando o dia já estourou (ou está perto), o critério troca: vale o que dá
   mais saciedade por caloria, estourando o mínimo possível. */
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

  // Papéis no prato. O macro entre parênteses é o que aquele papel regula
  // quando as porções são ajustadas.
  const PAPEIS = {
    prot: { macro: 'p', min: 0.5, max: 1.8, rotulo: 'proteína' },
    carb: { macro: 'c', min: 0.4, max: 2.2, rotulo: 'carboidrato' },
    leg: { macro: 'c', min: 0.5, max: 1.8, rotulo: 'leguminosa' },
    fruta: { macro: 'c', min: 0.5, max: 2, rotulo: 'fruta' },
    gord: { macro: 'g', min: 0.3, max: 1.8, rotulo: 'gordura boa' },
    veg: { macro: null, min: 0.8, max: 1.6, rotulo: 'vegetal' },
    bebida: { macro: null, min: 0.5, max: 1.5, rotulo: 'bebida' },
  };

  // Catálogo por refeição: [termo de busca, quantidade, medida, papel, fibra].
  // A medida é um pedaço do rótulo da medida caseira ("unidade", "fatia"…) ou
  // null para gramas. `fibra` marca o que segura a fome por volume e fibra —
  // entra no cálculo de saciedade, que as tabelas não trazem.
  const F = (b, q, med, papel, fibra) => ({ b, q, med, papel, fibra: !!fibra });
  const CATALOGO = {
    cafe: [
      F('Ovo de galinha cozido', 2, 'unidade', 'prot'),
      F('Ovo, galinha, mexido, com margarina, sem sal', 2, 'unidade', 'prot'),
      F('Pão, trigo, francês', 1, 'unidade', 'carb'),
      F('Pão de forma integral', 2, 'fatia', 'carb', 1),
      F('Tapioca goma hidratada', 60, null, 'carb'),
      F('Aveia em flocos', 40, null, 'carb', 1),
      F('Cuscuz de milho cozido', 120, null, 'carb', 1),
      F('Crepioca', 1, 'unidade', 'prot'),
      F('Pão de queijo Forno de Minas (congelado, assado)', 2, 'unidade', 'carb'),
      F('Iogurte natural integral', 170, null, 'prot'),
      F('Iogurte grego Danone tradicional', 1, 'pote', 'prot'),
      F('Queijo, minas, frescal', 50, null, 'prot'),
      F('Requeijão cremoso', 30, null, 'gord'),
      F('Whey protein concentrado', 30, null, 'prot'),
      F('Mamão, Papaia, cru', 180, null, 'fruta', 1),
      F('Banana prata', 1, 'unidade', 'fruta', 1),
      F('Maçã, Fuji, com casca, crua', 1, 'unidade', 'fruta', 1),
      F('Abacate', 100, null, 'gord', 1),
      F('Granola tradicional', 40, null, 'carb', 1),
      F('Café com leite', 200, null, 'bebida'),
      F('Leite desnatado', 200, null, 'bebida'),
    ],
    'lanche-manha': [
      F('Banana prata', 1, 'unidade', 'fruta', 1),
      F('Maçã, Fuji, com casca, crua', 1, 'unidade', 'fruta', 1),
      F('Mexerica', 1, 'unidade', 'fruta', 1),
      F('Mamão, Papaia, cru', 180, null, 'fruta', 1),
      F('Iogurte natural desnatado', 170, null, 'prot'),
      F('Iogurte grego Danone tradicional', 1, 'pote', 'prot'),
      F('Ovo de galinha cozido', 2, 'unidade', 'prot'),
      F('Queijo, minas, frescal', 40, null, 'prot'),
      F('Barra de proteína', 1, 'unidade', 'prot'),
      F('Whey protein concentrado', 30, null, 'prot'),
      F('Castanha de caju', 25, null, 'gord', 1),
      F('Amêndoa', 25, null, 'gord', 1),
      F('Pasta de amendoim integral', 20, null, 'gord'),
      F('Biscoito de arroz integral', 4, 'unidade', 'carb', 1),
    ],
    almoco: [
      F('Frango, peito, sem pele, grelhado', 150, null, 'prot'),
      F('Carne, bovina, patinho, sem gordura, refogada, sem sal', 130, null, 'prot'),
      F('Filé de tilápia grelhado', 150, null, 'prot'),
      F('Salmão, filé, com pele, fresco,  grelhado', 1, 'filé', 'prot'),
      F('Ovo frito', 2, 'unidade', 'prot'),
      F('Strogonoff de frango', 180, null, 'prot'),
      F('Carne de panela', 150, null, 'prot'),
      F('Arroz branco cozido', 130, null, 'carb'),
      F('Arroz integral cozido', 130, null, 'carb', 1),
      F('Macarrão cozido', 130, null, 'carb'),
      F('Batata doce cozida', 150, null, 'carb', 1),
      F('Purê de batata', 130, null, 'carb'),
      F('Feijão carioca cozido', 100, null, 'leg', 1),
      F('Feijão preto cozido', 100, null, 'leg', 1),
      F('Lentilha cozida', 100, null, 'leg', 1),
      F('Salada de alface e tomate', 120, null, 'veg', 1),
      F('Brócolis cozido', 100, null, 'veg', 1),
      F('Abobrinha refogada', 120, null, 'veg', 1),
      F('Couve refogada', 80, null, 'veg', 1),
      F('Farofa', 30, null, 'carb'),
      F('Azeite, de oliva, extra virgem', 1, 'colher de sopa', 'gord'),
      F('Abacate, cru', 80, null, 'gord', 1),
    ],
    'lanche-tarde': [
      F('Iogurte grego Danone tradicional', 1, 'pote', 'prot'),
      F('Whey protein concentrado', 30, null, 'prot'),
      F('Ovo de galinha cozido', 2, 'unidade', 'prot'),
      F('Queijo, minas, frescal', 40, null, 'prot'),
      F('Barra de proteína', 1, 'unidade', 'prot'),
      F('Sanduíche natural de frango', 1, 'unidade', 'prot'),
      F('Pão de forma integral', 2, 'fatia', 'carb', 1),
      F('Tapioca goma hidratada', 60, null, 'carb'),
      F('Biscoito de arroz integral', 4, 'unidade', 'carb', 1),
      F('Bolo de cenoura com cobertura', 1, 'fatia', 'carb'),
      F('Pipoca, com óleo de soja, sem sal', 30, null, 'carb', 1),
      F('Banana prata', 1, 'unidade', 'fruta', 1),
      F('Maçã, Fuji, com casca, crua', 1, 'unidade', 'fruta', 1),
      F('Mamão, Papaia, cru', 180, null, 'fruta', 1),
      F('Pasta de amendoim integral', 20, null, 'gord'),
      F('Castanha do Pará', 20, null, 'gord', 1),
      F('Café com leite', 200, null, 'bebida'),
    ],
    jantar: [
      F('Frango, peito, sem pele, grelhado', 150, null, 'prot'),
      F('Filé de tilápia grelhado', 150, null, 'prot'),
      F('Omelete', 150, null, 'prot'),
      F('Carne, boi, acém moída, cozida, com óleo, cebola e alho, sem sal', 130, null, 'prot'),
      F('Ovo de galinha, cozido', 3, 'unidade', 'prot'),
      F('Sanduíche natural de frango', 1, 'unidade', 'prot'),
      F('Panqueca de carne', 2, 'unidade', 'prot'),
      F('Combinado de sushi e sashimi (média)', 200, null, 'prot'),
      F('Arroz integral cozido', 100, null, 'carb', 1),
      F('Batata doce cozida', 130, null, 'carb', 1),
      F('Wrap de frango', 1, 'unidade', 'prot'),
      F('Feijão carioca cozido', 90, null, 'leg', 1),
      F('Sopa de legumes', 300, null, 'veg', 1),
      F('Salada de alface e tomate', 150, null, 'veg', 1),
      F('Legumes refogados', 150, null, 'veg', 1),
      F('Brócolis cozido', 100, null, 'veg', 1),
      F('Azeite, de oliva, extra virgem', 1, 'colher de sopa', 'gord'),
      F('Castanha-de-caju, torrada, salgada', 20, null, 'gord', 1),
    ],
    ceia: [
      F('Iogurte natural desnatado', 170, null, 'prot'),
      F('Queijo cottage', 100, null, 'prot'),
      F('Whey protein concentrado', 25, null, 'prot'),
      F('Ovo de galinha cozido', 2, 'unidade', 'prot'),
      F('Iogurte grego Danone tradicional', 1, 'pote', 'prot'),
      F('Leite desnatado', 200, null, 'bebida'),
      F('Chá de camomila', 200, null, 'bebida'),
      F('Gelatina diet preparada', 200, null, 'fruta'),
      F('Maçã, Fuji, com casca, crua', 1, 'unidade', 'fruta', 1),
      F('Castanha de caju', 15, null, 'gord', 1),
    ],
  };
  CATALOGO.madrugada = CATALOGO.ceia;

  // Molde do prato: quais papéis entram e em que ordem de prioridade.
  // `min` é quantos itens o prato precisa ter para valer a pena.
  const MOLDES = {
    cafe: { papeis: ['carb', 'prot', 'fruta', 'gord'], min: 2 },
    'lanche-manha': { papeis: ['prot', 'fruta', 'gord'], min: 2 },
    almoco: { papeis: ['prot', 'carb', 'leg', 'veg', 'gord'], min: 3 },
    'lanche-tarde': { papeis: ['prot', 'carb', 'fruta'], min: 2 },
    jantar: { papeis: ['prot', 'carb', 'veg', 'gord'], min: 2 },
    ceia: { papeis: ['prot', 'fruta'], min: 1 },
    madrugada: { papeis: ['prot'], min: 1 },
  };

  /* ---- Utilidades ---- */

  const chaveDia = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  // O que segura a fome: proteína por caloria e comida "grande" para pouca
  // caloria (densidade baixa). É o critério que assume quando o dia estourou.
  function saciedade(f, fibra) {
    const kcal = Math.max(f.kcal, 1);
    const prot = Math.min((f.p * 4) / kcal, 0.6) / 0.6;
    const leveza = 1 - Math.min(kcal / 300, 1);
    return 0.45 * prot + 0.4 * leveza + (fibra ? 0.15 : 0);
  }

  // Papel de um alimento que veio do histórico (o catálogo já traz o seu)
  function papelDe(f) {
    const kcal = Math.max(f.kcal, 1);
    const p = (f.p * 4) / kcal;
    const c = (f.c * 4) / kcal;
    const g = (f.g * 9) / kcal;
    if (f.l && kcal <= 80) return 'bebida';
    // pouca caloria por 100 g é acompanhamento, não fonte de macro: uma salada
    // com azeite tem a gordura dominando a fatia de kcal e ainda é salada
    if (kcal <= 70) return 'veg';
    if (p >= 0.3) return 'prot';
    if (g >= 0.5) return 'gord';
    if (c >= 0.6) return kcal <= 110 ? 'fruta' : 'carb';
    if (c >= 0.4 && p >= 0.18) return 'leg';
    return 'carb';
  }

  const medidaDe = (food, med) => {
    if (!med || !food.m) return null;
    return (food.m || []).find(([r]) => r.toLowerCase().includes(med)) || null;
  };

  // Um item de prato: alimento + porção + macros daquela porção
  function montar(food, qtd, med, extra = {}) {
    if (!food) return null;
    const medida = medidaDe(food, med);
    const porUn = medida ? medida[1] : 1;
    const gramas = qtd * porUn;
    if (!(gramas > 0)) return null;
    return recalcular({
      food,
      qtd,
      medida: medida ? medida[0] : 'g',
      porUn,
      base: qtd,
      papel: extra.papel || papelDe(food),
      fibra: !!extra.fibra,
      origem: extra.origem || 'catalogo',
      ...extra,
    });
  }

  function recalcular(item) {
    const gramas = item.qtd * item.porUn;
    const k = gramas / 100;
    return {
      ...item,
      gramas,
      kcal: item.food.kcal * k,
      p: item.food.p * k,
      c: item.food.c * k,
      g: item.food.g * k,
    };
  }

  // Porções realistas: gramas de 5 em 5, medidas caseiras de meia em meia
  function arredondar(item, qtd) {
    const lim = PAPEIS[item.papel] || PAPEIS.carb;
    // em gramas dá para servir bem mais; em unidades (um sanduíche, um pote)
    // ninguém come o dobro — o teto é mais curto
    const teto = item.base * (item.medida === 'g' ? lim.max : Math.min(lim.max, 1.5));
    let q = Math.min(Math.max(qtd, item.base * lim.min), teto);
    if (item.medida === 'g') q = Math.max(10, Math.round(q / 5) * 5);
    else q = Math.max(0.5, Math.round(q * 2) / 2);
    return recalcular({ ...item, qtd: q });
  }

  const somar = (itens) =>
    itens.reduce(
      (a, x) => ({ kcal: a.kcal + x.kcal, p: a.p + x.p, c: a.c + x.c, g: a.g + x.g }),
      { kcal: 0, p: 0, c: 0, g: 0 }
    );

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
    // o que ainda falta hoje cai nesta refeição na proporção dela entre as que
    // ainda vêm: às 11h o almoço leva a sua fatia, não o dia inteiro
    const idx = REFEICOES.indexOf(ref);
    const pesoRestante = REFEICOES.slice(idx).reduce((n, r) => n + r.peso, 0) || ref.peso;
    const fatia = ref.peso / pesoRestante;
    const tetoKcal = metas.kcal ? metas.kcal * ref.peso * 1.8 : 700;
    const alvoKcal =
      restante.kcal != null ? Math.max(80, Math.min(restante.kcal * fatia, tetoKcal)) : Math.min(450, tetoKcal);
    // alvo de cada macro para esta refeição: mesma fatia, com teto proporcional
    const fatiaMacro = (v, meta) =>
      v == null || meta == null ? null : Math.max(0, Math.min(v * fatia, meta * ref.peso * 1.8));
    const alvo = {
      kcal: alvoKcal,
      p: fatiaMacro(restante.p, metas.p),
      c: fatiaMacro(restante.c, metas.c),
      g: fatiaMacro(restante.g, metas.g),
    };
    // sem dieta alvo configurada: divide as calorias da refeição num padrão
    // equilibrado, só para ter um norte
    if (alvo.p == null) alvo.p = (alvoKcal * 0.28) / 4;
    if (alvo.c == null) alvo.c = (alvoKcal * 0.44) / 4;
    if (alvo.g == null) alvo.g = (alvoKcal * 0.28) / 9;
    const estourou =
      (restante.kcal != null && restante.kcal <= 0) ||
      (metas.p && restante.p <= 0 && metas.c && restante.c <= 0);
    const apertado =
      estourou || (metas.kcal && restante.kcal < Math.max(0.12 * metas.kcal, alvoKcal * 0.5));
    return {
      data, ref, metas, consumido, restante, alvo, alvoKcal, fatia, apertado, estourou,
      comidosHoje, recentes, frequencia, naRefeicao, porcao,
    };
  }

  /* ---- Candidatos ---- */

  function doCatalogo(ctx) {
    const lista = CATALOGO[ctx.ref.chave] || CATALOGO.almoco;
    const saida = [];
    for (const item of lista) {
      const food = FoodSearch.search(item.b, 1)[0];
      if (!food) continue;
      const cand = montar(food, item.q, item.med, {
        papel: item.papel,
        fibra: item.fibra,
        origem: 'catalogo',
      });
      if (cand) saida.push(cand);
    }
    return saida;
  }

  // O que a própria pessoa come nesta refeição, na porção que ela usa. É daqui
  // que sai a cara do prato — o molde só diz quantos de cada tipo entram.
  async function doHistorico(ctx) {
    const saida = [];
    for (const [foodId] of ctx.naRefeicao.entries()) {
      const food = await MacroDB.getFood(foodId);
      if (!food || !(food.kcal > 0)) continue;
      const p = ctx.porcao.get(foodId);
      const cand = montar(food, p ? p.qtd : 100, p && p.medida !== 'g' ? p.medida.toLowerCase() : null, {
        origem: 'historico',
      });
      if (cand) saida.push(cand);
    }
    return saida;
  }

  /* ---- Escolha de cada item do prato ---- */

  // Pontua um candidato para um papel, olhando o que ainda falta *no prato*
  function pontuar(cand, ctx, falta, macroDoPapel) {
    const kcal = Math.max(cand.kcal, 1);
    const perfil = { p: (cand.p * 4) / kcal, c: (cand.c * 4) / kcal, g: (cand.g * 9) / kcal };
    const alvoV = {
      p: Math.max(0, falta.p * 4),
      c: Math.max(0, falta.c * 4),
      g: Math.max(0, falta.g * 9),
    };
    const soma = alvoV.p + alvoV.c + alvoV.g || 1;
    const dir = { p: alvoV.p / soma, c: alvoV.c / soma, g: alvoV.g / soma };
    const dot = perfil.p * dir.p + perfil.c * dir.c + perfil.g * dir.g;
    const norma = Math.hypot(perfil.p, perfil.c, perfil.g) * Math.hypot(dir.p, dir.c, dir.g) || 1;
    const macro = dot / norma;
    const freq = ctx.frequencia.get(cand.food.i) || 0;
    const naRef = ctx.naRefeicao.get(cand.food.i) || 0;
    const habito =
      (cand.origem === 'historico' ? 0.55 : 0) +
      Math.min(Math.log1p(freq) / 4, 0.35) +
      Math.min(naRef * 0.06, 0.3);
    const dias = ctx.recentes.has(cand.food.i) ? ctx.recentes.get(cand.food.i) : 99;
    const enjoo = ctx.comidosHoje.has(cand.food.i) ? 1.2 : dias <= 1 ? 0.3 : dias <= 3 ? 0.1 : 0;
    const sac = saciedade(cand.food, cand.fibra);
    // densidade no macro do papel: quem ocupa a vaga da proteína precisa ser
    // mesmo proteico, senão a porção estoura antes de a meta ser atingida
    const fator = { p: 4, c: 4, g: 9 }[macroDoPapel] || 4;
    const densidade = macroDoPapel ? Math.min(((cand.food[macroDoPapel] * fator) / Math.max(cand.food.kcal, 1)) / 0.5, 1) : 0;
    if (ctx.apertado) return sac * 2.2 + macro * 0.6 + habito * 0.5 + densidade * 0.5 - enjoo;
    return macro * 1.1 + habito * 1.1 + densidade * 0.9 + sac * 0.3 - enjoo;
  }

  // Sorteio proporcional ao placar entre os melhores: o prato muda a cada
  // toque sem deixar de fazer sentido
  function sortear(lista) {
    if (!lista.length) return null;
    const pool = lista.slice(0, Math.min(8, lista.length));
    const min = Math.min(...pool.map((c) => c.placar));
    const pesos = pool.map((c) => Math.pow(c.placar - min + 0.3, 2));
    const total = pesos.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= pesos[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  /* ---- Ajuste das porções ---- */

  // Mexe na quantidade de cada item até o prato inteiro chegar perto do alvo
  // de macros: cada papel puxa o macro que ele regula (proteína pela proteína,
  // carboidrato pelo carbo…), em rodadas, respeitando limites de porção.
  function equilibrar(itens, alvo) {
    const atual = itens.map((x) => ({ ...x }));
    // a ordem importa: a proteína manda no prato, a gordura entra depois e o
    // carboidrato é quem fecha a conta — é a parte elástica da refeição
    const ajustarMacro = (macro) => {
      for (let i = 0; i < atual.length; i++) {
        const item = atual[i];
        if ((PAPEIS[item.papel] || {}).macro !== macro || !(alvo[macro] > 0)) continue;
        const outros = atual.reduce((n, x, j) => (j === i ? n : n + x[macro]), 0);
        const porQtd = (item.food[macro] * item.porUn) / 100;
        if (!(porQtd > 0)) continue;
        atual[i] = arredondar(item, (alvo[macro] - outros) / porQtd);
      }
    };
    for (let volta = 0; volta < 5; volta++) for (const macro of ['p', 'g', 'c']) ajustarMacro(macro);
    // sobra ou falta de caloria depois disso sai (ou entra) no carboidrato,
    // que é o item que dá para servir a mais sem desmontar o prato
    const flex = atual
      .map((x, i) => ({ x, i }))
      .filter(({ x }) => x.papel === 'carb' || x.papel === 'fruta');
    for (let volta = 0; volta < 3 && flex.length; volta++) {
      const dif = somar(atual).kcal - alvo.kcal;
      if (Math.abs(dif) < alvo.kcal * 0.08) break;
      const somaFlex = flex.reduce((n, { i }) => n + atual[i].kcal, 0) || 1;
      const fator = (somaFlex - dif) / somaFlex;
      if (!(fator > 0)) break;
      for (const { i } of flex) atual[i] = arredondar(atual[i], atual[i].qtd * fator);
      // encher de caloria não pode virar carboidrato demais: se passou muito do
      // alvo de carbo, volta atrás e aceita a refeição um pouco mais leve
    }
    // trava final: carboidrato bem acima do alvo desmancha a refeição, então o
    // item elástico volta atrás mesmo que as calorias fiquem abaixo
    if (alvo.c > 0 && flex.length && somar(atual).c > alvo.c * 1.2) {
      const excesso = somar(atual).c / (alvo.c * 1.1);
      for (const { i } of flex) atual[i] = arredondar(atual[i], atual[i].qtd / excesso);
    }
    return atual;
  }

  /* ---- Montagem do prato ---- */

  function motivoDe(item, ctx) {
    const papel = (PAPEIS[item.papel] || {}).rotulo || 'complemento';
    if (item.origem === 'historico') return `${papel} · você come isto ${ctx.ref.art} ${ctx.ref.nome.toLowerCase()}`;
    return papel;
  }

  async function sugerir(quando, opcoes = {}) {
    const ctx = await contexto(quando);
    const molde = MOLDES[ctx.ref.chave] || MOLDES.almoco;
    const papeis = ctx.apertado ? molde.papeis.filter((p) => p === 'prot' || p === 'veg' || p === 'fruta') : molde.papeis;
    const brutos = [...(await doHistorico(ctx)), ...doCatalogo(ctx)];
    // um alimento só entra uma vez, e o do histórico ganha do catálogo
    const porNome = new Map();
    for (const c of brutos) {
      const k = c.food.n.toLowerCase();
      if (!porNome.has(k)) porNome.set(k, c);
    }
    const disponiveis = [...porNome.values()];
    const evitar = new Set(opcoes.evitar || []);

    const prato = [];
    const falta = { kcal: ctx.alvo.kcal, p: ctx.alvo.p, c: ctx.alvo.c, g: ctx.alvo.g };
    for (const papel of papeis.length ? papeis : ['prot']) {
      const opcoesPapel = disponiveis
        .filter((c) => c.papel === papel && !prato.some((x) => x.food.i === c.food.i) && !evitar.has(c.food.i))
        .map((c) => ({ ...c, placar: pontuar(c, ctx, falta, (PAPEIS[papel] || {}).macro) }))
        .sort((a, b) => b.placar - a.placar);
      const escolhido = sortear(opcoesPapel);
      if (!escolhido) continue;
      // no modo saciedade o prato é curto: dois itens bastam
      if (ctx.apertado && prato.length >= 2) break;
      prato.push(escolhido);
      falta.p -= escolhido.p;
      falta.c -= escolhido.c;
      falta.g -= escolhido.g;
      falta.kcal -= escolhido.kcal;
    }
    if (!prato.length) return { ctx, alvo: ctx.alvo, itens: [], total: somar([]), modo: 'normal' };

    // no aperto o alvo é o que ainda cabe, não a fatia da refeição
    const alvo = ctx.apertado
      ? (() => {
          const teto = Math.max(ctx.restante.kcal != null ? ctx.restante.kcal : 0, 120);
          return {
            kcal: Math.min(ctx.alvo.kcal, teto),
            p: Math.max(ctx.alvo.p, 15),
            c: Math.max(0, Math.min(ctx.alvo.c, (teto * 0.3) / 4)),
            g: Math.max(0, Math.min(ctx.alvo.g, (teto * 0.25) / 9)),
          };
        })()
      : ctx.alvo;
    const itens = equilibrar(prato, alvo).map((x) => ({ ...x, motivo: motivoDe(x, ctx) }));
    return {
      ctx,
      alvo,
      itens,
      total: somar(itens),
      modo: ctx.apertado ? 'saciedade' : 'normal',
    };
  }

  return { sugerir, contexto, refeicaoDe, REFEICOES, CATALOGO, MOLDES, PAPEIS };
})();

if (typeof window !== 'undefined') window.Sugestao = Sugestao;
