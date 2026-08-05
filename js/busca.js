/* Busca de alimentos: normalização de acentos + match por prefixo de tokens.
   Prioriza fontes em português nativo (TACO 't' > IBGE 'i' > USDA 'u'). */
const FoodSearch = (() => {
  // alimentos do usuário primeiro; fontes em português nativo (TACO/TBCA/curados)
  // na frente; USDA traduzido por último
  const SOURCE_RANK = { p: -1, t: 0, b: 0, r: 0, i: 1, u: 3 };

  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      // grafias populares → grafia usada nas tabelas
      .replace(/\bkibe(s)?\b/g, 'quibe$1')
      .replace(/\b(mussarela|mozarela|mozzarela|mozzarella)\b/g, 'mucarela')
      .replace(/\byogur(te?|t)\b/g, 'iogurte')
      .replace(/\bcatupiri\b/g, 'catupiry');

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
    const results = [];
    for (const item of indexed) {
      let score = 0;
      let ok = true;
      for (const t of tokens) {
        // cada token da consulta precisa ser prefixo de alguma palavra do nome
        let best = -1;
        for (let w = 0; w < item.words.length; w++) {
          if (item.words[w].startsWith(t)) {
            best = w;
            break;
          }
        }
        if (best === -1) {
          ok = false;
          break;
        }
        score += best; // palavras mais no início do nome pontuam melhor
      }
      if (!ok) continue;
      if (item.norm.startsWith(qContent)) score -= 5; // começo exato do nome vale mais
      score = score * 10 + SOURCE_RANK[item.f.f] * 6 + item.norm.length / 50;
      results.push({ food: item.f, score });
    }
    results.sort((a, b) => a.score - b.score);
    return results.slice(0, limit).map((r) => r.food);
  }

  return { buildIndex, search, normalize };
})();
