/* Como o dia deve terminar.

   O painel de impacto responde "o que esta refeição faz com o dia até agora".
   Esta projeção responde outra coisa: "e depois dela, ainda vem o quê?". Sem
   isso o almoço de 700 kcal parece folgado às 13h e o dia estoura às 21h.

   O que falta do dia não é chutado por regra de três em cima da meta: é o que
   a PESSOA costuma comer em cada refeição, pela mediana dos últimos dois meses.
   Mediana e não média porque um rodízio de sexta não pode virar a expectativa
   de todas as sextas. Sem histórico suficiente para uma refeição, aí sim cai
   no peso do plano — e a projeção diz que aquele trecho é estimado. */
const Projecao = (() => {
  const JANELA_DIAS = 60;
  // abaixo disso a mediana é anedota, não hábito
  const MINIMO_AMOSTRAS = 3;
  // folga antes de falar: projeção é palpite, e palpite não pode gritar por 20 kcal
  const MARGEM = 0.05;
  const MARGEM_FORTE = 0.15;

  const ehAgua = (e) =>
    typeof AguaAviso !== 'undefined'
      ? AguaAviso.ehAgua(e)
      : !!e.ml && (e.kcal || 0) <= 2;

  const diaDe = (ts) => {
    const d = new Date(ts);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  };

  const mediana = (v) => {
    if (!v.length) return 0;
    const o = [...v].sort((a, b) => a - b);
    const m = Math.floor(o.length / 2);
    return o.length % 2 ? o[m] : (o[m - 1] + o[m]) / 2;
  };

  /* Quanto cada refeição custa para esta pessoa, por janela do plano.
     Só entram dias em que aquela refeição existiu: dia sem jantar registrado
     não conta como "jantar de 0 kcal", senão a mediana desabaria e a projeção
     prometeria um dia que nunca acontece. */
  function custoPorRefeicao(entries, plano, agora) {
    const limite = (agora || new Date()).getTime() - JANELA_DIAS * 86400000;
    const hoje = diaDe(agora || new Date());
    const porDiaRef = new Map(); // "dia|chave" -> kcal
    for (const e of entries) {
      if (ehAgua(e)) continue;
      const d = new Date(e.ts);
      const dia = diaDe(e.ts);
      if (dia < limite || dia >= hoje) continue; // hoje é o que se quer prever
      const ref = Sugestao.refeicaoDe(d, plano);
      const k = `${dia}|${ref.chave}`;
      porDiaRef.set(k, (porDiaRef.get(k) || 0) + (e.kcal || 0));
    }
    const amostras = new Map();
    for (const [k, kcal] of porDiaRef) {
      const chave = k.split('|')[1];
      if (!amostras.has(chave)) amostras.set(chave, []);
      amostras.get(chave).push(kcal);
    }
    const custo = new Map();
    for (const r of plano) {
      const v = amostras.get(r.chave) || [];
      custo.set(r.chave, { kcal: mediana(v), n: v.length, medido: v.length >= MINIMO_AMOSTRAS });
    }
    return custo;
  }

  /* entries: histórico inteiro · doDia: registros de hoje já salvos
     adicionando: kcal da refeição em montagem · quando: data/hora dela */
  function projetar({ entries, doDia, adicionando = 0, quando, refeicoesDia, metaKcal, gastoDiario }) {
    if (!metaKcal || !gastoDiario) return null;
    const direcao = metaKcal < gastoDiario ? 'deficit' : metaKcal > gastoDiario ? 'superavit' : null;
    if (!direcao) return null; // manutenção: não há teto nem piso a defender

    const agora = quando || new Date();
    const plano = Sugestao.planoDe(refeicoesDia);
    const atual = Sugestao.refeicaoDe(agora, plano);
    const custo = custoPorRefeicao(entries, plano, agora);

    const consumido = (doDia || []).reduce((n, e) => (ehAgua(e) ? n : n + (e.kcal || 0)), 0);

    // refeições de hoje que já têm registro: não são mais "o que falta"
    const jaFeitas = new Set();
    for (const e of doDia || []) {
      if (ehAgua(e)) continue;
      jaFeitas.add(Sugestao.refeicaoDe(new Date(e.ts), plano).chave);
    }

    const iAtual = plano.findIndex((r) => r.chave === atual.chave);
    const restantes = plano
      .slice(iAtual + 1)
      .filter((r) => !jaFeitas.has(r.chave))
      .map((r) => {
        const c = custo.get(r.chave) || { kcal: 0, n: 0, medido: false };
        return {
          chave: r.chave,
          nome: r.nome,
          kcal: Math.round(c.medido ? c.kcal : metaKcal * r.peso),
          medido: c.medido,
          n: c.n,
        };
      });

    const falta = restantes.reduce((n, r) => n + r.kcal, 0);
    const total = consumido + adicionando + falta;
    const sobra = metaKcal - total;
    const estimados = restantes.filter((r) => !r.medido).length;

    let risco = null;
    if (direcao === 'deficit') {
      if (total > metaKcal * (1 + MARGEM_FORTE)) risco = 'estoura';
      else if (total > metaKcal * (1 + MARGEM)) risco = 'aperta';
    } else {
      if (total < metaKcal * (1 - MARGEM_FORTE)) risco = 'falta';
      else if (total < metaKcal * (1 - MARGEM)) risco = 'curto';
    }

    return {
      direcao,
      consumido: Math.round(consumido),
      adicionando: Math.round(adicionando),
      restantes,
      falta: Math.round(falta),
      total: Math.round(total),
      meta: Math.round(metaKcal),
      sobra: Math.round(sobra),
      risco,
      estimados,
      refeicaoAtual: atual,
    };
  }

  return { projetar, custoPorRefeicao, JANELA_DIAS, MINIMO_AMOSTRAS };
})();

if (typeof window !== 'undefined') window.Projecao = Projecao;
