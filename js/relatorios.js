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


  /* ---- Relatório para o médico (impressão / PDF) ---- */

  const esc = (t) =>
    String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  const dataExtenso = (d) =>
    d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // nome da refeição pelo horário (mesma régua do diário)
  function nomeRefeicaoPdf(data) {
    const h = data.getHours() + data.getMinutes() / 60;
    if (h < 5) return 'Madrugada';
    if (h < 10.5) return 'Café da manhã';
    if (h < 12) return 'Lanche da manhã';
    if (h < 15) return 'Almoço';
    if (h < 18.5) return 'Lanche da tarde';
    if (h < 22) return 'Jantar';
    return 'Ceia';
  }

  const qtdStrPdf = (e) => {
    const un = e.ml ? 'ml' : 'g';
    if (e.medida === 'g') return `${fmt(e.qtd)} ${un}`;
    if (String(e.medida).includes('(')) return `${fmt(e.qtd)} × ${e.medida}`;
    return `${fmt(e.qtd)} × ${e.medida} (${fmt(e.gramas)} ${un})`;
  };

  // reúne tudo o que o relatório precisa, uma vez só
  async function dadosRelatorio() {
    const { inicio, fim, label } = intervalo();
    const entries = await MacroDB.getEntriesBetween(inicio.toISOString(), fim.toISOString());
    const cfg = MacroDB.getSettings();
    const tot = entries.reduce(
      (acc, e) => ({ kcal: acc.kcal + e.kcal, p: acc.p + e.p, c: acc.c + e.c, g: acc.g + e.g }),
      { kcal: 0, p: 0, c: 0, g: 0 }
    );
    const dias = diasContabilizados(inicio, fim, entries);
    const pad2 = (n) => String(n).padStart(2, '0');
    const porDia = new Map();
    for (const e of entries) {
      const dt = new Date(e.ts);
      const k = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
      if (!porDia.has(k)) porDia.set(k, []);
      porDia.get(k).push(e);
    }
    // cada dia com seus totais e refeições (itens do mesmo minuto)
    const diasDetalhe = [...porDia.keys()].sort().map((k) => {
      const itens = porDia.get(k).slice().sort((a, b) => (a.ts < b.ts ? -1 : 1));
      const soma = itens.reduce(
        (acc, e) => ({ kcal: acc.kcal + e.kcal, p: acc.p + e.p, c: acc.c + e.c, g: acc.g + e.g }),
        { kcal: 0, p: 0, c: 0, g: 0 }
      );
      const refs = new Map();
      for (const e of itens) {
        const chave = e.ts.slice(0, 16);
        if (!refs.has(chave)) refs.set(chave, []);
        refs.get(chave).push(e);
      }
      const [y, m, dd] = k.split('-').map(Number);
      return {
        data: new Date(y, m - 1, dd),
        tot: soma,
        refeicoes: [...refs.values()].map((itensRef) => ({
          data: new Date(itensRef[0].ts),
          itens: itensRef,
          tot: itensRef.reduce(
            (acc, e) => ({ kcal: acc.kcal + e.kcal, p: acc.p + e.p, c: acc.c + e.c, g: acc.g + e.g }),
            { kcal: 0, p: 0, c: 0, g: 0 }
          ),
        })),
      };
    });
    return { inicio, fim, fimVis: new Date(fim.getTime() - 86400000), label, cfg, tot, dias, diasDetalhe };
  }

  const NOTA_RELATORIO =
    'Relatório gerado pelo app Controle de Macros a partir dos registros do próprio usuário. ' +
    'Os valores nutricionais vêm das tabelas TACO, TBCA, IBGE e USDA, de rótulos de produtos e de ' +
    'estimativas para preparações caseiras e de restaurante — portanto são aproximações. O gasto ' +
    'energético é o valor informado pelo usuário nas configurações, não uma medição.';

  function montarRelatorioHtml(d) {
    const { cfg, tot, dias, diasDetalhe } = d;
    const div = Math.max(1, dias);
    const kcalMacro = tot.p * 4 + tot.c * 4 + tot.g * 9;
    const pctM = (v) => (kcalMacro > 0 ? `${fmt((v / kcalMacro) * 100, 0)}%` : '—');
    let html = `
      <h1>Relatório alimentar</h1>
      <p class="rp-periodo">
        Período: ${esc(dataExtenso(d.inicio))} a ${esc(dataExtenso(d.fimVis))} (${esc(d.label)})<br />
        Dias com registro: ${dias} · Emitido em ${esc(new Date().toLocaleString('pt-BR'))}
      </p>

      <h2>Gasto energético e metas configuradas</h2>
      <div class="rp-fatos">
        <div><span>Gasto basal (TMB)</span><b>${cfg.gastoBasal ? fmt(cfg.gastoBasal, 0) + ' kcal/dia' : 'não informado'}</b></div>
        <div><span>Gasto médio diário (TDEE)</span><b>${cfg.gastoDiario ? fmt(cfg.gastoDiario, 0) + ' kcal/dia' : 'não informado'}</b></div>
        <div><span>Meta de calorias</span><b>${cfg.metaKcal ? fmt(cfg.metaKcal, 0) + ' kcal/dia' : 'não definida'}</b></div>
        <div><span>Meta de proteínas</span><b>${cfg.metaP ? fmt(cfg.metaP, 0) + ' g/dia' : 'não definida'}</b></div>
        <div><span>Meta de carboidratos</span><b>${cfg.metaC ? fmt(cfg.metaC, 0) + ' g/dia' : 'não definida'}</b></div>
        <div><span>Meta de gorduras</span><b>${cfg.metaG ? fmt(cfg.metaG, 0) + ' g/dia' : 'não definida'}</b></div>
      </div>

      <h2>Consumo no período</h2>
      <table>
        <thead><tr><th>Nutriente</th><th>Total</th><th>Média/dia</th><th>% das kcal</th><th>Meta/dia</th></tr></thead>
        <tbody>
          <tr><td>Calorias</td><td>${fmt(tot.kcal, 0)} kcal</td><td>${fmt(tot.kcal / div, 0)} kcal</td><td>—</td><td>${cfg.metaKcal ? fmt(cfg.metaKcal, 0) : '—'}</td></tr>
          <tr><td>Proteínas</td><td>${fmt(tot.p, 0)} g</td><td>${fmt(tot.p / div, 0)} g</td><td>${pctM(tot.p * 4)}</td><td>${cfg.metaP ? fmt(cfg.metaP, 0) : '—'}</td></tr>
          <tr><td>Carboidratos</td><td>${fmt(tot.c, 0)} g</td><td>${fmt(tot.c / div, 0)} g</td><td>${pctM(tot.c * 4)}</td><td>${cfg.metaC ? fmt(cfg.metaC, 0) : '—'}</td></tr>
          <tr><td>Gorduras</td><td>${fmt(tot.g, 0)} g</td><td>${fmt(tot.g / div, 0)} g</td><td>${pctM(tot.g * 9)}</td><td>${cfg.metaG ? fmt(cfg.metaG, 0) : '—'}</td></tr>
        </tbody>
      </table>`;

    if (cfg.gastoDiario && dias > 0) {
      const gasto = cfg.gastoDiario * dias;
      const saldo = tot.kcal - gasto;
      const deficit = saldo <= 0;
      html += `
        <h2>Balanço energético</h2>
        <div class="rp-fatos">
          <div><span>Consumo total</span><b>${fmt(tot.kcal, 0)} kcal</b></div>
          <div><span>Gasto estimado (${dias} dia${dias > 1 ? 's' : ''})</span><b>${fmt(gasto, 0)} kcal</b></div>
          <div><span>${deficit ? 'Déficit' : 'Superávit'} no período</span><b>${fmt(Math.abs(saldo), 0)} kcal</b></div>
          <div><span>Equivalente em peso</span><b>${deficit ? '−' : '+'}${fmt(Math.abs(saldo) / KCAL_POR_KG, 2)} kg</b></div>
        </div>
        <p class="rp-nota" style="margin-top:8px;border:none;padding:0">
          Equivalência estimada por 7.700 kcal ≈ 1 kg de gordura corporal.
        </p>`;
    }

    if (diasDetalhe.length) {
      html += `
        <h2>Resumo por dia</h2>
        <table>
          <thead><tr><th>Dia</th><th>Calorias</th><th>Proteínas</th><th>Carboidratos</th><th>Gorduras</th>${cfg.gastoDiario ? '<th>Saldo</th>' : ''}</tr></thead>
          <tbody>`;
      for (const dia of diasDetalhe) {
        const saldoDia = dia.tot.kcal - cfg.gastoDiario;
        html += `<tr>
          <td>${esc(dia.data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }))}</td>
          <td>${fmt(dia.tot.kcal, 0)}</td><td>${fmt(dia.tot.p, 0)} g</td><td>${fmt(dia.tot.c, 0)} g</td><td>${fmt(dia.tot.g, 0)} g</td>
          ${cfg.gastoDiario ? `<td>${saldoDia <= 0 ? '−' : '+'}${fmt(Math.abs(saldoDia), 0)}</td>` : ''}
        </tr>`;
      }
      const saldoTotal = tot.kcal - cfg.gastoDiario * dias;
      html += `</tbody>
          <tfoot><tr>
            <td>Total</td><td>${fmt(tot.kcal, 0)}</td><td>${fmt(tot.p, 0)} g</td><td>${fmt(tot.c, 0)} g</td><td>${fmt(tot.g, 0)} g</td>
            ${cfg.gastoDiario ? `<td>${saldoTotal <= 0 ? '−' : '+'}${fmt(Math.abs(saldoTotal), 0)}</td>` : ''}
          </tr></tfoot>
        </table>`;
    }

    html += `<h2>Refeições do período</h2>`;
    if (!diasDetalhe.length) html += `<p>Nenhum alimento registrado neste período.</p>`;
    for (const dia of diasDetalhe) {
      html += `<div class="rp-dia">
        <div class="rp-dia-head">${esc(dataExtenso(dia.data))} — ${fmt(dia.tot.kcal, 0)} kcal · P ${fmt(dia.tot.p, 0)} g · C ${fmt(dia.tot.c, 0)} g · G ${fmt(dia.tot.g, 0)} g</div>`;
      for (const ref of dia.refeicoes) {
        html += `<div class="rp-ref">${esc(nomeRefeicaoPdf(ref.data))} · ${esc(ref.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }))} — ${fmt(ref.tot.kcal, 0)} kcal</div>
          <table>
            <thead><tr><th>Alimento</th><th>Quantidade</th><th>kcal</th><th>P</th><th>C</th><th>G</th></tr></thead>
            <tbody>`;
        for (const e of ref.itens) {
          html += `<tr>
            <td>${esc(e.nome)}</td><td>${esc(qtdStrPdf(e))}</td>
            <td>${fmt(e.kcal, 0)}</td><td>${fmt(e.p)}</td><td>${fmt(e.c)}</td><td>${fmt(e.g)}</td>
          </tr>`;
        }
        html += `</tbody></table>`;
      }
      html += `</div>`;
    }
    html += `<p class="rp-nota">${esc(NOTA_RELATORIO)}</p>`;
    return html;
  }

  /* ---- PDF de verdade (jsPDF): baixa o arquivo, sem depender de impressão ---- */

  // a fonte padrão do jsPDF é Latin-1: troca ou remove o que ela não desenha
  const txtPdf = (t) =>
    String(t)
      .replace(/≈/g, '~')
      .replace(/[—–]/g, '-')
      .replace(/[−]/g, '-')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/×/g, 'x')
      .replace(/[^\u0000-\u00FF]/g, '');

  function montarPdf(d) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const { cfg, tot, dias, diasDetalhe } = d;
    const div = Math.max(1, dias);
    const kcalMacro = tot.p * 4 + tot.c * 4 + tot.g * 9;
    const pctM = (v) => (kcalMacro > 0 ? `${fmt((v / kcalMacro) * 100, 0)}%` : '—');
    const M = 40;
    const largura = doc.internal.pageSize.getWidth();
    let y = 46;

    const titulo = (txt, tamanho = 12) => {
      if (y > doc.internal.pageSize.getHeight() - 90) {
        doc.addPage();
        y = 46;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(tamanho);
      doc.setTextColor(20);
      doc.text(txtPdf(txt), M, y);
      y += 6;
      doc.setDrawColor(30);
      doc.setLineWidth(1);
      doc.line(M, y, largura - M, y);
      y += 12;
    };
    const tabela = (head, body, opcoes = {}) => {
      const limpar = (celula) =>
        celula && typeof celula === 'object' && 'content' in celula
          ? { ...celula, content: txtPdf(celula.content) }
          : txtPdf(celula);
      doc.autoTable({
        head: [head.map(limpar)],
        body: body.map((linha) => linha.map(limpar)),
        startY: y,
        margin: { left: M, right: M },
        styles: { font: 'helvetica', fontSize: 8.5, cellPadding: 3, textColor: 30 },
        headStyles: { fillColor: [240, 240, 238], textColor: 20, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [250, 250, 249] },
        ...opcoes,
        ...(opcoes.foot ? { foot: opcoes.foot.map((linha) => linha.map(limpar)) } : {}),
      });
      y = doc.lastAutoTable.finalY + 16;
    };

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.text('Relatório alimentar', M, y);
    y += 18;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(90);
    doc.text(txtPdf(`Período: ${dataExtenso(d.inicio)} a ${dataExtenso(d.fimVis)} (${d.label})`), M, y);
    y += 12;
    doc.text(txtPdf(`Dias com registro: ${dias} · Emitido em ${new Date().toLocaleString('pt-BR')}`), M, y);
    y += 22;

    titulo('Gasto energético e metas configuradas');
    tabela(
      ['Parâmetro', 'Valor'],
      [
        ['Gasto basal (TMB)', cfg.gastoBasal ? `${fmt(cfg.gastoBasal, 0)} kcal/dia` : 'não informado'],
        ['Gasto médio diário (TDEE)', cfg.gastoDiario ? `${fmt(cfg.gastoDiario, 0)} kcal/dia` : 'não informado'],
        ['Meta de calorias', cfg.metaKcal ? `${fmt(cfg.metaKcal, 0)} kcal/dia` : 'não definida'],
        ['Meta de proteínas', cfg.metaP ? `${fmt(cfg.metaP, 0)} g/dia` : 'não definida'],
        ['Meta de carboidratos', cfg.metaC ? `${fmt(cfg.metaC, 0)} g/dia` : 'não definida'],
        ['Meta de gorduras', cfg.metaG ? `${fmt(cfg.metaG, 0)} g/dia` : 'não definida'],
      ],
      { columnStyles: { 1: { halign: 'right' } } }
    );

    titulo('Consumo no período');
    tabela(
      ['Nutriente', 'Total', 'Média/dia', '% das kcal', 'Meta/dia'],
      [
        ['Calorias', `${fmt(tot.kcal, 0)} kcal`, `${fmt(tot.kcal / div, 0)} kcal`, '—', cfg.metaKcal ? fmt(cfg.metaKcal, 0) : '—'],
        ['Proteínas', `${fmt(tot.p, 0)} g`, `${fmt(tot.p / div, 0)} g`, pctM(tot.p * 4), cfg.metaP ? fmt(cfg.metaP, 0) : '—'],
        ['Carboidratos', `${fmt(tot.c, 0)} g`, `${fmt(tot.c / div, 0)} g`, pctM(tot.c * 4), cfg.metaC ? fmt(cfg.metaC, 0) : '—'],
        ['Gorduras', `${fmt(tot.g, 0)} g`, `${fmt(tot.g / div, 0)} g`, pctM(tot.g * 9), cfg.metaG ? fmt(cfg.metaG, 0) : '—'],
      ],
      { columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' } } }
    );

    if (cfg.gastoDiario && dias > 0) {
      const gasto = cfg.gastoDiario * dias;
      const saldo = tot.kcal - gasto;
      const deficit = saldo <= 0;
      titulo('Balanço energético');
      tabela(
        ['Item', 'Valor'],
        [
          ['Consumo total', `${fmt(tot.kcal, 0)} kcal`],
          [`Gasto estimado (${dias} dia${dias > 1 ? 's' : ''})`, `${fmt(gasto, 0)} kcal`],
          [`${deficit ? 'Déficit' : 'Superávit'} no período`, `${fmt(Math.abs(saldo), 0)} kcal`],
          ['Equivalente em peso (7.700 kcal ~ 1 kg)', `${deficit ? '-' : '+'}${fmt(Math.abs(saldo) / KCAL_POR_KG, 2)} kg`],
        ],
        { columnStyles: { 1: { halign: 'right' } } }
      );
    }

    if (diasDetalhe.length) {
      titulo('Resumo por dia');
      const cabecalho = ['Dia', 'Calorias', 'Proteínas', 'Carboidratos', 'Gorduras'];
      if (cfg.gastoDiario) cabecalho.push('Saldo');
      const corpo = diasDetalhe.map((dia) => {
        const linha = [
          dia.data.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }),
          fmt(dia.tot.kcal, 0),
          `${fmt(dia.tot.p, 0)} g`,
          `${fmt(dia.tot.c, 0)} g`,
          `${fmt(dia.tot.g, 0)} g`,
        ];
        if (cfg.gastoDiario) {
          const saldoDia = dia.tot.kcal - cfg.gastoDiario;
          linha.push(`${saldoDia <= 0 ? '-' : '+'}${fmt(Math.abs(saldoDia), 0)}`);
        }
        return linha;
      });
      const totalLinha = ['Total', fmt(tot.kcal, 0), `${fmt(tot.p, 0)} g`, `${fmt(tot.c, 0)} g`, `${fmt(tot.g, 0)} g`];
      if (cfg.gastoDiario) {
        const saldoTotal = tot.kcal - cfg.gastoDiario * dias;
        totalLinha.push(`${saldoTotal <= 0 ? '-' : '+'}${fmt(Math.abs(saldoTotal), 0)}`);
      }
      tabela(cabecalho, corpo, {
        foot: [totalLinha],
        footStyles: { fillColor: [235, 235, 233], textColor: 20, fontStyle: 'bold' },
        columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' } },
      });
    }

    titulo('Refeições do período');
    if (!diasDetalhe.length) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text('Nenhum alimento registrado neste período.', M, y);
      y += 16;
    }
    for (const dia of diasDetalhe) {
      const corpo = [];
      for (const ref of dia.refeicoes) {
        corpo.push([
          {
            content: `${nomeRefeicaoPdf(ref.data)} · ${ref.data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} — ${fmt(ref.tot.kcal, 0)} kcal`,
            colSpan: 6,
            styles: { fontStyle: 'bold', fillColor: [246, 246, 244], textColor: 40 },
          },
        ]);
        for (const e of ref.itens) {
          corpo.push([e.nome, qtdStrPdf(e), fmt(e.kcal, 0), fmt(e.p), fmt(e.c), fmt(e.g)]);
        }
      }
      if (y > doc.internal.pageSize.getHeight() - 120) {
        doc.addPage();
        y = 46;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(20);
      doc.text(
        txtPdf(`${dataExtenso(dia.data)} — ${fmt(dia.tot.kcal, 0)} kcal · P ${fmt(dia.tot.p, 0)} g · C ${fmt(dia.tot.c, 0)} g · G ${fmt(dia.tot.g, 0)} g`),
        M,
        y
      );
      y += 8;
      tabela(['Alimento', 'Quantidade', 'kcal', 'P', 'C', 'G'], corpo, {
        columnStyles: {
          0: { cellWidth: 170 },
          2: { halign: 'right' }, 3: { halign: 'right' }, 4: { halign: 'right' }, 5: { halign: 'right' },
        },
      });
    }

    // nota de origem + numeração das páginas
    if (y > doc.internal.pageSize.getHeight() - 90) {
      doc.addPage();
      y = 46;
    }
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.8);
    doc.setTextColor(110);
    doc.text(doc.splitTextToSize(txtPdf(NOTA_RELATORIO), largura - M * 2), M, y);
    const paginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= paginas; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(130);
      doc.text(`${i} / ${paginas}`, largura - M, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
    }
    return doc;
  }

  async function baixarPdf() {
    const status = $('#rp-status');
    if (!window.jspdf) {
      status.textContent = 'Gerador de PDF indisponível — use o botão Imprimir.';
      return;
    }
    status.textContent = 'Gerando PDF…';
    const d = await dadosRelatorio();
    const doc = montarPdf(d);
    const nome = `relatorio-alimentar-${d.fimVis.toISOString().slice(0, 10)}.pdf`;
    const blob = doc.output('blob');
    const file = new File([blob], nome, { type: 'application/pdf' });

    // celular: folha de compartilhar (salvar em Arquivos, enviar ao médico)
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: nome });
        status.textContent = `PDF exportado: ${nome}`;
        return;
      } catch (e) {
        if (e.name === 'AbortError') {
          status.textContent = 'Exportação cancelada.';
          return;
        }
      }
    }
    // computador (ou onde o compartilhar não existe): download direto
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nome;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    status.textContent = `PDF gerado: ${nome}. Se o download não aparecer, use Imprimir.`;
  }

  async function abrirRelatorio() {
    $('#rp-conteudo').innerHTML = montarRelatorioHtml(await dadosRelatorio());
    $('#relatorio-print').hidden = false;
    $('#rp-status').textContent = 'Confira a prévia abaixo e toque em “Baixar PDF”.';
    document.body.style.overflow = 'hidden';
    $('#relatorio-print').scrollTop = 0;
  }

  function fecharRelatorio() {
    $('#relatorio-print').hidden = true;
    document.body.style.overflow = '';
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
    $('#btn-pdf').addEventListener('click', () => abrirRelatorio());
    $('#rp-fechar').addEventListener('click', fecharRelatorio);
    $('#rp-imprimir').addEventListener('click', () => window.print());
    $('#rp-baixar').addEventListener('click', () => baixarPdf());
    document.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape' && !$('#relatorio-print').hidden) fecharRelatorio();
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
