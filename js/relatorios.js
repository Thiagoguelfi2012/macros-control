/* Tela Relatórios: filtros de período, totais, déficit/superávit e gráficos. */
(() => {
  const $ = (sel) => document.querySelector(sel);
  let periodo = 'semana';
  let offset = 0; // 0 = período atual, -1 = anterior…
  let chartKcal = null;
  let chartMacros = null;
  let chartAcum = null;

  const fmt = (n, dec = 1) =>
    Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: dec });

  const cssVar = (name) =>
    getComputedStyle(document.documentElement).getPropertyValue(name).trim();

  const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const DIAS_SEMANA = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

  /* ---- Cálculo do intervalo do período ---- */

  function intervalo() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    let inicio, fim, granularidade, label;
    if (periodo === 'dia') {
      inicio = new Date(hoje);
      inicio.setDate(inicio.getDate() + offset);
      fim = new Date(inicio);
      fim.setDate(fim.getDate() + 1);
      granularidade = 'hora';
      label = inicio.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
    } else if (periodo === 'semana') {
      const diaSemana = (hoje.getDay() + 6) % 7; // segunda = 0
      inicio = new Date(hoje);
      inicio.setDate(inicio.getDate() - diaSemana + offset * 7);
      fim = new Date(inicio);
      fim.setDate(fim.getDate() + 7);
      granularidade = 'diaSemana';
      const fimVis = new Date(fim - 86400000);
      label = `${inicio.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${fimVis.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
    } else if (periodo === 'mes') {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() + offset + 1, 1);
      granularidade = 'diaMes';
      label = inicio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      label = label.charAt(0).toUpperCase() + label.slice(1);
    } else if (periodo === 'trimestre') {
      const tri = Math.floor(hoje.getMonth() / 3) + offset;
      inicio = new Date(hoje.getFullYear(), tri * 3, 1);
      fim = new Date(hoje.getFullYear(), tri * 3 + 3, 1);
      granularidade = 'mes';
      label = `${Math.floor(inicio.getMonth() / 3) + 1}º trimestre de ${inicio.getFullYear()}`;
    } else if (periodo === 'semestre') {
      const sem = Math.floor(hoje.getMonth() / 6) + offset;
      inicio = new Date(hoje.getFullYear(), sem * 6, 1);
      fim = new Date(hoje.getFullYear(), sem * 6 + 6, 1);
      granularidade = 'mes';
      label = `${Math.floor(inicio.getMonth() / 6) + 1}º semestre de ${inicio.getFullYear()}`;
    } else {
      inicio = new Date(hoje.getFullYear() + offset, 0, 1);
      fim = new Date(hoje.getFullYear() + offset + 1, 0, 1);
      granularidade = 'mes';
      label = String(inicio.getFullYear());
    }
    return { inicio, fim, granularidade, label };
  }

  // Dias que contam no período: dias completos já passados + o dia de hoje
  // APENAS se ele já tiver algum registro (de madrugada, antes do café, o dia
  // novo não entra no déficit/alvo). Retorna 0 se nenhum dia conta ainda.
  function diasContabilizados(inicio, fim, entries) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const fimCompletos = Math.min(fim.getTime(), hoje.getTime());
    let dias = Math.max(0, Math.round((fimCompletos - inicio.getTime()) / 86400000));
    if (hoje >= inicio && hoje < fim) {
      const temRegistroHoje = entries.some((e) => {
        const d = new Date(e.ts);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === hoje.getTime();
      });
      if (temRegistroHoje) dias += 1;
    }
    return dias;
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
    } else if (granularidade === 'diaSemana') {
      buckets = DIAS_SEMANA.map((d) => ({ label: d, ...vazio }));
      for (const e of entries) soma(buckets[(new Date(e.ts).getDay() + 6) % 7], e);
    } else if (granularidade === 'diaMes') {
      const nDias = Math.round((fim - inicio) / 86400000);
      buckets = Array.from({ length: nDias }, (_, i) => ({ label: String(i + 1), ...vazio }));
      for (const e of entries) soma(buckets[new Date(e.ts).getDate() - 1], e);
    } else {
      // por mês
      const meses = [];
      const c = new Date(inicio);
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
          <div class="t-sub">gasto estimado: ${fmt(gasto, 0)} kcal em ${dias} dia${dias > 1 ? 's' : ''}</div>
        </div>`;
    } else {
      balancoHtml = `
        <div class="tile balance">
          <div class="t-label">Déficit / superávit</div>
          <div class="t-value" style="font-size:14px;font-weight:500;color:var(--muted)">Configure seu gasto médio diário abaixo</div>
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
      // hoje só conta se já tiver registro (mesma regra do card de déficit)
      if (d.getTime() === hoje.getTime() && !porDia.has(k)) break;
      acc += (porDia.get(k) || 0) - gastoDiario;
      labels.push(d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }));
      data.push(Math.round(acc));
    }
    if (!gastoDiario || data.length < 2) {
      card.hidden = true;
      if (chartAcum) {
        chartAcum.destroy();
        chartAcum = null;
      }
      return;
    }
    card.hidden = false;
    card.dataset.final = String(data[data.length - 1]);
    const good = cssVar('--good-text');
    const bad = cssVar('--bad-text');
    const muted = cssVar('--muted');
    const grid = cssVar('--grid');
    const baseline = cssVar('--baseline');
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
                return ` ${v <= 0 ? 'Déficit' : 'Superávit'} acumulado: ${fmt(Math.abs(v), 0)} kcal`;
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
            grid: { color: (c) => (c.tick.value === 0 ? baseline : grid), drawTicks: false },
            border: { display: false },
            ticks: { color: muted, font: { size: 11 }, maxTicksLimit: 6 },
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
        ? `Consumo do período comparado com o alvo do período (alvo diário × ${dias} dias)`
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
      periodo = btn.dataset.p;
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

    function preencherConfig() {
      const { gastoBasal, gastoDiario, metaKcal, metaP, metaC, metaG } = MacroDB.getSettings();
      if (gastoBasal) $('#inp-basal').value = gastoBasal;
      if (gastoDiario) $('#inp-diario').value = gastoDiario;
      if (metaKcal) $('#inp-meta-kcal').value = metaKcal;
      if (metaP) $('#inp-meta-p').value = metaP;
      if (metaC) $('#inp-meta-c').value = metaC;
      if (metaG) $('#inp-meta-g').value = metaG;
    }
    preencherConfig();
    $('#btn-salvar-config').addEventListener('click', () => {
      MacroDB.saveSettings({
        gastoBasal: parseFloat($('#inp-basal').value) || 0,
        gastoDiario: parseFloat($('#inp-diario').value) || 0,
      });
      const ok = $('#save-ok');
      ok.hidden = false;
      setTimeout(() => (ok.hidden = true), 2000);
      render();
    });

    // dieta alvo: kcal implícitas atualizadas ao digitar, salvar separado
    const atualizarHintAlvo = () => {
      const kcalAlvo = parseFloat($('#inp-meta-kcal').value) || 0;
      const p = parseFloat($('#inp-meta-p').value) || 0;
      const c = parseFloat($('#inp-meta-c').value) || 0;
      const g = parseFloat($('#inp-meta-g').value) || 0;
      const kcalMacros = 4 * p + 4 * c + 9 * g;
      let txt = '';
      if (kcalMacros) {
        txt = `Os macros somam ≈ ${fmt(kcalMacros, 0)} kcal/dia (P ${fmt((4 * p * 100) / kcalMacros, 0)}% · C ${fmt((4 * c * 100) / kcalMacros, 0)}% · G ${fmt((9 * g * 100) / kcalMacros, 0)}% das calorias).`;
        if (kcalAlvo) {
          const dif = kcalMacros - kcalAlvo;
          txt +=
            Math.abs(dif) <= kcalAlvo * 0.05
              ? ' Coerente com a meta de calorias. ✓'
              : ` Atenção: ${fmt(Math.abs(dif), 0)} kcal ${dif > 0 ? 'acima' : 'abaixo'} da meta de ${fmt(kcalAlvo, 0)} kcal.`;
        }
      }
      $('#alvo-kcal-hint').textContent = txt;
    };
    for (const id of ['inp-meta-kcal', 'inp-meta-p', 'inp-meta-c', 'inp-meta-g']) {
      $('#' + id).addEventListener('input', atualizarHintAlvo);
    }
    atualizarHintAlvo();
    $('#btn-salvar-alvo').addEventListener('click', () => {
      MacroDB.saveSettings({
        metaKcal: parseFloat($('#inp-meta-kcal').value) || 0,
        metaP: parseFloat($('#inp-meta-p').value) || 0,
        metaC: parseFloat($('#inp-meta-c').value) || 0,
        metaG: parseFloat($('#inp-meta-g').value) || 0,
      });
      const ok = $('#save-ok-alvo');
      ok.hidden = false;
      setTimeout(() => (ok.hidden = true), 2000);
      render();
    });

    /* ---- Backup: exportar/importar registros, alimentos próprios e config ---- */

    const backupStatus = $('#backup-status');
    const setStatusBackup = (txt, erro = false) => {
      backupStatus.textContent = txt;
      backupStatus.style.color = erro ? 'var(--bad-text)' : '';
    };

    async function gerarBackup() {
      const [entries, custom] = await Promise.all([MacroDB.getAllEntries(), MacroDB.getCustomFoods()]);
      return {
        app: 'controle-de-macros',
        versao: 1,
        exportadoEm: new Date().toISOString(),
        settings: MacroDB.getSettings(),
        custom,
        entries,
      };
    }

    async function importarBackup(obj) {
      if (!obj || !Array.isArray(obj.entries)) {
        throw new Error('o conteúdo não parece um backup deste app');
      }
      // soma sem duplicar: um registro idêntico (mesmo instante, alimento e
      // quantidade) já presente é ignorado
      const atuais = await MacroDB.getAllEntries();
      const chave = (e) => `${e.ts}|${e.nome}|${e.gramas}|${e.kcal}`;
      const vistos = new Set(atuais.map(chave));
      let novos = 0;
      for (const e of obj.entries) {
        if (!e || !e.ts || !e.nome || vistos.has(chave(e))) continue;
        const { id, ...resto } = e;
        await MacroDB.addEntry(resto);
        vistos.add(chave(e));
        novos++;
      }
      const customs = (Array.isArray(obj.custom) ? obj.custom : []).filter((f) => f && f.i && f.n);
      for (const f of customs) await MacroDB.addCustomFood(f);
      if (obj.settings) MacroDB.saveSettings(obj.settings);
      preencherConfig();
      // alimentos próprios importados entram na busca (versão de página única)
      if (typeof FoodSearch !== 'undefined') FoodSearch.buildIndex(await MacroDB.ensureFoods());
      document.dispatchEvent(new Event('diario:refresh'));
      render();
      return { novos, repetidos: obj.entries.length - novos, customs: customs.length };
    }

    const resumoImport = (r) =>
      `Importado: ${r.novos} registro${r.novos === 1 ? '' : 's'} novo${r.novos === 1 ? '' : 's'}` +
      (r.repetidos ? ` (${r.repetidos} já existia${r.repetidos === 1 ? '' : 'm'})` : '') +
      `, ${r.customs} alimento${r.customs === 1 ? '' : 's'} próprio${r.customs === 1 ? '' : 's'} e configurações aplicadas.`;

    // hospedada, a página roda dentro de um iframe: downloads podem ser
    // bloqueados pelo sandbox — daí as camadas de fallback na exportação
    const embutido = (() => {
      try {
        return window.self !== window.top;
      } catch {
        return true;
      }
    })();

    $('#btn-exportar').addEventListener('click', async () => {
      const b = await gerarBackup();
      const nome = `controle-de-macros-backup-${b.exportadoEm.slice(0, 10)}.json`;
      const json = JSON.stringify(b);
      const resumo =
        `${b.entries.length} registro${b.entries.length === 1 ? '' : 's'} e ` +
        `${b.custom.length} alimento${b.custom.length === 1 ? '' : 's'} próprio${b.custom.length === 1 ? '' : 's'}`;

      // 1) celular: folha de compartilhar com o arquivo .json — permite
      // "Salvar em Arquivos"/Drive e funciona onde o download é bloqueado
      if (navigator.canShare) {
        try {
          const file = new File([json], nome, { type: 'application/json' });
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: nome });
            setStatusBackup(`Backup exportado (${resumo}): ${nome}.`);
            return;
          }
        } catch (e) {
          if (e.name === 'AbortError') {
            setStatusBackup('Exportação cancelada.');
            return;
          }
          /* compartilhar bloqueado: tenta o download direto */
        }
      }

      // 2) download direto do .json
      const blob = new Blob([json], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = nome;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 10000);

      // 3) embutido num iframe o download pode ser bloqueado sem aviso:
      // deixa o texto do backup pronto para copiar como garantia
      if (embutido) {
        const ta = $('#backup-texto');
        $('#backup-texto-wrap').hidden = false;
        ta.value = json;
        let copiado = false;
        try {
          await navigator.clipboard.writeText(json);
          copiado = true;
        } catch {
          /* sem permissão de clipboard */
        }
        setStatusBackup(
          `Backup gerado (${resumo}). Se o download de ${nome} não apareceu, o navegador o bloqueou dentro desta página — ` +
            (copiado
              ? 'o texto do backup já foi copiado para a área de transferência: cole e salve onde preferir.'
              : 'copie o texto do backup abaixo e salve onde preferir.')
        );
      } else {
        setStatusBackup(`Backup exportado (${resumo}): ${nome}.`);
      }
    });

    $('#btn-importar').addEventListener('click', () => $('#inp-importar').click());
    $('#inp-importar').addEventListener('change', async (ev) => {
      const file = ev.target.files[0];
      ev.target.value = '';
      if (!file) return;
      try {
        const r = await importarBackup(JSON.parse(await file.text()));
        setStatusBackup(resumoImport(r));
      } catch (e) {
        setStatusBackup(`Não foi possível importar: ${e.message}`, true);
      }
    });

    // fallback sem downloads/arquivos (ex.: página hospedada em iframe)
    $('#backup-toggle').addEventListener('click', () => {
      const w = $('#backup-texto-wrap');
      w.hidden = !w.hidden;
    });
    $('#btn-backup-gerar-texto').addEventListener('click', async () => {
      const b = await gerarBackup();
      const ta = $('#backup-texto');
      ta.value = JSON.stringify(b);
      ta.select();
      let copiado = false;
      try {
        await navigator.clipboard.writeText(ta.value);
        copiado = true;
      } catch {
        /* sem permissão de clipboard: o texto fica selecionado para copiar */
      }
      setStatusBackup(
        `Texto do backup gerado (${b.entries.length} registros)${copiado ? ' e copiado para a área de transferência' : ' — copie o texto selecionado'}.`
      );
    });
    $('#btn-backup-importar-texto').addEventListener('click', async () => {
      try {
        const txt = $('#backup-texto').value.trim();
        if (!txt) throw new Error('cole o texto do backup na caixa acima');
        const r = await importarBackup(JSON.parse(txt));
        setStatusBackup(resumoImport(r));
      } catch (e) {
        setStatusBackup(`Não foi possível importar: ${e.message}`, true);
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
