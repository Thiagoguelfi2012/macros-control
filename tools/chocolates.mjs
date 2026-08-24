/**
 * Camada de chocolates e bombons do mercado brasileiro — das marcas de massa às
 * gourmet e bean-to-bar. Valores por 100 g, com a porção de referência do rótulo
 * (tablete, quadradinho, bombom, unidade).
 *
 * Fonte: rótulos publicados pelas marcas. São valores de conhecimento de rótulo,
 * conferidos por plausibilidade — reformulações e variações de lote fazem alguns
 * produtos divergirem em poucos por cento. Para o valor exato de um produto
 * específico, cadastre-o como alimento próprio copiando o rótulo físico.
 *
 * Formato: { n, kcal, p, c, g, m?: [[rótulo, gramas]] }
 */
export const CHOCOLATES = [
  /* ============ Cacau Show ============ */

  // ---- Lacreme (linha ao leite cremoso) ----
  { n: 'Chocolate Cacau Show Lacreme ao leite (tablete)', kcal: 550, p: 7, c: 55, g: 33, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10], ['tablete (30 g)', 30]] },
  { n: 'Chocolate Cacau Show Lacreme branco (tablete)', kcal: 565, p: 6, c: 57, g: 34.5, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show Lacreme meio amargo (tablete)', kcal: 525, p: 6.5, c: 49, g: 33.5, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show Lacreme trufado (tablete)', kcal: 535, p: 6, c: 54, g: 32, m: [['tablete (90 g)', 90], ['quadradinho (11 g)', 11]] },
  { n: 'Chocolate Cacau Show Lacreme com avelãs', kcal: 570, p: 8, c: 49, g: 37, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show Lacreme com castanha de caju', kcal: 565, p: 8.5, c: 48, g: 36.5, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Bombom Cacau Show Lacreme ao leite', kcal: 545, p: 7, c: 55, g: 32.5, m: [['unidade (12,5 g)', 12.5], ['unidade (20 g)', 20]] },

  // ---- Zero (sem adição de açúcar) ----
  { n: 'Chocolate Cacau Show Zero ao leite (tablete)', kcal: 490, p: 8, c: 47, g: 34, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10], ['tablete (25 g)', 25]] },
  { n: 'Chocolate Cacau Show Zero meio amargo (tablete)', kcal: 480, p: 7.5, c: 46, g: 34.5, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show Zero branco (tablete)', kcal: 505, p: 7, c: 49, g: 35, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show Zero 55% cacau', kcal: 470, p: 8.5, c: 42, g: 35, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Bombom Cacau Show Zero (unidade)', kcal: 495, p: 8, c: 47, g: 34, m: [['unidade (12,5 g)', 12.5]] },
  { n: 'Trufa Cacau Show Zero açúcar', kcal: 430, p: 6, c: 46, g: 28, m: [['unidade (20 g)', 20]] },

  // ---- Wafers e Mil Folhas ----
  { n: 'Wafer Cacau Show Mil Folhas (tradicional)', kcal: 545, p: 6, c: 53, g: 33, m: [['unidade (24 g)', 24], ['unidade (60 g)', 60]] },
  { n: 'Wafer Cacau Show Mil Folhas avelã', kcal: 555, p: 7, c: 51, g: 35, m: [['unidade (24 g)', 24], ['unidade (60 g)', 60]] },
  { n: 'Wafer Cacau Show Mil Folhas pistache', kcal: 560, p: 7.5, c: 50, g: 35.5, m: [['unidade (24 g)', 24], ['unidade (60 g)', 60]] },
  { n: 'Wafer Cacau Show Mil Folhas doce de leite', kcal: 540, p: 5.5, c: 55, g: 32, m: [['unidade (24 g)', 24], ['unidade (60 g)', 60]] },
  { n: 'Wafer Cacau Show Mil Folhas ao leite', kcal: 545, p: 6, c: 53, g: 33, m: [['unidade (24 g)', 24]] },
  { n: 'Wafer Cacau Show Mil Folhas branco', kcal: 560, p: 6, c: 55, g: 34, m: [['unidade (24 g)', 24]] },
  { n: 'Wafer Cacau Show Mil Folhas meio amargo', kcal: 535, p: 6.5, c: 50, g: 33.5, m: [['unidade (24 g)', 24]] },
  { n: 'Wafer recheado trufado Cacau Show', kcal: 550, p: 6, c: 53, g: 33.5, m: [['unidade (25 g)', 25]] },

  // ---- Trufas ----
  { n: 'Trufa Cacau Show tradicional (ao leite)', kcal: 470, p: 4.5, c: 50, g: 27, m: [['unidade (28 g)', 28]] },
  { n: 'Trufa Cacau Show avelã', kcal: 490, p: 5.5, c: 47, g: 30, m: [['unidade (28 g)', 28]] },
  { n: 'Trufa Cacau Show pistache', kcal: 495, p: 6, c: 46, g: 31, m: [['unidade (28 g)', 28]] },
  { n: 'Trufa Cacau Show maracujá', kcal: 460, p: 4, c: 52, g: 26, m: [['unidade (28 g)', 28]] },
  { n: 'Trufa Cacau Show limão siciliano', kcal: 465, p: 4, c: 51, g: 26.5, m: [['unidade (28 g)', 28]] },
  { n: 'Trufa Cacau Show doce de leite', kcal: 475, p: 4.5, c: 52, g: 27, m: [['unidade (28 g)', 28]] },
  { n: 'Trufa Cacau Show brigadeiro', kcal: 480, p: 4.5, c: 53, g: 27, m: [['unidade (28 g)', 28]] },
  { n: 'Trufa Cacau Show morango', kcal: 465, p: 4, c: 52, g: 26.5, m: [['unidade (28 g)', 28]] },
  { n: 'Trufa Cacau Show coco', kcal: 480, p: 4, c: 50, g: 29, m: [['unidade (28 g)', 28]] },
  { n: 'Trufa Cacau Show café', kcal: 470, p: 4.5, c: 50, g: 27.5, m: [['unidade (28 g)', 28]] },

  // ---- Tabletes e barras ----
  { n: 'Chocolate Cacau Show ao leite (tablete)', kcal: 545, p: 7, c: 57, g: 31, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show 40% cacau meio amargo', kcal: 530, p: 6.5, c: 52, g: 32.5, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show 50% cacau (tablete)', kcal: 520, p: 6.5, c: 48, g: 33, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show Intense 70% cacau', kcal: 545, p: 8, c: 36, g: 38, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show Intense 85% cacau', kcal: 570, p: 10, c: 27, g: 44, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show branco (tablete)', kcal: 560, p: 6, c: 58, g: 33, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show ao leite com amêndoas', kcal: 570, p: 9, c: 48, g: 37, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show crocante (tablete)', kcal: 550, p: 7.5, c: 55, g: 32.5, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Cacau Show cookies and cream', kcal: 545, p: 6.5, c: 57, g: 31.5, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },

  // ---- Bombons, coleções e sazonais ----
  { n: 'Bombom Cacau Show Nugat', kcal: 520, p: 6, c: 55, g: 30, m: [['unidade (14 g)', 14]] },
  { n: 'Bombom Cacau Show Talismã', kcal: 540, p: 7, c: 52, g: 33, m: [['unidade (13 g)', 13]] },
  { n: 'Bombom Cacau Show crocante', kcal: 535, p: 7, c: 54, g: 31.5, m: [['unidade (13 g)', 13]] },
  { n: 'Bombom Cacau Show avelã', kcal: 560, p: 8, c: 49, g: 36, m: [['unidade (13 g)', 13]] },
  { n: 'Bombom Cacau Show doce de leite', kcal: 520, p: 5.5, c: 57, g: 29.5, m: [['unidade (13 g)', 13]] },
  { n: 'Coração Cacau Show (bombom)', kcal: 535, p: 6.5, c: 55, g: 31.5, m: [['unidade (18 g)', 18]] },
  { n: 'Língua de gato Cacau Show', kcal: 555, p: 7, c: 55, g: 33.5, m: [['unidade (7 g)', 7], ['caixa (100 g)', 100]] },
  { n: 'Ovo de Páscoa Cacau Show ao leite (porção)', kcal: 540, p: 6.5, c: 56, g: 31, m: [['porção (25 g)', 25], ['ovo 150 g (150 g)', 150], ['ovo 350 g (350 g)', 350]] },
  { n: 'Ovo de colher Cacau Show (porção)', kcal: 450, p: 5.5, c: 50, g: 25, m: [['porção (50 g)', 50], ['ovo 300 g (300 g)', 300]] },
  { n: 'Pão de mel Cacau Show', kcal: 400, p: 4, c: 60, g: 15, m: [['unidade (50 g)', 50]] },
  { n: 'Alfajor Cacau Show', kcal: 430, p: 4.5, c: 58, g: 20, m: [['unidade (55 g)', 55]] },
  { n: 'Copo da Felicidade Cacau Show', kcal: 340, p: 4.5, c: 40, g: 18, m: [['copo (150 g)', 150], ['copo (250 g)', 250]] },
  { n: 'Barra recheada Cacau Show (tipo tablete recheado)', kcal: 530, p: 6, c: 56, g: 30.5, m: [['tablete (90 g)', 90], ['quadradinho (11 g)', 11]] },
  { n: 'Pirulito Lolla Cacau Show', kcal: 540, p: 6.5, c: 56, g: 31, m: [['unidade (25 g)', 25]] },
  { n: 'Confeito de chocolate Cacau Show', kcal: 500, p: 5.5, c: 65, g: 23, m: [['porção (30 g)', 30]] },
  { n: 'Chocotone Cacau Show', kcal: 390, p: 6, c: 56, g: 15.5, m: [['fatia (80 g)', 80]] },
  { n: 'Panetone Cacau Show trufado', kcal: 400, p: 6, c: 55, g: 17, m: [['fatia (80 g)', 80]] },

  // ---- Lanut (linha de creme e mousse) ----
  { n: 'Mousse Lanut Cacau Show', kcal: 340, p: 5, c: 34, g: 20, m: [['pote (120 g)', 120], ['pote (200 g)', 200]] },
  { n: 'Mousse Lanut Cacau Show avelã', kcal: 350, p: 5.5, c: 33, g: 21.5, m: [['pote (120 g)', 120], ['pote (200 g)', 200]] },
  { n: 'Mousse Lanut Cacau Show pistache', kcal: 355, p: 6, c: 32, g: 22, m: [['pote (120 g)', 120], ['pote (200 g)', 200]] },
  { n: 'Creme Lanut Cacau Show (creme de avelã)', kcal: 555, p: 6, c: 52, g: 35, m: [['colher de sopa (15 g)', 15], ['pote (160 g)', 160]] },
  { n: 'Creme Lanut Cacau Show pistache', kcal: 570, p: 7, c: 49, g: 37, m: [['colher de sopa (15 g)', 15], ['pote (160 g)', 160]] },
  { n: 'Barra Lanut Cacau Show', kcal: 555, p: 7, c: 52, g: 34.5, m: [['tablete (90 g)', 90], ['quadradinho (11 g)', 11]] },

  /* ============ Kopenhagen ============ */
  { n: 'Chocolate Kopenhagen ao leite (tablete)', kcal: 550, p: 7.5, c: 55, g: 33, m: [['tablete (100 g)', 100], ['quadradinho (12,5 g)', 12.5]] },
  { n: 'Chocolate Kopenhagen meio amargo 60% cacau', kcal: 545, p: 8, c: 42, g: 37, m: [['tablete (100 g)', 100], ['quadradinho (12,5 g)', 12.5]] },
  { n: 'Chocolate Kopenhagen branco (tablete)', kcal: 570, p: 6.5, c: 56, g: 35, m: [['tablete (100 g)', 100], ['quadradinho (12,5 g)', 12.5]] },
  { n: 'Chocolate Kopenhagen 70% cacau', kcal: 560, p: 9, c: 34, g: 41, m: [['tablete (100 g)', 100], ['quadradinho (12,5 g)', 12.5]] },
  { n: 'Língua de gato Kopenhagen', kcal: 560, p: 7.5, c: 54, g: 34, m: [['unidade (7 g)', 7], ['caixa (100 g)', 100]] },
  { n: 'Nhá Benta Kopenhagen', kcal: 420, p: 3, c: 60, g: 18, m: [['unidade (23 g)', 23]] },
  { n: 'Lajotinha Kopenhagen', kcal: 545, p: 8, c: 50, g: 34, m: [['unidade (15 g)', 15]] },
  { n: 'Trufa Kopenhagen', kcal: 500, p: 5, c: 47, g: 32, m: [['unidade (20 g)', 20]] },
  { n: 'Bombom Kopenhagen Massimo', kcal: 555, p: 8, c: 48, g: 36, m: [['unidade (16 g)', 16]] },
  { n: 'Kopenhagen Nozes ao leite', kcal: 575, p: 8.5, c: 46, g: 39, m: [['tablete (100 g)', 100], ['quadradinho (12,5 g)', 12.5]] },
  { n: 'Kopenhagen castanha-do-pará', kcal: 580, p: 9, c: 44, g: 40, m: [['tablete (100 g)', 100]] },
  { n: 'Pão de mel Kopenhagen', kcal: 410, p: 4, c: 60, g: 16, m: [['unidade (55 g)', 55]] },
  { n: 'Ovo de Páscoa Kopenhagen (porção)', kcal: 550, p: 7.5, c: 54, g: 33, m: [['porção (25 g)', 25], ['ovo 250 g (250 g)', 250]] },

  /* ============ Brasil Cacau ============ */
  { n: 'Chocolate Brasil Cacau ao leite (tablete)', kcal: 545, p: 7, c: 56, g: 32, m: [['tablete (90 g)', 90], ['quadradinho (11 g)', 11]] },
  { n: 'Chocolate Brasil Cacau meio amargo 50%', kcal: 525, p: 7, c: 48, g: 33.5, m: [['tablete (90 g)', 90], ['quadradinho (11 g)', 11]] },
  { n: 'Chocolate Brasil Cacau branco', kcal: 565, p: 6, c: 57, g: 34, m: [['tablete (90 g)', 90]] },
  { n: 'Trufa Brasil Cacau', kcal: 480, p: 4.5, c: 50, g: 28, m: [['unidade (22 g)', 22]] },
  { n: 'Bombom Brasil Cacau', kcal: 535, p: 6.5, c: 55, g: 31, m: [['unidade (13 g)', 13]] },

  /* ============ Gourmet e bean-to-bar brasileiros ============ */
  { n: 'Chocolate Dengo ao leite 45% cacau', kcal: 545, p: 8, c: 48, g: 34.5, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Dengo 70% cacau', kcal: 570, p: 9, c: 32, g: 43, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Dengo branco com pistache', kcal: 580, p: 7.5, c: 50, g: 39, m: [['tablete (80 g)', 80]] },
  { n: 'Chocolate Amma 75% cacau', kcal: 575, p: 9.5, c: 30, g: 45, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Amma 100% cacau', kcal: 610, p: 13, c: 17, g: 52, m: [['tablete (80 g)', 80], ['quadradinho (10 g)', 10]] },
  { n: 'Chocolate Luisa Abram 70% cacau', kcal: 570, p: 9, c: 32, g: 43, m: [['tablete (80 g)', 80]] },
  { n: 'Chocolate Nugali ao leite', kcal: 550, p: 8, c: 52, g: 34, m: [['tablete (100 g)', 100], ['quadradinho (12,5 g)', 12.5]] },
  { n: 'Chocolate Nugali 60% cacau', kcal: 555, p: 8.5, c: 40, g: 38, m: [['tablete (100 g)', 100]] },
  { n: 'Chocolate Baianí 70% cacau', kcal: 575, p: 9, c: 31, g: 44, m: [['tablete (80 g)', 80]] },
  { n: 'Chocolate Mendoá ao leite', kcal: 548, p: 7.5, c: 53, g: 33.5, m: [['tablete (80 g)', 80]] },
  { n: 'Chocolate Chocolat du Jour ao leite', kcal: 555, p: 8, c: 51, g: 35, m: [['tablete (100 g)', 100]] },

  /* ============ Lacta / Mondelez ============ */
  { n: 'Chocolate Lacta Intense 40% cacau', kcal: 535, p: 6.5, c: 53, g: 32.5, m: [['barra (80 g)', 80], ['quadrado (11 g)', 11]] },
  { n: 'Chocolate Lacta Intense 50% cacau', kcal: 530, p: 7, c: 48, g: 34, m: [['barra (80 g)', 80], ['quadrado (11 g)', 11]] },
  { n: 'Chocolate Lacta Intense 70% cacau', kcal: 555, p: 9, c: 34, g: 40, m: [['barra (80 g)', 80], ['quadrado (11 g)', 11]] },
  { n: 'Chocolate Lacta ao leite com amêndoas', kcal: 555, p: 8.5, c: 51, g: 34.5, m: [['barra (80 g)', 80]] },
  { n: 'Chocolate Lacta ao leite com avelãs', kcal: 560, p: 8, c: 50, g: 35.5, m: [['barra (80 g)', 80]] },
  { n: 'Chocolate Lacta Oreo', kcal: 530, p: 6, c: 59, g: 29.5, m: [['barra (80 g)', 80], ['quadrado (11 g)', 11]] },
  { n: 'Chocolate Sensação (Nestlé)', kcal: 500, p: 5.5, c: 60, g: 26, m: [['unidade (38 g)', 38]] },
  { n: 'Wafer Bis Xtra ao leite', kcal: 505, p: 6, c: 60, g: 26, m: [['unidade (18 g)', 18]] },
  { n: 'Wafer Bis branco', kcal: 505, p: 5.5, c: 63, g: 25.5, m: [['unidade (7,5 g)', 7.5], ['caixa (100,8 g)', 100.8]] },
  { n: 'Bombom Amandita (Lacta)', kcal: 530, p: 6, c: 58, g: 30, m: [['unidade (8 g)', 8]] },
  { n: 'Confeti (Lacta)', kcal: 490, p: 5, c: 69, g: 21, m: [['pacote (40 g)', 40]] },
  { n: 'Chocolate Milka ao leite', kcal: 535, p: 6.4, c: 58, g: 29.5, m: [['tablete (100 g)', 100], ['quadrado (12,5 g)', 12.5]] },
  { n: 'Chocolate Toblerone ao leite', kcal: 525, p: 5.6, c: 60, g: 29, m: [['barra (100 g)', 100], ['triângulo (10 g)', 10]] },
  { n: 'Chocolate Cadbury Dairy Milk', kcal: 530, p: 7.3, c: 57, g: 30, m: [['barra (100 g)', 100]] },

  /* ============ Garoto ============ */
  { n: 'Chocolate Garoto ao leite (tablete)', kcal: 540, p: 6.5, c: 58, g: 30.5, m: [['tablete (80 g)', 80], ['quadrado (10 g)', 10]] },
  { n: 'Chocolate Garoto meio amargo', kcal: 520, p: 6, c: 55, g: 30, m: [['tablete (80 g)', 80]] },
  { n: 'Chocolate Garoto branco', kcal: 560, p: 6, c: 58, g: 33, m: [['tablete (80 g)', 80]] },
  { n: 'Chocolate Talento ao leite', kcal: 545, p: 7, c: 55, g: 32, m: [['barra (85 g)', 85], ['quadrado (10,6 g)', 10.6]] },
  { n: 'Chocolate Talento branco com castanhas', kcal: 565, p: 7.5, c: 53, g: 35, m: [['barra (85 g)', 85], ['quadrado (10,6 g)', 10.6]] },
  { n: 'Chocolate Talento meio amargo com amêndoas', kcal: 555, p: 8.5, c: 46, g: 36, m: [['barra (85 g)', 85], ['quadrado (10,6 g)', 10.6]] },
  { n: 'Chocolate Talento 70% cacau', kcal: 560, p: 9, c: 34, g: 41, m: [['barra (85 g)', 85]] },
  { n: 'Chocolate Talento avelãs', kcal: 565, p: 8, c: 50, g: 36, m: [['barra (85 g)', 85]] },
  { n: 'Bombom Garoto sortido (caixa, média)', kcal: 500, p: 5.5, c: 60, g: 26, m: [['unidade (12 g)', 12], ['caixa (250 g)', 250]] },
  { n: 'Chocolate Batom (Garoto)', kcal: 540, p: 6.5, c: 58.5, g: 30.5, m: [['unidade (16 g)', 16]] },
  { n: 'Chocolate Crocante (Garoto)', kcal: 525, p: 7, c: 58, g: 29, m: [['unidade (32 g)', 32]] },
  { n: 'Serenata de Amor trufa (Garoto)', kcal: 515, p: 6, c: 57, g: 29, m: [['unidade (22 g)', 22]] },

  /* ============ Nestlé ============ */
  { n: 'Chocolate Nestlé Alpino tablete', kcal: 555, p: 7, c: 55, g: 33.5, m: [['tablete (85 g)', 85], ['quadrado (10,6 g)', 10.6]] },
  { n: 'Chocolate Nestlé Classic meio amargo', kcal: 520, p: 6, c: 56, g: 29.5, m: [['barra (80 g)', 80], ['quadrado (12,5 g)', 12.5]] },
  { n: 'Chocolate Nestlé Classic branco', kcal: 560, p: 6.5, c: 58, g: 33, m: [['barra (80 g)', 80]] },
  { n: 'Chocolate Nestlé Classic ao leite com avelãs', kcal: 560, p: 8, c: 51, g: 35, m: [['barra (80 g)', 80]] },
  { n: 'Chocolate KitKat branco', kcal: 535, p: 6, c: 60, g: 29, m: [['unidade 4 dedos (41,5 g)', 41.5], ['dedo (10,4 g)', 10.4]] },
  { n: 'Chocolate KitKat dark (meio amargo)', kcal: 515, p: 6, c: 59, g: 27.5, m: [['unidade 4 dedos (41,5 g)', 41.5]] },
  { n: 'Chocolate Suflair branco', kcal: 560, p: 6.5, c: 58, g: 33, m: [['barra (50 g)', 50]] },
  { n: 'Chocolate Milkybar (Nestlé)', kcal: 555, p: 7, c: 57, g: 32.5, m: [['barra (25 g)', 25]] },
  { n: 'Bombom Nestlé Especialidades (média)', kcal: 505, p: 6, c: 58, g: 27, m: [['unidade (13 g)', 13], ['caixa (251 g)', 251]] },

  /* ============ Hershey's ============ */
  { n: "Chocolate Hershey's ao leite (barra)", kcal: 545, p: 7.5, c: 57, g: 31.5, m: [['barra (92 g)', 92], ['quadrado (11,5 g)', 11.5], ['barra (20 g)', 20]] },
  { n: "Chocolate Hershey's Cookies'n'Creme", kcal: 545, p: 6, c: 60, g: 31, m: [['barra (87 g)', 87], ['quadrado (11 g)', 11]] },
  { n: "Chocolate Hershey's Air ao leite", kcal: 555, p: 7, c: 57, g: 32.5, m: [['barra (85 g)', 85]] },
  { n: "Chocolate Hershey's Mais Cacau 40%", kcal: 535, p: 7, c: 53, g: 32, m: [['barra (85 g)', 85]] },
  { n: "Chocolate Hershey's Mais Cacau 60%", kcal: 550, p: 8, c: 42, g: 37, m: [['barra (85 g)', 85]] },
  { n: "Chocolate Hershey's branco", kcal: 565, p: 6, c: 58, g: 34, m: [['barra (87 g)', 87]] },

  /* ============ Ferrero / Kinder ============ */
  { n: 'Kinder Bueno', kcal: 572, p: 8.7, c: 49, g: 37, m: [['unidade (21,5 g)', 21.5], ['embalagem 2 un (43 g)', 43]] },
  { n: 'Kinder Bueno branco', kcal: 585, p: 8.5, c: 49, g: 39, m: [['unidade (19,5 g)', 19.5], ['embalagem 2 un (39 g)', 39]] },
  { n: 'Kinder Chocolate (barrinha)', kcal: 566, p: 8.7, c: 53, g: 35, m: [['unidade (12,5 g)', 12.5]] },
  { n: 'Kinder Delice', kcal: 430, p: 6.5, c: 45, g: 24.5, m: [['unidade (39 g)', 39]] },
  { n: 'Ferrero Raffaello', kcal: 615, p: 7, c: 42, g: 46.5, m: [['unidade (10 g)', 10], ['3 unidades (30 g)', 30]] },
  { n: 'Nutella B-ready', kcal: 545, p: 8, c: 52, g: 32.5, m: [['unidade (22 g)', 22]] },

  /* ============ Lindt ============ */
  { n: 'Chocolate Lindt Lindor ao leite (bola)', kcal: 610, p: 6, c: 46, g: 44, m: [['unidade (12,5 g)', 12.5], ['3 unidades (37,5 g)', 37.5]] },
  { n: 'Chocolate Lindt Lindor branco (bola)', kcal: 620, p: 6, c: 47, g: 45, m: [['unidade (12,5 g)', 12.5]] },
  { n: 'Chocolate Lindt Lindor 60% cacau (bola)', kcal: 600, p: 6.5, c: 40, g: 45.5, m: [['unidade (12,5 g)', 12.5]] },
  { n: 'Chocolate Lindt Lindor avelã (bola)', kcal: 615, p: 7, c: 44, g: 45.5, m: [['unidade (12,5 g)', 12.5]] },
  { n: 'Chocolate Lindt Lindor salted caramel', kcal: 605, p: 5.5, c: 47, g: 43.5, m: [['unidade (12,5 g)', 12.5]] },
  { n: 'Chocolate Lindt Excellence 70% cacau', kcal: 566, p: 9, c: 34, g: 41, m: [['tablete (100 g)', 100], ['quadrado (10 g)', 10]] },
  { n: 'Chocolate Lindt Excellence 85% cacau', kcal: 592, p: 12, c: 19, g: 46, m: [['tablete (100 g)', 100], ['quadrado (10 g)', 10]] },
  { n: 'Chocolate Lindt Excellence 90% cacau', kcal: 604, p: 13, c: 14, g: 50, m: [['tablete (100 g)', 100]] },
  { n: 'Chocolate Lindt ao leite (tablete)', kcal: 560, p: 7.5, c: 52, g: 35, m: [['tablete (100 g)', 100], ['quadrado (10 g)', 10]] },

  /* ============ Arcor, Neugebauer e outros ============ */
  { n: 'Tortuguita (Arcor)', kcal: 505, p: 5, c: 58, g: 28, m: [['unidade (18 g)', 18]] },
  { n: "Bib's (Arcor)", kcal: 495, p: 5.5, c: 62, g: 25, m: [['unidade (15 g)', 15]] },
  { n: 'Rocklets (Arcor)', kcal: 480, p: 4.5, c: 71, g: 19.5, m: [['pacote (40 g)', 40]] },
  { n: 'Tablito (Arcor)', kcal: 520, p: 6, c: 60, g: 28, m: [['unidade (26 g)', 26]] },
  { n: 'Chocolate Neugebauer ao leite', kcal: 540, p: 6.5, c: 58, g: 30.5, m: [['tablete (90 g)', 90], ['quadrado (11 g)', 11]] },
  { n: 'Chokinho (Neugebauer)', kcal: 525, p: 6, c: 60, g: 29, m: [['unidade (18 g)', 18]] },
  { n: 'Alfajor Havanna chocolate', kcal: 415, p: 5, c: 58, g: 18, m: [['unidade (60 g)', 60]] },
  { n: 'Alfajor Havanna doce de leite (branco)', kcal: 420, p: 5, c: 60, g: 18, m: [['unidade (60 g)', 60]] },
  { n: 'Chocolate Diletto (barra)', kcal: 545, p: 7, c: 55, g: 32.5, m: [['tablete (80 g)', 80]] },
  { n: 'Ovomaltine crocante (barra)', kcal: 520, p: 6.5, c: 62, g: 27, m: [['unidade (25 g)', 25]] },
  { n: 'Creme de avelã Ovomaltine', kcal: 545, p: 6, c: 58, g: 31, m: [['colher de sopa (15 g)', 15], ['pote (300 g)', 300]] },
];
