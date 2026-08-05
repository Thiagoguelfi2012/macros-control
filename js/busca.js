/* Busca de alimentos: normalização de acentos + match por prefixo de tokens.
   Prioriza fontes em português nativo (TACO 't' > IBGE 'i' > USDA 'u'). */
const FoodSearch = (() => {
  const SOURCE_RANK = { t: 0, i: 1, u: 2 };

  const normalize = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9 ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  let indexed = null;

  function buildIndex(foods) {
    indexed = foods.map((f) => ({ f, norm: normalize(f.n), words: normalize(f.n).split(' ') }));
  }

  function search(query, limit = 50) {
    if (!indexed) return [];
    const q = normalize(query);
    if (!q) return [];
    const tokens = q.split(' ');
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
      if (item.norm.startsWith(q)) score -= 5; // começo exato do nome vale mais
      score = score * 10 + SOURCE_RANK[item.f.f] * 3 + item.norm.length / 50;
      results.push({ food: item.f, score });
    }
    results.sort((a, b) => a.score - b.score);
    return results.slice(0, limit).map((r) => r.food);
  }

  return { buildIndex, search, normalize };
})();
