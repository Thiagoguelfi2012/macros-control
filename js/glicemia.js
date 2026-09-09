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
    const amortecida = [temProteina, temGordura, temVegetal].filter(Boolean).length;
    // carga alta num prato sem proteína, gordura nem vegetal é o caso que
    // realmente pede ajuste; com o prato equilibrado o aviso vira nota de rodapé
    const aviso = nivel === 'alta' ? (amortecida <= 1 ? 'forte' : 'leve') : null;
    return { cg: Math.round(cg), nivel, aviso, total, porItem, temProteina, temGordura, temVegetal, amortecida };
  }

  /* ---- O que diluir a refeição sem pesar nas calorias ----
     Ordem por custo calórico. As duas primeiras não são alimentos: são jeitos
     de comer o mesmo prato, e custam zero. */
  const DILUENTES = [
    { tipo: 'ordem', titulo: 'Comece pela salada e pela proteína', detalhe: 'deixe o arroz, a massa ou o pão para o fim do prato', kcal: 0 },
    { tipo: 'tempero', busca: 'Vinagre', qtd: 15, med: null, titulo: 'Vinagre ou limão na salada', detalhe: 'ácido junto da refeição segura a subida', kcal: 3 },
    { tipo: 'vegetal', busca: 'Salada de alface e tomate', qtd: 120, med: null, precisa: 'vegetal' },
    { tipo: 'vegetal', busca: 'Pepino, cru', qtd: 100, med: null, precisa: 'vegetal' },
    { tipo: 'vegetal', busca: 'Brócolis cozido', qtd: 100, med: null, precisa: 'vegetal' },
    { tipo: 'proteina', busca: 'Ovo de galinha, cozido', qtd: 1, med: 'unidade', precisa: 'proteina' },
    { tipo: 'proteina', busca: 'Iogurte, natural, desnatado', qtd: 100, med: null, precisa: 'proteina' },
    { tipo: 'proteina', busca: 'Queijo cottage', qtd: 50, med: null, precisa: 'proteina' },
    { tipo: 'proteina', busca: 'Frango, peito, sem pele, grelhado', qtd: 60, med: null, precisa: 'proteina' },
    { tipo: 'gordura', busca: 'Azeite, de oliva, extra virgem', qtd: 1, med: 'colher de cha', precisa: 'gordura' },
    { tipo: 'gordura', busca: 'Castanha de caju', qtd: 10, med: null, precisa: 'gordura' },
    { tipo: 'gordura', busca: 'Abacate, cru', qtd: 40, med: null, precisa: 'gordura' },
  ];

  // Monta a lista de sugestões para aquela refeição: primeiro o que falta
  // (proteína, vegetal, gordura), sempre do mais barato em calorias para o
  // mais caro, e no máximo quatro.
  function sugestoes(aval, quantos = 4) {
    const falta = {
      proteina: !aval.temProteina,
      vegetal: !aval.temVegetal,
      gordura: !aval.temGordura,
    };
    const saida = [];
    for (const d of DILUENTES) {
      if (saida.length >= quantos * 3) break;
      if (d.precisa && !falta[d.precisa]) continue;
      if (!d.busca) {
        saida.push({ ...d, kcalPorcao: 0 });
        continue;
      }
      const food = typeof FoodSearch !== 'undefined' ? FoodSearch.search(d.busca, 1)[0] : null;
      if (!food) continue;
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
        detalhe: d.detalhe || (d.tipo === 'proteina' ? 'proteína segura a curva' : d.tipo === 'vegetal' ? 'fibra e volume, quase sem caloria' : 'gordura boa retarda a absorção'),
      });
    }
    // as de custo zero primeiro; depois as mais baratas
    saida.sort((a, b) => a.kcalPorcao - b.kcalPorcao);
    return saida.slice(0, quantos);
  }

  return { avaliar, sugestoes, igDe, TABELA };
})();

if (typeof window !== 'undefined') window.Glicemia = Glicemia;
