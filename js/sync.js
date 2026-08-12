/* Conta e sincronização via Supabase (plano gratuito): login por e-mail/senha
   ou com o Google (OAuth do próprio Supabase — as duas formas caem na mesma
   conta quando o e-mail é o mesmo) e backup em uma tabela com RLS, onde cada
   usuário só enxerga a própria linha. Sem SDK: REST direto (GoTrue/PostgREST).

   Isolamento por usuário: o banco local do navegador é de um usuário por vez.
   O aparelho guarda de quem são os dados locais; ao entrar com outra conta, o
   local é limpo antes de baixar o da conta nova (os dados de quem saiu ficam
   preservados na nuvem). Ao sair, o local é limpo depois de subir a última
   versão — nada de diários misturados no mesmo aparelho. */
const SupabaseSync = (() => {
  const DEFAULT_URL = 'https://ddzqpkrjqsmwjlsqhbsm.supabase.co';
  const DEFAULT_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkenFwa3JqcXNtd2psc3FoYnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTI5MjQsImV4cCI6MjEwMjEyODkyNH0.OayKpjn1hJsW7vWnYzxMLhwiDn_u9U4j5Rmkq1WLdEM';
  const TABELA = 'backups';
  const DONO = 'sbDonoLocal'; // de qual usuário são os dados neste aparelho

  const cfg = () => ({
    url: (localStorage.getItem('sbUrl') || DEFAULT_URL).replace(/\/+$/, ''),
    key: localStorage.getItem('sbAnonKey') || DEFAULT_ANON_KEY,
  });

  const estado = {
    configurado: !!(cfg().url && cfg().key),
    conectado: false,
    email: '',
    ultimaSync: localStorage.getItem('sbUltimaSync') || '',
    ocupado: false,
    erro: '',
    aviso: '',
  };
  let sessao = null; // { access_token, refresh_token, expires_at, user_id, email }
  let timerUpload = null;
  let alteracoesPendentes = false;
  const ouvintes = [];

  const avisar = () => {
    for (const fn of ouvintes) {
      try {
        fn(estado);
      } catch {
        /* ouvinte não pode derrubar a sincronização */
      }
    }
  };

  const recarregarTelas = async () => {
    if (typeof FoodSearch !== 'undefined' && typeof MacroDB.ensureFoods === 'function') {
      FoodSearch.buildIndex(await MacroDB.ensureFoods());
    }
    document.dispatchEvent(new Event('diario:refresh'));
    document.dispatchEvent(new Event('relatorios:refresh'));
  };

  function salvarSessao() {
    if (sessao) localStorage.setItem('sbSessao', JSON.stringify(sessao));
    else localStorage.removeItem('sbSessao');
  }

  function carregarSessao() {
    try {
      sessao = JSON.parse(localStorage.getItem('sbSessao') || 'null');
    } catch {
      sessao = null;
    }
    if (sessao) {
      estado.conectado = true;
      estado.email = sessao.email || '';
    }
  }

  const traduzErro = (msg) => {
    const m = String(msg || '');
    if (/invalid login credentials/i.test(m)) return 'e-mail ou senha incorretos';
    if (/already registered/i.test(m)) return 'este e-mail já tem conta — use Entrar';
    if (/password should be/i.test(m)) return 'senha muito curta (mínimo 6 caracteres)';
    if (/rate limit/i.test(m)) return 'muitas tentativas — aguarde um instante';
    if (/provider is not enabled/i.test(m)) return 'login com Google ainda não ativado no projeto';
    if (/failed to fetch|networkerror|load failed/i.test(m))
      return 'sem conexão com o servidor (rede indisponível ou bloqueada neste ambiente)';
    return m;
  };

  async function chamarAuth(caminho, body) {
    const { url, key } = cfg();
    let r;
    try {
      r = await fetch(`${url}/auth/v1/${caminho}`, {
        method: body ? 'POST' : 'GET',
        headers: { apikey: key, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw new Error(traduzErro(e.message));
    }
    const dados = await r.json().catch(() => ({}));
    if (!r.ok) {
      throw new Error(traduzErro(dados.msg || dados.error_description || dados.message || `erro ${r.status}`));
    }
    return dados;
  }

  function adotarSessao(dados) {
    sessao = {
      access_token: dados.access_token,
      refresh_token: dados.refresh_token,
      expires_at: Date.now() + (Number(dados.expires_in) || 3600) * 1000,
      user_id: (dados.user && dados.user.id) || (sessao && sessao.user_id),
      email: (dados.user && dados.user.email) || (sessao && sessao.email) || '',
    };
    estado.conectado = true;
    estado.email = sessao.email;
    estado.erro = '';
    salvarSessao();
  }

  async function renovarSessao() {
    adotarSessao(await chamarAuth('token?grant_type=refresh_token', { refresh_token: sessao.refresh_token }));
  }

  async function garantirToken() {
    if (!sessao) throw new Error('não conectado');
    if (Date.now() > sessao.expires_at - 60000) await renovarSessao();
    return sessao.access_token;
  }

  async function api(caminho, opts = {}) {
    const { url, key } = cfg();
    const token = await garantirToken();
    let r;
    try {
      r = await fetch(`${url}/rest/v1/${caminho}`, {
        ...opts,
        headers: {
          apikey: key,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...(opts.headers || {}),
        },
      });
    } catch (e) {
      throw new Error(traduzErro(e.message));
    }
    if (r.status === 401) {
      await renovarSessao(); // token recusado: renova uma vez e repete
      return api(caminho, opts);
    }
    if (!r.ok) throw new Error(`o servidor respondeu ${r.status}`);
    return r;
  }

  async function baixarRemoto() {
    // o RLS já limita à própria linha; o filtro explícito é defesa em profundidade
    const r = await api(`${TABELA}?select=dados&user_id=eq.${sessao.user_id}`);
    const linhas = await r.json();
    return (linhas[0] && linhas[0].dados) || null;
  }

  async function subirBackup() {
    const backup = await MacroDB.exportBackup();
    await api(TABELA, {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify([
        { user_id: sessao.user_id, dados: backup, atualizado_em: new Date().toISOString() },
      ]),
    });
    alteracoesPendentes = false;
    estado.ultimaSync = new Date().toISOString();
    localStorage.setItem('sbUltimaSync', estado.ultimaSync);
  }

  /* ---- Isolamento entre usuários no mesmo aparelho ---- */

  // Dados locais sem dono (uso local antes de qualquer login) são adotados pela
  // conta que entrar — é o caminho de migração de quem já usava o app. Dados de
  // OUTRA conta são apagados daqui (continuam na nuvem do dono).
  async function prepararLocalPara(userId) {
    const dono = localStorage.getItem(DONO);
    if (dono && dono !== userId) {
      await MacroDB.clearLocal();
      await recarregarTelas();
      estado.aviso = 'dados do usuário anterior removidos deste aparelho (seguem salvos na conta dele)';
    }
    localStorage.setItem(DONO, userId);
  }

  async function aposAutenticar() {
    await prepararLocalPara(sessao.user_id);
    avisar();
    await sincronizar();
  }

  async function sincronizar() {
    if (!estado.conectado || estado.ocupado) return;
    estado.ocupado = true;
    estado.erro = '';
    avisar();
    try {
      const remoto = await baixarRemoto();
      if (remoto) {
        const r = await MacroDB.mergeBackup(remoto);
        if (r.novos || r.customs) await recarregarTelas();
      }
      await subirBackup();
    } catch (e) {
      if (e.message === 'não conectado') await sair(false);
      else estado.erro = e.message;
    }
    estado.ocupado = false;
    avisar();
  }

  /* ---- Entrar / criar conta / Google / sair ---- */

  async function entrar(email, senha) {
    estado.erro = '';
    estado.aviso = '';
    avisar();
    try {
      adotarSessao(await chamarAuth('token?grant_type=password', { email, password: senha }));
      await aposAutenticar();
    } catch (e) {
      estado.erro = e.message;
      avisar();
    }
  }

  async function criarConta(email, senha) {
    estado.erro = '';
    estado.aviso = '';
    avisar();
    try {
      const dados = await chamarAuth('signup', { email, password: senha });
      if (dados.access_token) {
        adotarSessao(dados);
        await aposAutenticar();
      } else {
        // projeto com confirmação de e-mail ligada
        estado.aviso = 'conta criada — confirme no link enviado ao seu e-mail e depois toque em Entrar';
        avisar();
      }
    } catch (e) {
      estado.erro = e.message;
      avisar();
    }
  }

  // OAuth do Google pelo próprio Supabase: sai da página e volta com os tokens
  // no fragmento da URL (por isso não funciona em file:// nem dentro de iframe).
  function entrarComGoogle() {
    if (!podeOAuth()) {
      estado.erro = 'o login com Google precisa do app aberto no endereço https (não funciona em arquivo local)';
      avisar();
      return;
    }
    const destino = location.href.split('#')[0];
    location.href =
      `${cfg().url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(destino)}`;
  }

  const podeOAuth = () =>
    (location.protocol === 'https:' || location.hostname === 'localhost') && window.self === window.top;

  // volta do Google: tokens vêm no hash da URL
  async function capturarRetornoOAuth() {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : '';
    if (!hash) return false;
    const p = new URLSearchParams(hash);
    if (p.get('error_description')) {
      estado.erro = traduzErro(p.get('error_description'));
      history.replaceState(null, '', location.pathname + location.search);
      avisar();
      return false;
    }
    const access_token = p.get('access_token');
    if (!access_token) return false;
    history.replaceState(null, '', location.pathname + location.search);
    try {
      adotarSessao({
        access_token,
        refresh_token: p.get('refresh_token'),
        expires_in: p.get('expires_in'),
      });
      // o hash não traz o usuário: busca id e e-mail
      const { url, key } = cfg();
      const r = await fetch(`${url}/auth/v1/user`, {
        headers: { apikey: key, Authorization: `Bearer ${access_token}` },
      });
      const u = await r.json();
      sessao.user_id = u.id;
      sessao.email = u.email || '';
      estado.email = sessao.email;
      salvarSessao();
      await aposAutenticar();
      return true;
    } catch (e) {
      estado.erro = traduzErro(e.message);
      avisar();
      return false;
    }
  }

  // limpar = true apaga os dados deste aparelho (já enviados à nuvem), para que
  // o próximo usuário do aparelho não veja o diário de quem saiu
  async function sair(limpar = true) {
    clearTimeout(timerUpload);
    if (estado.conectado && alteracoesPendentes) {
      try {
        await subirBackup(); // não perde o que ainda não subiu
      } catch {
        /* sem rede: o que estiver só local se perde ao limpar — avisado na UI */
      }
    }
    sessao = null;
    salvarSessao();
    estado.conectado = false;
    estado.email = '';
    estado.erro = '';
    estado.aviso = '';
    if (limpar) {
      localStorage.removeItem(DONO);
      await MacroDB.clearLocal();
      await recarregarTelas();
    }
    avisar();
  }

  function setConfig(url, key) {
    localStorage.setItem('sbUrl', url.trim().replace(/\/+$/, ''));
    localStorage.setItem('sbAnonKey', key.trim());
    location.reload();
  }

  // mudanças locais (registros, alimentos próprios, configurações — inclusive um
  // importar de backup antigo) sobem em rajada única após 4 s de calmaria
  MacroDB.onChange((tipo) => {
    if (!estado.conectado || tipo === 'limpeza') return;
    alteracoesPendentes = true;
    clearTimeout(timerUpload);
    timerUpload = setTimeout(async () => {
      try {
        await subirBackup();
        estado.erro = '';
      } catch (e) {
        estado.erro = e.message;
      }
      avisar();
    }, 4000);
  });

  async function init() {
    carregarSessao();
    if (!estado.configurado) return;
    if (await capturarRetornoOAuth()) return; // voltou do Google: já sincronizou
    if (estado.conectado) {
      // sessão salva de uma visita anterior
      if (sessao.user_id) localStorage.setItem(DONO, sessao.user_id);
      setTimeout(() => sincronizar(), 800);
    }
  }

  init();

  return {
    entrar,
    criarConta,
    entrarComGoogle,
    sair,
    sincronizar,
    setConfig,
    configurado: () => estado.configurado,
    podeOAuth,
    onEstado: (fn) => {
      ouvintes.push(fn);
      fn(estado);
    },
  };
})();
