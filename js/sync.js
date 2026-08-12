/* Conta e sincronização via Supabase (plano gratuito): login por e-mail/senha
   (Supabase Auth) e backup em uma tabela com RLS — cada usuário só enxerga a
   própria linha. Sem SDK: chamadas REST diretas (Auth/GoTrue + PostgREST).
   A sincronização reaproveita a regra do importar (MacroDB.mergeBackup):
   baixa o remoto, soma com o local sem duplicar e sobe a união — por isso o
   histórico antigo de quem usava só local entra pelo importar/exportar e, na
   sequência, sobe para a nuvem sozinho. */
const SupabaseSync = (() => {
  // Projeto padrão (pode ficar vazio: os valores configurados na tela de
  // Relatórios, salvos no navegador, têm prioridade). A anon key é pública
  // por design — a segurança vem das políticas RLS no banco.
  const DEFAULT_URL = 'https://ddzqpkrjqsmwjlsqhbsm.supabase.co';
  const DEFAULT_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkenFwa3JqcXNtd2psc3FoYnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1NTI5MjQsImV4cCI6MjEwMjEyODkyNH0.OayKpjn1hJsW7vWnYzxMLhwiDn_u9U4j5Rmkq1WLdEM';
  const TABELA = 'backups';

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
    if (/failed to fetch|networkerror|load failed/i.test(m))
      return 'sem conexão com o servidor (rede indisponível ou bloqueada neste ambiente)';
    return m;
  };

  async function chamarAuth(caminho, body) {
    const { url, key } = cfg();
    let r;
    try {
      r = await fetch(`${url}/auth/v1/${caminho}`, {
        method: 'POST',
        headers: { apikey: key, 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
      expires_at: Date.now() + (dados.expires_in || 3600) * 1000,
      user_id: dados.user && dados.user.id,
      email: (dados.user && dados.user.email) || '',
    };
    estado.conectado = true;
    estado.email = sessao.email;
    estado.erro = '';
    salvarSessao();
  }

  async function renovarSessao() {
    const dados = await chamarAuth('token?grant_type=refresh_token', {
      refresh_token: sessao.refresh_token,
    });
    adotarSessao(dados);
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
      // token recusado: renova uma vez e repete
      await renovarSessao();
      return api(caminho, opts);
    }
    if (!r.ok) throw new Error(`o servidor respondeu ${r.status}`);
    return r;
  }

  async function baixarRemoto() {
    const r = await api(`${TABELA}?select=dados`);
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
    estado.ultimaSync = new Date().toISOString();
    localStorage.setItem('sbUltimaSync', estado.ultimaSync);
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
        if (r.novos || r.customs) {
          // alimentos próprios vindos da nuvem entram na busca
          if (typeof FoodSearch !== 'undefined') FoodSearch.buildIndex(await MacroDB.ensureFoods());
          document.dispatchEvent(new Event('diario:refresh'));
          document.dispatchEvent(new Event('relatorios:refresh'));
        }
      }
      await subirBackup();
    } catch (e) {
      if (e.message === 'não conectado') sair();
      else estado.erro = e.message;
    }
    estado.ocupado = false;
    avisar();
  }

  async function entrar(email, senha) {
    estado.erro = '';
    estado.aviso = '';
    avisar();
    try {
      adotarSessao(await chamarAuth('token?grant_type=password', { email, password: senha }));
      avisar();
      await sincronizar();
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
        avisar();
        await sincronizar();
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

  function sair() {
    sessao = null;
    salvarSessao();
    estado.conectado = false;
    estado.email = '';
    estado.erro = '';
    avisar();
  }

  function setConfig(url, key) {
    localStorage.setItem('sbUrl', url.trim().replace(/\/+$/, ''));
    localStorage.setItem('sbAnonKey', key.trim());
    location.reload();
  }

  // mudanças locais (registros, alimentos próprios, configurações — inclusive
  // um importar de backup antigo) sobem em rajada única após 4 s de calmaria
  MacroDB.onChange(() => {
    if (!estado.conectado) return;
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

  carregarSessao();
  // sessão salva de uma visita anterior: sincroniza ao abrir
  if (estado.conectado && estado.configurado) setTimeout(() => sincronizar(), 800);

  return {
    entrar,
    criarConta,
    sair,
    sincronizar,
    setConfig,
    configurado: () => estado.configurado,
    onEstado: (fn) => {
      ouvintes.push(fn);
      fn(estado);
    },
  };
})();
