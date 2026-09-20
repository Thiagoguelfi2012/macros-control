/* Camada de dados: IndexedDB (alimentos + registros) e localStorage (configurações). */
const MacroDB = (() => {
  const DB_NAME = 'macros-db';
  const DB_VERSION = 4;
  const FOODS_URL = 'data/foods.json';
  const MANIFESTO_URL = 'data/foods-manifest.json';
  const FOODS_VERSION = 52; // deve acompanhar o campo v de data/foods.json
  let dbPromise = null;
  let foodsCache = null; // array em memória para busca instantânea
  let versaoCarregada = null; // versão que de fato entrou na busca

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('foods')) {
          db.createObjectStore('foods', { keyPath: 'i' });
        }
        // A base inteira cabe em UM registro. Guardada como 18 mil registros
        // soltos, relê-la custava um getAll() de 18 mil desserializações a cada
        // abertura de página — no celular isso é a tela "Carregando banco de
        // alimentos…". Em um registro só é uma leitura.
        if (!db.objectStoreNames.contains('base')) {
          db.createObjectStore('base', { keyPath: 'k' });
        }
        if (!db.objectStoreNames.contains('entries')) {
          const st = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
          st.createIndex('ts', 'ts');
        }
        if (!db.objectStoreNames.contains('custom')) {
          db.createObjectStore('custom', { keyPath: 'i' });
        }
        // treinos montados pelo usuário e execuções (com a carga do dia)
        if (!db.objectStoreNames.contains('treinos')) {
          db.createObjectStore('treinos', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sessoes')) {
          const st = db.createObjectStore('sessoes', { keyPath: 'id' });
          st.createIndex('ts', 'ts');
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

  /* ---- Notificação de mudanças (usada pela sincronização) ---- */

  const changeListeners = [];
  const onChange = (fn) => changeListeners.push(fn);
  const notifyChange = (tipo) => {
    for (const fn of changeListeners) {
      try {
        fn(tipo);
      } catch {
        /* ouvinte não pode quebrar a gravação */
      }
    }
  };

  const tx = (db, store, mode) => db.transaction(store, mode).objectStore(store);
  const wrap = (req) =>
    new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

  /* ---- Fallback em localStorage (file://, iframes com IndexedDB bloqueado) ---- */

  const LS_KEY = 'entriesFallback';
  const lsAll = () => JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  const lsSave = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));
  const LS_CUSTOM = 'customFallback';
  const lsCustom = () => JSON.parse(localStorage.getItem(LS_CUSTOM) || '[]');
  const lsCustomSave = (arr) => localStorage.setItem(LS_CUSTOM, JSON.stringify(arr));
  const LS_TREINOS = 'treinosFallback';
  const LS_SESSOES = 'sessoesFallback';
  const lsLer = (k) => JSON.parse(localStorage.getItem(k) || '[]');
  const lsGravar = (k, arr) => localStorage.setItem(k, JSON.stringify(arr));

  /* ---- Alimentos próprios (cadastrados pelo usuário) ---- */

  async function getCustomFoods() {
    try {
      const db = await open();
      return await wrap(tx(db, 'custom', 'readonly').getAll());
    } catch {
      return lsCustom();
    }
  }

  async function addCustomFood(food) {
    try {
      const db = await open();
      await wrap(tx(db, 'custom', 'readwrite').put(food));
    } catch {
      lsCustomSave([...lsCustom().filter((f) => f.i !== food.i), food]);
    }
    if (foodsCache) foodsCache = [food, ...foodsCache.filter((f) => f.i !== food.i)];
    notifyChange('custom');
    return food;
  }

  async function deleteCustomFood(id) {
    try {
      const db = await open();
      await wrap(tx(db, 'custom', 'readwrite').delete(id));
    } catch {
      lsCustomSave(lsCustom().filter((f) => f.i !== id));
    }
    if (foodsCache) foodsCache = foodsCache.filter((f) => f.i !== id);
    notifyChange('custom');
  }

  /* ---- Alimentos ---- */

  // Devolve o texto junto com o JSON: o hash tem de ser tirado dos bytes que
  // chegaram, não de um re-stringify (que pode reordenar e dar outro hash).
  async function baixarFoods(url, modo) {
    const res = await fetch(url, { cache: modo });
    if (!res.ok) throw new Error('Não foi possível carregar data/foods.json');
    const texto = await res.text();
    return { texto, dados: JSON.parse(texto) };
  }

  // Mesmo sha1 curto do manifesto. Sem crypto.subtle (contexto não seguro, como
  // file://) devolve vazio, e aí a conferência é pulada em vez de dar errado.
  async function hashDe(texto) {
    try {
      if (!(self.crypto && self.crypto.subtle)) return '';
      const buf = await self.crypto.subtle.digest('SHA-1', new TextEncoder().encode(texto));
      return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
    } catch {
      return '';
    }
  }

  // Recarrega a página com um parâmetro novo na URL: obriga o navegador a
  // buscar o HTML de novo, e com ele os js/css na versão publicada.
  function recarregarSemCache() {
    const u = new URL(location.href);
    u.searchParams.set('atualizado', String(Date.now()));
    location.replace(u.toString());
  }

  /* Carregamento da base.

     A base não é baixada a cada visita — nunca foi. O que ela faz a cada
     abertura é buscar o MANIFESTO: uns 50 bytes com a versão e o hash do
     conteúdo. Se o hash bate com o que está guardado aqui, nada é baixado.

     Por que hash e não só o número da versão: o número mora em duas mãos (o v
     do arquivo e o FOODS_VERSION daqui) e elas se desencontram. Com hash, um v
     novo de conteúdo igual não custa download a ninguém, e conteúdo novo chega
     mesmo que alguém esqueça de subir o v. Sem rede, o manifesto falha e o que
     está guardado é usado do mesmo jeito — o app continua abrindo offline. */

  const guardarBase = async (foods, v, h) => {
    const db = await open();
    await new Promise((resolve, reject) => {
      const t = db.transaction(['base', 'foods'], 'readwrite');
      t.objectStore('base').put({ k: 'foods', v, h, foods });
      t.objectStore('foods').clear(); // formato antigo, um registro por alimento
      t.oncomplete = resolve;
      t.onerror = () => reject(t.error);
    });
    localStorage.setItem('foodsVersion', String(v));
    if (h) localStorage.setItem('foodsHash', h);
  };

  const lerBase = async () => {
    const db = await open();
    const reg = await wrap(tx(db, 'base', 'readonly').get('foods'));
    if (reg && reg.foods && reg.foods.length) return reg;
    // migração do formato antigo: aproveita o que já está no aparelho em vez
    // de cobrar 2,3 MB de download de quem já tinha a base
    const antigos = await wrap(tx(db, 'foods', 'readonly').getAll());
    if (!antigos.length) return null;
    const v = Number(localStorage.getItem('foodsVersion') || 0) || FOODS_VERSION;
    await guardarBase(antigos, v, localStorage.getItem('foodsHash') || '');
    return { k: 'foods', v, h: localStorage.getItem('foodsHash') || '', foods: antigos };
  };

  // null quando não deu para consultar (offline, 404): aí o local vale
  async function lerManifesto() {
    try {
      const res = await fetch(`${MANIFESTO_URL}?t=${Date.now()}`, { cache: 'no-store' });
      if (!res.ok) return null;
      const m = await res.json();
      return m && m.h ? m : null;
    } catch {
      return null;
    }
  }

  async function ensureFoods() {
    if (foodsCache) return foodsCache;
    let base;
    if (typeof window !== 'undefined' && window.FOODS_DATA) {
      // versão standalone (arquivo único): banco embutido na página
      base = window.FOODS_DATA.foods;
      versaoCarregada = window.FOODS_DATA.v ?? FOODS_VERSION;
    } else {
      base = null;
      let local = null;
      try {
        local = await lerBase();
      } catch {
        /* IndexedDB indisponível: segue para o fetch */
      }
      const manifesto = await lerManifesto();
      const serve =
        local &&
        (!manifesto || (manifesto.h && local.h ? manifesto.h === local.h : manifesto.v === local.v));
      if (serve) {
        base = local.foods;
        versaoCarregada = local.v;
      } else {
        const marca = (manifesto && manifesto.h) || FOODS_VERSION;
        let { texto, dados: data } = await baixarFoods(`${FOODS_URL}?v=${marca}`, 'no-cache');
        let hash = await hashDe(texto);
        // O navegador pode servir um foods.json antigo do cache mesmo com o ?v
        // novo (CDN, service worker do sistema). Quem denuncia isso é o hash não
        // bater com o do manifesto; sem manifesto, sobra comparar a versão.
        const velho = manifesto && manifesto.h && hash ? hash !== manifesto.h : data.v < FOODS_VERSION;
        if (velho) {
          ({ texto, dados: data } = await baixarFoods(`${FOODS_URL}?v=${marca}&r=${Date.now()}`, 'reload'));
          hash = await hashDe(texto);
        }
        // Veio versão MAIOR que este js/db.js conhece: quem está velho é o HTML
        // desta página, que ficou no cache. Recarrega furando o cache, uma vez.
        if (data.v > FOODS_VERSION && !sessionStorage.getItem('recarregouPorVersao')) {
          sessionStorage.setItem('recarregouPorVersao', '1');
          recarregarSemCache();
          await new Promise(() => {}); // a página vai embora
        }
        base = data.foods;
        versaoCarregada = data.v;
        // Guarda o hash do que REALMENTE chegou, nunca o que o manifesto
        // prometeu: se o servidor devolveu conteúdo velho, gravar a promessa
        // faria a próxima visita se achar em dia com a base errada para sempre.
        try {
          await guardarBase(base, data.v, hash);
        } catch {
          /* sem persistência da base: recarrega a cada visita */
        }
      }
    }
    const custom = await getCustomFoods();
    foodsCache = [...custom, ...base];
    return foodsCache;
  }

  async function getFood(id) {
    const foods = await ensureFoods();
    return foods.find((f) => f.i === id) || null;
  }

  /* ---- Registros ---- */
  // entry: { id?, ts (ISO), foodId, nome, qtd, medida, gramas, kcal, p, c, g }

  async function addEntry(entry) {
    let id;
    try {
      const db = await open();
      id = await wrap(tx(db, 'entries', 'readwrite').add(entry));
    } catch {
      const arr = lsAll();
      entry.id = arr.reduce((m, e) => Math.max(m, e.id), 0) + 1;
      arr.push(entry);
      lsSave(arr);
      id = entry.id;
    }
    notifyChange('entries');
    return id;
  }

  async function updateEntry(entry) {
    try {
      const db = await open();
      await wrap(tx(db, 'entries', 'readwrite').put(entry));
    } catch {
      lsSave(lsAll().map((e) => (e.id === entry.id ? entry : e)));
    }
    notifyChange('entries');
    return entry.id;
  }

  async function deleteEntry(id) {
    try {
      const db = await open();
      await wrap(tx(db, 'entries', 'readwrite').delete(id));
    } catch {
      lsSave(lsAll().filter((e) => e.id !== id));
    }
    notifyChange('entries');
  }

  async function getEntry(id) {
    try {
      const db = await open();
      return await wrap(tx(db, 'entries', 'readonly').get(id));
    } catch {
      return lsAll().find((e) => e.id === id) || null;
    }
  }

  async function getAllEntries() {
    try {
      const db = await open();
      return await wrap(tx(db, 'entries', 'readonly').getAll());
    } catch {
      return lsAll();
    }
  }

  async function getEntriesBetween(startISO, endISO) {
    try {
      const db = await open();
      const range = IDBKeyRange.bound(startISO, endISO, false, true);
      return await wrap(tx(db, 'entries', 'readonly').index('ts').getAll(range));
    } catch {
      return lsAll().filter((e) => e.ts >= startISO && e.ts < endISO);
    }
  }

  /* ---- Treinos e execuções ---- */

  // Um treino: { id, nome, foco, exercicios: [{ id, exercicioId, nome, grupo,
  // equipamento, series, repMin, repMax, carga, intervalo, obs }], criadoEm }.
  // Uma execução: { id, treinoId, treinoNome, ts, fimTs, itens: [{ exercicioId,
  // nome, carga, reps, feito }] }.

  const novoId = () =>
    `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

  async function lerStore(nome, chaveFallback) {
    try {
      const db = await open();
      return await wrap(tx(db, nome, 'readonly').getAll());
    } catch {
      return lsLer(chaveFallback);
    }
  }

  async function gravarStore(nome, chaveFallback, item) {
    try {
      const db = await open();
      await wrap(tx(db, nome, 'readwrite').put(item));
    } catch {
      lsGravar(chaveFallback, [...lsLer(chaveFallback).filter((x) => x.id !== item.id), item]);
    }
  }

  async function apagarStore(nome, chaveFallback, id) {
    try {
      const db = await open();
      await wrap(tx(db, nome, 'readwrite').delete(id));
    } catch {
      lsGravar(chaveFallback, lsLer(chaveFallback).filter((x) => x.id !== id));
    }
  }

  const ordenarTreinos = (lista) =>
    lista.slice().sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || String(a.criadoEm).localeCompare(String(b.criadoEm)));

  async function getTreinos() {
    return ordenarTreinos(await lerStore('treinos', LS_TREINOS));
  }

  async function getTreino(id) {
    return (await getTreinos()).find((t) => t.id === id) || null;
  }

  async function saveTreino(treino) {
    const item = { ...treino };
    if (!item.id) item.id = novoId();
    if (!item.criadoEm) item.criadoEm = new Date().toISOString();
    if (item.ordem == null) item.ordem = (await getTreinos()).length;
    await gravarStore('treinos', LS_TREINOS, item);
    notifyChange('treino');
    return item;
  }

  async function deleteTreino(id) {
    await apagarStore('treinos', LS_TREINOS, id);
    notifyChange('treino');
  }

  async function getSessoes() {
    const lista = await lerStore('sessoes', LS_SESSOES);
    return lista.slice().sort((a, b) => String(a.ts).localeCompare(String(b.ts)));
  }

  async function saveSessao(sessao) {
    const item = { ...sessao };
    if (!item.id) item.id = novoId();
    if (!item.ts) item.ts = new Date().toISOString();
    await gravarStore('sessoes', LS_SESSOES, item);
    notifyChange('sessao');
    return item;
  }

  async function deleteSessao(id) {
    await apagarStore('sessoes', LS_SESSOES, id);
    notifyChange('sessao');
  }

  /* ---- Configurações ---- */

  function getSettings() {
    const n = (k) => Number(localStorage.getItem(k) || 0) || null;
    return {
      gastoBasal: n('gastoBasal'),
      gastoDiario: n('gastoDiario'),
      metaKcal: n('metaKcal'),
      metaP: n('metaP'),
      metaC: n('metaC'),
      metaG: n('metaG'),
      refeicoesDia: n('refeicoesDia') || 4,
      metaAgua: n('metaAgua'),
    };
  }

  function saveSettings({ gastoBasal, gastoDiario, metaKcal, metaP, metaC, metaG, refeicoesDia, metaAgua }) {
    const set = (k, v) => {
      if (v != null) localStorage.setItem(k, String(v));
    };
    set('gastoBasal', gastoBasal);
    set('gastoDiario', gastoDiario);
    set('metaKcal', metaKcal);
    set('metaP', metaP);
    set('metaC', metaC);
    set('metaG', metaG);
    set('refeicoesDia', refeicoesDia);
    set('metaAgua', metaAgua);
    notifyChange('settings');
  }

  /* ---- Versão da base e atualização forçada ---- */

  const foodsInfo = () => ({
    versao: versaoCarregada ?? FOODS_VERSION,
    esperada: FOODS_VERSION,
    itens: foodsCache ? foodsCache.length : 0,
  });

  // Descarta a base guardada no aparelho e recarrega a página: resolve o caso
  // de o navegador continuar servindo uma lista de alimentos antiga do cache.
  async function refreshFoods() {
    localStorage.removeItem('foodsVersion');
    sessionStorage.removeItem('recarregouPorVersao');
    try {
      const db = await open();
      await wrap(tx(db, 'foods', 'readwrite').clear());
    } catch {
      /* sem IndexedDB: a base já vem do fetch a cada visita */
    }
    // apaga também o que o navegador tiver guardado das telas e dos scripts:
    // sem isso um HTML velho continua pedindo a versão anterior da base
    try {
      if (typeof caches !== 'undefined' && caches.keys) {
        const chaves = await caches.keys();
        await Promise.all(chaves.map((k) => caches.delete(k)));
      }
    } catch {
      /* sem Cache Storage: nada a limpar */
    }
    foodsCache = null;
    recarregarSemCache();
  }

  /* ---- Limpeza local (troca de usuário no mesmo aparelho) ---- */

  const CHAVES_CONFIG = ['gastoBasal', 'gastoDiario', 'metaKcal', 'metaP', 'metaC', 'metaG', 'refeicoesDia', 'metaAgua'];

  // Apaga registros, alimentos próprios e configurações DESTE aparelho. Usado ao
  // entrar com outra conta ou sair: os dados de quem saiu permanecem na nuvem.
  async function clearLocal() {
    try {
      const db = await open();
      await new Promise((resolve, reject) => {
        const t = db.transaction(['entries', 'custom', 'treinos', 'sessoes'], 'readwrite');
        t.objectStore('entries').clear();
        t.objectStore('custom').clear();
        t.objectStore('treinos').clear();
        t.objectStore('sessoes').clear();
        t.oncomplete = resolve;
        t.onerror = () => reject(t.error);
      });
    } catch {
      /* sem IndexedDB: só o fallback abaixo importa */
    }
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_CUSTOM);
    localStorage.removeItem(LS_TREINOS);
    localStorage.removeItem(LS_SESSOES);
    localStorage.removeItem('cestaRefeicao');
    localStorage.removeItem('sessaoEmAndamento');
    localStorage.removeItem('treinosSemeados');
    for (const k of CHAVES_CONFIG) localStorage.removeItem(k);
    foodsCache = null; // recarrega a base sem os alimentos próprios do anterior
    notifyChange('limpeza');
  }

  async function hasLocalData() {
    const [entries, custom, treinos, sessoes] = await Promise.all([
      getAllEntries(), getCustomFoods(), getTreinos(), getSessoes(),
    ]);
    return entries.length > 0 || custom.length > 0 || treinos.length > 0 || sessoes.length > 0;
  }

  /* ---- Backup (exportar/importar/sincronizar) ---- */

  async function exportBackup() {
    const [entries, custom, treinos, sessoes] = await Promise.all([
      getAllEntries(), getCustomFoods(), getTreinos(), getSessoes(),
    ]);
    return {
      app: 'controle-de-macros',
      versao: 2,
      exportadoEm: new Date().toISOString(),
      settings: getSettings(),
      custom,
      entries,
      treinos,
      sessoes,
    };
  }

  // Soma um backup com o que já existe: registros idênticos (mesmo instante,
  // alimento e quantidade) são ignorados, alimentos próprios atualizados por
  // id e configurações não nulas aplicadas por cima.
  async function mergeBackup(obj) {
    if (!obj || !Array.isArray(obj.entries)) {
      throw new Error('o conteúdo não parece um backup deste app');
    }
    const atuais = await getAllEntries();
    const chave = (e) => `${e.ts}|${e.nome}|${e.gramas}|${e.kcal}`;
    const vistos = new Set(atuais.map(chave));
    let novos = 0;
    for (const e of obj.entries) {
      if (!e || !e.ts || !e.nome || vistos.has(chave(e))) continue;
      const { id, ...resto } = e;
      await addEntry(resto);
      vistos.add(chave(e));
      novos++;
    }
    const customs = (Array.isArray(obj.custom) ? obj.custom : []).filter((f) => f && f.i && f.n);
    for (const f of customs) await addCustomFood(f);
    // treinos e execuções vêm com id próprio: o backup mais recente vence
    const treinos = (Array.isArray(obj.treinos) ? obj.treinos : []).filter((t) => t && t.id);
    for (const t of treinos) await gravarStore('treinos', LS_TREINOS, t);
    const sessoesVistas = new Set((await getSessoes()).map((x) => x.id));
    const sessoes = (Array.isArray(obj.sessoes) ? obj.sessoes : []).filter((x) => x && x.id);
    let sessoesNovas = 0;
    for (const x of sessoes) {
      if (sessoesVistas.has(x.id)) continue;
      await gravarStore('sessoes', LS_SESSOES, x);
      sessoesNovas++;
    }
    if (obj.settings) saveSettings(obj.settings);
    if (treinos.length || sessoesNovas) notifyChange('treino');
    return {
      novos, repetidos: obj.entries.length - novos, customs: customs.length,
      treinos: treinos.length, sessoes: sessoesNovas,
    };
  }

  return {
    foodsInfo,
    refreshFoods,
    onChange,
    exportBackup,
    mergeBackup,
    clearLocal,
    hasLocalData,
    ensureFoods,
    getFood,
    getCustomFoods,
    addCustomFood,
    deleteCustomFood,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntry,
    getAllEntries,
    getEntriesBetween,
    getSettings,
    saveSettings,
    getTreinos,
    getTreino,
    saveTreino,
    deleteTreino,
    getSessoes,
    saveSessao,
    deleteSessao,
    novoId,
  };
})();
