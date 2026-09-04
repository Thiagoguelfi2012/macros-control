/* Tela Configurações: gasto energético, dieta alvo, backup e conta. */
(() => {
  const $ = (sel) => document.querySelector(sel);
  const fmt = (n, dec = 1) =>
    Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: dec });

  // as outras telas dependem destas configurações (metas, gasto, dados)
  const avisarTelas = () => {
    document.dispatchEvent(new Event('relatorios:refresh'));
    document.dispatchEvent(new Event('diario:refresh'));
  };

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
    avisarTelas();
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
    avisarTelas();
  });

  /* ---- Refeições por dia (usado pela sugestão de refeição) ---- */

  const { refeicoesDia } = MacroDB.getSettings();
  $('#sel-refeicoes').value = String(refeicoesDia || 4);

  function atualizarHintRefeicoes() {
    const n = Number($('#sel-refeicoes').value) || 4;
    const nomes = (window.Sugestao ? Sugestao.planoDe(n) : []).map((r) => r.nome);
    const { metaKcal, gastoDiario } = MacroDB.getSettings();
    const kcal = metaKcal || gastoDiario;
    const partes = window.Sugestao
      ? Sugestao.planoDe(n).map((r) => `${r.nome} ${kcal ? `${fmt(kcal * r.peso, 0)} kcal` : `${fmt(r.peso * 100, 0)}%`}`)
      : nomes;
    $('#refeicoes-hint').textContent = partes.length
      ? `Divisão de um dia cheio: ${partes.join(' · ')}.`
      : '';
  }
  $('#sel-refeicoes').addEventListener('change', atualizarHintRefeicoes);
  atualizarHintRefeicoes();
  $('#btn-salvar-refeicoes').addEventListener('click', () => {
    MacroDB.saveSettings({ refeicoesDia: Number($('#sel-refeicoes').value) || 4 });
    const ok = $('#save-ok-refeicoes');
    ok.hidden = false;
    setTimeout(() => (ok.hidden = true), 2000);
    avisarTelas();
  });

  /* ---- Lista de alimentos: versão e atualização forçada ---- */

  (async () => {
    await MacroDB.ensureFoods();
    const { versao, esperada, itens } = MacroDB.foodsInfo();
    const atrasada = esperada != null && versao < esperada;
    $('#base-info').textContent =
      `Versão ${versao} · ${fmt(itens, 0)} alimentos disponíveis na busca.` +
      (atrasada ? ` O app espera a versão ${esperada}: toque em “Atualizar lista de alimentos”.` : '');
    $('#base-info').classList.toggle('aviso', atrasada);
  })();

  $('#btn-atualizar-base').addEventListener('click', () => {
    $('#base-info').textContent = 'Baixando a lista mais recente…';
    MacroDB.refreshFoods();
  });

  /* ---- Backup: exportar/importar registros, alimentos próprios e config ---- */

  const backupStatus = $('#backup-status');
  const setStatusBackup = (txt, erro = false) => {
    backupStatus.textContent = txt;
    backupStatus.style.color = erro ? 'var(--bad-text)' : '';
  };

  const gerarBackup = () => MacroDB.exportBackup();

  async function importarBackup(obj) {
    const r = await MacroDB.mergeBackup(obj);
    preencherConfig();
    // alimentos próprios importados entram na busca (versão de página única)
    if (typeof FoodSearch !== 'undefined') FoodSearch.buildIndex(await MacroDB.ensureFoods());
    avisarTelas();
    return r;
  }

  const resumoImport = (r) =>
    `Importado: ${r.novos} registro${r.novos === 1 ? '' : 's'} novo${r.novos === 1 ? '' : 's'}` +
    (r.repetidos ? ` (${r.repetidos} já existia${r.repetidos === 1 ? '' : 'm'})` : '') +
    `, ${r.customs} alimento${r.customs === 1 ? '' : 's'} próprio${r.customs === 1 ? '' : 's'}` +
    (r.treinos ? `, ${r.treinos} treino${r.treinos === 1 ? '' : 's'}` : '') +
    (r.sessoes ? `, ${r.sessoes} execução${r.sessoes === 1 ? '' : 'ões'} de treino` : '') +
    ` e configurações aplicadas.`;

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

  /* ---- Conta e sincronização (Supabase) ---- */

  if (typeof SupabaseSync !== 'undefined') {
    const sStatus = $('#s-status');
    SupabaseSync.onEstado((e) => {
      $('#s-login').hidden = e.conectado || !e.configurado;
      $('#s-conectado').hidden = !e.conectado;
      $('#s-config').hidden = e.configurado;
      // OAuth exige sair da página: não funciona em arquivo local nem em iframe
      $('#s-google').hidden = !SupabaseSync.podeOAuth();
      let txt;
      if (!e.configurado) {
        txt = 'Para ativar, informe abaixo a URL e a chave pública do projeto Supabase (instruções no README).';
      } else if (!SupabaseSync.podeOAuth() && !e.conectado) {
        txt =
          'O login com Google precisa do app aberto no endereço próprio (https), fora de arquivo local e de páginas incorporadas. Aqui os dados seguem neste aparelho — use Exportar/Importar acima para levá-los a outro.';
      } else if (e.conectado) {
        txt = `Conectado como ${e.email || 'sua conta'}.`;
        if (e.ocupado) txt += ' Sincronizando…';
        else if (e.ultimaSync) txt += ` Última sincronização: ${new Date(e.ultimaSync).toLocaleString('pt-BR')}.`;
      } else {
        txt = 'Não conectado — seus dados seguem apenas neste aparelho.';
      }
      if (e.aviso) txt += ` ${e.aviso}.`;
      if (e.erro) txt += ` (${e.erro})`;
      sStatus.textContent = txt;
    });
    $('#s-google').addEventListener('click', () => SupabaseSync.entrarComGoogle());
    // sair limpa os dados deste aparelho: confirma em dois toques (diálogos
    // nativos são bloqueados quando o app roda dentro de um iframe)
    const btnSair = $('#s-sair');
    btnSair.addEventListener('click', () => {
      if (btnSair.dataset.armado) {
        clearTimeout(btnSair._timer);
        delete btnSair.dataset.armado;
        btnSair.textContent = 'Sair';
        SupabaseSync.sair();
        return;
      }
      btnSair.dataset.armado = '1';
      btnSair.textContent = 'Confirmar saída?';
      sStatus.textContent =
        'Ao sair, os dados deste aparelho são limpos — eles continuam na sua conta e voltam quando você entrar de novo.';
      btnSair._timer = setTimeout(() => {
        delete btnSair.dataset.armado;
        btnSair.textContent = 'Sair';
      }, 4000);
    });
    $('#s-sync').addEventListener('click', () => SupabaseSync.sincronizar());
    $('#s-salvar-config').addEventListener('click', () => {
      const url = $('#s-url').value.trim();
      const key = $('#s-key').value.trim();
      if (url && key) SupabaseSync.setConfig(url, key);
    });
    // a sincronização pode trazer configurações novas de outro aparelho
    document.addEventListener('config:refresh', preencherConfig);
  }
})();
