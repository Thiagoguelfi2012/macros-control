/**
 * Camada de pastas de amendoim, castanhas e sementes vendidas no Brasil —
 * das marcas fitness (Dr. Peanut, Vitapower, Amendocrem) às importadas
 * (Reese's, Skippy, Jif) e às integrais de mercado natural.
 *
 * Valores por 100 g, com a colher de sopa e a porção do rótulo como medidas.
 * Fonte: rótulos publicados pelas marcas — conhecimento de rótulo conferido por
 * plausibilidade. Sabores novos aparecem o tempo todo nessas marcas; para o
 * valor exato de um pote específico, cadastre-o como alimento próprio.
 *
 * Formato: { n, kcal, p, c, g, m?: [[rótulo, gramas]] }
 */
const COLHERES = [['colher de sopa (20 g)', 20], ['colher de chá (7 g)', 7], ['porção (30 g)', 30]];

export const PASTAS = [
  /* ============ Dr. Peanut ============ */
  { n: 'Pasta de amendoim Dr. Peanut integral', kcal: 590, p: 26, c: 16, g: 48, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut paçoca', kcal: 570, p: 23, c: 22, g: 44, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut avelã', kcal: 553, p: 23, c: 20, g: 43, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut chocolate branco', kcal: 575, p: 22, c: 24, g: 44, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut chocolate ao leite', kcal: 565, p: 22, c: 24, g: 43, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut beijinho', kcal: 580, p: 22, c: 23, g: 45, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut brigadeiro', kcal: 565, p: 22, c: 25, g: 42, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut doce de leite', kcal: 560, p: 22, c: 26, g: 41, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut leite em pó (leite ninho)', kcal: 570, p: 23, c: 24, g: 43, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut churros', kcal: 565, p: 22, c: 26, g: 42, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut cookies and cream', kcal: 570, p: 22, c: 25, g: 43, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut pistache', kcal: 585, p: 23, c: 20, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut brownie', kcal: 560, p: 23, c: 24, g: 42, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut torta de limão', kcal: 565, p: 22, c: 25, g: 42, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut red velvet', kcal: 565, p: 22, c: 25, g: 42, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut coco', kcal: 580, p: 22, c: 21, g: 46, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut rapadura', kcal: 565, p: 22, c: 26, g: 42, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut banoffee', kcal: 560, p: 22, c: 26, g: 41, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut crocante', kcal: 585, p: 25, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Dr. Peanut com whey protein', kcal: 550, p: 30, c: 18, g: 39, m: COLHERES },

  /* ============ Vitapower ============ */
  { n: 'Pasta de amendoim Vitapower integral', kcal: 587, p: 27, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Vitapower crocante', kcal: 585, p: 26, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Vitapower chocolate branco', kcal: 575, p: 22, c: 24, g: 44, m: COLHERES },
  { n: 'Pasta de amendoim Vitapower cookies', kcal: 570, p: 22, c: 25, g: 43, m: COLHERES },
  { n: 'Pasta de amendoim Vitapower paçoca', kcal: 570, p: 23, c: 22, g: 44, m: COLHERES },
  { n: 'Pasta de amendoim Vitapower leite em pó', kcal: 570, p: 23, c: 24, g: 43, m: COLHERES },
  { n: 'Pasta de amendoim Vitapower brigadeiro', kcal: 565, p: 22, c: 25, g: 42, m: COLHERES },
  { n: 'Pasta de amendoim Vitapower avelã', kcal: 565, p: 23, c: 21, g: 44, m: COLHERES },
  { n: 'Pasta de amendoim Vitapower doce de leite', kcal: 560, p: 22, c: 26, g: 41, m: COLHERES },
  { n: 'Pasta de amendoim Vitapower coco', kcal: 580, p: 22, c: 21, g: 46, m: COLHERES },

  /* ============ Amendocrem ============ */
  { n: 'Amendocrem pasta de amendoim tradicional', kcal: 600, p: 24, c: 20, g: 48, m: COLHERES },
  { n: 'Amendocrem pasta de amendoim crocante', kcal: 598, p: 24, c: 20, g: 48, m: COLHERES },
  { n: 'Amendocrem pasta de amendoim com chocolate', kcal: 580, p: 21, c: 26, g: 44, m: COLHERES },
  { n: 'Amendocrem pasta de amendoim zero açúcar', kcal: 585, p: 26, c: 15, g: 48, m: COLHERES },
  { n: 'Amendocrem pasta de amendoim com mel', kcal: 585, p: 23, c: 24, g: 45, m: COLHERES },

  /* ============ Importadas ============ */
  { n: "Pasta de amendoim Reese's cremosa (creamy)", kcal: 588, p: 22, c: 24, g: 47, m: COLHERES },
  { n: "Pasta de amendoim Reese's crocante (crunchy)", kcal: 588, p: 23, c: 23, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Skippy cremosa', kcal: 588, p: 22, c: 22, g: 50, m: COLHERES },
  { n: 'Pasta de amendoim Skippy crocante', kcal: 588, p: 23, c: 22, g: 50, m: COLHERES },
  { n: 'Pasta de amendoim Jif cremosa', kcal: 590, p: 22, c: 22, g: 50, m: COLHERES },
  { n: 'Pasta de amendoim Peter Pan cremosa', kcal: 588, p: 22, c: 23, g: 48, m: COLHERES },

  /* ============ Integrais e naturais ============ */
  { n: 'Pasta de amendoim Mandubim integral', kcal: 588, p: 26, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Mandubim crocante', kcal: 588, p: 26, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Pura Vida integral', kcal: 590, p: 25, c: 18, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Vitao integral', kcal: 585, p: 25, c: 18, g: 46, m: COLHERES },
  { n: 'Pasta de amendoim Jasmine integral', kcal: 585, p: 26, c: 17, g: 46, m: COLHERES },
  { n: 'Pasta de amendoim Mãe Terra integral', kcal: 588, p: 26, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Naturê integral', kcal: 585, p: 25, c: 18, g: 46, m: COLHERES },
  { n: 'Pasta de amendoim Feito de Grãos integral', kcal: 588, p: 26, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Butter Nut integral', kcal: 590, p: 25, c: 18, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim orgânica integral', kcal: 588, p: 26, c: 17, g: 47, m: COLHERES },

  /* ============ Marcas de suplemento ============ */
  { n: 'Pasta de amendoim Growth Supplements integral', kcal: 588, p: 26, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Growth Supplements chocolate branco', kcal: 575, p: 23, c: 23, g: 44, m: COLHERES },
  { n: 'Pasta de amendoim Max Titanium integral', kcal: 588, p: 26, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Integralmédica integral', kcal: 588, p: 26, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Bold integral', kcal: 590, p: 25, c: 18, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim Nutrata integral', kcal: 588, p: 26, c: 17, g: 47, m: COLHERES },
  { n: 'Pasta de amendoim proteica com whey (média)', kcal: 555, p: 32, c: 16, g: 39, m: COLHERES },

  /* ============ Outras castanhas e sementes ============ */
  { n: 'Pasta de castanha de caju integral', kcal: 585, p: 18, c: 27, g: 46, m: COLHERES },
  { n: 'Pasta de amêndoas integral', kcal: 610, p: 21, c: 19, g: 53, m: COLHERES },
  { n: 'Pasta de castanha-do-pará integral', kcal: 655, p: 14, c: 12, g: 66, m: COLHERES },
  { n: 'Pasta de macadâmia integral', kcal: 715, p: 8, c: 14, g: 75, m: COLHERES },
  { n: 'Pasta de avelã pura (sem açúcar)', kcal: 650, p: 15, c: 17, g: 61, m: COLHERES },
  { n: 'Pasta de pistache', kcal: 615, p: 20, c: 28, g: 49, m: COLHERES },
  { n: 'Pasta de nozes integral', kcal: 655, p: 15, c: 14, g: 65, m: COLHERES },
  { n: 'Tahine (pasta de gergelim)', kcal: 595, p: 17, c: 21, g: 53, m: COLHERES },
  { n: 'Pasta de girassol (sunflower butter)', kcal: 617, p: 20, c: 18, g: 55, m: COLHERES },
  { n: 'Pasta de coco (manteiga de coco)', kcal: 650, p: 7, c: 24, g: 62, m: COLHERES },
  { n: 'Pasta de amendoim com cacau (sem açúcar)', kcal: 575, p: 26, c: 18, g: 45, m: COLHERES },
  { n: 'Mix de castanhas em pasta', kcal: 620, p: 18, c: 20, g: 54, m: COLHERES },
];
