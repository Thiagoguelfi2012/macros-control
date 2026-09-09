/* Carga glicêmica estimada de uma refeição, e o que fazer a respeito.

   As tabelas de alimentos do app não trazem índice glicêmico (nem fibra), e
   não existe IG medido para 18 mil itens. O que dá para fazer com honestidade
   é estimar: uma tabela de IG por tipo de alimento — os valores clássicos das
   tabelas internacionais (arroz branco ~73, pão francês ~75, feijão ~30…) —
   casada pelo nome, com um palpite pela composição quando nada casa.

   O aviso não é sobre o alimento isolado: é sobre a **refeição**, pela carga
   glicêmica (IG × carboidrato ÷ 100), que é o número que leva em conta o
   quanto de carboidrato realmente entrou no prato. */
const Glicemia = (() => {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ');

  // [regex, IG]. A ordem importa: a primeira que casa vale, então o mais
  // específico vem antes do mais genérico.
  const TABELA = [
    // açúcares e bebidas açucaradas
    [/glicose|dextrose|maltodextrina/, 100],
    [/\bmel\b|xarope de milho/, 61],
    [/acucar|rapadura|melado|calda de/, 68],
    [/refrigerante|guarana|coca-cola|energetico/, 63],
    [/suco.*(caixa|nectar|industrializado|em po|refresco)|refresco em po/, 66],
    [/suco natural|suco de (laranja|uva|maca|melancia|abacaxi)/, 50],
    [/isotonico|gatorade|powerade/, 78],
    // pães, massas e cereais
    [/\bpao\b.*(integral|centeio|fermentacao natural|australiano)/, 58],
    [/\bpao\b.*(frances|forma|sirio|bisnaguinha|hamburguer|hot dog|trigo)|baguete|torrada/, 73],
    [/pao de queijo|chipa/, 65],
    [/tapioca|goma de mandioca|beiju/, 85],
    [/cuscuz/, 65],
    [/farofa|farinha de mandioca|biju/, 70],
    [/macarrao.*integral|massa integral/, 45],
    [/macarrao|espaguete|talharim|penne|lasanha|nhoque|panqueca/, 52],
    [/arroz.*integral/, 60],
    [/arroz.*(parboilizado|selvagem|negro|7 graos)/, 55],
    [/arroz|risoto|sushi|temaki(?!.*sem arroz)|nigiri|uramaki|hossomaki/, 72],
    [/aveia|mingau de aveia/, 55],
    [/granola|cereal matinal|sucrilhos|nesfit/, 60],
    [/quinoa/, 53],
    [/milho|pipoca|polenta|angu|curau/, 62],
    // tubérculos e raízes
    [/pure de batata|batata.*(pure|instantanea)/, 85],
    [/batata.*(frita|assada|sorriso|palito|noisette|rustica|airfryer|smile)/, 70],
    [/batata doce|inhame|cara\b/, 55],
    [/mandioca|aipim|macaxeira|mandioquinha|batata baroa/, 55],
    [/batata/, 78],
    // leguminosas e vegetais
    [/feijao|lentilha|grao de bico|ervilha|soja|edamame|tremoco/, 32],
    [/salada|alface|rucula|agriao|couve|brocolis|espinafre|repolho|pepino|tomate|abobrinha|berinjela|chuchu|vagem|acelga|escarola|palmito|aspargo/, 15],
    [/cenoura|beterraba|abobora|moranga/, 45],
    // frutas
    [/melancia/, 72],
    [/abacaxi|mamao|manga madura|banana.*(madura|nanica|prata)/, 56],
    [/banana|uva|kiwi|manga|caqui|figo/, 52],
    [/maca|pera|laranja|mexerica|tangerina|morango|ameixa|pessego|cereja|framboesa|amora|mirtilo|abacate|coco/, 40],
    [/fruta|salada de fruta/, 50],
    // laticínios
    [/iogurte.*(grego|natural|desnatado|proteico|skyr)/, 32],
    [/iogurte|bebida lactea|leite fermentado/, 45],
    [/leite (condensado)/, 61],
    [/leite|queijo|requeijao|cream cheese|cottage|manteiga|creme de leite/, 30],
    // doces e ultraprocessados
    [/sorvete|picole|acai (com|na tigela)|milk ?shake/, 57],
    [/biscoito|bolacha|cookie|wafer|waffer/, 68],
    [/bolo|torta doce|donut|rosquinha|panetone|churros|sonho\b/, 62],
    [/chocolate|bombom|brigadeiro|beijinho|trufa|nutella|pacoca|doce de leite|cocada|pudim|mousse/, 45],
    [/salgadinho|chips|nachos|batata chips/, 60],
    [/pizza|esfiha|coxinha|pastel|empada|quibe|enroladinho|hamburguer|sanduiche|x-|hot dog|cachorro quente|wrap|burrito|taco/, 55],
    [/barra de (cereal|proteina)|barrinha/, 55],
    // proteínas e gorduras puras: sem carboidrato relevante
    [/frango|carne|boi|patinho|alcatra|file|peixe|salmao|tilapia|atum|camarao|ovo|omelete|presunto|peru|linguica|bacon|whey|albumina|castanha|amendoa|noz|amendoim|azeite|oleo|abacate/, 25],
  ];

  // Sem regra que case, o palpite vem da composição: quanto mais o alimento é
  // carboidrato puro e denso, mais alto o IG provável.
  function igPorComposicao(food) {
    const kcal = Math.max(food.kcal || 0, 1);
    const fatiaCarb = ((food.c || 0) * 4) / kcal;
    if ((food.c || 0) < 5) return 25;
    if (fatiaCarb >= 0.8 && (food.c || 0) >= 50) return 70;
    if (fatiaCarb >= 0.6) return 60;
    if (fatiaCarb >= 0.4) return 50;
    return 40;
  }

  const igDe = (food) => {
    const n = norm(food.n || food.nome);
    for (const [re, ig] of TABELA) if (re.test(n)) return ig;
    return igPorComposicao(food);
  };

  // Carga glicêmica da refeição: IG × carboidrato ÷ 100, item a item.
  // Referência usual por refeição: até 10 baixa, 11-19 média, 20+ alta.
  function avaliar(itens) {
    const lista = (itens || []).filter((i) => i && !i.off);
    const total = lista.reduce(
      (a, i) => ({
        kcal: a.kcal + (i.kcal || 0),
        p: a.p + (i.p || 0),
        c: a.c + (i.c || 0),
        g: a.g + (i.g || 0),
      }),
      { kcal: 0, p: 0, c: 0, g: 0 }
    );
    let cg = 0;
    const porItem = lista.map((i) => {
      const ig = igDe({ n: i.nome, kcal: i.gramas ? (i.kcal / i.gramas) * 100 : i.kcal, c: i.gramas ? (i.c / i.gramas) * 100 : i.c });
      const carga = (ig * (i.c || 0)) / 100;
      cg += carga;
      return { nome: i.nome, ig, carga, c: i.c || 0 };
    });
    porItem.sort((a, b) => b.carga - a.carga);
    const nivel = cg >= 20 ? 'alta' : cg >= 11 ? 'media' : 'baixa';
    // o que já segura a curva: proteína, gordura e vegetais no mesmo prato
    const temProteina = total.p >= 15;
    const temGordura = total.g >= 10;
    const temVegetal = lista.some((i) => /salada|alface|rucula|couve|brocolis|legume|verdura|pepino|tomate|abobrinha|repolho|espinafre|cenoura/.test(norm(i.nome)));
    // as tabelas não trazem fibra, mas leguminosa, aveia e semente no prato são
    // fibra de fato — e é fibra que segura a curva junto com proteína e gordura
    const temFibra =
      temVegetal ||
      lista.some((i) => /feijao|lentilha|grao de bico|ervilha|soja|aveia|chia|linhaca|psyllium|integral/.test(norm(i.nome)));
    const amortecida = [temProteina, temGordura, temFibra].filter(Boolean).length;
    // carga alta num prato sem proteína, gordura nem vegetal é o caso que
    // realmente pede ajuste; com o prato equilibrado o aviso vira nota de rodapé
    const aviso = nivel === 'alta' ? (amortecida <= 1 ? 'forte' : 'leve') : null;
    return {
      cg: Math.round(cg), nivel, aviso, total, porItem,
      temProteina, temGordura, temVegetal, temFibra, amortecida,
      perfil: perfilDe(lista),
    };
  }

  /* ---- O que diluir a refeição sem pesar nas calorias ----
     A sugestão precisa combinar com o que está no prato: vinagre e salada num
     lanche de iogurte com granola não faz sentido. Cada opção declara em quais
     perfis de refeição ela cabe. */

  // Perfil da refeição, pelo que já está nela
  function perfilDe(itens) {
    const nomes = itens.map((i) => norm(i.nome)).join(' | ');
    const salgado = /arroz|feijao|macarrao|carne|frango|peixe|salada|legume|batata|farofa|strogonoff|lasanha|pizza|hamburguer|sanduiche|esfiha|coxinha|sopa|omelete|ovo/.test(nomes);
    // leite e café não fazem uma refeição ser doce; iogurte, fruta e granola sim
    const doce = /iogurte|whey|granola|aveia|fruta|banana|morango|mamao|abacaxi|manga|bolo|torta|doce|chocolate|acai|sorvete|\bmel\b|geleia|vitamina|smoothie|shake|pudim|mousse|cookie|biscoito|pacoca|barra de/.test(nomes);
    const pao = /\bpao\b|torrada|bisnaguinha|baguete|croissant|cuscuz|tapioca|crepioca/.test(nomes);
    if (salgado) return 'salgado';
    if (doce) return 'doce';
    if (pao) return 'pao';
    return 'salgado';
  }

  // `perfis` diz onde a opção cabe; `precisa` só a mostra quando aquilo falta
  const DILUENTES = [
    // --- jeitos de comer, custo zero ---
    {
      tipo: 'ordem', perfis: ['salgado'], kcalPorcao: 0,
      titulo: 'Comece pela salada e pela proteína',
      detalhe: 'deixe o arroz, a massa ou o pão para o fim do prato',
    },
    {
      tipo: 'ordem', perfis: ['doce'], kcalPorcao: 0,
      titulo: 'Coma a parte proteica antes da doce',
      detalhe: 'iogurte, whey ou queijo primeiro; a fruta, a granola e o doce depois',
    },
    {
      tipo: 'ordem', perfis: ['pao'], kcalPorcao: 0,
      titulo: 'Coma o recheio junto, não o pão sozinho',
      detalhe: 'ovo, queijo ou pasta de amendoim na mesma garfada seguram a subida',
    },
    // --- salgado ---
    { tipo: 'tempero', perfis: ['salgado'], busca: 'Vinagre, maçã', qtd: 15, titulo: 'Vinagre de maçã na salada', detalhe: 'ácido junto da refeição segura a subida' },
    { tipo: 'tempero', perfis: ['salgado'], busca: 'Limão, cravo, suco', qtd: 20, titulo: 'Suco de limão', detalhe: 'ácido junto da refeição segura a subida' },
    { tipo: 'vegetal', perfis: ['salgado'], busca: 'Salada de alface e tomate', qtd: 120, precisa: 'vegetal' },
    { tipo: 'vegetal', perfis: ['salgado'], busca: 'Pepino, cru', qtd: 100, precisa: 'vegetal' },
    { tipo: 'vegetal', perfis: ['salgado'], busca: 'Brócolis cozido', qtd: 100, precisa: 'vegetal' },
    { tipo: 'proteina', perfis: ['salgado', 'pao'], busca: 'Ovo de galinha, cozido', qtd: 1, med: 'unidade', precisa: 'proteina' },
    { tipo: 'proteina', perfis: ['salgado'], busca: 'Frango, peito, sem pele, grelhado', qtd: 60, precisa: 'proteina' },
    { tipo: 'gordura', perfis: ['salgado'], busca: 'Azeite, de oliva, extra virgem', qtd: 1, med: 'colher de cha', precisa: 'gordura' },
    // --- pão / café da manhã ---
    { tipo: 'proteina', perfis: ['pao'], busca: 'Queijo, minas, frescal', qtd: 40, precisa: 'proteina' },
    { tipo: 'gordura', perfis: ['pao', 'doce'], busca: 'Pasta de amendoim integral', qtd: 10, precisa: 'gordura' },
    { tipo: 'gordura', perfis: ['pao'], busca: 'Abacate, cru', qtd: 40, precisa: 'gordura' },
    // --- doce / lácteo ---
    { tipo: 'fibra', perfis: ['doce'], busca: 'Chia, semente, seca', qtd: 10, detalhe: 'fibra que engrossa e retarda a absorção' },
    { tipo: 'fibra', perfis: ['doce', 'pao'], busca: 'Linhaça, semente', qtd: 10, detalhe: 'fibra que retarda a absorção' },
    { tipo: 'proteina', perfis: ['doce'], busca: 'Iogurte, natural, desnatado', qtd: 100, precisa: 'proteina' },
    { tipo: 'proteina', perfis: ['doce'], busca: 'Queijo cottage', qtd: 50, precisa: 'proteina' },
    { tipo: 'proteina', perfis: ['doce'], busca: 'Whey protein concentrado', qtd: 15, precisa: 'proteina' },
    { tipo: 'gordura', perfis: ['doce'], busca: 'Castanha de caju', qtd: 10, precisa: 'gordura' },
  ];

  const DETALHE_PADRAO = {
    proteina: 'proteína segura a curva',
    vegetal: 'fibra e volume, quase sem caloria',
    gordura: 'gordura boa retarda a absorção',
    fibra: 'fibra retarda a absorção',
    tempero: 'quase sem caloria',
  };

  // Monta a lista para aquela refeição: só o que combina com o perfil, só o
  // que ainda falta, sem repetir o que já está no prato, do mais barato em
  // calorias para o mais caro.
  function sugestoes(aval, quantos = 4) {
    const perfil = aval.perfil || 'salgado';
    const falta = {
      proteina: !aval.temProteina,
      vegetal: !aval.temVegetal,
      gordura: !aval.temGordura,
    };
    const jaTem = (nome) => {
      const raiz = norm(nome).split(' ')[0];
      return (aval.porItem || []).some((i) => norm(i.nome).includes(raiz));
    };
    const saida = [];
    for (const d of DILUENTES) {
      if (!d.perfis.includes(perfil)) continue;
      if (d.precisa && !falta[d.precisa]) continue;
      if (!d.busca) {
        saida.push({ ...d, kcalPorcao: 0 });
        continue;
      }
      const food = typeof FoodSearch !== 'undefined' ? FoodSearch.search(d.busca, 1)[0] : null;
      if (!food || jaTem(food.n)) continue;
      const medida = d.med && food.m ? (food.m || []).find(([r]) => norm(r).includes(d.med)) : null;
      const gramas = medida ? d.qtd * medida[1] : d.qtd;
      const k = gramas / 100;
      saida.push({
        ...d,
        food,
        gramas,
        medida: medida ? medida[0] : 'g',
        qtd: d.qtd,
        kcalPorcao: Math.round(food.kcal * k),
        p: food.p * k,
        c: food.c * k,
        g: food.g * k,
        titulo: d.titulo || food.n,
        detalhe: d.detalhe || DETALHE_PADRAO[d.tipo] || '',
      });
    }
    saida.sort((a, b) => a.kcalPorcao - b.kcalPorcao);
    return saida.slice(0, quantos);
  }

  return { avaliar, sugestoes, igDe, perfilDe, TABELA };
})();

if (typeof window !== 'undefined') window.Glicemia = Glicemia;
