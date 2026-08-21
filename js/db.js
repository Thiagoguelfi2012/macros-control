/* Camada de dados: IndexedDB (alimentos + registros) e localStorage (configurações). */
const MacroDB = (() => {
  const DB_NAME = 'macros-db';
  const DB_VERSION = 2;
  const FOODS_URL = 'data/foods.json';
  const FOODS_VERSION = 26; // deve acompanhar o campo v de data/foods.json
  let dbPromise = null;
  let foodsCache = null; // array em memória para busca instantânea

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains('foods')) {
          db.createObjectStore('foods', { keyPath: 'i' });
        }
        if (!db.objectStoreNames.contains('entries')) {
          const st = db.createObjectStore('entries', { keyPath: 'id', autoIncrement: true });
          st.createIndex('ts', 'ts');
        }
        if (!db.objectStoreNames.contains('custom')) {
          db.createObjectStore('custom', { keyPath: 'i' });
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

  async function ensureFoods() {
    if (foodsCache) return foodsCache;
    let base;
    if (typeof window !== 'undefined' && window.FOODS_DATA) {
      // versão standalone (arquivo único): banco embutido na página
      base = window.FOODS_DATA.foods;
    } else {
      base = null;
      try {
        const db = await open();
        const storedVersion = Number(localStorage.getItem('foodsVersion') || 0);
        if (storedVersion === FOODS_VERSION) {
          const all = await wrap(tx(db, 'foods', 'readonly').getAll());
          if (all.length > 0) base = all;
        }
      } catch {
        /* IndexedDB indisponível: segue para o fetch */
      }
      if (!base) {
        // primeira visita (ou base atualizada): busca o JSON e persiste
        const res = await fetch(`${FOODS_URL}?v=${FOODS_VERSION}`, { cache: 'no-cache' });
        if (!res.ok) throw new Error('Não foi possível carregar data/foods.json');
        const data = await res.json();
        base = data.foods;
        try {
          const db = await open();
          await new Promise((resolve, reject) => {
            const t = db.transaction('foods', 'readwrite');
            const st = t.objectStore('foods');
            st.clear();
            for (const f of base) st.put(f);
            t.oncomplete = resolve;
            t.onerror = () => reject(t.error);
          });
          localStorage.setItem('foodsVersion', String(data.v));
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
    };
  }

  function saveSettings({ gastoBasal, gastoDiario, metaKcal, metaP, metaC, metaG }) {
    const set = (k, v) => {
      if (v != null) localStorage.setItem(k, String(v));
    };
    set('gastoBasal', gastoBasal);
    set('gastoDiario', gastoDiario);
    set('metaKcal', metaKcal);
    set('metaP', metaP);
    set('metaC', metaC);
    set('metaG', metaG);
    notifyChange('settings');
  }

  /* ---- Versão da base e atualização forçada ---- */

  const foodsInfo = () => ({
    versao: FOODS_VERSION,
    itens: foodsCache ? foodsCache.length : 0,
  });

  // Descarta a base guardada no aparelho e recarrega a página: resolve o caso
  // de o navegador continuar servindo uma lista de alimentos antiga do cache.
  async function refreshFoods() {
    localStorage.removeItem('foodsVersion');
    try {
      const db = await open();
      await wrap(tx(db, 'foods', 'readwrite').clear());
    } catch {
      /* sem IndexedDB: a base já vem do fetch a cada visita */
    }
    foodsCache = null;
    location.reload();
  }

  /* ---- Limpeza local (troca de usuário no mesmo aparelho) ---- */

  const CHAVES_CONFIG = ['gastoBasal', 'gastoDiario', 'metaKcal', 'metaP', 'metaC', 'metaG'];

  // Apaga registros, alimentos próprios e configurações DESTE aparelho. Usado ao
  // entrar com outra conta ou sair: os dados de quem saiu permanecem na nuvem.
  async function clearLocal() {
    try {
      const db = await open();
      await new Promise((resolve, reject) => {
        const t = db.transaction(['entries', 'custom'], 'readwrite');
        t.objectStore('entries').clear();
        t.objectStore('custom').clear();
        t.oncomplete = resolve;
        t.onerror = () => reject(t.error);
      });
    } catch {
      /* sem IndexedDB: só o fallback abaixo importa */
    }
    localStorage.removeItem(LS_KEY);
    localStorage.removeItem(LS_CUSTOM);
    localStorage.removeItem('cestaRefeicao');
    for (const k of CHAVES_CONFIG) localStorage.removeItem(k);
    foodsCache = null; // recarrega a base sem os alimentos próprios do anterior
    notifyChange('limpeza');
  }

  async function hasLocalData() {
    const [entries, custom] = await Promise.all([getAllEntries(), getCustomFoods()]);
    return entries.length > 0 || custom.length > 0;
  }

  /* ---- Backup (exportar/importar/sincronizar) ---- */

  async function exportBackup() {
    const [entries, custom] = await Promise.all([getAllEntries(), getCustomFoods()]);
    return {
      app: 'controle-de-macros',
      versao: 1,
      exportadoEm: new Date().toISOString(),
      settings: getSettings(),
      custom,
      entries,
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
    if (obj.settings) saveSettings(obj.settings);
    return { novos, repetidos: obj.entries.length - novos, customs: customs.length };
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
  };
})();
