/* Porta de entrada: sem conta, sem app.

   O app fica visível atrás de um véu translúcido — dá para ver que ele existe,
   não dá para usar. Enquanto não há sessão, o conteúdo é marcado como inerte,
   então nada atrás da tela recebe clique, foco ou tecla.

   Um aviso honesto sobre o alcance disto: este é um site estático, e a trava
   vive no próprio JavaScript da página. Ela decide quem usa a interface, não
   quem pode ler os dados — o que já está no navegador deste aparelho continua
   no navegador deste aparelho. Quem protege dado de verdade aqui é o RLS do
   Supabase, que só entrega a linha do dono do token. */
const LoginGate = (() => {
  const ID = 'login-gate';
  const SEM_CONTA = 'gateSemConta'; // escape onde o OAuth é impossível
  let veu = null;
  let ultimo = null;

  const temSync = () => typeof SupabaseSync !== 'undefined';

  // OAuth do Google sai da página e volta com os tokens no endereço. Isso não
  // acontece dentro de um iframe nem em arquivo aberto do disco: nesses lugares
  // não existe login possível, e travar a porta só deixaria o app inútil.
  const oauthPossivel = () => temSync() && SupabaseSync.configurado() && SupabaseSync.podeOAuth();

  const voltandoDoGoogle = () => /access_token=|error_description=/.test(location.hash || '');

  const dispensado = () => localStorage.getItem(SEM_CONTA) === '1';

  function montar() {
    if (veu) return veu;
    veu = document.createElement('div');
    veu.id = ID;
    veu.className = 'gate';
    veu.setAttribute('role', 'dialog');
    veu.setAttribute('aria-modal', 'true');
    veu.setAttribute('aria-label', 'Entrar na sua conta');
    document.body.appendChild(veu);
    veu.addEventListener('click', (ev) => {
      const b = ev.target.closest('button');
      if (!b) return;
      if (b.dataset.acao === 'entrar') {
        b.disabled = true;
        b.textContent = 'abrindo o Google…';
        SupabaseSync.entrarComGoogle();
      }
      if (b.dataset.acao === 'sem-conta') {
        localStorage.setItem(SEM_CONTA, '1');
        aplicar(ultimo || {});
      }
    });
    return veu;
  }

  const icone = `<svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
    <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-4H24v7.5h12c-.2 2-1.5 5-4.4 7l6.7 5.2C42.2 36 45 30.6 45 24z"/>
    <path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-6.9-5.4c-1.9 1.3-4.4 2.2-7.6 2.2-5.8 0-10.7-3.8-12.5-9.1l-7.1 5.5C8.1 41 15.4 46 24 46z"/>
    <path fill="#FBBC05" d="M11.5 28.4c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4l-7.1-5.5C2.9 17 2 20.4 2 24s.9 7 2.4 9.9l7.1-5.5z"/>
    <path fill="#EA4335" d="M24 10.6c3.3 0 5.5 1.4 6.8 2.6l6-5.9C33.1 3.9 29.1 2 24 2 15.4 2 8.1 7 4.4 14.1l7.1 5.5C13.3 14.4 18.2 10.6 24 10.6z"/>
  </svg>`;

  function corpo(st) {
    if (voltandoDoGoogle())
      return `<p class="gate-sub">Entrando…</p>`;

    if (!oauthPossivel()) {
      const motivo = !temSync() || !SupabaseSync.configurado()
        ? 'A conta não está configurada nesta cópia do app.'
        : window.self !== window.top
          ? 'Esta cópia está rodando dentro de um quadro (iframe), e o login do Google precisa abrir a página inteira.'
          : 'Esta cópia foi aberta como arquivo do computador, e o login do Google só funciona em endereço https.';
      return `
        <p class="gate-sub">${motivo}</p>
        <p class="gate-sub">Para entrar com a sua conta, abra o app pelo endereço https dele. Aqui dá para usar sem conta — mas nada sai deste navegador: sem backup, sem sincronizar com o celular.</p>
        <button class="btn" data-acao="sem-conta" type="button">Usar sem conta neste navegador</button>`;
    }

    return `
      <p class="gate-sub">Seus treinos, sua dieta e seu histórico ficam na sua conta — e só aparecem depois que você entra.</p>
      <button class="btn btn-primary gate-google" data-acao="entrar" type="button">${icone}<span>Entrar com Google</span></button>
      ${st && st.erro ? `<p class="gate-erro">${st.erro}</p>` : ''}`;
  }

  function aplicar(st) {
    ultimo = st;
    const liberado = (st && st.conectado) || dispensado();
    const app = document.querySelector('main') || document.body;

    if (liberado) {
      if (veu) veu.remove();
      veu = null;
      document.body.classList.remove('com-gate');
      if (app !== document.body) app.removeAttribute('inert');
      return;
    }

    const el = montar();
    el.innerHTML = `
      <div class="gate-fundo"></div>
      <div class="gate-card">
        <h2>Controle de Macros</h2>
        ${corpo(st)}
      </div>`;
    document.body.classList.add('com-gate');
    // inert tira tudo que está atrás da porta do alcance do clique, do foco e
    // do leitor de tela — o véu sozinho só esconderia
    if (app !== document.body) app.setAttribute('inert', '');
  }

  function iniciar() {
    if (!temSync()) return aplicar({});
    SupabaseSync.onEstado(aplicar);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();

  return { aplicar, liberar: () => localStorage.setItem(SEM_CONTA, '1') };
})();
