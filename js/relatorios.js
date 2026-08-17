/* Tela Relatórios: filtros de período, totais, déficit/superávit e gráficos. */
(() => {
  const $ = (sel) => document.querySelector(sel);
  let periodo = 7; // tamanho da janela em dias (1, 7, 15, 30, 90, 365)
  let offset = 0; // 0 = janela atual (terminando hoje), -1 = janela anterior…
  let chartKcal = null;
  let chartMacros = null;
  let chartAcum = null;

  const fmt = (n, dec = 1) =>
    Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: dec });

  const cssVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  // equivalência clássica para projeção de peso: 1 kg de gordura ≈ 7.700 kcal
  const KCAL_POR_KG = 7700;

  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const DIAS_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

  /* ---- Cálculo do intervalo do período ---- */

  function intervalo() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const n = periodo;
    // janela móvel de n dias terminando hoje; o offset desloca em janelas inteiras
    const fim = new Date(hoje);
    fim.setDate(fim.getDate() + 1 + offset * n);
    const inicio = new Date(fim);
    inicio.setDate(inicio.getDate() - n);
    const fimVis = new Date(fim.getTime() - 86400000);
    let granularidade, label;
    if (n === 1) {
      granularidade = 'hora';
      label =
        offset === 0
          ? 'Hoje'
          : fimVis.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } else {
      // até 90 dias: uma barra por dia; 1 ano: uma barra por mês
      granularidade = n >= 180 ? 'mes' : 'dia';
      label =
        offset === 0
          ? `Últimos ${n} dias`
          : `${inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${fimVis.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    }
    return { inicio, fim, granularidade, label };
  }

  // Dias que contam no período: SOMENTE os dias com algum alimento registrado.
  // Dias futuros nunca entram, e dias sem registro também não — seja hoje de
  // madrugada (antes do café) ou datas anteriores ao início do uso do app, que
  // inflariam o gasto e criariam um déficit irreal em janelas longas.
  function diasContabilizados(inicio, fim, entries) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const limite = Math.min(fim.getTime(), hoje.getTime() + 86400000);
    const dias = new Set();
    for (const e of entries) {
      const d = new Date(e.ts);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() >= inicio.getTime() && d.getTime() < limite) dias.add(d.getTime());
    }
    return dias.size;
  }

  /* ---- Agregação ---- */

  function agregar(entries, inicio, fim, granularidade) {
    const soma = (b, e) => {
      b.kcal += e.kcal;
      b.p += e.p;
      b.c += e.c;
      b.g += e.g;
    };
    const vazio = { kcal: 0, p: 0, c: 0, g: 0 };
    let buckets = [];
    if (granularidade === 'hora') {
      buckets = Array.from({ length: 24 }, (_, h) => ({ label: `${String(h).padStart(2, '0')}h`, ...vazio }));
      for (const e of entries) soma(buckets[new Date(e.ts).getHours()], e);
    } else if (granularidade === 'dia') {
      const nDias = Math.round((fim - inicio) / 86400000);
      const curta = nDias <= 7; // janela curta: dia da semana ajuda na leitura
      buckets = Array.from({ length: nDias }, (_, i) => {
        const d = new Date(inicio);
        d.setDate(d.getDate() + i);
        const dm = `${d.getDate()}/${d.getMonth() + 1}`;
        return { label: curta ? `${DIAS_SEMANA[(d.getDay() + 6) % 7]} ${dm}` : dm, ...vazio };
      });
      for (const e of entries) {
        const d = new Date(e.ts);
        d.setHours(0, 0, 0, 0);
        const idx = Math.round((d - inicio) / 86400000);
        if (idx >= 0 && idx < buckets.length) soma(buckets[idx], e);
      }
    } else {
      // por mês (janela de 1 ano); meses parciais nas pontas recebem só os
      // registros dentro da janela
      const meses = [];
      const c = new Date(inicio.getFullYear(), inicio.getMonth(), 1);
      while (c < fim) {
        meses.push({ label: MESES[c.getMonth()], mes: c.getMonth(), ano: c.getFullYear(), ...vazio, dias: new Date(c.getFullYear(), c.getMonth() + 1, 0).getDate() });
        c.setMonth(c.getMonth() + 1);
      }
      for (const e of entries) {
        const d = new Date(e.ts);
        const b = meses.find((m) => m.mes === d.getMonth() && m.ano === d.getFullYear());
        if (b) soma(b, e);
      }
      buckets = meses;
    }
    return buckets;
  }

  /* ---- Tiles ---- */

  function renderTiles(tot, dias, diasReais) {
    const { gastoDiario } = MacroDB.getSettings();
    const tiles = $('#tiles');
    const kcalMacro = tot.p * 4 + tot.c * 4 + tot.g * 9;
    const pct = (v) => (kcalMacro > 0 ? `${fmt((v / kcalMacro) * 100, 0)}% das kcal` : '—');
    let balancoHtml;
    if (gastoDiario && diasReais === 0) {
      balancoHtml = `
        <div class="tile balance">
          <div class="t-label">Déficit / superávit</div>
          <div class="t-value" style="font-size:14px;font-weight:500;color:var(--muted)">Sem registros no período ainda</div>
        </div>`;
    } else if (gastoDiario) {
      const gasto = gastoDiario * dias;
      const saldo = tot.kcal - gasto; // >0 = superávit, <0 = déficit
      const ehDeficit = saldo <= 0;
      balancoHtml = `
        <div class="tile balance">
          <div class="t-label">${ehDeficit ? '▼ Déficit calórico' : '▲ Superávit calórico'}</div>
          <div class="t-value ${ehDeficit ? 'good' : 'bad'}">${fmt(Math.abs(saldo), 0)} kcal</div>
          <div class="t-sub">gasto estimado: ${fmt(gasto, 0)} kcal em ${dias} dia${dias > 1 ? 's' : ''} com registro</div>
        </div>`;
    } else {
      balancoHtml = `
        <div class="tile balance">
          <div class="t-label">Déficit / superávit</div>
          <div class="t-value" style="font-size:14px;font-weight:500;color:var(--muted)">Configure seu gasto médio diário em Configurações</div>
        </div>`;
    }
    // num período de um dia só, "média por dia" repetiria o total: omite
    const subKcal = dias > 1 ? `média ${fmt(tot.kcal / dias, 0)} kcal/dia` : '&nbsp;';
    const subMacro = (kcalM, v) => (dias > 1 ? `${pct(kcalM)} · ${fmt(v / dias, 0)} g/dia` : pct(kcalM));
    tiles.innerHTML = `
      <div class="tile">
        <div class="t-label">Calorias</div>
        <div class="t-value">${fmt(tot.kcal, 0)}</div>
        <div class="t-sub">${subKcal}</div>
      </div>
      <div class="tile">
        <div class="t-label"><span class="sw sw-p"></span>Proteínas</div>
        <div class="t-value">${fmt(tot.p, 0)} g</div>
        <div class="t-sub">${subMacro(tot.p * 4, tot.p)}</div>
      </div>
      <div class="tile">
        <div class="t-label"><span class="sw sw-c"></span>Carboidratos</div>
        <div class="t-value">${fmt(tot.c, 0)} g</div>
        <div class="t-sub">${subMacro(tot.c * 4, tot.c)}</div>
      </div>
      <div class="tile">
        <div class="t-label"><span class="sw sw-g"></span>Gorduras</div>
        <div class="t-value">${fmt(tot.g, 0)} g</div>
        <div class="t-sub">${subMacro(tot.g * 9, tot.g)}</div>
      </div>
      ${balancoHtml}`;
  }

  /* ---- Déficit calórico acumulado ---- */

  function renderAcumulado(entries, inicio, fim) {
    const { gastoDiario } = MacroDB.getSettings();
    const card = $('#card-acum');
    const pad2 = (n) => String(n).padStart(2, '0');
    const chave = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
    // consumo por dia
    const porDia = new Map();
    for (const e of entries) {
      const k = chave(new Date(e.ts));
      porDia.set(k, (porDia.get(k) || 0) + e.kcal);
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const labels = [];
    const data = [];
    let acc = 0;
    for (const d = new Date(inicio); d < fim; d.setDate(d.getDate() + 1)) {
      if (d > hoje) break;
      const k = chave(d);
      // só dias com registro entram no acumulado (mesma regra dos tiles): dias
      // em branco não geram déficit, senão a curva despencaria sozinha
      if (!porDia.has(k)) continue;
      acc += porDia.get(k) - gastoDiario;
      labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
      data.push(Math.round(acc));
    }
    if (!gastoDiario || data.length < 2) {
      card.hidden = true;
      $('#acum-peso').hidden = true;
      if (chartAcum) {
        chartAcum.destroy();
        chartAcum = null;
      }
      return;
    }
    card.hidden = false;
    const final = data[data.length - 1];
    card.dataset.final = String(final);

    // projeção de peso: ~7.700 kcal equivalem a 1 kg de gordura corporal
    const kg = Math.abs(final) / KCAL_POR_KG;
    const perdeu = final <= 0;
    const kgEl = $('#ap-kg');
    kgEl.textContent = `${perdeu ? '−' : '+'}${fmt(kg, 2)} kg`;
    kgEl.className = perdeu ? 'good' : 'bad';
    $('#ap-texto').textContent = perdeu
      ? 'de gordura no período, se o ritmo se confirmar'
      : 'de ganho no período, se o ritmo se confirmar';
    const porSemana = (kg / data.length) * 7;
    $('#ap-ritmo').textContent =
      `Ritmo de ${perdeu ? '−' : '+'}${fmt(porSemana, 2)} kg/semana em ${data.length} dia${data.length > 1 ? 's' : ''} com registro · ` +
      `estimativa por 7.700 kcal ≈ 1 kg (o peso da balança também varia com água, intestino e glicogênio)`;
    $('#acum-peso').hidden = false;
    const good = cssVar('--good-text');
    const bad = cssVar('--bad-text');
    const muted = cssVar('--muted');
    const grid = cssVar('--grid');
    const baseline = cssVar('--baseline');
    // escala fixada nos dois eixos (kcal e kg) para que leiam o mesmo intervalo,
    // arredondada para valores redondos em vez de sobrar 880 / −11.880 nas pontas
    const menor = Math.min(...data, 0);
    const maior = Math.max(...data, 0);
    const amplitude = maior - menor;
    const passo = amplitude > 8000 ? 2000 : amplitude > 4000 ? 1000 : amplitude > 1500 ? 500 : 100;
    const escalaMin = Math.floor((menor - amplitude * 0.05) / passo) * passo;
    const escalaMax = Math.ceil((maior + amplitude * 0.05) / passo) * passo;
    if (chartAcum) chartAcum.destroy();
    chartAcum = new Chart($('#chart-acum'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Saldo acumulado',
            data,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.15,
            borderColor: data[data.length - 1] <= 0 ? good : bad,
            segment: { borderColor: (c) => (c.p1.parsed.y <= 0 ? good : bad) },
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = ctx.parsed.y;
                const emKg = fmt(Math.abs(v) / KCAL_POR_KG, 2);
                return ` ${v <= 0 ? 'Déficit' : 'Superávit'} acumulado: ${fmt(Math.abs(v), 0)} kcal ≈ ${emKg} kg`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { color: baseline },
            ticks: { color: muted, font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
          },
          y: {
            min: escalaMin,
            max: escalaMax,
            grid: { color: (c) => (c.tick.value === 0 ? baseline : grid), drawTicks: false },
            border: { display: false },
            ticks: { color: muted, font: { size: 11 }, maxTicksLimit: 6 },
          },
          // mesma escala, lida em quilos: o eixo da direita traduz as kcal
          kg: {
            position: 'right',
            min: escalaMin,
            max: escalaMax,
            grid: { display: false },
            border: { display: false },
            ticks: {
              color: muted,
              font: { size: 11 },
              maxTicksLimit: 6,
              callback: (v) => `${fmt(v / KCAL_POR_KG, 1)} kg`,
            },
          },
        },
      },
    });
  }

  /* ---- Dieta alvo × consumo ---- */

  function renderAlvo(tot, dias) {
    const { metaKcal, metaP, metaC, metaG } = MacroDB.getSettings();
    const card = $('#card-alvo');
    if (!metaKcal && !metaP && !metaC && !metaG) {
      card.hidden = true;
      return;
    }
    card.hidden = false;
    // o alvo acompanha o período selecionado: alvo diário × dias decorridos
    // (semana em andamento com 3 dias → alvo de 3 dias)
    $('#alvo-sub').textContent =
      dias > 1
        ? `Consumo do período comparado com o alvo (alvo diário × ${dias} dias com registro)`
        : 'Consumo do dia comparado com o alvo diário';
    const macros = [
      { nome: 'Calorias', unidade: 'kcal', cor: 'var(--accent)', sw: '', total: tot.kcal, alvo: metaKcal },
      { nome: 'Proteínas', cor: 'var(--s1)', sw: 'sw-p', total: tot.p, alvo: metaP },
      { nome: 'Carboidratos', cor: 'var(--s2)', sw: 'sw-c', total: tot.c, alvo: metaC },
      { nome: 'Gorduras', cor: 'var(--s3)', sw: 'sw-g', total: tot.g, alvo: metaG },
    ];
    const wrap = $('#alvo-bars');
    wrap.innerHTML = '';
    for (const m of macros) {
      const un = m.unidade || 'g';
      const chip = m.sw
        ? `<span class="macro-chip"><span class="sw ${m.sw}"></span>${m.nome}</span>`
        : `<span class="macro-chip">${m.nome}</span>`;
      const row = document.createElement('div');
      row.className = 'alvo-row';
      if (!m.alvo) {
        row.innerHTML = `
          <div class="alvo-head">
            ${chip}
            <span class="alvo-vals"><b>${fmt(m.total, 0)}</b> ${un} · sem alvo definido</span>
          </div>`;
        wrap.appendChild(row);
        continue;
      }
      const alvoPeriodo = m.alvo * dias;
      const pct = (m.total / alvoPeriodo) * 100;
      const media = dias > 1 ? ` · média ${fmt(m.total / dias, 0)}/dia` : '';
      row.innerHTML = `
        <div class="alvo-head">
          ${chip}
          <span class="alvo-vals"><b>${fmt(m.total, 0)}</b> / ${fmt(alvoPeriodo, 0)} ${un} · ${fmt(pct, 0)}%${media}</span>
        </div>
        <div class="alvo-bar${pct > 110 ? ' over' : ''}">
          <div style="width:${Math.min(100, pct).toFixed(1)}%;background:${m.cor}"></div>
        </div>`;
      wrap.appendChild(row);
    }
  }

  /* ---- Gráficos ---- */

  function renderCharts(buckets, granularidade, tot, dias) {
    const { gastoDiario } = MacroDB.getSettings();
    const ink2 = cssVar('--ink-2');
    const muted = cssVar('--muted');
    const grid = cssVar('--grid');
    const surface = cssVar('--surface');
    const s1 = cssVar('--s1');
    const s2 = cssVar('--s2');
    const s3 = cssVar('--s3');

    const labels = buckets.map((b) => b.label);
    // barras empilhadas por macronutriente (em kcal)
    const mkStack = (label, cor, valor) => ({
      label,
      data: buckets.map((b) => Math.round(valor(b))),
      backgroundColor: cor,
      stack: 'kcal',
      borderColor: surface,
      borderWidth: 1.5,
      borderSkipped: false,
      maxBarThickness: 26,
      barPercentage: 0.65,
      categoryPercentage: 0.8,
    });
    const datasets = [
      mkStack('Proteínas', s1, (b) => b.p * 4),
      mkStack('Carboidratos', s2, (b) => b.c * 4),
      mkStack('Gorduras', s3, (b) => b.g * 9),
    ];
    const { metaKcal } = MacroDB.getSettings();
    const linhas = [];
    if (granularidade !== 'hora') {
      const porBalde = (v) => buckets.map((b) => (granularidade === 'mes' ? v * b.dias : v));
      if (gastoDiario) {
        datasets.push({
          type: 'line',
          label: granularidade === 'mes' ? 'Gasto estimado no mês' : 'Gasto médio diário',
          data: porBalde(gastoDiario),
          stack: 'linha-gasto',
          borderColor: muted,
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
        });
        linhas.push('gasto estimado');
      }
      if (metaKcal) {
        datasets.push({
          type: 'line',
          label: 'Dieta alvo',
          data: porBalde(metaKcal),
          stack: 'linha-alvo',
          borderColor: cssVar('--alvo-line'),
          borderWidth: 2,
          borderDash: [3, 3],
          pointRadius: 0,
          pointHoverRadius: 4,
          fill: false,
        });
        linhas.push('dieta alvo');
      }
    }
    $('#chart-kcal-sub').textContent = linhas.length
      ? `Barras: calorias por macronutriente · Linha${linhas.length > 1 ? 's' : ''} tracejada${linhas.length > 1 ? 's' : ''}: ${linhas.join(' e ')}`
      : 'Calorias por macronutriente no período';

    if (chartKcal) chartKcal.destroy();
    chartKcal = new Chart($('#chart-kcal'), {
      type: 'bar',
      data: { labels, datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            labels: { color: ink2, usePointStyle: true, pointStyleWidth: 10, boxHeight: 8, font: { size: 12 } },
          },
          tooltip: {
            filter: (ctx) => ctx.dataset.type === 'line' || ctx.parsed.y > 0,
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.type === 'line') return ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y, 0)} kcal`;
                const b = buckets[ctx.dataIndex];
                const { metaP, metaC, metaG } = MacroDB.getSettings();
                const info = {
                  Proteínas: [b.p, metaP],
                  Carboidratos: [b.c, metaC],
                  Gorduras: [b.g, metaG],
                }[ctx.dataset.label];
                if (!info) return ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y, 0)} kcal`;
                const [gramas, metaDia] = info;
                // alvo do balde: diário nas visões por dia; × dias na visão mensal
                // (no filtro Dia, cada barra é 1 hora — % do alvo não se aplica)
                const alvo =
                  metaDia && granularidade !== 'hora'
                    ? granularidade === 'mes'
                      ? metaDia * b.dias
                      : metaDia
                    : null;
                const pctAlvo = alvo ? ` · ${fmt((gramas / alvo) * 100, 0)}% do alvo` : '';
                return ` ${ctx.dataset.label}: ${fmt(gramas, 0)} g (${fmt(ctx.parsed.y, 0)} kcal)${pctAlvo}`;
              },
              footer: (items) => {
                const barra = items.find((i) => i.dataset.type !== 'line');
                if (!barra) return '';
                const b = buckets[barra.dataIndex];
                const total = 4 * b.p + 4 * b.c + 9 * b.g;
                if (total <= 0) return '';
                const { metaKcal: mk } = MacroDB.getSettings();
                const alvoKcal =
                  mk && granularidade !== 'hora' ? (granularidade === 'mes' ? mk * b.dias : mk) : null;
                return `Total: ${fmt(total, 0)} kcal${alvoKcal ? ` · ${fmt((total / alvoKcal) * 100, 0)}% da meta` : ''}`;
              },
            },
          },
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            border: { color: cssVar('--baseline') },
            ticks: { color: muted, font: { size: 11 }, maxRotation: 0, autoSkip: true },
          },
          y: {
            stacked: true,
            beginAtZero: true,
            grid: { color: grid, drawTicks: false },
            border: { display: false },
            ticks: { color: muted, font: { size: 11 }, maxTicksLimit: 6 },
          },
        },
      },
    });

    // Distribuição de macros (em kcal): anel externo = consumo; quando há dieta
    // alvo, anel interno mais claro = distribuição do alvo
    const kcalP = tot.p * 4;
    const kcalC = tot.c * 4;
    const kcalG = tot.g * 9;
    const { metaP, metaC, metaG } = MacroDB.getSettings();
    const temAlvo = metaP || metaC || metaG;
    const datasetsMacros = [
      {
        label: 'Consumo',
        data: [Math.round(kcalP), Math.round(kcalC), Math.round(kcalG)],
        backgroundColor: [s1, s2, s3],
        borderColor: surface,
        borderWidth: 2,
        hoverOffset: 6,
      },
    ];
    if (temAlvo) {
      const hexa = (c, a) => c + a; // cores dos tokens são hex #rrggbb
      // alvo escalado para o período (× dias decorridos), comparável ao consumo
      datasetsMacros.push({
        label: 'Alvo',
        data: [
          Math.round((metaP || 0) * 4 * dias),
          Math.round((metaC || 0) * 4 * dias),
          Math.round((metaG || 0) * 9 * dias),
        ],
        backgroundColor: [hexa(s1, '73'), hexa(s2, '73'), hexa(s3, '73')],
        borderColor: surface,
        borderWidth: 2,
      });
    }
    $('#macros-sub').textContent = temAlvo
      ? 'Anel externo: consumo · anel interno (claro): dieta alvo'
      : 'Participação nas calorias do período';
    if (chartMacros) chartMacros.destroy();
    chartMacros = new Chart($('#chart-macros'), {
      type: 'doughnut',
      data: {
        labels: ['Proteínas', 'Carboidratos', 'Gorduras'],
        datasets: datasetsMacros,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '45%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: ink2, usePointStyle: true, pointStyleWidth: 10, boxHeight: 8, font: { size: 12 } },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const totalDs = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = totalDs > 0 ? ` (${fmt((ctx.parsed / totalDs) * 100, 0)}%)` : '';
                return ` ${ctx.dataset.label} — ${ctx.label}: ${fmt(ctx.parsed, 0)} kcal${pct}`;
              },
            },
          },
        },
      },
    });
  }

  /* ---- Render principal ---- */

  async function render() {
    const { inicio, fim, granularidade, label } = intervalo();
    $('#range-label').textContent = label;
    $('#btn-next').disabled = offset >= 0;
    const entries = await MacroDB.getEntriesBetween(inicio.toISOString(), fim.toISOString());
    const tot = entries.reduce(
      (acc, e) => ({ kcal: acc.kcal + e.kcal, p: acc.p + e.p, c: acc.c + e.c, g: acc.g + e.g }),
      { kcal: 0, p: 0, c: 0, g: 0 }
    );
    const diasReais = diasContabilizados(inicio, fim, entries);
    const dias = Math.max(1, diasReais);
    renderTiles(tot, dias, diasReais);
    renderAcumulado(entries, inicio, fim);
    renderAlvo(tot, dias);
    renderCharts(agregar(entries, inicio, fim, granularidade), granularidade, tot, dias);
  }

  /* ---- Eventos ---- */

  function init() {
    $('#seg-periodo').addEventListener('click', (ev) => {
      const btn = ev.target.closest('button[data-p]');
      if (!btn) return;
      for (const b of $('#seg-periodo').children) b.classList.toggle('active', b === btn);
      periodo = Number(btn.dataset.p);
      offset = 0;
      render();
    });
    $('#btn-prev').addEventListener('click', () => {
      offset--;
      render();
    });
    $('#btn-next').addEventListener('click', () => {
      if (offset < 0) {
        offset++;
        render();
      }
    });


    // re-renderiza os gráficos quando o tema muda (cores dos tokens): pelo
    // sistema ou por um toggle que carimbe data-theme na raiz
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', render);
    new MutationObserver(render).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    // versão de página única: o diário dispara este evento ao trocar de aba
    document.addEventListener('relatorios:refresh', render);

    render();
  }

  init();
})();
