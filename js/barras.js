/* Leitor de código de barras: aponta a câmera para a embalagem e o alimento
   entra no diário sem digitar nada.

   A leitura é do próprio navegador (BarcodeDetector, Chrome/Android). Onde não
   existe — iPhone, por exemplo —, sobra o campo para digitar os números, que
   é o mesmo caminho a partir dali.

   Quem responde "que produto é esse" é o Open Food Facts, a base aberta de
   rótulos: sai daqui só o número do código de barras. O que vem de lá é
   gravado como alimento próprio, então da segunda vez em diante o mesmo
   produto é encontrado offline, na busca normal. */
const Barras = (() => {
  const $ = (s) => document.querySelector(s);
  const API = 'https://world.openfoodfacts.org/api/v2/product/';
  const FORMATOS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf'];

  let stream = null;
  let lendo = false;
  let aoEscolher = null;
  let iniciado = false;

  const suportado = () => typeof window !== 'undefined' && 'BarcodeDetector' in window;
  const status = (txt, tipo) => {
    const el = $('#scan-status');
    if (!el) return;
    el.textContent = txt;
    el.className = `scan-status${tipo ? ` ${tipo}` : ''}`;
  };

  function pararCamera() {
    lendo = false;
    if (stream) {
      for (const t of stream.getTracks()) t.stop();
      stream = null;
    }
    const v = $('#scan-video');
    if (v) v.srcObject = null;
    const palco = $('#scan-palco');
    if (palco) palco.hidden = true;
  }

  async function ligarCamera() {
    if (!suportado()) {
      status('Este navegador não lê o código pela câmera. Digite os números abaixo.', 'aviso');
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      status('Sem acesso à câmera aqui. Digite os números abaixo.', 'aviso');
      return;
    }
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
    } catch (e) {
      const negado = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError');
      status(
        negado
          ? 'Permissão de câmera negada. Libere nas configurações do navegador ou digite os números abaixo.'
          : 'Não consegui abrir a câmera. Digite os números abaixo.',
        'aviso'
      );
      return;
    }
    const video = $('#scan-video');
    $('#scan-palco').hidden = false;
    video.srcObject = stream;
    try {
      await video.play();
    } catch {
      /* alguns navegadores só tocam depois de um gesto; o autoplay resolve */
    }
    status('Procurando o código… mantenha a embalagem enquadrada.');
    const detector = new window.BarcodeDetector({ formats: FORMATOS });
    lendo = true;
    const passo = async () => {
      if (!lendo) return;
      try {
        const achados = await detector.detect(video);
        const codigo = achados.map((x) => x.rawValue).find((x) => /^\d{8,14}$/.test(x || ''));
        if (codigo) {
          if (navigator.vibrate) navigator.vibrate(60);
          pararCamera();
          $('#scan-codigo').value = codigo;
          await buscar(codigo);
          return;
        }
      } catch {
        /* frame ruim: tenta o próximo */
      }
      setTimeout(passo, 220);
    };
    setTimeout(passo, 400);
  }

  /* ---- Consulta ---- */

  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : null;
  };

  // Monta o alimento a partir do que o Open Food Facts devolve. Sem os quatro
  // números por 100 g não dá para registrar nada, então isso é o mínimo.
  function daApi(prod, codigo) {
    const nut = prod.nutriments || {};
    let kcal = num(nut['energy-kcal_100g']);
    if (kcal == null && num(nut.energy_100g) != null) kcal = num(nut.energy_100g) / 4.184;
    const p = num(nut.proteins_100g);
    const c = num(nut.carbohydrates_100g);
    const g = num(nut.fat_100g);
    if (kcal == null || p == null || c == null || g == null) return null;
    const marca = (prod.brands || '').split(',')[0].trim();
    const base = (prod.product_name_pt || prod.product_name || '').trim();
    if (!base) return null;
    const nome = marca && !base.toLowerCase().includes(marca.toLowerCase()) ? `${base} (${marca})` : base;
    const food = {
      i: `cod-${codigo}`,
      n: nome,
      f: 'p',
      cod: codigo,
      origem: 'Open Food Facts',
      kcal: Math.round(kcal * 10) / 10,
      p: Math.round(p * 10) / 10,
      c: Math.round(c * 10) / 10,
      g: Math.round(g * 10) / 10,
      m: [],
    };
    // porção do rótulo e tamanho da embalagem viram medidas caseiras
    const porcao = parseFloat(String(prod.serving_size || '').replace(',', '.'));
    if (porcao > 0 && porcao < 2000) food.m.push([`porção (${Math.round(porcao)} g)`, Math.round(porcao)]);
    const pacote = parseFloat(String(prod.quantity || '').replace(',', '.'));
    if (pacote > 0 && pacote <= 5000 && Math.round(pacote) !== Math.round(porcao || 0))
      food.m.push([`embalagem (${Math.round(pacote)} g)`, Math.round(pacote)]);
    if (/\b(ml|l|litro)\b/i.test(String(prod.quantity || prod.serving_size || ''))) food.l = 1;
    if (!food.m.length) delete food.m;
    return food;
  }

  async function buscar(codigo) {
    const cod = String(codigo || '').replace(/\D/g, '');
    if (cod.length < 8) {
      status('Código curto demais — confira os números.', 'aviso');
      return;
    }
    $('#scan-achado').hidden = true;
    status('Procurando esse código…');
    // já escaneado antes: resolve offline, sem rede
    const meus = await MacroDB.getCustomFoods();
    const conhecido = meus.find((f) => f.cod === cod);
    if (conhecido) {
      mostrar(conhecido, 'Você já tinha escaneado este produto.');
      return;
    }
    let prod = null;
    try {
      const r = await fetch(
        `${API}${encodeURIComponent(cod)}.json?fields=product_name,product_name_pt,brands,quantity,serving_size,nutriments`,
        { headers: { Accept: 'application/json' } }
      );
      if (r.ok) {
        const json = await r.json();
        if (json && json.status === 1 && json.product) prod = json.product;
      }
    } catch {
      status('Sem internet para consultar o código. Cadastre o alimento pelo rótulo.', 'aviso');
      return;
    }
    if (!prod) {
      status(`Não encontrei o código ${cod} na base de rótulos. Cadastre o alimento pelo rótulo.`, 'aviso');
      return;
    }
    const food = daApi(prod, cod);
    if (!food) {
      status('Achei o produto, mas o rótulo dele não tem a tabela nutricional completa.', 'aviso');
      return;
    }
    mostrar(food, 'Confira os números com o rótulo antes de salvar.');
  }

  const fmt = (v, casas = 1) =>
    Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: casas });

  function mostrar(food, nota) {
    status('Produto encontrado.', 'ok');
    const box = $('#scan-achado');
    box.innerHTML = `
      <div class="scan-card">
        <b>${food.n}</b>
        <span class="scan-macros">${fmt(food.kcal, 0)} kcal · P ${fmt(food.p)} · C ${fmt(food.c)} · G ${fmt(food.g)} <i>(100 ${food.l ? 'ml' : 'g'})</i></span>
        <span class="scan-nota">${nota}${food.origem ? ` Fonte: ${food.origem}.` : ''}</span>
        <button class="btn btn-primary" id="btn-scan-usar" type="button">Usar este alimento</button>
      </div>`;
    box.hidden = false;
    $('#btn-scan-usar').onclick = async () => {
      const meus = await MacroDB.getCustomFoods();
      if (!meus.some((f) => f.i === food.i)) {
        await MacroDB.addCustomFood(food);
        FoodSearch.buildIndex(await MacroDB.ensureFoods());
      }
      fechar();
      if (aoEscolher) aoEscolher(food);
    };
  }

  /* ---- Abrir e fechar ---- */

  function fechar() {
    pararCamera();
    const back = $('#modal-barras');
    if (back) back.classList.remove('open');
  }

  function abrir(opcoes = {}) {
    aoEscolher = opcoes.aoEscolher || null;
    const back = $('#modal-barras');
    if (!back) return;
    if (!iniciado) {
      iniciado = true;
      $('#btn-scan-fechar').addEventListener('click', fechar);
      $('#btn-scan-buscar').addEventListener('click', () => buscar($('#scan-codigo').value));
      $('#scan-codigo').addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') buscar($('#scan-codigo').value);
      });
      back.addEventListener('click', (ev) => {
        if (ev.target === back) fechar();
      });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) pararCamera();
      });
    }
    $('#scan-achado').hidden = true;
    $('#scan-codigo').value = '';
    status('Aponte a câmera para o código de barras da embalagem.');
    back.classList.add('open');
    ligarCamera();
  }

  return { abrir, fechar, buscar, suportado, daApi };
})();

if (typeof window !== 'undefined') window.Barras = Barras;
