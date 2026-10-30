/**
 * Importa o recorte Brasil do Open Food Facts para uma camada da base.
 *
 * O OFF publica o catálogo inteiro como JSONL (uma linha = um produto), com
 * licença ODbL, que permite o uso em massa. O arquivo completo passa de 9 GB,
 * então aqui tudo é lido em streaming: a memória não cresce com o tamanho do
 * dump.
 *
 * O ponto desta camada NÃO é trazer o máximo de itens. É trazer só o que dá
 * para confiar: produto com nome em português, com os quatro macros por 100 g,
 * que feche em Atwater e que não seja repetição do que já temos. Tudo o que
 * não passa é contado e sai no relatório, para a gente saber o que ficou de
 * fora e por quê — um importador que engole lixo calado é pior que não ter
 * importador.
 *
 * Uso:
 *   node tools/importar-off.mjs <dump.jsonl|dump.jsonl.gz>
 *   node tools/importar-off.mjs --amostra     (gera e processa um arquivo de
 *                                              teste, sem precisar do dump)
 *
 * Saída: tools/off-brasil.json, que build-foods.mjs lê como origem 'o'.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import readline from 'node:readline';
import { fileURLToPath } from 'node:url';

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const RAIZ = path.resolve(AQUI, '..');
const SAIDA = path.join(AQUI, 'off-brasil.json');
const AMOSTRA = path.join(AQUI, 'off-amostra.jsonl');

/* ---------------------------------------------------------------- limites */

// Faixas de plausibilidade por 100 g. Fora delas o cadastro está errado:
// gordura pura dá 900 kcal, então nada passa disso; e a soma dos macros não
// cabe em mais de 100 g de alimento.
const LIM = { kcal: [1, 900], p: [0, 100], c: [0, 100], g: [0, 100] };

// Atwater: p*4 + c*4 + g*9 contra as kcal declaradas. Rótulo real desvia um
// pouco — fibra e poliol contam diferente —, mas não desvia muito. Como aqui
// ninguém olha item por item, a régua é mais dura que a da curadoria à mão.
const ATWATER_MIN = -0.25;
const ATWATER_MAX = 0.3;

// Nome que não serve: curto demais, só número, ou resto de cadastro de teste.
const NOME_RUIM = /^(test|teste|xxx+|aaa+|produto|product|sem nome|unknown|n\/a|\d+)$/i;

/* ------------------------------------------------------------ normalização */

// Mesma chave que a busca usa para comparar nomes: sem acento, sem
// pontuação, espaço simples. É o que decide se um produto do OFF é repetição
// de algo que já está na base.
const chave = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/['‘’ʼ´`]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const num = (v) => {
  if (v == null || v === '') return null;
  const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};

const round1 = (n) => Math.round(n * 10) / 10;

/* -------------------------------------------------------------- medidas */

// "25 g", "1 porção (30 g)", "200ml", "1,5 L" → gramas/ml como número.
function gramasDe(texto) {
  const t = String(texto || '').toLowerCase().replace(',', '.');
  // prefere o que estiver entre parênteses: "1 porção (30 g)" → 30
  const dentro = t.match(/\(([^)]*)\)/);
  const alvo = dentro ? dentro[1] : t;
  const m = alvo.match(/(\d+(?:\.\d+)?)\s*(kg|g|l|ml)\b/);
  if (!m) return null;
  const v = Number(m[1]);
  const un = m[2];
  if (un === 'kg' || un === 'l') return v * 1000;
  return v;
}

// Monta as medidas caseiras do produto a partir do que o OFF guarda: a porção
// de referência do rótulo e o tamanho da embalagem. Sem medida o alimento só
// pode ser lançado em gramas, que é o que queremos evitar.
function medidasDe(prod, liquido) {
  const un = liquido ? 'ml' : 'g';
  const saida = [];
  const vistos = new Set();
  const por = (rot, qtd) => {
    if (!(qtd > 0) || qtd > 5000) return;
    const q = Math.round(qtd * 10) / 10;
    if (vistos.has(q)) return;
    vistos.add(q);
    // acima de 1000 o rótulo fica ilegível em ml/g: 2 L lê melhor que 2000 ml
    const [valor, unidade] = q >= 1000
      ? [Math.round((q / 1000) * 100) / 100, liquido ? 'L' : 'kg']
      : [q, un];
    saida.push([`${rot} (${String(valor).replace('.', ',')} ${unidade})`, q]);
  };
  por('porção', gramasDe(prod.serving_size));
  por('embalagem', gramasDe(prod.quantity));
  return saida;
}

/* -------------------------------------------------------------- líquidos */

// Mesmas marcas e palavras que build-foods.mjs usa; aqui o dump ainda dá uma
// pista melhor, que é a unidade declarada da embalagem (ml ou L).
const LIQ_EXCL = /(^|[ ,(])p[óo]([ ,)]|$)|desidratad|condensado|em barra|mistura|creme de leite|sorvete|xarope|picol[ée]|geladinho|gelatina|levedo/i;
const LIQ_PALAVRA = /(^|[ ,(/-])(cerveja|chope|refrigerante|refresco|suco|n[ée]ctar|[áa]gua|leite|iogurte liquido|bebida|ch[áa]|caf[ée]|energ[ée]tico|isot[ôo]nico|vinho|whisky|vodka|cacha[çc]a|guaran[áa]|coca-?cola|pepsi|fanta|sprite|achocolatado)([ ,)/-]|$)/i;

function ehLiquido(nome, prod) {
  const diz = `${prod.quantity || ''} ${prod.serving_size || ''}`;
  if (/\b\d+\s*(ml|l|litros?)\b/i.test(diz)) return true;
  const n = String(nome || '').trim();
  return !LIQ_EXCL.test(n) && LIQ_PALAVRA.test(n);
}

/* ---------------------------------------------------------------- nomes */

// O OFF guarda o nome em vários idiomas. Para esta base o português vem
// primeiro; o campo genérico só entra se não houver português, e marca já
// presente no nome não é repetida.
function nomeDe(prod) {
  const bruto = String(prod.product_name_pt || prod.product_name || '').trim();
  if (!bruto) return null;
  // colapsa espaço, tira aspas soltas e CAIXA ALTA inteira (fica ilegível na
  // lista e atrapalha o desempate por tamanho de nome)
  let n = bruto.replace(/\s+/g, ' ').replace(/^["']|["']$/g, '').trim();
  if (n.length > 3 && n === n.toUpperCase() && /[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/.test(n)) {
    n = n.charAt(0) + n.slice(1).toLowerCase();
  }
  const marca = String(prod.brands || '').split(',')[0].trim();
  if (marca && !chave(n).includes(chave(marca))) n = `${n} (${marca})`;
  return n;
}

/* --------------------------------------------------------------- filtro */

// Devolve o alimento pronto, ou o motivo da rejeição. Um motivo por item:
// o primeiro que bater, para o relatório ficar legível.
function avaliar(prod, jaTem) {
  const paises = []
    .concat(prod.countries_tags || [])
    .map((x) => String(x).toLowerCase());
  if (!paises.some((x) => /(^|:)(brazil|brasil)$/.test(x))) return { erro: 'fora do Brasil' };

  const nome = nomeDe(prod);
  if (!nome) return { erro: 'sem nome' };
  if (nome.length < 3 || NOME_RUIM.test(nome)) return { erro: 'nome inútil' };

  const nu = prod.nutriments || {};
  let kcal = num(nu['energy-kcal_100g']);
  if (kcal == null) {
    const kj = num(nu['energy-kj_100g']) ?? num(nu.energy_100g);
    if (kj != null) kcal = kj / 4.184;
  }
  const p = num(nu.proteins_100g);
  const c = num(nu.carbohydrates_100g);
  const g = num(nu.fat_100g);
  if (kcal == null || p == null || c == null || g == null) return { erro: 'sem tabela nutricional' };

  for (const [campo, valor] of [['kcal', kcal], ['p', p], ['c', c], ['g', g]]) {
    const [lo, hi] = LIM[campo];
    if (valor < lo || valor > hi) return { erro: `${campo} fora da faixa` };
  }
  if (p + c + g > 100) return { erro: 'macros somam mais de 100 g' };

  const atwater = p * 4 + c * 4 + g * 9;
  const desvio = (atwater - kcal) / kcal;
  if (desvio < ATWATER_MIN || desvio > ATWATER_MAX) {
    return { erro: 'não fecha em Atwater' };
  }

  if (jaTem.has(chave(nome))) return { erro: 'já está na base' };

  const liquido = ehLiquido(nome, prod);
  const alimento = {
    n: nome,
    kcal: round1(kcal),
    p: round1(p),
    c: round1(c),
    g: round1(g),
    m: medidasDe(prod, liquido),
  };
  if (liquido) alimento.l = 1;
  if (prod.code) alimento.cod = String(prod.code);
  return { alimento };
}

/* ------------------------------------------------------------- amostra */

// Arquivo de teste com os casos que importam: um produto bom, um sem tabela,
// um que não fecha em Atwater, um fora do Brasil, um repetido e um líquido.
// Serve para exercitar o caminho inteiro sem baixar 9 GB.
function gerarAmostra() {
  const linhas = [
    { code: '1', product_name_pt: 'Biscoito recheado de limão', brands: 'Marca Teste',
      countries_tags: ['en:brazil'], serving_size: '30 g', quantity: '130 g',
      nutriments: { 'energy-kcal_100g': 480, proteins_100g: 6, carbohydrates_100g: 68, fat_100g: 20 } },
    { code: '2', product_name_pt: 'Produto sem tabela', countries_tags: ['en:brazil'],
      nutriments: {} },
    { code: '3', product_name_pt: 'Produto impossível', countries_tags: ['en:brazil'],
      nutriments: { 'energy-kcal_100g': 100, proteins_100g: 50, carbohydrates_100g: 50, fat_100g: 50 } },
    { code: '4', product_name: 'French Cookie', countries_tags: ['en:france'],
      nutriments: { 'energy-kcal_100g': 480, proteins_100g: 6, carbohydrates_100g: 68, fat_100g: 20 } },
    { code: '5', product_name_pt: 'Paçoquita', brands: 'Santa Helena', countries_tags: ['en:brazil'],
      nutriments: { 'energy-kcal_100g': 480, proteins_100g: 12, carbohydrates_100g: 55, fat_100g: 24 } },
    { code: '6', product_name_pt: 'Refrigerante de guaraná', brands: 'Marca Teste',
      countries_tags: ['en:brazil'], serving_size: '200 ml', quantity: '2 L',
      nutriments: { 'energy-kcal_100g': 40, proteins_100g: 0, carbohydrates_100g: 10, fat_100g: 0 } },
    { code: '7', product_name_pt: 'TESTE', countries_tags: ['en:brazil'],
      nutriments: { 'energy-kcal_100g': 200, proteins_100g: 5, carbohydrates_100g: 30, fat_100g: 6 } },
    { code: '8', product_name_pt: 'Barra de cereal castanha', brands: 'Marca Teste',
      countries_tags: ['en:brazil'], serving_size: '1 unidade (25 g)',
      nutriments: { 'energy-kj_100g': 1674, proteins_100g: 8, carbohydrates_100g: 55, fat_100g: 12 } },
  ];
  fs.writeFileSync(AMOSTRA, linhas.map((x) => JSON.stringify(x)).join('\n') + '\n');
  return AMOSTRA;
}

/* ----------------------------------------------------------------- main */

async function main() {
  const arg = process.argv[2];
  if (!arg) {
    console.error('uso: node tools/importar-off.mjs <dump.jsonl[.gz]> | --amostra');
    process.exit(1);
  }
  const entrada = arg === '--amostra' ? gerarAmostra() : arg;
  if (!fs.existsSync(entrada)) {
    console.error(`arquivo não encontrado: ${entrada}`);
    process.exit(1);
  }

  // nomes que a base já tem: o dump não pode duplicar o que foi curado à mão
  const base = JSON.parse(fs.readFileSync(path.join(RAIZ, 'data', 'foods.json'), 'utf8'));
  const jaTem = new Set(base.foods.map((f) => chave(f.n)));
  console.log(`base atual: ${base.foods.length} alimentos (v${base.v})`);

  let fluxo = fs.createReadStream(entrada);
  if (entrada.endsWith('.gz')) fluxo = fluxo.pipe(zlib.createGunzip());
  const linhas = readline.createInterface({ input: fluxo, crlfDelay: Infinity });

  const aceitos = [];
  const motivos = new Map();
  let lidas = 0;
  let quebradas = 0;
  const conta = (m) => motivos.set(m, (motivos.get(m) || 0) + 1);

  for await (const linha of linhas) {
    if (!linha.trim()) continue;
    lidas++;
    if (lidas % 250000 === 0) process.stderr.write(`  ${lidas} lidas, ${aceitos.length} aceitos\r`);
    let prod;
    try {
      prod = JSON.parse(linha);
    } catch {
      quebradas++;
      continue;
    }
    const r = avaliar(prod, jaTem);
    if (r.erro) {
      conta(r.erro);
      continue;
    }
    // o próprio lote não pode repetir: o OFF tem o mesmo produto em vários
    // códigos de barras (embalagens diferentes do mesmo item)
    jaTem.add(chave(r.alimento.n));
    aceitos.push(r.alimento);
  }

  aceitos.sort((a, b) => a.n.localeCompare(b.n, 'pt-BR'));
  fs.writeFileSync(SAIDA, JSON.stringify(aceitos, null, 0));

  const semMedida = aceitos.filter((a) => !a.m.length).length;
  console.log(`\nlinhas lidas: ${lidas}${quebradas ? ` (${quebradas} ilegíveis)` : ''}`);
  console.log(`aceitos: ${aceitos.length}`);
  console.log(`  com medida caseira: ${aceitos.length - semMedida}`);
  console.log(`  só em gramas: ${semMedida}`);
  console.log(`  líquidos: ${aceitos.filter((a) => a.l).length}`);
  console.log('rejeitados:');
  for (const [m, n] of [...motivos.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(8)}  ${m}`);
  }
  console.log(`\ngravado: ${path.relative(RAIZ, SAIDA)}`);
}

main();
