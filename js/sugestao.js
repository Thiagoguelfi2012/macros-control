/* Sugestão de refeição: monta um prato para agora.

   O prato nunca é inventado item a item — isso juntava temaki com feijão. Ele
   sai de uma **montagem**: ou uma combinação típica brasileira escrita à mão
   (PF de arroz, feijão, carne e salada; tapioca com ovo e café; japonês), ou
   uma refeição que a própria pessoa já fez naquele horário, tirada do
   histórico (alimentos que ela registrou juntos, no mesmo horário, no mesmo
   dia). Depois disso as porções são ajustadas para bater com o que falta da
   meta.

   Quanto cabe nesta refeição depende de quantas refeições a pessoa faz por dia
   (configurável em Ajustes) e de quais ainda vêm pela frente. */
const Sugestao = (() => {
  const fmt = (v, casas = 1) =>
    Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas });

  // Janelas do dia. `ate` é a hora limite; o peso é a fatia da meta diária que
  // aquela refeição costuma levar (normalizado por plano).
  const JANELAS = {
    cafe: { chave: 'cafe', nome: 'Café da manhã', art: 'no', ate: 10.5 },
    'lanche-manha': { chave: 'lanche-manha', nome: 'Lanche da manhã', art: 'no', ate: 12 },
    almoco: { chave: 'almoco', nome: 'Almoço', art: 'no', ate: 15 },
    'lanche-tarde': { chave: 'lanche-tarde', nome: 'Lanche da tarde', art: 'no', ate: 18.5 },
    jantar: { chave: 'jantar', nome: 'Jantar', art: 'no', ate: 22 },
    ceia: { chave: 'ceia', nome: 'Ceia', art: 'na', ate: 24 },
  };

  // Quais refeições existem no dia, conforme o número escolhido em Ajustes.
  // A última de cada plano estica até a meia-noite.
  const PLANOS = {
    3: [['cafe', 0.3], ['almoco', 0.4], ['jantar', 0.3]],
    4: [['cafe', 0.25], ['almoco', 0.35], ['lanche-tarde', 0.12], ['jantar', 0.28]],
    5: [['cafe', 0.22], ['lanche-manha', 0.08], ['almoco', 0.32], ['lanche-tarde', 0.12], ['jantar', 0.26]],
    6: [
      ['cafe', 0.2], ['lanche-manha', 0.07], ['almoco', 0.3],
      ['lanche-tarde', 0.11], ['jantar', 0.25], ['ceia', 0.07],
    ],
  };

  const planoDe = (n) => {
    const lista = PLANOS[Math.min(6, Math.max(3, Number(n) || 4))] || PLANOS[4];
    return lista.map(([chave, peso], i) => ({
      ...JANELAS[chave],
      peso,
      ate: i === lista.length - 1 ? 24 : JANELAS[chave].ate,
    }));
  };

  const refeicaoDe = (data, plano) => {
    const lista = plano || planoDe(4);
    const h = data.getHours() + data.getMinutes() / 60;
    return lista.find((r) => h < r.ate) || lista[lista.length - 1];
  };

  // Papel de cada item dentro da montagem: diz qual macro aquele item regula
  // quando as porções são ajustadas, e o quanto ele pode crescer ou encolher.
  const PAPEIS = {
    prot: { macro: 'p', min: 0.5, max: 1.8 },
    carb: { macro: 'c', min: 0.4, max: 2.2 },
    leg: { macro: 'c', min: 0.5, max: 1.8 },
    fruta: { macro: 'c', min: 0.5, max: 2 },
    gord: { macro: 'g', min: 0.3, max: 1.8 },
    veg: { macro: null, min: 0.8, max: 1.6 },
    bebida: { macro: null, min: 0.5, max: 1.5 },
    extra: { macro: null, min: 0.5, max: 2 },
  };

  // [termo de busca, quantidade, medida (pedaço do rótulo) ou null, papel, opcional?]
  const I = (b, q, med, papel, op) => ({ b, q, med, papel, op: !!op });

  // Montagens: combinações que existem de verdade na mesa brasileira. É daqui
  // que sai a cara do prato — nada é combinado por conta própria.
  const MONTAGENS = {
    cafe: [
      { nome: 'Pão com ovo e café', itens: [I('Pão, trigo, francês', 1, 'unidade', 'carb'), I('Ovo de galinha cozido', 2, 'unidade', 'prot'), I('Café com leite', 200, null, 'bebida', 1)] },
      { nome: 'Pão integral com queijo e café', itens: [I('Pão de forma integral', 2, 'fatia', 'carb'), I('Queijo, minas, frescal', 50, null, 'prot'), I('Café com leite', 200, null, 'bebida', 1)] },
      { nome: 'Tapioca com queijo', itens: [I('Tapioca goma hidratada', 60, null, 'carb'), I('Queijo, minas, frescal', 50, null, 'prot'), I('Mamão, Papaia, cru', 150, null, 'fruta', 1)] },
      { nome: 'Tapioca com ovo (crepioca)', itens: [I('Crepioca', 1, 'unidade', 'prot'), I('Banana prata', 1, 'unidade', 'fruta', 1), I('Café com leite', 200, null, 'bebida', 1)] },
      { nome: 'Cuscuz com ovo', itens: [I('Cuscuz de milho cozido', 120, null, 'carb'), I('Ovo, galinha, mexido, com margarina, sem sal', 2, 'unidade', 'prot'), I('Café com leite', 200, null, 'bebida', 1)] },
      { nome: 'Aveia com banana e whey', itens: [I('Aveia em flocos', 40, null, 'carb'), I('Banana prata', 1, 'unidade', 'fruta'), I('Whey protein concentrado', 30, null, 'prot')] },
      { nome: 'Iogurte com granola e fruta', itens: [I('Iogurte natural integral', 170, null, 'prot'), I('Granola tradicional', 40, null, 'carb'), I('Mamão, Papaia, cru', 150, null, 'fruta')] },
      { nome: 'Pão de queijo com café', itens: [I('Pão de queijo Forno de Minas (congelado, assado)', 3, 'unidade', 'carb'), I('Café com leite', 200, null, 'bebida'), I('Banana prata', 1, 'unidade', 'fruta', 1)] },
      { nome: 'Ovos mexidos com abacate', itens: [I('Ovo, galinha, mexido, com margarina, sem sal', 3, 'unidade', 'prot'), I('Abacate', 100, null, 'gord'), I('Pão de forma integral', 1, 'fatia', 'carb', 1)] },
    ],
    'lanche-manha': [
      { nome: 'Fruta com castanhas', itens: [I('Banana prata', 1, 'unidade', 'fruta'), I('Castanha de caju', 25, null, 'gord')] },
      { nome: 'Iogurte com fruta', itens: [I('Iogurte natural desnatado', 170, null, 'prot'), I('Mamão, Papaia, cru', 150, null, 'fruta')] },
      { nome: 'Whey com fruta', itens: [I('Whey protein concentrado', 30, null, 'prot'), I('Banana prata', 1, 'unidade', 'fruta')] },
      { nome: 'Ovos cozidos com fruta', itens: [I('Ovo de galinha cozido', 2, 'unidade', 'prot'), I('Maçã, Fuji, com casca, crua', 1, 'unidade', 'fruta')] },
      { nome: 'Barra de proteína', itens: [I('Barra de proteína', 1, 'unidade', 'prot'), I('Mexerica', 1, 'unidade', 'fruta', 1)] },
    ],
    almoco: [
      { nome: 'Prato feito com bife', itens: [I('Arroz branco cozido', 130, null, 'carb'), I('Feijão carioca cozido', 100, null, 'leg'), I('Carne, bovina, patinho, sem gordura, refogada, sem sal', 130, null, 'prot'), I('Salada de alface e tomate', 120, null, 'veg')] },
      { nome: 'Prato feito com frango', itens: [I('Arroz branco cozido', 130, null, 'carb'), I('Feijão preto cozido', 100, null, 'leg'), I('Frango, peito, sem pele, grelhado', 150, null, 'prot'), I('Salada de alface e tomate', 120, null, 'veg')] },
      { nome: 'Arroz integral com peixe', itens: [I('Arroz integral cozido', 130, null, 'carb'), I('Filé de tilápia grelhado', 150, null, 'prot'), I('Legumes refogados', 150, null, 'veg'), I('Azeite, de oliva, extra virgem', 1, 'colher de sopa', 'gord', 1)] },
      { nome: 'Arroz, feijão e ovo frito', itens: [I('Arroz branco cozido', 130, null, 'carb'), I('Feijão carioca cozido', 100, null, 'leg'), I('Ovo frito', 2, 'unidade', 'prot'), I('Couve refogada', 80, null, 'veg')] },
      { nome: 'Macarrão com carne moída', itens: [I('Macarrão cozido', 130, null, 'carb'), I('Carne, boi, acém moída, cozida, com óleo, cebola e alho, sem sal', 130, null, 'prot'), I('Salada de alface e tomate', 120, null, 'veg')] },
      { nome: 'Strogonoff com arroz', itens: [I('Strogonoff de frango', 180, null, 'prot'), I('Arroz branco cozido', 130, null, 'carb'), I('Salada de alface e tomate', 100, null, 'veg', 1)] },
      { nome: 'Batata doce com frango e legumes', itens: [I('Batata doce cozida', 150, null, 'carb'), I('Frango, peito, sem pele, grelhado', 150, null, 'prot'), I('Brócolis cozido', 100, null, 'veg')] },
      { nome: 'Salada com frango grelhado', itens: [I('Salada de alface e tomate', 150, null, 'veg'), I('Frango, peito, sem pele, grelhado', 150, null, 'prot'), I('Batata doce cozida', 120, null, 'carb', 1), I('Azeite, de oliva, extra virgem', 1, 'colher de sopa', 'gord', 1)] },
      { nome: 'Japonês (combinado)', itens: [I('Combinado de sushi e sashimi (média)', 250, null, 'prot'), I('Temaki de salmão', 1, 'unidade', 'carb', 1)] },
      { nome: 'Carne de panela com arroz', itens: [I('Carne de panela', 150, null, 'prot'), I('Arroz branco cozido', 130, null, 'carb'), I('Feijão carioca cozido', 90, null, 'leg', 1), I('Abobrinha refogada', 120, null, 'veg', 1)] },
      { nome: 'Lentilha com arroz integral', itens: [I('Lentilha cozida', 130, null, 'leg'), I('Arroz integral cozido', 130, null, 'carb'), I('Ovo de galinha cozido', 2, 'unidade', 'prot'), I('Salada de alface e tomate', 120, null, 'veg')] },
    ],
    'lanche-tarde': [
      { nome: 'Pão com pasta de amendoim e banana', itens: [I('Pão de forma integral', 2, 'fatia', 'carb'), I('Pasta de amendoim integral', 20, null, 'gord'), I('Banana prata', 1, 'unidade', 'fruta')] },
      { nome: 'Iogurte com fruta', itens: [I('Iogurte grego Danone tradicional', 1, 'pote', 'prot'), I('Mamão, Papaia, cru', 150, null, 'fruta')] },
      { nome: 'Whey com fruta', itens: [I('Whey protein concentrado', 30, null, 'prot'), I('Banana prata', 1, 'unidade', 'fruta')] },
      { nome: 'Tapioca com queijo', itens: [I('Tapioca goma hidratada', 60, null, 'carb'), I('Queijo, minas, frescal', 40, null, 'prot')] },
      { nome: 'Café com pão de queijo', itens: [I('Pão de queijo Forno de Minas (congelado, assado)', 3, 'unidade', 'carb'), I('Café com leite', 200, null, 'bebida')] },
      { nome: 'Sanduíche natural', itens: [I('Sanduíche natural de frango', 1, 'unidade', 'prot'), I('Maçã, Fuji, com casca, crua', 1, 'unidade', 'fruta', 1)] },
      { nome: 'Castanhas com fruta', itens: [I('Castanha do Pará', 20, null, 'gord'), I('Banana prata', 1, 'unidade', 'fruta')] },
      { nome: 'Ovos cozidos com fruta', itens: [I('Ovo de galinha cozido', 2, 'unidade', 'prot'), I('Maçã, Fuji, com casca, crua', 1, 'unidade', 'fruta')] },
    ],
    jantar: [
      { nome: 'Frango grelhado com legumes', itens: [I('Frango, peito, sem pele, grelhado', 150, null, 'prot'), I('Legumes refogados', 150, null, 'veg'), I('Arroz integral cozido', 100, null, 'carb', 1)] },
      { nome: 'Peixe com purê e salada', itens: [I('Filé de tilápia grelhado', 150, null, 'prot'), I('Purê de batata', 130, null, 'carb'), I('Salada de alface e tomate', 120, null, 'veg')] },
      { nome: 'Omelete com salada', itens: [I('Omelete', 150, null, 'prot'), I('Salada de alface e tomate', 150, null, 'veg'), I('Pão de forma integral', 1, 'fatia', 'carb', 1)] },
      { nome: 'Sopa de legumes com frango', itens: [I('Sopa de legumes', 300, null, 'veg'), I('Frango, peito, sem pele, grelhado', 120, null, 'prot')] },
      { nome: 'Prato feito leve', itens: [I('Arroz integral cozido', 100, null, 'carb'), I('Feijão carioca cozido', 90, null, 'leg'), I('Frango, peito, sem pele, grelhado', 130, null, 'prot'), I('Salada de alface e tomate', 120, null, 'veg')] },
      { nome: 'Wrap de frango com salada', itens: [I('Wrap de frango', 1, 'unidade', 'prot'), I('Salada de alface e tomate', 120, null, 'veg')] },
      { nome: 'Sanduíche natural com fruta', itens: [I('Sanduíche natural de frango', 1, 'unidade', 'prot'), I('Mamão, Papaia, cru', 150, null, 'fruta', 1)] },
      { nome: 'Japonês (combinado)', itens: [I('Combinado de sushi e sashimi (média)', 250, null, 'prot'), I('Temaki de salmão', 1, 'unidade', 'carb', 1)] },
      { nome: 'Carne moída com abobrinha', itens: [I('Carne, boi, acém moída, cozida, com óleo, cebola e alho, sem sal', 130, null, 'prot'), I('Abobrinha refogada', 150, null, 'veg'), I('Arroz integral cozido', 100, null, 'carb', 1)] },
    ],
    ceia: [
      { nome: 'Iogurte com fruta', itens: [I('Iogurte natural desnatado', 170, null, 'prot'), I('Maçã, Fuji, com casca, crua', 1, 'unidade', 'fruta', 1)] },
      { nome: 'Queijo cottage com gelatina', itens: [I('Queijo cottage', 100, null, 'prot'), I('Gelatina diet preparada', 200, null, 'extra', 1)] },
      { nome: 'Leite com whey', itens: [I('Leite desnatado', 200, null, 'bebida'), I('Whey protein concentrado', 25, null, 'prot')] },
      { nome: 'Ovos cozidos', itens: [I('Ovo de galinha cozido', 2, 'unidade', 'prot')] },
      { nome: 'Chá com castanhas', itens: [I('Chá de camomila', 200, null, 'bebida'), I('Castanha de caju', 15, null, 'gord')] },
    ],
  };
  MONTAGENS.madrugada = MONTAGENS.ceia;

  const montagensDe = (chave) =>
    MONTAGENS[chave] || MONTAGENS[chave === 'lanche-manha' ? 'lanche-tarde' : 'ceia'] || MONTAGENS.almoco;

  /* ---- Porções e cálculo ---- */

  const medidaDe = (food, med) => {
    if (!med || !food.m) return null;
    return (food.m || []).find(([r]) => r.toLowerCase().includes(med)) || null;
  };

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

  function montarItem(food, qtd, med, extra = {}) {
    if (!food || !(food.kcal >= 0)) return null;
    const medida = medidaDe(food, med);
    const porUn = medida ? medida[1] : 1;
    if (!(qtd * porUn > 0)) return null;
    return recalcular({
      food,
      qtd,
      medida: medida ? medida[0] : 'g',
      porUn,
      base: qtd,
      papel: extra.papel || 'carb',
      op: !!extra.op,
      origem: extra.origem || 'montagem',
    });
  }

  // Porções realistas: gramas de 5 em 5, medidas caseiras de meia em meia
  function arredondar(item, qtd) {
    const lim = PAPEIS[item.papel] || PAPEIS.carb;
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

  // O que segura a fome: proteína por caloria e comida "grande" para pouca
  // caloria. É o critério que assume quando o dia estourou.
  function saciedade(f) {
    const kcal = Math.max(f.kcal, 1);
    const prot = Math.min((f.p * 4) / kcal, 0.6) / 0.6;
    const leveza = 1 - Math.min(kcal / 300, 1);
    return 0.5 * prot + 0.5 * leveza;
  }

  // Qual macro um alimento do histórico regula quando a porção é ajustada.
  // É leitura dos números do próprio alimento, não classificação do que ele é —
  // e serve só para saber o que crescer ou encolher no prato.
  function papelPorMacro(f) {
    const kcal = Math.max(f.kcal, 1);
    const p = (f.p * 4) / kcal;
    const c = (f.c * 4) / kcal;
    const g = (f.g * 9) / kcal;
    if (p >= 0.3 && p >= c && p >= g && f.p >= 8) return 'prot';
    if (g >= 0.45 && g >= c && f.kcal >= 150) return 'gord';
    if (c >= 0.45 && f.c >= 12) return 'carb';
    return 'extra';
  }

  // Mexe na quantidade de cada item até o prato chegar perto do alvo de macros:
  // a proteína manda, a gordura entra depois e o carboidrato fecha a conta.
  function equilibrar(itens, alvo) {
    const atual = itens.map((x) => ({ ...x }));
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
    }
    if (alvo.c > 0 && flex.length && somar(atual).c > alvo.c * 1.2) {
      const excesso = somar(atual).c / (alvo.c * 1.1);
      for (const { i } of flex) atual[i] = arredondar(atual[i], atual[i].qtd / excesso);
    }
    return atual;
  }

  // Carga × repetições do prato: o que aquela porção entrega, em números
  function destaqueDe(cand) {
    const macros = [
      { kcal: cand.p * 4, txt: `${fmt(cand.p)} g de proteína` },
      { kcal: cand.c * 4, txt: `${fmt(cand.c)} g de carboidrato` },
      { kcal: cand.g * 9, txt: `${fmt(cand.g)} g de gordura` },
    ].sort((a, b) => b.kcal - a.kcal);
    return macros[0].kcal > 0 ? macros[0].txt : `${fmt(cand.kcal, 0)} kcal`;
  }

  /* ---- Contexto: metas, consumo do dia e histórico ---- */

  const chaveDia = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  async function contexto(quando) {
    const data = quando || new Date();
    const s = MacroDB.getSettings();
    const plano = planoDe(s.refeicoesDia);
    const ref = refeicaoDe(data, plano);
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
    const recentes = new Map();
    const frequencia = new Map();
    // refeições do histórico: alimentos que a pessoa registrou juntos, no mesmo
    // dia e na mesma janela — é o que ensina o que combina com o quê
    const refeicoes = new Map();
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
      const dias = Math.floor((data - d) / 86400000);
      if (dias >= 0 && (!recentes.has(e.foodId) || dias < recentes.get(e.foodId)))
        recentes.set(e.foodId, dias);
      const janela = refeicaoDe(d, plano);
      const k = `${chaveDia(d)}|${janela.chave}`;
      if (!refeicoes.has(k)) refeicoes.set(k, { chave: janela.chave, ts: e.ts, itens: [] });
      refeicoes.get(k).itens.push(e);
    }
    const restante = {
      kcal: metas.kcal ? metas.kcal - consumido.kcal : null,
      p: metas.p ? metas.p - consumido.p : null,
      c: metas.c ? metas.c - consumido.c : null,
      g: metas.g ? metas.g - consumido.g : null,
    };
    // o que falta hoje cai nesta refeição na proporção dela entre as que ainda
    // vêm — e quantas vêm depende do número de refeições configurado
    const idx = plano.indexOf(ref);
    const pesoRestante = plano.slice(idx).reduce((n, r) => n + r.peso, 0) || ref.peso;
    const fatia = ref.peso / pesoRestante;
    const tetoKcal = metas.kcal ? metas.kcal * ref.peso * 1.8 : 700;
    const alvoKcal =
      restante.kcal != null ? Math.max(80, Math.min(restante.kcal * fatia, tetoKcal)) : Math.min(450, tetoKcal);
    const fatiaMacro = (v, meta) =>
      v == null || meta == null ? null : Math.max(0, Math.min(v * fatia, meta * ref.peso * 1.8));
    const alvo = {
      kcal: alvoKcal,
      p: fatiaMacro(restante.p, metas.p),
      c: fatiaMacro(restante.c, metas.c),
      g: fatiaMacro(restante.g, metas.g),
    };
    if (alvo.p == null) alvo.p = (alvoKcal * 0.28) / 4;
    if (alvo.c == null) alvo.c = (alvoKcal * 0.44) / 4;
    if (alvo.g == null) alvo.g = (alvoKcal * 0.28) / 9;
    const estourou =
      (restante.kcal != null && restante.kcal <= 0) ||
      (metas.p && restante.p <= 0 && metas.c && restante.c <= 0);
    const apertado =
      estourou || (metas.kcal && restante.kcal < Math.max(0.12 * metas.kcal, alvoKcal * 0.5));
    return {
      data, plano, ref, metas, consumido, restante, alvo, alvoKcal, fatia, apertado, estourou,
      comidosHoje, recentes, frequencia, refeicoes,
    };
  }

  /* ---- Candidatos a prato ---- */

  // Montagens do catálogo, resolvidas na base de alimentos
  function pratosDoCatalogo(ctx) {
    const saida = [];
    for (const m of montagensDe(ctx.ref.chave)) {
      const itens = [];
      for (const it of m.itens) {
        const food = FoodSearch.search(it.b, 1)[0];
        if (!food) continue;
        const item = montarItem(food, it.q, it.med, { papel: it.papel, op: it.op, origem: 'montagem' });
        if (item) itens.push(item);
      }
      if (itens.length) saida.push({ nome: m.nome, origem: 'catalogo', itens });
    }
    return saida;
  }

  // Refeições que a própria pessoa já fez naquele horário. O prato é o conjunto
  // que ela registrou junto — por isso temaki nunca aparece com feijão: ela
  // nunca comeu os dois na mesma refeição.
  async function pratosDoHistorico(ctx) {
    const candidatas = [...ctx.refeicoes.values()]
      .filter((r) => r.chave === ctx.ref.chave && r.itens.length >= 2)
      .sort((a, b) => new Date(b.ts) - new Date(a.ts))
      .slice(0, 40);
    const porConjunto = new Map();
    for (const r of candidatas) {
      const ids = [...new Set(r.itens.map((e) => e.foodId))].sort();
      const k = ids.join('|');
      if (!porConjunto.has(k)) porConjunto.set(k, { ...r, vezes: 0 });
      porConjunto.get(k).vezes++;
    }
    const saida = [];
    for (const r of [...porConjunto.values()].slice(0, 12)) {
      const itens = [];
      const vistos = new Set();
      for (const e of r.itens) {
        if (vistos.has(e.foodId)) continue;
        vistos.add(e.foodId);
        const food = await MacroDB.getFood(e.foodId);
        if (!food || !(food.kcal > 0)) continue;
        const item = montarItem(food, e.qtd, e.medida !== 'g' ? e.medida.toLowerCase() : null, {
          papel: papelPorMacro(food),
          origem: 'historico',
        });
        if (item) itens.push(item);
      }
      if (itens.length >= 2) {
        const d = new Date(r.ts);
        saida.push({
          nome: `Como você comeu em ${d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`,
          origem: 'historico',
          vezes: r.vezes,
          quandoTs: r.ts,
          itens,
        });
      }
    }
    return saida;
  }

  /* ---- Escolha do prato ---- */

  // O quanto o prato erra o alvo, macro a macro (0 = na mosca)
  function erroDe(total, alvo) {
    const dif = (a, b) => (b > 0 ? Math.abs(a - b) / b : 0);
    return (
      dif(total.kcal, alvo.kcal) * 1.2 +
      dif(total.p, alvo.p) * 1.4 +
      dif(total.c, alvo.c) * 0.8 +
      dif(total.g, alvo.g) * 0.6
    );
  }

  function pontuarPrato(prato, ctx) {
    const foods = prato.itens.map((x) => x.food);
    const repetidoHoje = foods.filter((f) => ctx.comidosHoje.has(f.i)).length;
    const recentes = foods.filter((f) => (ctx.recentes.get(f.i) ?? 99) <= 1).length;
    const familiar =
      foods.reduce((n, f) => n + Math.min(Math.log1p(ctx.frequencia.get(f.i) || 0) / 3, 0.4), 0) /
      Math.max(foods.length, 1);
    const doHistorico = prato.origem === 'historico' ? 0.6 + Math.min((prato.vezes || 1) * 0.1, 0.4) : 0;
    const sac = prato.itens.reduce((n, x) => n + saciedade(x.food), 0) / Math.max(foods.length, 1);
    const base = doHistorico + familiar + (ctx.apertado ? sac * 1.6 : sac * 0.3);
    return base - repetidoHoje * 0.8 - recentes * 0.15 - erroDe(somar(prato.itens), ctx.alvo) * 1.5;
  }

  // Sorteio proporcional ao placar entre os melhores: "Trocar" traz outro prato
  // sem cair no pior deles
  function sortear(lista) {
    if (!lista.length) return null;
    const pool = lista.slice(0, Math.min(7, lista.length));
    // softmax: o melhor colocado ganha na maioria das vezes, mas quem está
    // perto dele tem chance de verdade — senão "Trocar" devolve sempre o mesmo
    const topo = Math.max(...pool.map((c) => c.placar));
    const pesos = pool.map((c) => Math.exp((c.placar - topo) * 1.1));
    const total = pesos.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= pesos[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  /* ---- API ---- */

  async function sugerir(quando, opcoes = {}) {
    const ctx = await contexto(quando);
    // no aperto o alvo é o que ainda cabe, não a fatia cheia da refeição
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
    ctx.alvo = alvo;

    const brutos = [...(await pratosDoHistorico(ctx)), ...pratosDoCatalogo(ctx)];
    // "Trocar" percorre as montagens: as últimas mostradas ficam de fora até
    // acabarem as opções, e aí a rodada recomeça
    let evitar = new Set(opcoes.evitar || []);
    if (brutos.length && brutos.every((x) => evitar.has(x.nome))) evitar = new Set();
    const pratos = [];
    for (const prato of brutos) {
      if (evitar.has(prato.nome)) continue;
      // no modo saciedade o prato encurta: fica o essencial, sem os opcionais
      let itens = ctx.apertado ? prato.itens.filter((x) => !x.op).slice(0, 2) : prato.itens;
      if (!itens.length) itens = prato.itens.slice(0, 1);
      // opcional sai também quando a refeição é pequena demais para ele
      if (!ctx.apertado && alvo.kcal < 350) itens = itens.filter((x) => !x.op);
      const ajustados = equilibrar(itens, alvo);
      const total = somar(ajustados);
      if (!(total.kcal > 0)) continue;
      pratos.push({ ...prato, itens: ajustados, total, placar: 0 });
    }
    if (!pratos.length) return { ctx, alvo, itens: [], total: somar([]), modo: 'normal', montagem: null };
    for (const p of pratos) p.placar = pontuarPrato(p, ctx);
    pratos.sort((a, b) => b.placar - a.placar);
    const escolhido = sortear(pratos);
    return {
      ctx,
      alvo,
      itens: escolhido.itens.map((x) => ({ ...x, motivo: destaqueDe(x) })),
      total: escolhido.total,
      modo: ctx.apertado ? 'saciedade' : 'normal',
      montagem: { nome: escolhido.nome, origem: escolhido.origem },
    };
  }

  return { sugerir, contexto, refeicaoDe, planoDe, PLANOS, MONTAGENS, PAPEIS };
})();

if (typeof window !== 'undefined') window.Sugestao = Sugestao;
