#!/usr/bin/env node
/**
 * Gera data/foods.json a partir de três fontes públicas:
 *  - TACO   (~597 alimentos, PT nativo)  — marcelosanto/tabela_taco
 *  - IBGE   (~1.971 alimentos, PT nativo) — renandspedrosa/tabela-taco-api (POF/IBGE)
 *  - USDA SR28 (~8.790 alimentos, EN traduzido por glossário) — alyssaq/usda-sqlite
 *
 * Uso: node tools/build-foods.mjs [dirDadosBrutos]
 * Se o diretório não for informado (ou os arquivos não existirem), baixa os
 * arquivos brutos para tools/.cache/.
 */
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CURADOS } from './curados.mjs';
import { MARCAS } from './marcas.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW_DIR = process.argv[2] || join(ROOT, 'tools', '.cache');
const OUT = join(ROOT, 'data', 'foods.json');
const TARGET_TOTAL = 25000; // efetivamente "tudo": inclui todas as fontes

const SOURCES = {
  'FOOD_DES.txt': 'https://raw.githubusercontent.com/alyssaq/usda-sqlite/master/data/FOOD_DES.txt',
  'NUT_DATA.txt': 'https://raw.githubusercontent.com/alyssaq/usda-sqlite/master/data/NUT_DATA.txt',
  'WEIGHT.txt': 'https://raw.githubusercontent.com/alyssaq/usda-sqlite/master/data/WEIGHT.txt',
  'taco_TACO.json': 'https://raw.githubusercontent.com/marcelosanto/tabela_taco/main/TACO.json',
  'ibge.sql': 'https://raw.githubusercontent.com/renandspedrosa/tabela-taco-api/master/database/seeders/scripts/ibge.sql',
  'tbca.txt': 'https://raw.githubusercontent.com/resen-dev/web-scraping-tbca/main/alimentos.txt',
};

async function ensureRawFiles() {
  mkdirSync(RAW_DIR, { recursive: true });
  for (const [name, url] of Object.entries(SOURCES)) {
    const path = join(RAW_DIR, name);
    if (existsSync(path)) continue;
    process.stderr.write(`Baixando ${name}...\n`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Falha ao baixar ${url}: HTTP ${res.status}`);
    writeFileSync(path, Buffer.from(await res.arrayBuffer()));
  }
}

const norm = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const round1 = (x) => Math.round(x * 10) / 10;

function num(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const s = String(v).trim().replace(',', '.');
  if (!s || s === 'NA' || s === 'Tr' || s === '-' || s === '*') return 0;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

/* ------------------------------------------------------------------ */
/* Glossário EN -> PT para as descrições do SR28                       */
/* ------------------------------------------------------------------ */

// Primeiro segmento da descrição (substantivo principal)
const FIRST = {
  'beef': 'Carne bovina', 'pork': 'Carne suína', 'lamb': 'Cordeiro', 'veal': 'Vitela',
  'chicken': 'Frango', 'turkey': 'Peru', 'fish': 'Peixe', 'beverages': 'Bebida',
  'alcoholic beverage': 'Bebida alcoólica', 'alcoholic beverages': 'Bebida alcoólica',
  'cereals ready-to-eat': 'Cereal matinal', 'cereals': 'Cereais', 'babyfood': 'Papinha infantil',
  'infant formula': 'Fórmula infantil', 'soup': 'Sopa', 'snacks': 'Snack', 'candies': 'Doce',
  'beans': 'Feijão', 'fast foods': 'Fast food', 'nuts': 'Castanha', 'potatoes': 'Batata',
  'cheese': 'Queijo', 'cookies': 'Biscoito doce', 'crackers': 'Biscoito salgado',
  'bread': 'Pão', 'oil': 'Óleo', 'game meat': 'Carne de caça', 'salad dressing': 'Molho para salada',
  'restaurant': 'Restaurante', 'sauce': 'Molho', 'milk': 'Leite', 'puddings': 'Pudim',
  'seeds': 'Sementes', 'squash': 'Abóbora', 'spices': 'Especiaria', 'gravy': 'Molho de carne',
  'cake': 'Bolo', 'corn': 'Milho', 'yogurt': 'Iogurte', 'peppers': 'Pimentão',
  'mollusks': 'Molusco', 'crustaceans': 'Crustáceo', 'rice': 'Arroz', 'pie': 'Torta',
  'ice creams': 'Sorvete', 'egg': 'Ovo', 'peas': 'Ervilha', 'pasta': 'Massa',
  'mushrooms': 'Cogumelo', 'wheat flour': 'Farinha de trigo', 'usda commodity': 'Commodity USDA',
  'soy sauce': 'Molho de soja', 'shortening': 'Gordura vegetal', 'margarine': 'Margarina',
  'margarine-like': 'Margarina light', 'butter': 'Manteiga', 'cream': 'Creme de leite',
  'sausage': 'Linguiça', 'frankfurter': 'Salsicha', 'ham': 'Presunto', 'bacon': 'Bacon',
  'bologna': 'Mortadela', 'salami': 'Salame', 'pepperoni': 'Peperoni', 'pastrami': 'Pastrami',
  'oat bran': 'Farelo de aveia', 'wheat bran': 'Farelo de trigo', 'rice bran': 'Farelo de arroz',
  'noodles': 'Macarrão', 'macaroni': 'Macarrão', 'spaghetti': 'Espaguete',
  'rolls': 'Pãozinho', 'bagels': 'Bagel', 'muffins': 'Muffin', 'muffin': 'Muffin',
  'pancakes': 'Panqueca', 'waffles': 'Waffle', 'doughnuts': 'Rosquinha (donut)',
  'croissants': 'Croissant', 'danish pastry': 'Folhado doce', 'toaster pastries': 'Pastelaria de torradeira',
  'pizza': 'Pizza', 'sandwich': 'Sanduíche', 'hamburger': 'Hambúrguer', 'cheeseburger': 'Cheeseburger',
  'tomatoes': 'Tomate', 'tomato products': 'Derivados de tomate', 'onions': 'Cebola',
  'carrots': 'Cenoura', 'broccoli': 'Brócolis', 'cauliflower': 'Couve-flor', 'spinach': 'Espinafre',
  'lettuce': 'Alface', 'cabbage': 'Repolho', 'cucumber': 'Pepino', 'kale': 'Couve',
  'garlic': 'Alho', 'ginger root': 'Gengibre', 'beets': 'Beterraba', 'celery': 'Salsão',
  'asparagus': 'Aspargo', 'eggplant': 'Berinjela', 'okra': 'Quiabo', 'chayote': 'Chuchu',
  'zucchini': 'Abobrinha', 'pumpkin': 'Abóbora moranga', 'sweet potato': 'Batata-doce',
  'cassava': 'Mandioca', 'yam': 'Inhame', 'taro': 'Taioba (taro)', 'turnips': 'Nabo',
  'radishes': 'Rabanete', 'leeks': 'Alho-poró', 'chives': 'Cebolinha', 'parsley': 'Salsinha',
  'watercress': 'Agrião', 'arugula': 'Rúcula', 'collards': 'Couve-manteiga', 'chard': 'Acelga',
  'artichokes': 'Alcachofra', 'brussels sprouts': 'Couve-de-bruxelas', 'mustard greens': 'Folhas de mostarda',
  'apples': 'Maçã', 'bananas': 'Banana', 'oranges': 'Laranja', 'grapes': 'Uva',
  'strawberries': 'Morango', 'pineapple': 'Abacaxi', 'watermelon': 'Melancia', 'melons': 'Melão',
  'mangos': 'Manga', 'papayas': 'Mamão', 'avocados': 'Abacate', 'peaches': 'Pêssego',
  'pears': 'Pera', 'plums': 'Ameixa', 'apricots': 'Damasco', 'cherries': 'Cereja',
  'figs': 'Figo', 'guavas': 'Goiaba', 'kiwifruit': 'Kiwi', 'lemons': 'Limão-siciliano',
  'limes': 'Limão', 'tangerines': 'Tangerina', 'grapefruit': 'Toranja', 'pomegranates': 'Romã',
  'raspberries': 'Framboesa', 'blackberries': 'Amora', 'blueberries': 'Mirtilo',
  'cranberries': 'Cranberry', 'raisins': 'Uva-passa', 'dates': 'Tâmara', 'prunes': 'Ameixa seca',
  'coconut meat': 'Coco', 'coconut milk': 'Leite de coco', 'coconut water': 'Água de coco',
  'passion-fruit': 'Maracujá', 'acerola': 'Acerola', 'jackfruit': 'Jaca', 'persimmons': 'Caqui',
  'starfruit': 'Carambola', 'soursop': 'Graviola', 'tamarinds': 'Tamarindo', 'plantains': 'Banana-da-terra',
  'lentils': 'Lentilha', 'chickpeas (garbanzo beans': 'Grão-de-bico', 'chickpea flour (besan)': 'Farinha de grão-de-bico',
  'soybeans': 'Soja', 'tofu': 'Tofu', 'tempeh': 'Tempeh', 'hummus': 'Homus',
  'peanuts': 'Amendoim', 'peanut butter': 'Pasta de amendoim', 'almonds': 'Amêndoa',
  'walnuts': 'Nozes', 'cashew nuts': 'Castanha-de-caju', 'brazilnuts': 'Castanha-do-pará',
  'hazelnuts or filberts': 'Avelã', 'pistachio nuts': 'Pistache', 'macadamia nuts': 'Macadâmia',
  'pecans': 'Noz-pecã', 'pine nuts': 'Pinhão (pinoli)', 'chia seeds': 'Semente de chia',
  'flaxseed': 'Linhaça', 'sesame seeds': 'Gergelim', 'sesame butter': 'Tahine',
  'sunflower seed kernels': 'Semente de girassol', 'sunflower seed butter': 'Pasta de girassol',
  'quinoa': 'Quinoa', 'amaranth grain': 'Amaranto', 'oats': 'Aveia', 'oat flour': 'Farinha de aveia',
  'barley': 'Cevada', 'buckwheat': 'Trigo-sarraceno', 'millet': 'Painço', 'rye grain': 'Centeio',
  'rye flour': 'Farinha de centeio', 'corn flour': 'Farinha de milho', 'cornmeal': 'Fubá',
  'couscous': 'Cuscuz marroquino', 'hominy': 'Canjica (hominy)', 'semolina': 'Semolina',
  'tapioca': 'Tapioca', 'wild rice': 'Arroz selvagem', 'sorghum grain': 'Sorgo',
  'egg substitute': 'Substituto de ovo', 'egg custards': 'Curau/creme de ovos',
  'sugars': 'Açúcar', 'honey': 'Mel', 'molasses': 'Melado', 'syrups': 'Xarope',
  'jams and preserves': 'Geleia', 'jellies': 'Geleia', 'gelatin desserts': 'Gelatina',
  'chocolate': 'Chocolate', 'cocoa': 'Cacau', 'baking chocolate': 'Chocolate para cobertura',
  'frostings': 'Cobertura de bolo', 'marshmallows': 'Marshmallow', 'ice cream': 'Sorvete',
  'frozen yogurts': 'Iogurte gelado', 'sherbet': 'Sorbet', 'milk shakes': 'Milk-shake',
  'eggnog': 'Gemada', 'whey': 'Soro de leite (whey)', 'sour cream': 'Creme azedo (sour cream)',
  'dulce de leche': 'Doce de leite', 'flan': 'Pudim de leite (flã)',
  'coffee': 'Café', 'tea': 'Chá', 'water': 'Água', 'carbonated beverage': 'Refrigerante',
  'cranberry juice': 'Suco de cranberry', 'orange juice': 'Suco de laranja',
  'apple juice': 'Suco de maçã', 'grape juice': 'Suco de uva', 'pineapple juice': 'Suco de abacaxi',
  'lemon juice': 'Suco de limão-siciliano', 'lime juice': 'Suco de limão',
  'energy drink': 'Bebida energética', 'sports drink': 'Isotônico',
  'wine': 'Vinho', 'beer': 'Cerveja',
  'salmon': 'Salmão', 'tuna': 'Atum', 'sardine': 'Sardinha', 'cod': 'Bacalhau (cod)',
  'tilapia': 'Tilápia', 'trout': 'Truta', 'anchovy': 'Anchova', 'herring': 'Arenque',
  'mackerel': 'Cavala', 'halibut': 'Halibute', 'haddock': 'Hadoque', 'flatfish (flounder and sole species)': 'Linguado',
  'swordfish': 'Peixe-espada', 'shark': 'Tubarão (cação)', 'catfish': 'Bagre',
  'shrimp': 'Camarão', 'crab': 'Caranguejo', 'lobster': 'Lagosta', 'oyster': 'Ostra',
  'clam': 'Marisco (vôngole)', 'mussel': 'Mexilhão', 'scallop': 'Vieira', 'octopus': 'Polvo',
  'squid': 'Lula', 'crayfish': 'Lagostim', 'caviar': 'Caviar', 'roe': 'Ova de peixe',
  'duck': 'Pato', 'goose': 'Ganso', 'quail': 'Codorna', 'pheasant': 'Faisão',
  'rabbit': 'Coelho', 'liver': 'Fígado', 'liverwurst spread': 'Patê de fígado',
  'pate': 'Patê', 'headcheese': 'Queijo de porco', 'tripe': 'Dobradinha (tripa)',
  'oopah (tunicate)': 'Tunicado (oopah)', 'seaweed': 'Alga marinha', 'spirulina': 'Espirulina',
  'vital wheat gluten': 'Glúten de trigo (seitan)', 'meatballs': 'Almôndegas',
  'vegetarian fillets': 'Filé vegetariano', 'veggie burgers or soyburgers': 'Hambúrguer vegetal',
  'mayonnaise': 'Maionese', 'mayonnaise dressing': 'Maionese', 'mustard': 'Mostarda',
  'catsup': 'Ketchup', 'vinegar': 'Vinagre', 'olives': 'Azeitona', 'pickles': 'Picles',
  'hot chili peppers': 'Pimenta', 'jalapeno peppers': 'Pimenta jalapeño',
  'salt': 'Sal', 'baking powder': 'Fermento químico', 'yeast extract spread': 'Extrato de levedura',
  'leavening agents': 'Fermento', 'cornstarch': 'Amido de milho (maisena)',
  'vanilla extract': 'Extrato de baunilha', 'protein supplement': 'Suplemento proteico',
  'nutritional supplement': 'Suplemento nutricional', 'meal replacement': 'Substituto de refeição',
  'rice drink': 'Bebida de arroz', 'soymilk': 'Leite de soja', 'almond milk': 'Leite de amêndoas',
  'oil or fat': 'Óleo ou gordura', 'fat': 'Gordura', 'lard': 'Banha', 'animal fat': 'Gordura animal',
  'fish oil': 'Óleo de peixe', 'oopah': 'Oopah', 'emu': 'Ema (emu)', 'ostrich': 'Avestruz',
  'bison': 'Bisão', 'goat': 'Cabrito', 'pin cherries': 'Cereja silvestre',
};

// Segmentos subsequentes (frases completas entre vírgulas)
const PHRASES = {
  'cashew nuts': 'de caju', 'cashew butter': 'manteiga de caju', 'almonds': 'amêndoas',
  'walnuts': 'nozes', 'english': 'inglês', 'brazilnuts': 'do Pará', 'macadamia nuts': 'macadâmia',
  'pistachio nuts': 'pistache', 'pecans': 'noz-pecã', 'hazelnuts or filberts': 'avelã',
  'pine nuts': 'pinoli', 'mixed nuts': 'mix', 'peanuts': 'amendoim',
  'cooked': 'cozido', 'raw': 'cru', 'separable lean and fat': 'carne com gordura',
  'separable lean only': 'somente carne magra', 'canned': 'enlatado', 'boneless': 'sem osso',
  'trimmed to 0" fat': 'sem gordura aparente', 'trimmed to 1/8" fat': 'com pouca gordura aparente',
  'trimmed to 1/4" fat': 'com gordura aparente', 'frozen': 'congelado', 'roasted': 'assado',
  'boiled': 'cozido em água', 'choice': 'padrão choice', 'fresh': 'fresco', 'imported': 'importado',
  'drained': 'escorrido', 'all grades': 'todas as classificações', 'without salt': 'sem sal',
  'braised': 'cozido em fogo brando', 'select': 'padrão select', 'with salt': 'com sal',
  'loin': 'lombo', 'unprepared': 'não preparado', 'new zealand': 'Nova Zelândia',
  'broiled': 'grelhado no forno', 'round': 'coxão (round)', 'bone-in': 'com osso',
  'grilled': 'grelhado', 'meat only': 'somente carne', 'mature seeds': 'grãos maduros',
  'dry': 'seco', 'white': 'branco', 'dry mix': 'mistura em pó', 'condensed': 'condensado',
  'chuck': 'acém', 'broilers or fryers': 'de granja', 'cured': 'curado',
  'meat and skin': 'carne e pele', 'solids and liquids': 'sólidos e líquidos',
  'steak': 'bife', 'shoulder': 'paleta', 'variety meats and by-products': 'miúdos',
  'rib': 'costela', 'powder': 'em pó', 'domestic': 'nacional', 'plain': 'tradicional',
  'regular': 'comum', 'ready-to-serve': 'pronto para servir', 'whole': 'inteiro',
  'dried': 'desidratado', 'strained': 'peneirado', 'enriched': 'enriquecido',
  'dry heat': 'calor seco', 'leg': 'perna', 'sweet': 'doce', 'chocolate': 'chocolate',
  'ground': 'moído', 'reduced fat': 'teor reduzido de gordura', 'mixed species': 'espécies variadas',
  'instant': 'instantâneo', 'junior': 'júnior', 'green': 'verde', 'fruit': 'fruta',
  'pork': 'suíno', 'dinner': 'refeição', 'commercially prepared': 'industrializado',
  'unenriched': 'não enriquecido', 'breast': 'peito', 'unheated': 'não aquecido',
  'roast': 'assado', 'with iron': 'com ferro', 'composite of trimmed retail cuts': 'mistura de cortes',
  'fried': 'frito', 'heated': 'aquecido', 'prepared from recipe': 'preparado em casa',
  'short loin': 'contrafilé', 'stewed': 'ensopado', 'prepared with water': 'preparado com água',
  'tenderloin': 'filé-mignon', 'drained solids': 'sólidos escorridos', 'vanilla': 'baunilha',
  'ready-to-feed': 'pronto para consumo', 'prepared with equal volume water': 'preparado com água',
  'sweetened': 'adoçado', 'unsweetened': 'sem açúcar', 'low sodium': 'baixo sódio',
  'prepared with whole milk': 'preparado com leite integral', 'light': 'light',
  'dark meat': 'carne escura', 'drumstick': 'coxa', 'thigh': 'sobrecoxa', 'wing': 'asa',
  'fluid': 'líquido', 'brisket': 'peito bovino', 'bottom round': 'coxão duro',
  'top round': 'coxão mole', 'eye of round': 'lagarto', 'fried chicken': 'frango frito',
  'prepared': 'preparado', 'cereal': 'cereal', 'raw (alaska native)': 'cru (nativo do Alasca)',
  '(alaska native)': '(nativo do Alasca)', 'table': 'de mesa', 'lean only': 'somente magra',
  'skin removed': 'sem pele', 'without skin': 'sem pele', 'with skin': 'com pele',
  'skinless': 'sem pele', 'moist heat': 'calor úmido', 'baked': 'assado no forno',
  'microwaved': 'no micro-ondas', 'pan-fried': 'frito na frigideira', 'pan-broiled': 'grelhado na frigideira',
  'rotisserie': 'assado na churrasqueira giratória', 'smoked': 'defumado', 'pickled': 'em conserva',
  'salted': 'salgado', 'unsalted': 'sem sal', 'dry roasted': 'torrado sem óleo',
  'oil roasted': 'torrado com óleo', 'blanched': 'branqueado', 'toasted': 'torrado',
  'shredded': 'ralado', 'sliced': 'fatiado', 'chopped': 'picado', 'diced': 'em cubos',
  'crumbs': 'farelo', 'grated': 'ralado', 'melted': 'derretido', 'creamed': 'cremoso',
  'evaporated': 'evaporado', 'sweetened condensed': 'condensado adoçado',
  'nonfat': 'desnatado', 'skim': 'desnatado', 'lowfat': 'semidesnatado',
  'low fat': 'semidesnatado', 'whole milk': 'leite integral', 'reduced sodium': 'sódio reduzido',
  'fat free': 'sem gordura', 'fat-free': 'sem gordura', 'sugar free': 'sem açúcar',
  'sugar-free': 'sem açúcar', 'caffeine free': 'sem cafeína', 'decaffeinated': 'descafeinado',
  'no sugar added': 'sem adição de açúcar', 'with added vitamin c': 'com vitamina C adicionada',
  'with added calcium': 'com cálcio adicionado', 'with added vitamins a and d': 'com vitaminas A e D',
  'vitamin d added': 'com vitamina D', 'without added vitamin a': 'sem vitamina A adicionada',
  'from concentrate': 'de concentrado', 'frozen concentrate': 'concentrado congelado',
  'undiluted': 'não diluído', 'diluted': 'diluído', 'bottled': 'engarrafado',
  'brewed': 'coado/infusão', 'espresso': 'expresso', 'instant powder': 'solúvel em pó',
  'carbonated': 'gaseificado', 'juice': 'suco', 'nectar': 'néctar',
  'red': 'vermelho', 'yellow': 'amarelo', 'orange': 'laranja', 'purple': 'roxo',
  'black': 'preto', 'brown': 'marrom', 'pink': 'rosa', 'blue': 'azul',
  'baby food': 'papinha', 'toddler': 'para crianças pequenas', 'organic': 'orgânico',
  'wild': 'selvagem', 'farmed': 'de cativeiro', 'atlantic': 'do Atlântico', 'pacific': 'do Pacífico',
  'mixed nuts': 'mix de castanhas', 'trail mix': 'mix de cereais e castanhas',
  'seedless': 'sem sementes', 'peeled': 'descascado', 'unpeeled': 'com casca',
  'without skin and seeds': 'sem casca e sem sementes', 'in water': 'em água',
  'in oil': 'em óleo', 'in olive oil': 'em azeite', 'in tomato sauce': 'em molho de tomate',
  'packed in water': 'conservado em água', 'packed in oil': 'conservado em óleo',
  'in heavy syrup': 'em calda', 'in light syrup': 'em calda leve', 'in juice': 'no próprio suco',
  'in syrup': 'em calda', 'heavy syrup pack': 'em calda', 'juice pack': 'no próprio suco',
  'water pack': 'em água', 'solids and liquid': 'sólidos e líquido',
  'white meat': 'carne branca', 'light meat': 'carne clara', 'giblets': 'miúdos',
  'heart': 'coração', 'gizzard': 'moela', 'tongue': 'língua', 'kidneys': 'rins',
  'brain': 'cérebro', 'lungs': 'pulmões', 'spleen': 'baço', 'feet': 'pés',
  'tail': 'rabo', 'neck': 'pescoço', 'back': 'dorso', 'ribs': 'costelas',
  'ham and water product': 'presunto com água', 'spiral cut': 'em espiral',
  'center slice': 'fatia central', 'shank half': 'metade do pernil', 'rump half': 'metade da alcatra',
  'sirloin': 'alcatra', 'top sirloin': 'maminha/alcatra', 'flank': 'fraldinha',
  'skirt steak': 'entranha', 'plate': 'ponta de agulha', 'ribeye': 'ancho (ribeye)',
  'porterhouse steak': 'bife porterhouse', 't-bone steak': 'bife t-bone',
  'ground beef': 'carne moída', 'patty': 'hambúrguer (disco)', 'patties': 'hambúrgueres (discos)',
  'link': 'gomo', 'links': 'gomos', 'crumbles': 'farofa de carne',
  'reduced calorie': 'baixa caloria', 'low calorie': 'baixa caloria', 'diet': 'diet',
  'zero': 'zero', 'with sugar': 'com açúcar', 'sweetened with sugar': 'adoçado com açúcar',
  'with aspartame': 'com aspartame', 'with saccharin': 'com sacarina',
  'high protein': 'rico em proteína', 'high fiber': 'rico em fibras', 'multigrain': 'multigrãos',
  'whole grain': 'grãos integrais', 'whole wheat': 'trigo integral', 'whole-wheat': 'trigo integral',
  'wheat': 'trigo', 'rye': 'centeio', 'oat': 'aveia', 'oatmeal': 'mingau de aveia (oatmeal)',
  'granola': 'granola', 'flakes': 'flocos', 'puffed': 'inflado', 'shredded wheat': 'trigo desfiado',
  'corn flakes': 'flocos de milho', 'bran flakes': 'flocos de farelo', 'muesli': 'muesli',
  'stone ground': 'moído em pedra', 'degermed': 'sem gérmen', 'self-rising': 'com fermento',
  'all purpose': 'de uso geral', 'all-purpose': 'de uso geral', 'bleached': 'branqueada',
  'unbleached': 'não branqueada', 'cake flour': 'farinha para bolo',
  'crust': 'massa/casca', 'thin crust': 'massa fina', 'thick crust': 'massa grossa',
  'frozen entree': 'prato congelado', 'entree': 'prato principal', 'meatless': 'sem carne',
  'vegetarian': 'vegetariano', 'vegan': 'vegano', 'gluten-free': 'sem glúten',
  'soy': 'soja', 'tofu': 'tofu', 'extra firm': 'extra firme', 'firm': 'firme',
  'soft': 'macio', 'silken': 'sedoso', 'extra virgin': 'extravirgem', 'virgin': 'virgem',
  'refined': 'refinado', 'unrefined': 'não refinado', 'cold pressed': 'prensado a frio',
  'hydrogenated': 'hidrogenado', 'partially hydrogenated': 'parcialmente hidrogenado',
  'olive': 'oliva', 'canola': 'canola', 'sunflower': 'girassol', 'safflower': 'cártamo',
  'soybean': 'soja', 'palm': 'dendê (palma)', 'palm kernel': 'palmiste', 'coconut': 'coco',
  'corn and canola': 'milho e canola', 'peanut': 'amendoim', 'sesame': 'gergelim',
  'grapeseed': 'semente de uva', 'avocado': 'abacate', 'flaxseed': 'linhaça',
  'stick': 'em tablete', 'tub': 'em pote', 'spread': 'cremoso (pasta)', 'whipped': 'batido',
  'salted butter': 'manteiga com sal', 'unsalted butter': 'manteiga sem sal',
  'shelf stable': 'longa vida', 'ultra-pasteurized': 'ultrapasteurizado (UHT)',
  'pasteurized': 'pasteurizado', 'unpasteurized': 'não pasteurizado',
  'american': 'americano', 'cheddar': 'cheddar', 'mozzarella': 'muçarela',
  'parmesan': 'parmesão', 'provolone': 'provolone', 'ricotta': 'ricota', 'swiss': 'suíço',
  'cottage': 'cottage', 'cream cheese': 'cream cheese', 'blue': 'gorgonzola (azul)',
  'brie': 'brie', 'camembert': 'camembert', 'feta': 'feta', 'goat': 'de cabra',
  'gouda': 'gouda', 'monterey': 'monterey', 'muenster': 'muenster', 'colby': 'colby',
  'part skim milk': 'semidesnatado', 'low moisture': 'baixa umidade',
  'greek': 'grego', 'plain yogurt': 'iogurte natural', 'nonfat yogurt': 'iogurte desnatado',
  'fruit variety': 'sabor frutas', 'strawberry': 'morango', 'banana': 'banana',
  'peach': 'pêssego', 'cherry': 'cereja', 'apple': 'maçã', 'grape': 'uva',
  'lemon': 'limão-siciliano', 'lime': 'limão', 'raspberry': 'framboesa',
  'blueberry': 'mirtilo', 'mixed berry': 'frutas vermelhas', 'tropical': 'tropical',
  'mango': 'manga', 'pineapple': 'abacaxi', 'caramel': 'caramelo', 'coffee': 'café',
  'mocha': 'mocha', 'hazelnut': 'avelã', 'almond': 'amêndoa', 'butter pecan': 'manteiga e noz-pecã',
  'cookies and cream': 'cookies and cream', 'mint': 'menta', 'peppermint': 'hortelã-pimenta',
  'cinnamon': 'canela', 'honey': 'mel', 'maple': 'bordo (maple)', 'ginger': 'gengibre',
  'garlic': 'alho', 'onion': 'cebola', 'ranch': 'ranch', 'italian': 'italiano',
  'french': 'francês', 'caesar': 'caesar', 'thousand island': 'mil ilhas',
  'blue or roquefort cheese': 'queijo azul (roquefort)', 'vinaigrette': 'vinagrete',
  'barbecue': 'barbecue', 'teriyaki': 'teriyaki', 'alfredo': 'alfredo', 'pesto': 'pesto',
  'marinara': 'ao sugo (marinara)', 'salsa': 'molho mexicano (salsa)',
  'cheese sauce': 'molho de queijo', 'white sauce': 'molho branco',
  'hot': 'picante', 'mild': 'suave', 'medium': 'médio', 'spicy': 'apimentado',
  'extra hot': 'extra picante', 'chunky': 'em pedaços', 'smooth': 'liso',
  'crunchy': 'crocante', 'chunk style': 'em pedaços', 'creamy': 'cremoso',
  'with pulp': 'com polpa', 'pulp free': 'sem polpa',
  'white rice': 'arroz branco', 'brown rice': 'arroz integral', 'long-grain': 'agulhinha',
  'medium-grain': 'grão médio', 'short-grain': 'grão curto', 'parboiled': 'parboilizado',
  'glutinous': 'glutinoso', 'jasmine': 'jasmim', 'basmati': 'basmati',
  'al dente': 'al dente', 'with egg': 'com ovo', 'egg noodles': 'macarrão de ovos',
  'rice noodles': 'macarrão de arroz', 'soba': 'soba', 'ramen': 'lámen',
  'lasagna': 'lasanha', 'ravioli': 'ravióli', 'tortellini': 'tortellini', 'gnocchi': 'nhoque',
  'stuffed': 'recheado', 'with cheese': 'com queijo', 'with meat': 'com carne',
  'with meat sauce': 'com molho de carne', 'with tomato sauce': 'com molho de tomate',
  'with vegetables': 'com legumes', 'and vegetables': 'e legumes',
  'vegetable': 'de legumes', 'chicken broth': 'caldo de galinha', 'beef broth': 'caldo de carne',
  'vegetable broth': 'caldo de legumes', 'bouillon': 'caldo (cubo)', 'broth': 'caldo',
  'cream of chicken': 'creme de galinha', 'cream of mushroom': 'creme de cogumelos',
  'cream of celery': 'creme de salsão', 'tomato': 'tomate', 'minestrone': 'minestrone',
  'chicken noodle': 'galinha com macarrão', 'chicken rice': 'canja (galinha com arroz)',
  'lentil': 'lentilha', 'split pea': 'ervilha partida', 'black bean': 'feijão preto',
  'clam chowder': 'creme de mariscos', 'onion soup': 'sopa de cebola',
  'prepared with equal volume milk': 'preparado com leite',
  'canned soup': 'sopa enlatada', 'dehydrated': 'desidratado',
  'kidney': 'rajado (kidney)', 'pinto': 'carioca (pinto)', 'navy': 'branco (navy)',
  'great northern': 'branco graúdo', 'lima': 'fava (lima)', 'mung': 'moyashi (mungo)',
  'adzuki': 'azuki', 'fava': 'fava', 'french style': 'à francesa',
  'snap': 'vagem', 'green snap': 'vagem verde', 'sprouted': 'germinado',
  'boiled without salt': 'cozido sem sal', 'boiled with salt': 'cozido com sal',
  'cooked without salt': 'cozido sem sal', 'cooked with salt': 'cozido com sal',
  'baked in skin': 'assada com casca', 'without skin boiled': 'cozida sem casca',
  'flesh and skin': 'polpa e casca', 'flesh only': 'somente polpa', 'skin only': 'somente casca',
  'hash brown': 'batata ralada frita (hash brown)', 'french fried': 'frita (palito)',
  'mashed': 'purê', 'au gratin': 'gratinado', 'scalloped': 'ao forno com molho',
  'home-prepared': 'caseiro', 'restaurant-prepared': 'de restaurante',
  'fast food': 'fast food', 'from frozen': 'de congelado', 'oven-heated': 'aquecido no forno',
  'chips': 'em chips', 'potato chips': 'batata chips', 'tortilla chips': 'tortilha chips',
  'popcorn': 'pipoca', 'air-popped': 'estourada sem óleo', 'oil-popped': 'estourada com óleo',
  'microwave': 'de micro-ondas', 'caramel-coated': 'caramelizada', 'cheese-flavor': 'sabor queijo',
  'pretzels': 'pretzel', 'rice cakes': 'bolacha de arroz', 'granola bars': 'barra de cereais',
  'energy bar': 'barra energética', 'protein bar': 'barra de proteína',
  'hard': 'duro', 'soft type': 'macio', 'chewy': 'mastigável', 'gummy': 'de goma',
  'milk chocolate': 'chocolate ao leite', 'dark chocolate': 'chocolate amargo',
  'semisweet': 'meio amargo', 'white chocolate': 'chocolate branco',
  'with almonds': 'com amêndoas', 'with peanuts': 'com amendoim', 'with rice cereal': 'com flocos de arroz',
  'chocolate chip': 'gotas de chocolate', 'chocolate sandwich': 'recheado de chocolate',
  'vanilla sandwich': 'recheado de baunilha', 'peanut butter sandwich': 'recheado de pasta de amendoim',
  'sugar wafers': 'wafer', 'wafers': 'wafer', 'shortbread': 'amanteigado',
  'gingersnaps': 'biscoito de gengibre', 'graham': 'maisena (graham)', 'fig bars': 'biscoito de figo',
  'animal crackers': 'biscoito de leite (animais)', 'saltines': 'cream cracker',
  'cheese crackers': 'biscoito de queijo', 'whole-wheat crackers': 'biscoito integral',
  'melba toast': 'torrada melba', 'matzo': 'matzá', 'breadsticks': 'palitos de pão (grissini)',
  'croutons': 'croutons', 'seasoned': 'temperado', 'unseasoned': 'sem tempero',
  'stuffing': 'farofa úmida (stuffing)', 'cornbread': 'broa de milho', 'biscuits': 'biscoito amanteigado (scone)',
  'pita': 'pão sírio', 'tortillas': 'tortilha', 'flour tortilla': 'tortilha de trigo',
  'corn tortilla': 'tortilha de milho', 'taco shells': 'casquinha de taco',
  'naan': 'pão naan', 'focaccia': 'focaccia', 'sourdough': 'fermentação natural',
  'baguette': 'baguete', 'ciabatta': 'ciabatta', 'kaiser': 'pão kaiser',
  'hamburger or hotdog': 'de hambúrguer ou hot dog', 'hot dog': 'hot dog',
  'dinner rolls': 'pãozinho de jantar', 'sweet rolls': 'pão doce', 'cinnamon buns': 'pão de canela',
  'english muffin': 'muffin inglês', 'toasted bread': 'pão torrado', 'toast': 'torrada',
  'angelfood': 'pão de ló (angel food)', 'pound cake': 'bolo inglês', 'sponge': 'pão de ló',
  'cheesecake': 'cheesecake', 'carrot cake': 'bolo de cenoura', 'chocolate cake': 'bolo de chocolate',
  'yellow cake': 'bolo amarelo', 'white cake': 'bolo branco', 'coffeecake': 'bolo de café',
  'cupcakes': 'cupcake', 'brownies': 'brownie', 'with icing': 'com cobertura',
  'without icing': 'sem cobertura', 'with frosting': 'com cobertura', 'without frosting': 'sem cobertura',
  'apple pie': 'torta de maçã', 'pumpkin pie': 'torta de abóbora', 'pecan pie': 'torta de noz-pecã',
  'lemon meringue': 'torta de limão com merengue', 'banana cream': 'creme de banana',
  'egg white': 'clara de ovo', 'egg yolk': 'gema de ovo', 'whole egg': 'ovo inteiro',
  'scrambled': 'mexido', 'poached': 'pochê', 'hard-boiled': 'cozido duro',
  'omelet': 'omelete', 'quiche': 'quiche',
  'vitamin c': 'vitamina C', 'calcium': 'cálcio', 'vitamin d': 'vitamina D',
  'unfortified': 'não fortificado', 'fortified': 'fortificado',
  'with ara and dha': 'com ARA e DHA', 'with dha': 'com DHA',
  'liquid concentrate': 'concentrado líquido', 'not reconstituted': 'não reconstituído',
  'reconstituted': 'reconstituído', 'as prepared': 'preparado',
  'higher fat': 'mais gordura', 'lower fat': 'menos gordura', 'extra lean': 'extra magro',
  'lean': 'magro', 'lean and fat': 'magro com gordura', '90% lean meat / 10% fat': '90% carne magra / 10% gordura',
  '80% lean meat / 20% fat': '80% carne magra / 20% gordura', '85% lean meat / 15% fat': '85% carne magra / 15% gordura',
  '95% lean meat / 5% fat': '95% carne magra / 5% gordura', '70% lean meat / 30% fat': '70% carne magra / 30% gordura',
  '75% lean meat / 25% fat': '75% carne magra / 25% gordura', '93% lean meat / 7% fat': '93% carne magra / 7% gordura',
  '97% lean meat / 3% fat': '97% carne magra / 3% gordura',
  'australian': 'australiano', 'wagyu': 'wagyu', 'kobe': 'kobe', 'angus': 'angus',
  'grass-fed': 'de pasto', 'grain-fed': 'de confinamento', 'free range': 'caipira',
  'a la carte': 'à la carte', 'family style': 'porção família', 'kids meal': 'refeição infantil',
  'value meal': 'combo', 'with mayonnaise': 'com maionese', 'with ketchup': 'com ketchup',
  'with lettuce and tomato': 'com alface e tomate', 'with cheese and bacon': 'com queijo e bacon',
  'with bacon': 'com bacon', 'double': 'duplo', 'triple': 'triplo', 'large': 'grande',
  'small': 'pequeno', 'single': 'simples', 'plain bun': 'pão simples',
  'condiments': 'condimentos', 'with condiments': 'com condimentos', 'without condiments': 'sem condimentos',
  'gluten free': 'sem glúten', 'lactose free': 'sem lactose', 'lactose reduced': 'baixa lactose',
  'reduced sugar': 'menos açúcar', 'no salt added': 'sem adição de sal',
  'lightly salted': 'levemente salgado', 'honey roasted': 'torrado com mel',
  'roasted in oil': 'torrado em óleo', 'raw kernels': 'grãos crus', 'kernels': 'grãos',
  'halves': 'metades', 'pieces': 'pedaços', 'slivered': 'laminado', 'blanched almonds': 'amêndoas sem pele',
  'in shell': 'com casca', 'shelled': 'sem casca', 'roasted and salted': 'torrado e salgado',
  'all varieties': 'todas as variedades', 'assorted flavors': 'sabores sortidos',
  'average of all types': 'média de todos os tipos', 'all types': 'todos os tipos',
  'store bought': 'industrializado', 'homemade': 'caseiro', 'takeout': 'para viagem',
  'refrigerated': 'refrigerado', 'shelf-stable': 'longa vida', 'aseptic': 'embalagem asséptica',
  'concentrate': 'concentrado', 'syrup': 'xarope', 'squeezed': 'espremido',
  'freshly squeezed': 'espremido na hora', 'not from concentrate': 'não de concentrado',
  'with peel': 'com casca', 'without peel': 'sem casca', 'edible portion': 'parte comestível',
};

// Fallback palavra a palavra
const WORDS = {
  'and': 'e', 'or': 'ou', 'with': 'com', 'without': 'sem', 'in': 'em', 'of': 'de',
  'fat': 'gordura', 'cooked': 'cozido', 'lean': 'magro', 'raw': 'cru', 'beef': 'carne bovina',
  'trimmed': 'aparado', 'only': 'somente', 'salt': 'sal', 'meat': 'carne', 'canned': 'enlatado',
  'frozen': 'congelado', 'boneless': 'sem osso', 'chicken': 'frango', 'ready': 'pronto',
  'roasted': 'assado', 'pork': 'suíno', 'steak': 'bife', 'dry': 'seco', 'loin': 'lombo',
  'prepared': 'preparado', 'added': 'adicionado', 'all': 'todos', 'drained': 'escorrido',
  'whole': 'inteiro', 'soup': 'sopa', 'cheese': 'queijo', 'fresh': 'fresco', 'lamb': 'cordeiro',
  'chocolate': 'chocolate', 'roast': 'assado', 'white': 'branco', 'skin': 'pele',
  'fish': 'peixe', 'seeds': 'sementes', 'braised': 'refogado', 'milk': 'leite',
  'water': 'água', 'cookies': 'biscoitos', 'beans': 'feijão', 'broiled': 'grelhado',
  'juice': 'suco', 'shoulder': 'paleta', 'low': 'baixo', 'fried': 'frito', 'bone': 'osso',
  'rib': 'costela', 'turkey': 'peru', 'oil': 'óleo', 'fruit': 'fruta', 'grilled': 'grelhado',
  'cream': 'creme', 'rice': 'arroz', 'fast': 'fast', 'regular': 'comum', 'sauce': 'molho',
  'free': 'livre', 'wheat': 'trigo', 'ham': 'presunto', 'red': 'vermelho', 'snacks': 'snacks',
  'candies': 'doces', 'corn': 'milho', 'crackers': 'biscoitos', 'reduced': 'reduzido',
  'bread': 'pão', 'nuts': 'castanhas', 'powder': 'pó', 'light': 'light', 'sugar': 'açúcar',
  'dried': 'seco', 'foods': 'alimentos', 'pizza': 'pizza', 'sweet': 'doce',
  'butter': 'manteiga', 'formula': 'fórmula', 'condensed': 'condensado', 'infant': 'infantil',
  'plain': 'simples', 'products': 'derivados', 'cured': 'curado', 'leg': 'perna',
  'sirloin': 'alcatra', 'vegetable': 'vegetal', 'vitamin': 'vitamina', 'veal': 'vitela',
  'ribs': 'costelas', 'ground': 'moído', 'variety': 'variedade', 'sandwich': 'sanduíche',
  'vanilla': 'baunilha', 'mixed': 'misto', 'flour': 'farinha', 'potatoes': 'batatas',
  'sodium': 'sódio', 'bar': 'barra', 'type': 'tipo', 'style': 'estilo', 'sausage': 'linguiça',
  'dressing': 'molho', 'tomato': 'tomate', 'egg': 'ovo', 'recipe': 'receita',
  'original': 'original', 'domestic': 'nacional', 'instant': 'instantâneo',
  'enriched': 'enriquecido', 'baked': 'assado', 'beverage': 'bebida', 'includes': 'inclui',
  'pan': 'frigideira', 'salad': 'salada', 'flavor': 'sabor', 'green': 'verde',
  'syrup': 'xarope', 'strained': 'peneirado', 'cereal': 'cereal', 'chops': 'costeletas',
  'calorie': 'caloria', 'vegetables': 'legumes', 'no': 'sem', 'oatmeal': 'aveia',
  'tenderloin': 'filé-mignon', 'fudge': 'fudge', 'peanut': 'amendoim', 'ice': 'gelo',
  'made': 'feito', 'yellow': 'amarelo', 'apple': 'maçã', 'alcoholic': 'alcoólica',
  'pasta': 'massa', 'potato': 'batata', 'french': 'francês', 'soy': 'soja',
  'cinnamon': 'canela', 'breast': 'peito', 'brown': 'marrom', 'chips': 'chips',
  'yogurt': 'iogurte', 'not': 'não', 'dark': 'escuro', 'shank': 'pernil', 'half': 'metade',
  'margarine': 'margarina', 'unsweetened': 'sem açúcar', 'sweetened': 'adoçado',
  'grain': 'grão', 'stew': 'ensopado', 'seasoned': 'temperado', 'boiled': 'cozido',
  'heat': 'calor', 'moist': 'úmido', 'salted': 'salgado', 'smoked': 'defumado',
  'slices': 'fatias', 'slice': 'fatia', 'topping': 'cobertura', 'topped': 'coberto',
  'filled': 'recheado', 'filling': 'recheio', 'coated': 'coberto', 'covered': 'coberto',
  'dip': 'pasta (dip)', 'mix': 'mistura', 'blend': 'blend', 'drink': 'bebida',
  'punch': 'ponche', 'ade': 'refresco', 'cocktail': 'coquetel', 'smoothie': 'smoothie',
  'shake': 'shake', 'frozen dessert': 'sobremesa gelada', 'dessert': 'sobremesa',
  'dumpling': 'bolinho', 'fritter': 'bolinho frito', 'roll': 'rolinho', 'wrap': 'wrap',
  'burrito': 'burrito', 'taco': 'taco', 'enchilada': 'enchilada', 'quesadilla': 'quesadilla',
  'nachos': 'nachos', 'fajita': 'fajita', 'tamale': 'tamale', 'empanada': 'empanada',
  'lasagna': 'lasanha', 'casserole': 'gratinado', 'pot': 'panela', 'pie': 'torta',
  'turnover': 'pastel assado', 'strudel': 'strudel', 'eclair': 'bomba (éclair)',
  'custard': 'creme', 'mousse': 'musse', 'pudding': 'pudim', 'gelatin': 'gelatina',
  'sorbet': 'sorbet', 'cone': 'casquinha', 'sundae': 'sundae', 'bars': 'barras',
  'squares': 'quadradinhos', 'balls': 'bolinhas', 'sticks': 'palitos', 'rings': 'anéis',
  'nuggets': 'nuggets', 'tenders': 'tirinhas', 'fillet': 'filé', 'fillets': 'filés',
  'cutlet': 'filé à milanesa', 'breaded': 'empanado', 'battered': 'empanado',
  'floured': 'enfarinhado', 'marinated': 'marinado', 'glazed': 'glaceado',
  'candied': 'cristalizado', 'spiced': 'condimentado', 'herb': 'ervas', 'herbs': 'ervas',
  'garden': 'da horta', 'country': 'caipira', 'old': 'antigo', 'fashioned': 'tradicional',
  'classic': 'clássico', 'premium': 'premium', 'select': 'seleto', 'choice': 'choice',
  'grade': 'classificação', 'grades': 'classificações', 'commercial': 'industrial',
  'commodity': 'commodity', 'institutional': 'institucional', 'school': 'escolar',
  'lunch': 'almoço', 'breakfast': 'café da manhã', 'supper': 'jantar', 'meal': 'refeição',
  'snack': 'lanche', 'appetizer': 'entrada', 'side': 'acompanhamento', 'dish': 'prato',
  'platter': 'travessa', 'combo': 'combo', 'supreme': 'supremo', 'deluxe': 'deluxe',
  'loaded': 'completo', 'grands': 'grande', 'big': 'grande', 'little': 'pequeno',
  'mini': 'mini', 'jumbo': 'jumbo', 'king': 'king', 'size': 'tamanho',
  'from': 'de', 'to': 'para', 'the': '', 'a': '', 'an': '', 'as': 'como',
  'eat': 'consumo', 'serve': 'servir', 'bake': 'assar', 'heat and serve': 'aquecer e servir',
  'unprepared': 'não preparado', 'uncooked': 'não cozido', 'undrained': 'não escorrido',
  'solids': 'sólidos', 'liquids': 'líquidos', 'liquid': 'líquido', 'drippings': 'caldo da carne',
  'juices': 'sucos', 'pulp': 'polpa', 'peel': 'casca', 'rind': 'casca', 'core': 'centro',
  'seed': 'semente', 'pit': 'caroço', 'stem': 'talo', 'stems': 'talos', 'leaves': 'folhas',
  'leaf': 'folha', 'head': 'cabeça', 'root': 'raiz', 'roots': 'raízes', 'bulb': 'bulbo',
  'tops': 'ramas', 'young': 'jovem', 'mature': 'maduro', 'ripe': 'maduro', 'unripe': 'verde',
  'baby': 'baby', 'petite': 'petit', 'spears': 'talos', 'florets': 'floretes',
  'caps': 'chapéus', 'pods': 'vagens', 'shell': 'casca', 'wedge': 'gomo', 'segment': 'gomo',
  'sections': 'gomos', 'chunks': 'pedaços', 'cubes': 'cubos', 'strips': 'tiras',
  'spread': 'pasta', 'paste': 'pasta', 'puree': 'purê', 'crushed': 'triturado',
  'minced': 'picadinho', 'flaked': 'em flocos', 'granulated': 'granulado', 'powdered': 'em pó',
  'liquid egg': 'ovo líquido', 'substitute': 'substituto', 'imitation': 'imitação',
  'artificial': 'artificial', 'natural': 'natural', 'pure': 'puro', 'extract': 'extrato',
  'concentrate': 'concentrado', 'isolate': 'isolado', 'protein': 'proteína',
  'fiber': 'fibra', 'bran': 'farelo', 'germ': 'gérmen', 'starch': 'amido',
  'gluten': 'glúten', 'malt': 'malte', 'malted': 'maltado', 'yeast': 'levedura',
  'sour': 'azedo', 'bitter': 'amargo', 'salty': 'salgado', 'savory': 'salgado',
  'spicy': 'picante', 'zesty': 'picante', 'tangy': 'ácido', 'smoky': 'defumado',
  'buttery': 'amanteigado', 'cheesy': 'com queijo', 'nutty': 'com castanhas',
  'fruity': 'frutado', 'honey': 'mel', 'maple': 'bordo (maple)', 'molasses': 'melado',
  'caramel': 'caramelo', 'toffee': 'toffee', 'butterscotch': 'caramelo de manteiga',
  'marshmallow': 'marshmallow', 'nougat': 'torrone', 'coconut': 'coco', 'almond': 'amêndoa',
  'pecan': 'noz-pecã', 'walnut': 'nozes', 'cashew': 'caju', 'pistachio': 'pistache',
  'macadamia': 'macadâmia', 'hazelnut': 'avelã', 'raisin': 'uva-passa', 'raisins': 'uvas-passas',
  'date': 'tâmara', 'fig': 'figo', 'prune': 'ameixa seca', 'cranberry': 'cranberry',
  'blueberry': 'mirtilo', 'strawberry': 'morango', 'raspberry': 'framboesa',
  'blackberry': 'amora', 'cherry': 'cereja', 'peach': 'pêssego', 'pear': 'pera',
  'plum': 'ameixa', 'apricot': 'damasco', 'mango': 'manga', 'papaya': 'mamão',
  'banana': 'banana', 'pineapple': 'abacaxi', 'orange': 'laranja', 'lemon': 'limão-siciliano',
  'lime': 'limão', 'grapefruit': 'toranja', 'tangerine': 'tangerina', 'melon': 'melão',
  'watermelon': 'melancia', 'grape': 'uva', 'kiwi': 'kiwi', 'guava': 'goiaba',
  'avocado': 'abacate', 'olive': 'oliva', 'onion': 'cebola', 'garlic': 'alho',
  'pepper': 'pimenta', 'peppers': 'pimentões', 'chili': 'pimenta chili', 'jalapeno': 'jalapeño',
  'mushroom': 'cogumelo', 'mushrooms': 'cogumelos', 'spinach': 'espinafre',
  'broccoli': 'brócolis', 'carrot': 'cenoura', 'carrots': 'cenouras', 'celery': 'salsão',
  'cabbage': 'repolho', 'lettuce': 'alface', 'cucumber': 'pepino', 'zucchini': 'abobrinha',
  'squash': 'abóbora', 'pumpkin': 'abóbora', 'eggplant': 'berinjela', 'cauliflower': 'couve-flor',
  'asparagus': 'aspargos', 'artichoke': 'alcachofra', 'beet': 'beterraba', 'beets': 'beterrabas',
  'radish': 'rabanete', 'turnip': 'nabo', 'leek': 'alho-poró', 'scallion': 'cebolinha',
  'shallot': 'échalote', 'parsley': 'salsinha', 'cilantro': 'coentro', 'basil': 'manjericão',
  'oregano': 'orégano', 'thyme': 'tomilho', 'rosemary': 'alecrim', 'sage': 'sálvia',
  'dill': 'endro (dill)', 'mint': 'menta', 'ginger': 'gengibre', 'turmeric': 'cúrcuma',
  'cumin': 'cominho', 'paprika': 'páprica', 'curry': 'curry', 'mustard': 'mostarda',
  'nutmeg': 'noz-moscada', 'clove': 'cravo', 'cloves': 'cravos', 'anise': 'anis',
  'fennel': 'erva-doce', 'saffron': 'açafrão', 'bay': 'louro', 'vanilla bean': 'fava de baunilha',
  'peas': 'ervilhas', 'pea': 'ervilha', 'lentils': 'lentilhas', 'chickpeas': 'grão-de-bico',
  'soybeans': 'soja', 'tofu': 'tofu', 'salmon': 'salmão', 'tuna': 'atum',
  'sardines': 'sardinhas', 'anchovies': 'anchovas', 'cod': 'bacalhau', 'trout': 'truta',
  'tilapia': 'tilápia', 'shrimp': 'camarão', 'crab': 'caranguejo', 'lobster': 'lagosta',
  'oysters': 'ostras', 'clams': 'mariscos', 'mussels': 'mexilhões', 'scallops': 'vieiras',
  'squid': 'lula', 'octopus': 'polvo', 'duck': 'pato', 'goose': 'ganso', 'quail': 'codorna',
  'rabbit': 'coelho', 'venison': 'carne de veado', 'bison': 'bisão', 'goat': 'cabrito',
  'liver': 'fígado', 'heart': 'coração', 'kidney beans': 'feijão rajado', 'tongue': 'língua',
  'bacon': 'bacon', 'salami': 'salame', 'pepperoni': 'peperoni', 'bologna': 'mortadela',
  'frankfurter': 'salsicha', 'hot dog': 'hot dog', 'chorizo': 'chouriço', 'kielbasa': 'linguiça polonesa',
  'bratwurst': 'salsicha alemã', 'pastrami': 'pastrami', 'prosciutto': 'presunto parma',
  'wing': 'asa', 'wings': 'asas', 'thighs': 'sobrecoxas', 'drumsticks': 'coxas',
  'back': 'dorso', 'neck': 'pescoço', 'giblets': 'miúdos', 'gizzard': 'moela',
  'restaurant': 'restaurante', 'chinese': 'chinês', 'mexican': 'mexicano', 'italian': 'italiano',
  'japanese': 'japonês', 'thai': 'tailandês', 'indian': 'indiano', 'greek': 'grego',
  'mediterranean': 'mediterrâneo', 'latino': 'latino', 'american': 'americano',
  'european': 'europeu', 'asian': 'asiático', 'hawaiian': 'havaiano', 'cajun': 'cajun',
  'buffalo': 'à moda buffalo', 'bbq': 'barbecue', 'barbecued': 'na churrasqueira',
  'rotisserie': 'assado giratório', 'wood': 'lenha', 'fire': 'fogo', 'char': 'chamuscado',
  'flame': 'chama', 'griddle': 'chapa', 'skillet': 'frigideira', 'wok': 'wok',
  'steamed': 'no vapor', 'poached': 'pochê', 'simmered': 'fervido lentamente',
  'stir-fried': 'salteado', 'sauteed': 'salteado', 'deep': 'imersão', 'batter': 'massa de empanar',
  'dough': 'massa', 'pastry': 'massa folhada', 'crust': 'massa', 'pretzel': 'pretzel',
  'bagel': 'bagel', 'croissant': 'croissant', 'donut': 'rosquinha', 'doughnut': 'rosquinha',
  'muffin': 'muffin', 'scone': 'scone', 'waffle': 'waffle', 'pancake': 'panqueca',
  'crepe': 'crepe', 'biscuit': 'biscoito', 'brownie': 'brownie', 'cake': 'bolo',
  'cupcake': 'cupcake', 'frosting': 'cobertura', 'icing': 'glacê', 'glaze': 'calda',
  'jam': 'geleia', 'jelly': 'geleia', 'preserves': 'compota', 'marmalade': 'marmelada',
  'wafer': 'wafer', 'cracker': 'biscoito', 'pretzels': 'pretzels', 'trail': 'trilha',
  'granola': 'granola', 'muesli': 'muesli', 'flakes': 'flocos', 'crisp': 'crocante',
  'crispy': 'crocante', 'crunch': 'crocante', 'puffs': 'inflados', 'pops': 'estourados',
  'loops': 'argolas', 'shredded': 'desfiado', 'frosted': 'com cobertura açucarada',
  'toasted': 'torrado', 'roasted seaweed': 'alga torrada', 'nori': 'nori', 'kelp': 'kombu',
  'wakame': 'wakame', 'agar': 'ágar', 'spirulina': 'espirulina',
  'organic': 'orgânico', 'conventional': 'convencional', 'wild': 'selvagem',
  'farm': 'fazenda', 'farmed': 'de cativeiro', 'raised': 'criado', 'fed': 'alimentado',
  'pastured': 'de pasto', 'cage': 'gaiola', 'range': 'solto', 'caught': 'pescado',
  'atlantic': 'do Atlântico', 'pacific': 'do Pacífico', 'alaska': 'do Alasca',
  'alaskan': 'do Alasca', 'norwegian': 'norueguês', 'chilean': 'chileno',
  'spanish': 'espanhol', 'portuguese': 'português', 'brazilian': 'brasileiro',
  'florida': 'da Flórida', 'california': 'da Califórnia', 'valencia': 'valência',
  'navel': 'baía (navel)', 'clementine': 'clementina', 'mandarin': 'mexerica',
  'bartlett': 'williams', 'bosc': 'bosc', 'anjou': 'anjou', 'gala': 'gala',
  'fuji': 'fuji', 'granny smith': 'verde (granny smith)', 'red delicious': 'red delicious',
  'golden delicious': 'golden', 'honeydew': 'melão honeydew', 'cantaloupe': 'melão cantalupo',
  'casaba': 'melão casaba', 'crenshaw': 'melão crenshaw', 'muskmelon': 'melão',
  'summer': 'de verão', 'winter': 'de inverno', 'spring': 'de primavera', 'fall': 'de outono',
  'butternut': 'cabotiá (butternut)', 'acorn': 'abóbora acorn', 'spaghetti squash': 'abóbora espaguete',
  'hubbard': 'abóbora hubbard', 'delicata': 'abóbora delicata', 'kabocha': 'cabotiá',
  'sun-dried': 'seco ao sol', 'freeze-dried': 'liofilizado', 'oil-roasted': 'torrado em óleo',
  'dry-roasted': 'torrado sem óleo', 'dried-frozen': 'seco e congelado', 'crude': 'bruto',
  'stewing': 'para ensopado', 'cholesterol': 'colesterol', 'milkfat': 'de gordura',
  'carbonated': 'gaseificada', 'high': 'alto teor de', 'fructose': 'frutose', 'thick': 'espesso',
  'energy': 'energética', 'gourd': 'cabaça', 'shallots': 'échalotes', 'muffins': 'muffins',
  'english': 'inglês', 'hotcakes': 'panquecas', 'cube': 'cubo', 'cut': 'corte', 'cuts': 'cortes',
  'quarter': 'quarto', 'creamy': 'cremoso', 'stir': 'salteado', 'skewer': 'espetinho',
  'skewered': 'no espetinho', 'pan-fried': 'frito na frigideira', 'deep-fried': 'frito por imersão',
  'ready-to-eat': 'pronto para consumo', 'ready-to-drink': 'pronto para beber',
  'ready-to-bake': 'pronto para assar', 'ready-to-heat': 'pronto para aquecer',
  'ready-to-serve': 'pronto para servir', 'semi-sweet': 'meio amargo', 'bite-size': 'tamanho bocado',
  'sugar-coated': 'coberto de açúcar', 'chocolate-coated': 'coberto de chocolate',
  'chocolate-flavor': 'sabor chocolate', 'yogurt-covered': 'coberto de iogurte',
  'reduced-fat': 'teor reduzido de gordura', 'reduced-sodium': 'sódio reduzido',
  'low-fat': 'semidesnatado', 'non-fat': 'desnatado', 'full-fat': 'integral',
  'whole-grain': 'grãos integrais', 'multi-grain': 'multigrãos', 'stone-ground': 'moído em pedra',
  'vacuum-packed': 'embalado a vácuo', 'water-packed': 'em água', 'oil-packed': 'em óleo',
  'home-prepared': 'caseiro', 'pre-cooked': 'pré-cozido', 'pre-sliced': 'pré-fatiado',
  'par-fried': 'pré-frito', 'oven-baked': 'assado no forno', 'oven-roasted': 'assado no forno',
  'char-grilled': 'grelhado no carvão', 'flame-broiled': 'grelhado na chama',
  'butter-flavored': 'sabor manteiga', 'honey-roasted': 'torrado com mel',
};

// Rótulos de medidas caseiras do SR28
const MEASURES = {
  'cup': 'xícara', 'cups': 'xícaras', 'tbsp': 'colher de sopa', 'tablespoon': 'colher de sopa',
  'tsp': 'colher de chá', 'teaspoon': 'colher de chá', 'slice': 'fatia', 'slices': 'fatias',
  'piece': 'pedaço', 'pieces': 'pedaços', 'unit': 'unidade', 'each': 'unidade',
  'whole': 'unidade inteira', 'fruit': 'unidade', 'medium': 'unidade média',
  'large': 'unidade grande', 'small': 'unidade pequena', 'extra large': 'unidade extra grande',
  'jumbo': 'unidade jumbo', 'serving': 'porção', 'container': 'embalagem', 'package': 'pacote',
  'packet': 'sachê', 'can': 'lata', 'bottle': 'garrafa', 'box': 'caixa', 'bag': 'saco',
  'stick': 'tablete', 'pat': 'porção individual', 'bar': 'barra', 'link': 'gomo',
  'links': 'gomos', 'patty': 'disco (hambúrguer)', 'patties': 'discos', 'strip': 'tira',
  'strips': 'tiras', 'wedge': 'gomo', 'ring': 'anel', 'stalk': 'talo', 'spear': 'talo',
  'leaf': 'folha', 'leaves': 'folhas', 'head': 'cabeça', 'clove': 'dente', 'bulb': 'bulbo',
  'ear': 'espiga', 'pod': 'vagem', 'sprig': 'ramo', 'biscuit': 'unidade', 'cookie': 'unidade',
  'cracker': 'unidade', 'chip': 'unidade', 'wafer': 'unidade', 'donut': 'unidade',
  'muffin': 'unidade', 'roll': 'unidade', 'bun': 'unidade', 'bagel': 'unidade',
  'tortilla': 'unidade', 'pita': 'unidade', 'pancake': 'unidade', 'waffle': 'unidade',
  'egg': 'ovo', 'drumstick': 'coxa', 'thigh': 'sobrecoxa', 'wing': 'asa', 'breast': 'peito',
  'fillet': 'filé', 'filet': 'filé', 'steak': 'bife', 'chop': 'costeleta', 'cutlet': 'filé',
  'shrimp': 'camarão', 'oyster': 'ostra', 'clam': 'marisco', 'mussel': 'mexilhão',
  'scallop': 'vieira', 'olive': 'azeitona', 'date': 'tâmara', 'prune': 'ameixa',
  'fig': 'figo', 'cherry': 'cereja', 'grape': 'uva', 'berry': 'unidade',
  'nut': 'unidade', 'kernel': 'grão', 'pretzel': 'unidade', 'candy': 'unidade',
  'scoop': 'concha (scoop)', 'ladle': 'concha', 'bowl': 'tigela', 'plate': 'prato',
  'glass': 'copo', 'drink': 'dose', 'shot': 'dose', 'jigger': 'dose', 'pouch': 'sachê',
  'cube': 'cubo', 'inch': 'polegada', 'pie': 'torta', 'cake': 'bolo', 'pizza': 'pizza',
  'sandwich': 'sanduíche', 'taco': 'taco', 'burrito': 'burrito', 'item': 'item',
  'order': 'porção', 'meal': 'refeição', 'nlea serving': 'porção (rótulo)', 'portion': 'porção',
  'tablet': 'tablete', 'square': 'quadradinho', 'section': 'gomo', 'segment': 'gomo',
  'half': 'metade', 'quarter': 'quarto', 'stalk, small': 'talo pequeno',
};

// Medidas caseiras estimadas para alimentos PT (TACO/IBGE), casadas por padrão no nome.
// Fontes: medidas caseiras usuais de tabelas de equivalência brasileiras.
const PT_MEASURES = [
  [/^ovo de galinha|^ovo,|^ovo /i, [['unidade', 50]]],
  [/^ovo de codorna/i, [['unidade', 10]]],
  [/^banana/i, [['unidade', 86]]],
  [/^ma[çc][ãa]/i, [['unidade', 130]]],
  [/^laranja/i, [['unidade', 180]]],
  [/^tangerina|^mexerica/i, [['unidade', 135]]],
  [/^limão/i, [['unidade', 60]]],
  [/^mam[ãa]o.*papaia|^mam[ãa]o papaia/i, [['metade', 155]]],
  [/^manga/i, [['unidade', 300]]],
  [/^p[êe]ra|^pera/i, [['unidade', 160]]],
  [/^abacaxi/i, [['fatia', 75]]],
  [/^melancia/i, [['fatia', 200]]],
  [/^mel[ãa]o/i, [['fatia', 90]]],
  [/^uva[, ]/i, [['cacho pequeno', 170], ['unidade', 8]]],
  [/^morango/i, [['unidade', 12]]],
  [/^goiaba/i, [['unidade', 170]]],
  [/^caqui/i, [['unidade', 110]]],
  [/^kiwi/i, [['unidade', 76]]],
  [/^abacate/i, [['metade', 215]]],
  [/^p[ãa]o.*franc[êe]s/i, [['unidade', 50]]],
  [/^p[ãa]o.*forma/i, [['fatia', 25]]],
  [/^p[ãa]o.*integral/i, [['fatia', 25]]],
  [/^p[ãa]o de queijo/i, [['unidade média', 20]]],
  [/^p[ãa]o.*hot ?dog|^p[ãa]o.*hamb[úu]rguer/i, [['unidade', 50]]],
  [/^arroz.*cozido|^arroz[, ]/i, [['colher de sopa', 25], ['escumadeira', 80]]],
  [/^feij[ãa]o/i, [['concha', 86], ['colher de sopa', 26]]],
  [/^lentilha|^gr[ãa]o.de.bico|^ervilha/i, [['colher de sopa', 24]]],
  [/^farinha|^farofa/i, [['colher de sopa', 15]]],
  [/^a[çc][úu]car/i, [['colher de sopa', 14], ['colher de chá', 5]]],
  [/^mel[, ]|^mel$/i, [['colher de sopa', 21]]],
  [/^azeite|^[óo]leo/i, [['colher de sopa', 8], ['colher de chá', 3]]],
  [/^manteiga|^margarina/i, [['colher de sopa', 14], ['colher de chá', 5]]],
  [/^requeij[ãa]o/i, [['colher de sopa', 30]]],
  [/^leite[, ](?!.*pó)/i, [['copo (200 ml)', 200], ['xícara', 240]]],
  [/^iogurte/i, [['pote (170 g)', 170], ['copo (200 ml)', 200]]],
  [/^queijo.*minas|^queijo.*frescal/i, [['fatia', 30]]],
  [/^queijo.*mu[çs]sarela|^queijo.*prato/i, [['fatia', 20]]],
  [/^presunto|^mortadela|^salame/i, [['fatia', 15]]],
  [/^macarr[ãa]o|^massa[, ]|^espaguete/i, [['pegador (cozido)', 110]]],
  [/^batata.*frita/i, [['porção pequena', 100]]],
  [/^batata/i, [['unidade média', 140]]],
  [/^mandioca|^aipim|^macaxeira/i, [['pedaço', 80]]],
  [/^cenoura/i, [['unidade', 80]]],
  [/^tomate/i, [['unidade', 90]]],
  [/^cebola/i, [['unidade', 100]]],
  [/^alface/i, [['folha', 10]]],
  [/^couve[, -]/i, [['colher de sopa (refogada)', 20]]],
  [/^biscoito|^bolacha/i, [['unidade', 7]]],
  [/^bolo/i, [['fatia', 60]]],
  [/^pizza/i, [['fatia', 115]]],
  [/^tapioca/i, [['unidade média', 90]]],
  [/^cuscuz/i, [['fatia', 135]]],
  [/^salsicha/i, [['unidade', 50]]],
  [/^lingui[çc]a/i, [['gomo', 60]]],
  [/^hamb[úu]rguer/i, [['unidade', 90]]],
  [/^coxinha|^pastel|^esfirra|^empada/i, [['unidade', 80]]],
  [/^refrigerante/i, [['lata (350 ml)', 350], ['copo (250 ml)', 250]]],
  [/^suco/i, [['copo (250 ml)', 250]]],
  [/^cerveja/i, [['lata (350 ml)', 350], ['garrafa (600 ml)', 600]]],
  [/^vinho/i, [['taça (150 ml)', 150]]],
  [/^caf[ée][, ]/i, [['xícara pequena (50 ml)', 50], ['xícara (150 ml)', 150]]],
  [/^achocolatado/i, [['colher de sopa', 20]]],
  [/^chocolate/i, [['quadrado (25 g)', 25]]],
  [/^granola|^aveia/i, [['colher de sopa', 15]]],
  [/^castanha|^amendoim|^am[êe]ndoa|^nozes/i, [['punhado (30 g)', 30]]],
  [/^temaki/i, [['unidade (130 g)', 130]]],
  [/^sushi|^niguiri|^uramaki|^hossomaki|^hot ?roll/i, [['unidade (30 g)', 30]]],
  [/^sashimi/i, [['fatia (15 g)', 15]]],
  [/^esfiha|^esfirra/i, [['unidade (80 g)', 80], ['mini (35 g)', 35]]],
  [/^quibe(?!be)/i, [['unidade (100 g)', 100]]],
  [/^lasanha/i, [['pedaço (180 g)', 180]]],
  [/^estrogonofe|^strogonofe/i, [['concha (150 g)', 150]]],
  [/^feijoada/i, [['concha (140 g)', 140]]],
  [/^sopa|^caldo|^canja/i, [['concha (130 g)', 130], ['tigela (300 g)', 300]]],
  [/^panqueca/i, [['unidade (80 g)', 80]]],
  [/^torta/i, [['fatia (100 g)', 100]]],
  [/^vitamina|^smoothie/i, [['copo (300 ml)', 300]]],
  [/^p[ãa]o de queijo/i, [['unidade média (40 g)', 40], ['mini (20 g)', 20]]],
  [/^sandu[íi]che|^bauru|^misto/i, [['unidade (160 g)', 160]]],
  [/^omelete/i, [['unidade (140 g)', 140]]],
  // ---- unidades médias para cortes e itens que vêm "por peça" ----
  // (os padrões usam delimitadores explícitos: \b do JS falha após acento,
  //  e "asa" solto casaria com "massa")
  [/sassami|filezinho/i, [['unidade (50 g)', 50]]],
  [/fil[ée] de frango|frango.*fil[ée]/i, [['filé (100 g)', 100]]],
  [/coxinha da asa/i, [['unidade (35 g)', 35]]],
  [/sobrecoxa/i, [['unidade (100 g)', 100]]],
  [/(^|[ ,(])coxa/i, [['unidade (65 g)', 65]]],
  [/(^|[ ,(])asa(s)?([ ,)]|$)/i, [['unidade (30 g)', 30]]],
  [/fil[ée] mignon/i, [['medalhão (100 g)', 100]]],
  [/(^|[ ,(])bife|[àa] milanesa/i, [['bife médio (100 g)', 100]]],
  [/alm[ôo]ndega/i, [['unidade (30 g)', 30]]],
  [/nugget/i, [['unidade (20 g)', 20]]],
  [/(til[áa]pia|merluza|pescada|linguado|salm[ãa]o|peixe|bacalhau).*fil[ée]|fil[ée].*(til[áa]pia|merluza|pescada)/i, [['filé (120 g)', 120]]],
  [/^camar[ãa]o/i, [['unidade (10 g)', 10], ['porção (100 g)', 100]]],
  [/^kani/i, [['unidade (20 g)', 20]]],
  [/^p[êe]ssego/i, [['unidade (120 g)', 120]]],
  [/^ameixa.*(seca|passa)/i, [['unidade (10 g)', 10]]],
  [/^ameixa/i, [['unidade (60 g)', 60]]],
  [/^damasco.*seco/i, [['unidade (8 g)', 8]]],
  [/^damasco/i, [['unidade (35 g)', 35]]],
  [/^figo/i, [['unidade (60 g)', 60]]],
  [/^caju[, ]/i, [['unidade (60 g)', 60]]],
  [/^carambola/i, [['unidade (90 g)', 90]]],
  [/^cereja/i, [['unidade (8 g)', 8]]],
  [/^lichia/i, [['unidade (20 g)', 20]]],
  [/^jabuticaba/i, [['unidade (8 g)', 8]]],
  [/^pitanga/i, [['unidade (7 g)', 7]]],
  [/^n[êe]spera/i, [['unidade (40 g)', 40]]],
  [/^pepino/i, [['unidade (200 g)', 200]]],
  [/^piment[ãa]o/i, [['unidade (120 g)', 120]]],
  [/^beterraba/i, [['unidade (160 g)', 160]]],
  [/^abobrinha/i, [['unidade (250 g)', 250]]],
  [/^berinjela/i, [['unidade (250 g)', 250]]],
  [/^chuchu/i, [['unidade (300 g)', 300]]],
  [/^quiabo/i, [['unidade (10 g)', 10]]],
  [/^rabanete/i, [['unidade (20 g)', 20]]],
  [/^alho([, ]|$)/i, [['dente (3 g)', 3]]],
  [/^milho, verde/i, [['espiga (grãos, 100 g)', 100], ['colher de sopa', 25]]],
  [/^azeitona/i, [['unidade (4 g)', 4]]],
  [/bisnaguinha|bisnaga/i, [['unidade (20 g)', 20]]],
  [/^torrada/i, [['unidade (8 g)', 8]]],
  [/^bombom/i, [['unidade (21 g)', 21]]],
  [/^bala([, ]|$)/i, [['unidade (5 g)', 5]]],
  [/^p[ãa]o de mel/i, [['unidade (60 g)', 60]]],
];

const BRAND_RE = /^[A-Z0-9][A-Z0-9&.'\- ]+$/; // segmentos todos em maiúsculas = marca

function translatePhrase(seg) {
  const t = seg.trim();
  if (!t) return '';
  if (BRAND_RE.test(t) && t.length > 2) return t; // marca: mantém
  const key = t.toLowerCase();
  if (PHRASES[key]) return PHRASES[key];
  // fallback palavra a palavra
  const out = key
    .split(/\s+/)
    .map((w) => {
      const clean = w.replace(/[()]/g, '');
      const tr = WORDS[clean];
      if (tr != null) return w.includes('(') || w.includes(')') ? w.replace(clean, tr) : tr;
      return w;
    })
    .filter(Boolean)
    .join(' ');
  return out;
}

function translateDesc(desc) {
  const parts = desc.split(',').map((p) => p.trim());
  const head = parts[0];
  let headPt = FIRST[head.toLowerCase()];
  if (!headPt) {
    if (BRAND_RE.test(head)) headPt = head;
    else {
      const w = translatePhrase(head);
      headPt = w.charAt(0).toUpperCase() + w.slice(1);
    }
  }
  const rest = parts.slice(1).map(translatePhrase).filter(Boolean);
  return [headPt, ...rest].join(', ');
}

function translateMeasure(desc) {
  let d = desc.trim();
  // remove parênteses explicativos longos: 'pat (1" sq, 1/3" high)' -> 'pat'
  d = d.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
  const key = d.toLowerCase().replace(/,.*$/, '').trim();
  if (MEASURES[key]) return MEASURES[key];
  const first = key.split(/\s+/)[0];
  if (MEASURES[first]) return MEASURES[first];
  return null; // medida não traduzível: descarta (oz, lb, etc.)
}

/* ------------------------------------------------------------------ */
/* Parsers                                                             */
/* ------------------------------------------------------------------ */

function parseSr28Line(line) {
  return line
    .replace(/\r?\n$/, '')
    .split('^')
    .map((f) => (f.startsWith('~') && f.endsWith('~') ? f.slice(1, -1) : f));
}

function loadSr28() {
  const desc = readFileSync(join(RAW_DIR, 'FOOD_DES.txt'), 'latin1').split('\n').filter(Boolean);
  const nut = readFileSync(join(RAW_DIR, 'NUT_DATA.txt'), 'latin1').split('\n').filter(Boolean);
  const weight = readFileSync(join(RAW_DIR, 'WEIGHT.txt'), 'latin1').split('\n').filter(Boolean);

  const foods = new Map();
  for (const line of desc) {
    const f = parseSr28Line(line);
    foods.set(f[0], { id: f[0], group: f[1], desc: f[2], nut: {}, medidas: [] });
  }
  const WANTED = new Set(['203', '204', '205', '208']);
  for (const line of nut) {
    const f = parseSr28Line(line);
    if (!WANTED.has(f[1])) continue;
    const food = foods.get(f[0]);
    if (food) food.nut[f[1]] = parseFloat(f[2]);
  }
  for (const line of weight) {
    const f = parseSr28Line(line);
    const food = foods.get(f[0]);
    if (!food) continue;
    const amount = parseFloat(f[2]);
    const grams = parseFloat(f[4]);
    if (!Number.isFinite(amount) || !Number.isFinite(grams) || amount <= 0 || grams <= 0) continue;
    const label = translateMeasure(f[3]);
    if (!label) continue;
    const per1 = grams / amount;
    if (per1 < 0.5 || per1 > 2000) continue;
    if (!food.medidas.some((m) => m[0] === label)) food.medidas.push([label, round1(per1)]);
  }
  return [...foods.values()];
}

function loadTaco() {
  const data = JSON.parse(readFileSync(join(RAW_DIR, 'taco_TACO.json'), 'utf8'));
  return data.map((d) => ({
    nome: d.description.trim(),
    kcal: num(d.energy_kcal),
    p: num(d.protein_g),
    c: num(d.carbohydrate_g),
    g: num(d.lipid_g),
  }));
}

function loadIbge() {
  const sql = readFileSync(join(RAW_DIR, 'ibge.sql'), 'utf8');
  const out = [];
  // tuplas: (codigo, 'nome', 'categoria', prep_cod|NULL, 'prep', 'kcal', 'prot', 'lip', 'carb', ...)
  const re = /\((\d{7}),\s*'((?:[^'\\]|\\.|'')*)',\s*'((?:[^'\\]|\\.|'')*)',\s*(?:\d+|NULL),\s*'((?:[^'\\]|\\.|'')*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'/g;
  const unesc = (s) => s.replace(/\\'/g, "'").replace(/''/g, "'").replace(/\\\\/g, '\\');
  let m;
  while ((m = re.exec(sql)) !== null) {
    const nome = unesc(m[2]).trim();
    let prep = unesc(m[4]).trim();
    if (/^n[ãa]o se aplica$/i.test(prep)) prep = '';
    else prep = prep.replace(/\(a\)/gi, '').trim().toLowerCase();
    out.push({
      nome: prep ? `${nome}, ${prep}` : nome,
      kcal: num(m[5]),
      p: num(m[6]),
      g: num(m[7]), // Lipidios vem antes de Carboidrato no dump
      c: num(m[8]),
    });
  }
  return out;
}

/* Limpa a descrição da TBCA: remove os parênteses com a lista de ingredientes,
   o nome científico no fim e expande abreviações (c/, s/, p/). */
function cleanTbcaName(desc) {
  let s = desc;
  // remove grupos parentéticos (aninhados) iterativamente
  for (let i = 0; i < 6 && /\([^()]*\)/.test(s); i++) s = s.replace(/\([^()]*\)/g, ' ');
  // parêntese sem fechamento na fonte: descarta tudo a partir dele
  s = s.replace(/\(.*$/, ' ');
  s = s
    .replace(/\bc\//gi, 'com ')
    .replace(/\bs\//gi, 'sem ')
    .replace(/\bp\//gi, 'para ')
    .replace(/\s+/g, ' ');
  let parts = s.split(',').map((p) => p.trim()).filter(Boolean);
  // descarta segmentos residuais: nome científico latino, "Brazilian recipe" etc.
  const lixo = /^[A-Z][a-z]+ [a-z]+\.?( |$)|\b(Mart|Lam|Mill|Merr|Osbeck|DC|Duch|Gaertn)\b\.?|recipe$/;
  parts = parts.filter((p, idx) => idx === 0 || !lixo.test(p));
  return parts.join(', ');
}

function loadTbca() {
  const out = [];
  for (const line of readFileSync(join(RAW_DIR, 'tbca.txt'), 'utf8').split('\n')) {
    const t = line.trim().replace(/,\s*$/, '');
    if (!t.startsWith('{')) continue;
    let item;
    try {
      item = JSON.parse(t);
    } catch {
      continue;
    }
    const get = (comp) => {
      const n = (item.nutrientes || []).find(
        (x) => x.Componente === comp && (comp !== 'Energia' || x.Unidades === 'kcal')
      );
      return n ? num(n['Valor por 100g']) : 0;
    };
    const nome = cleanTbcaName(item.descricao || '');
    if (!nome) continue;
    out.push({
      nome,
      kcal: get('Energia'),
      p: get('Proteína'),
      c: get('Carboidrato total'),
      g: get('Lipídios'),
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Montagem                                                            */
/* ------------------------------------------------------------------ */

function ptMeasuresFor(nome) {
  for (const [re, medidas] of PT_MEASURES) {
    if (re.test(nome)) return medidas.map(([l, g]) => [l, g]);
  }
  return [];
}

// Prioridade de grupos SR28 para completar até 10.000 (menor = mais comum)
const GROUP_PRIORITY = {
  '0100': 1, '0500': 1, '0900': 1, '1100': 1, '1300': 2, '1000': 2, '1500': 1,
  '1600': 1, '2000': 1, '1800': 2, '0400': 2, '1200': 1, '1900': 3, '0600': 3,
  '0800': 3, '1400': 2, '2100': 3, '2200': 3, '2500': 3, '0700': 3, '0200': 2,
  '1700': 4, '3600': 4, '0300': 5, '3500': 6,
};

// Id estável derivado do nome (FNV-1a em base36): não muda quando a base
// cresce, então registros antigos continuam apontando para o alimento certo.
// (Ids posicionais — t12, b340… — mudavam a cada atualização da base.)
const usedIds = new Set();
function stableId(prefix, nome) {
  let h = 0x811c9dc5;
  const s = norm(nome);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  let id = prefix + h.toString(36);
  while (usedIds.has(id)) id += 'x'; // colisão: sufixo determinístico
  usedIds.add(id);
  return id;
}

/* ---- Líquidos: unidade base em ml + medidas de copo/lata/garrafa ---- */

// decide pela(s) primeira(s) palavra(s) do nome; versões em pó/sólidas ficam
// de fora. Obs.: \b do JS falha após acento (pó, café), então os limites são
// delimitadores explícitos ([ ,)] ou fim).
const LIQ_START =
  /^(cerveja|chope|refrigerante|suco|n[ée]ctar|refresco|[áa]gua|leite|bebida|vinho|cacha[çc]a|aguardente|pinga|vodka|whisky|u[íi]sque|rum|gim|gin|licor|champanhe|espumante|sidra|caf[ée]|ch[áa]|mate|chimarr[ãa]o|isot[ôo]nico|energ[ée]tico|vitamina|smoothie|milk-?shake|kombucha|caldo de cana|garapa|coquetel|caipirinha|batida|cappuccino|capuccino|chocolate quente|gemada|gin t[ôo]nica|cuba libre|refrigerantes?)([ ,(]|$)/i;
const LIQ_EXCL = /(^|[ ,(])p[óo]([ ,)]|$)|desidratad|condensado|em barra|mistura|creme de leite|sorvete/i;

function isLiquid(nome) {
  return !LIQ_EXCL.test(nome) && LIQ_START.test(nome.trim());
}

// medidas padrão por tipo de bebida (aplicadas quando o item não tem nenhuma)
const LIQ_MEASURES = [
  [/cerveja/i, [['lata (350 ml)', 350], ['long neck (330 ml)', 330], ['garrafa (600 ml)', 600]]],
  [/chope/i, [['tulipa (300 ml)', 300], ['caldereta (350 ml)', 350]]],
  [/refrigerante/i, [['lata (350 ml)', 350], ['copo (250 ml)', 250], ['garrafa (600 ml)', 600]]],
  [/suco|n[ée]ctar|refresco|garapa|caldo de cana/i, [['copo (250 ml)', 250], ['caixinha (200 ml)', 200]]],
  [/[áa]gua de coco/i, [['copo (250 ml)', 250], ['caixinha (200 ml)', 200]]],
  [/[áa]gua/i, [['copo (250 ml)', 250], ['garrafa (500 ml)', 500]]],
  [/leite/i, [['copo (200 ml)', 200], ['xícara (240 ml)', 240]]],
  [/caf[ée]|cappuccino|capuccino/i, [['xícara pequena (50 ml)', 50], ['xícara (150 ml)', 150]]],
  [/ch[áa]|mate|kombucha/i, [['xícara (200 ml)', 200], ['copo (300 ml)', 300]]],
  [/vinho|espumante|champanhe|sidra/i, [['taça (150 ml)', 150]]],
  [/cacha[çc]a|aguardente|pinga|vodka|whisky|u[íi]sque|rum|gim|gin\b|licor/i, [['dose (50 ml)', 50]]],
  [/energ[ée]tico/i, [['lata (250 ml)', 250], ['lata (473 ml)', 473]]],
  [/isot[ôo]nico/i, [['garrafa (500 ml)', 500]]],
  [/vitamina|smoothie|milk|batida|coquetel|caipirinha|gemada|chocolate quente/i, [['copo (300 ml)', 300]]],
];

function liquidMeasures(nome) {
  for (const [re, m] of LIQ_MEASURES) if (re.test(nome)) return m.map(([l, g]) => [l, g]);
  return [['copo (250 ml)', 250]];
}

async function main() {
  await ensureRawFiles();

  const foods = [];
  const seen = new Set();
  const push = (food, permiteZerado = false) => {
    const key = norm(food.n);
    if (!key || seen.has(key)) return false;
    // sem nenhum valor nutricional (ex.: '*' na TACO): descarta — outra fonte
    // cobre. Curados/marcas podem ser legitimamente zero (Coca zero, creatina).
    if (!permiteZerado && !food.kcal && !food.p && !food.c && !food.g) return false;
    seen.add(key);
    foods.push(food);
    return true;
  };
  const fixEnergy = (f) => {
    if (!f.kcal) f.kcal = round1(4 * f.p + 4 * f.c + 9 * f.g);
    return f;
  };

  // 1) TACO — prioridade máxima na busca
  for (const t of loadTaco()) {
    push(fixEnergy({
      i: stableId('t', t.nome), n: t.nome, f: 't',
      kcal: round1(t.kcal), p: round1(t.p), c: round1(t.c), g: round1(t.g),
      m: ptMeasuresFor(t.nome),
    }));
  }
  const nTaco = foods.length;

  // 2) TBCA (inclui preparações e pratos prontos, PT nativo)
  for (const t of loadTbca()) {
    push(fixEnergy({
      i: stableId('b', t.nome), n: t.nome, f: 'b',
      kcal: round1(t.kcal), p: round1(t.p), c: round1(t.c), g: round1(t.g),
      m: ptMeasuresFor(t.nome),
    }));
  }
  const nTbca = foods.length - nTaco;

  // 3) Camada curada de "vida real" (suplementos, salgados, redes, japonesa)
  let nCurados = 0;
  for (const cItem of CURADOS) {
    if (push({
      i: stableId('r', cItem.n), n: cItem.n, f: 'r',
      kcal: round1(cItem.kcal), p: round1(cItem.p), c: round1(cItem.c), g: round1(cItem.g),
      m: (cItem.m || []).map(([l, gr]) => [l, gr]),
    }, true)) nCurados++;
  }

  // 4) Marcas brasileiras (valores de rótulo)
  let nMarcas = 0;
  for (const it of MARCAS) {
    const food = {
      i: stableId('m', it.n), n: it.n, f: 'm',
      kcal: round1(it.kcal), p: round1(it.p), c: round1(it.c), g: round1(it.g),
      m: (it.m || []).map(([l, gr]) => [l, gr]),
    };
    if (it.l) food.l = 1;
    if (push(food, true)) nMarcas++;
  }

  // 5) IBGE
  const antesIbge = foods.length;
  for (const t of loadIbge()) {
    push(fixEnergy({
      i: stableId('i', t.nome), n: t.nome, f: 'i',
      kcal: round1(t.kcal), p: round1(t.p), c: round1(t.c), g: round1(t.g),
      m: ptMeasuresFor(t.nome),
    }));
  }
  const nIbge = foods.length - antesIbge;

  // 5) SR28 traduzido, até completar TARGET_TOTAL
  const sr = loadSr28();
  sr.sort((a, b) => {
    const pa = GROUP_PRIORITY[a.group] ?? 4;
    const pb = GROUP_PRIORITY[b.group] ?? 4;
    if (pa !== pb) return pa - pb;
    return a.desc.length - b.desc.length;
  });
  let nUsda = 0;
  for (const s of sr) {
    if (foods.length >= TARGET_TOTAL) break;
    const kcal = s.nut['208'];
    const p = s.nut['203'] ?? 0;
    const g = s.nut['204'] ?? 0;
    const c = s.nut['205'] ?? 0;
    if (kcal == null && !p && !c && !g) continue;
    const nome = translateDesc(s.desc);
    if (push(fixEnergy({
      i: `u${s.id}`, n: nome, f: 'u',
      kcal: round1(kcal ?? 0), p: round1(p), c: round1(c), g: round1(g),
      m: s.medidas.slice(0, 4),
    }))) nUsda++;
  }

  // líquidos: unidade base vira ml na interface + medidas de copo/lata/garrafa
  let nLiquidos = 0;
  for (const f of foods) {
    if (isLiquid(f.n)) {
      f.l = 1;
      nLiquidos++;
      if (!f.m || !f.m.length) f.m = liquidMeasures(f.n);
    }
  }

  for (const f of foods) if (!f.m.length) delete f.m;

  mkdirSync(dirname(OUT), { recursive: true });
  // Ao regenerar a base com mudanças relevantes, incremente v e o
  // FOODS_VERSION correspondente em js/db.js para forçar a recarga no navegador.
  writeFileSync(OUT, JSON.stringify({ v: 15, foods }));

  const bytes = readFileSync(OUT).length;
  console.log(`foods.json gerado: ${foods.length} alimentos (${(bytes / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`  TACO: ${nTaco} | TBCA: ${nTbca} | Curados: ${nCurados} | Marcas: ${nMarcas} | IBGE: ${nIbge} | USDA SR28 traduzido: ${nUsda}`);
  const comMedidas = foods.filter((f) => f.m && f.m.length).length;
  console.log(`  Alimentos com medidas caseiras (unidades): ${comMedidas}`);
  console.log(`  Líquidos (unidade base em ml): ${nLiquidos}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
