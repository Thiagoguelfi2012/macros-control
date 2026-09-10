/* Ritmo da meta de água: metade até as 13h, o restante até as 18h.

   O aviso tem duas pernas. A primeira é a tela: sempre que o app abre, o
   cartão do Diário mostra se o ritmo está em dia. A segunda é a notificação do
   navegador nos horários — e aqui vale ser honesto sobre o limite: um site
   estático só consegue disparar o alarme com a aba viva. Se o app estiver
   fechado às 13h, o aviso aparece na primeira vez que ele for aberto depois
   disso (e a notificação sai nesse momento), em vez de se perder. */
const AguaAviso = (() => {
  const CHECKPOINTS = [
    { hora: 13, fracao: 0.5, rotulo: '13h' },
    { hora: 18, fracao: 1, rotulo: '18h' },
  ];

  const chaveDia = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const ehAgua = (e) =>
    !!e.ml &&
    (e.kcal || 0) <= 2 &&
    /^agua( |,|$)/.test(
      String(e.nome || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
    );

  const fmtVol = (ml) =>
    ml >= 1000
      ? `${Number(ml / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} L`
      : `${Math.round(ml)} ml`;

  async function totalDeHoje(quando) {
    const agora = quando || new Date();
    const hoje = chaveDia(agora);
    const entries = await MacroDB.getAllEntries();
    return entries
      .filter((e) => ehAgua(e) && chaveDia(new Date(e.ts)) === hoje)
      .reduce((n, e) => n + (e.gramas || 0), 0);
  }

  // Como está o ritmo agora: quanto já deveria ter bebido e o que falta
  function estado(bebido, meta, quando) {
    const agora = quando || new Date();
    const h = agora.getHours() + agora.getMinutes() / 60;
    if (!meta) return { semMeta: true, bebido };
    const vencidos = CHECKPOINTS.filter((c) => h >= c.hora);
    const proximo = CHECKPOINTS.find((c) => h < c.hora) || null;
    const atrasado = vencidos.filter((c) => bebido < meta * c.fracao).pop() || null;
    const alvoAgora = atrasado ? meta * atrasado.fracao : proximo ? meta * proximo.fracao : meta;
    return {
      bebido,
      meta,
      proximo,
      atrasado,
      alvoAgora,
      falta: Math.max(0, alvoAgora - bebido),
      completo: bebido >= meta,
      // antes das 13h ainda não há atraso possível: o alvo é só uma referência
      emDia: !atrasado,
    };
  }

  const chaveAviso = (c, agora) => `avisoAgua:${chaveDia(agora)}:${c.hora}`;

  function notificar(c, est) {
    if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;
    const titulo = c.fracao >= 1 ? 'Meta de água do dia' : 'Metade da água até as 13h';
    const corpo =
      c.fracao >= 1
        ? `Faltam ${fmtVol(est.meta - est.bebido)} para fechar a meta de hoje (${fmtVol(est.bebido)} de ${fmtVol(est.meta)}).`
        : `Você bebeu ${fmtVol(est.bebido)} de ${fmtVol(est.meta * c.fracao)} até as ${c.rotulo}. Faltam ${fmtVol(est.meta * c.fracao - est.bebido)}.`;
    try {
      new Notification(titulo, { body: corpo, tag: `agua-${c.hora}`, icon: 'data:,' });
      return true;
    } catch {
      return false;
    }
  }

  let timers = [];
  const limparTimers = () => {
    for (const t of timers) clearTimeout(t);
    timers = [];
  };

  // Dispara o que estiver vencido e agenda o próximo horário enquanto o app
  // estiver aberto
  async function verificar() {
    const { metaAgua } = MacroDB.getSettings();
    const ligado = localStorage.getItem('avisoAguaLigado') !== '0';
    if (!metaAgua || !ligado) return null;
    const agora = new Date();
    const bebido = await totalDeHoje(agora);
    const est = estado(bebido, metaAgua, agora);
    const h = agora.getHours() + agora.getMinutes() / 60;
    for (const c of CHECKPOINTS) {
      if (h < c.hora) continue;
      if (bebido >= metaAgua * c.fracao) continue;
      const k = chaveAviso(c, agora);
      if (localStorage.getItem(k)) continue;
      if (notificar(c, est)) localStorage.setItem(k, '1');
    }
    agendar();
    return est;
  }

  function agendar() {
    limparTimers();
    const agora = new Date();
    for (const c of CHECKPOINTS) {
      const alvo = new Date(agora);
      alvo.setHours(c.hora, 0, 0, 0);
      const espera = alvo - agora;
      // só o que ainda vai acontecer hoje, e dentro do limite do setTimeout
      if (espera > 0 && espera < 24 * 3600 * 1000) timers.push(setTimeout(verificar, espera + 1000));
    }
  }

  async function pedirPermissao() {
    if (typeof Notification === 'undefined') return 'indisponivel';
    if (Notification.permission === 'granted') return 'granted';
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }

  const suportado = () => typeof Notification !== 'undefined';
  const permissao = () => (typeof Notification === 'undefined' ? 'indisponivel' : Notification.permission);

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) verificar();
    });
    if (typeof MacroDB !== 'undefined') setTimeout(verificar, 1500);
  }

  return { CHECKPOINTS, estado, verificar, totalDeHoje, pedirPermissao, suportado, permissao, ehAgua, fmtVol };
})();

if (typeof window !== 'undefined') window.AguaAviso = AguaAviso;
