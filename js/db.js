/* Camada de dados: IndexedDB (alimentos + registros) e localStorage (configurações). */
const MacroDB = (() => {
  const DB_NAME = 'macros-db';
  const DB_VERSION = 1;
  const FOODS_URL = 'data/foods.json';
  const FOODS_VERSION = 2; // deve acompanhar o campo v de data/foods.json
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
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    return dbPromise;
  }

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

  /* ---- Alimentos ---- */

  async function ensureFoods() {
    if (foodsCache) return foodsCache;
    // versão standalone (arquivo único): banco embutido na página
    if (typeof window !== 'undefined' && window.FOODS_DATA) {
      foodsCache = window.FOODS_DATA.foods;
      return foodsCache;
    }
    const db = await open();
    const storedVersion = Number(localStorage.getItem('foodsVersion') || 0);
    if (storedVersion === FOODS_VERSION) {
      const all = await wrap(tx(db, 'foods', 'readonly').getAll());
      if (all.length > 0) {
        foodsCache = all;
        return foodsCache;
      }
    }
    // primeira visita (ou base atualizada): busca o JSON e persiste
    const res = await fetch(FOODS_URL);
    if (!res.ok) throw new Error('Não foi possível carregar data/foods.json');
    const data = await res.json();
    foodsCache = data.foods;
    await new Promise((resolve, reject) => {
      const t = db.transaction('foods', 'readwrite');
      const st = t.objectStore('foods');
      st.clear();
      for (const f of data.foods) st.put(f);
      t.oncomplete = resolve;
      t.onerror = () => reject(t.error);
    });
    localStorage.setItem('foodsVersion', String(data.v));
    return foodsCache;
  }

  async function getFood(id) {
    const foods = await ensureFoods();
    return foods.find((f) => f.i === id) || null;
  }

  /* ---- Registros ---- */
  // entry: { id?, ts (ISO), foodId, nome, qtd, medida, gramas, kcal, p, c, g }

  async function addEntry(entry) {
    try {
      const db = await open();
      return await wrap(tx(db, 'entries', 'readwrite').add(entry));
    } catch {
      const arr = lsAll();
      entry.id = arr.reduce((m, e) => Math.max(m, e.id), 0) + 1;
      arr.push(entry);
      lsSave(arr);
      return entry.id;
    }
  }

  async function updateEntry(entry) {
    try {
      const db = await open();
      return await wrap(tx(db, 'entries', 'readwrite').put(entry));
    } catch {
      lsSave(lsAll().map((e) => (e.id === entry.id ? entry : e)));
      return entry.id;
    }
  }

  async function deleteEntry(id) {
    try {
      const db = await open();
      return await wrap(tx(db, 'entries', 'readwrite').delete(id));
    } catch {
      lsSave(lsAll().filter((e) => e.id !== id));
    }
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
    return {
      gastoBasal: Number(localStorage.getItem('gastoBasal') || 0) || null,
      gastoDiario: Number(localStorage.getItem('gastoDiario') || 0) || null,
    };
  }

  function saveSettings({ gastoBasal, gastoDiario }) {
    if (gastoBasal != null) localStorage.setItem('gastoBasal', String(gastoBasal));
    if (gastoDiario != null) localStorage.setItem('gastoDiario', String(gastoDiario));
  }

  return {
    ensureFoods,
    getFood,
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
