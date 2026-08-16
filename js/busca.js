/* Busca de alimentos: normalização de acentos + match por prefixo de tokens.
   Prioriza fontes em português nativo (TACO 't' > IBGE 'i' > USDA 'u'). */
const FoodSearch = (() => {
  // alimentos do usuário primeiro; fontes em português nativo (TACO/TBCA/curados)
  // na frente; USDA traduzido por último
  const SOURCE_RANK = { p: -1, t: 0, b: 0, r: 0, m: 0, i: 1, u: 3 };

  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      // apóstrofos (retos e tipográficos) somem em vez de virar espaço:
      // "hellmann's" vira "hellmanns" e "McDonald’s" vira "mcdonalds"
      .replace(/['‘’ʼ´`]/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      // grafias populares → grafia usada nas tabelas
      .replace(/\bmiojo\b/g, 'macarrao instantaneo')
      .replace(/\bkibe(s)?\b/g, 'quibe$1')
      .replace(/\b(mussarela|mozarela|mozzarela|mozzarella)\b/g, 'mucarela')
      .replace(/\byogur(te?|t)\b/g, 'iogurte')
      .replace(/\bcatupiri\b/g, 'catupiry')
      .replace(/\bmaizena\b/g, 'maisena')
      .replace(/\bwooper\b/g, 'whopper')
      .replace(/\bbk\b/g, 'burger king')
      .replace(/\bbach?io\b/g, 'bacio') // "bachio di latte" → Bacio di Latte
      .replace(/\bmc ?donalds?\b/g, 'mcdonalds')
      .replace(/\bhamburger(s)?\b/g, 'hamburguer$1')
      .replace(/\bx (burguer|burger|salada|tudo|bacon|egg)\b/g, 'x$1')
      // "bolacha" e "biscoito" são a mesma coisa (varia por região): as tabelas
      // e os rótulos usam "biscoito", então normaliza tudo para ele
      .replace(/\bbolach(a|as|inha|inhas)\b/g, 'biscoito');

  // palavras de ligação: não contam para o match nem para a posição —
  // "file catupiry" encontra "Filé mignon ao catupiry"
  // ("sem" fica de fora: distingue "temaki sem arroz" de "com arroz")
  // "mini" também: o tamanho vem da medida caseira, não do nome —
  // "mini pão de queijo" deve achar o pão de queijo (que tem a medida mini)
  const STOP = new Set([
    'de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'as', 'os', 'ao', 'aos',
    'em', 'no', 'na', 'nos', 'nas', 'com', 'para', 'mini',
  ]);

  let indexed = null;

  function buildIndex(foods) {
    indexed = foods.map((f) => {
      const words = normalize(f.n).split(' ').filter((w) => !STOP.has(w));
      return { f, norm: words.join(' '), words };
    });
  }

  function search(query, limit = 50) {
    if (!indexed) return [];
    const q = normalize(query);
    if (!q) return [];
    let tokens = q.split(' ').filter((t) => !STOP.has(t));
    if (!tokens.length) tokens = q.split(' ');
    const qContent = tokens.join(' ');
    // mínimo de termos que precisam bater quando nada casa com a consulta
    // inteira: "esfiha aberta de queijo branco" ainda acha a esfiha de queijo
    const minParcial = tokens.length >= 3 ? tokens.length - 1 : tokens.length;
    const results = [];
    const parciais = [];
    for (const item of indexed) {
      let score = 0;
      let casados = 0;
      for (const t of tokens) {
        // cada token da consulta precisa ser prefixo de alguma palavra do nome
        let best = -1;
        let exato = false;
        for (let w = 0; w < item.words.length; w++) {
          if (item.words[w] === t) {
            best = w;
            exato = true;
            break; // palavra idêntica vale mais que prefixo ("bis" ≠ "biscoito")
          }
          if (best === -1 && item.words[w].startsWith(t)) best = w;
        }
        if (best === -1) continue;
        casados++;
        score += best - (exato ? 3 : 0); // início do nome e match exato pontuam melhor
      }
      if (casados < minParcial) continue;
      // começo exato do nome vale mais — mas só em fronteira de palavra,
      // senão "bis" ganharia o bônus em "biscoito"
      if (
        item.norm.startsWith(qContent) &&
        (item.norm.length === qContent.length || item.norm[qContent.length] === ' ')
      ) {
        score -= 5;
      }
      score = score * 10 + SOURCE_RANK[item.f.f] * 6 + item.norm.length / 50;
      (casados === tokens.length ? results : parciais).push({ food: item.f, score });
    }
    // resultados parciais só entram quando não há nada que case por completo
    const lista = results.length ? results : parciais;
    lista.sort((a, b) => a.score - b.score);
    return lista.slice(0, limit).map((r) => r.food);
  }

  return { buildIndex, search, normalize };
})();
