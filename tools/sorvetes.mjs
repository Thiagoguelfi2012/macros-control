/**
 * Camada de sorvetes e picolés do mercado brasileiro: as linhas da Kibon,
 * Nestlé e os picolés licenciados da Lacta, os potes, as importadas e as redes
 * de sorveteria.
 *
 * Valores por 100 g, com a unidade do palito ou a bola como medida — é assim
 * que se come, não em gramas. Fonte: rótulos das marcas e médias de mercado
 * para as redes; são estimativas boas para o controle diário.
 *
 * Formato: { n, kcal, p, c, g, m?: [[rótulo, gramas]] }
 */
export const SORVETES = [
  /* ---- Picolés licenciados (chocolates famosos) ---- */
  { n: 'Picolé Prestígio (Nestlé)', kcal: 270, p: 3, c: 30, g: 15, m: [['unidade (62 g)', 62]] },
  { n: 'Picolé Sonho de Valsa (Lacta/Kibon)', kcal: 300, p: 3.5, c: 33, g: 16.5, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Ouro Branco (Lacta/Kibon)', kcal: 305, p: 3.5, c: 34, g: 17, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Diamante Negro (Lacta/Kibon)', kcal: 300, p: 3.5, c: 33, g: 16.5, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Bis (Lacta/Kibon)', kcal: 310, p: 4, c: 35, g: 17, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Laka (Lacta/Kibon)', kcal: 310, p: 4, c: 35, g: 17, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Oreo (Kibon)', kcal: 290, p: 3.5, c: 35, g: 15, m: [['unidade (65 g)', 65]] },
  { n: 'Picolé Nescau (Nestlé)', kcal: 250, p: 3.5, c: 30, g: 13, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Kit Kat (Nestlé)', kcal: 300, p: 4, c: 34, g: 16.5, m: [['unidade (63 g)', 63]] },
  { n: 'Picolé Moça doce de leite (Nestlé)', kcal: 260, p: 3.5, c: 34, g: 12, m: [['unidade (62 g)', 62]] },
  { n: 'Picolé Alpino (Nestlé)', kcal: 310, p: 4, c: 33, g: 17.5, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Brigadeiro (Nestlé)', kcal: 270, p: 3.5, c: 33, g: 13.5, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Serenata de Amor (Garoto)', kcal: 300, p: 3.5, c: 33, g: 16.5, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Chokito (Nestlé)', kcal: 295, p: 3.5, c: 36, g: 15, m: [['unidade (62 g)', 62]] },

  /* ---- Kibon: linha clássica ---- */
  { n: 'Picolé Magnum amêndoas (Kibon)', kcal: 340, p: 5, c: 32, g: 21.5, m: [['unidade (71 g)', 71]] },
  { n: 'Picolé Magnum chocolate branco (Kibon)', kcal: 335, p: 4.5, c: 34, g: 20, m: [['unidade (70 g)', 70]] },
  { n: 'Picolé Magnum duplo caramelo (Kibon)', kcal: 335, p: 4, c: 36, g: 19.5, m: [['unidade (77 g)', 77]] },
  { n: 'Picolé Magnum ao leite (Kibon)', kcal: 330, p: 4.5, c: 33, g: 20, m: [['unidade (69 g)', 69]] },
  { n: 'Sorvete Kibon Cornetto morango', kcal: 290, p: 4, c: 39, g: 13, m: [['unidade (66 g)', 66]] },
  { n: 'Sorvete Kibon Cornetto avelã', kcal: 320, p: 4.5, c: 38, g: 16.5, m: [['unidade (68 g)', 68]] },
  { n: 'Sorvete Kibon Cornetto tradicional', kcal: 305, p: 4.5, c: 38, g: 15, m: [['unidade (66 g)', 66]] },
  { n: 'Picolé Sandubon (Kibon)', kcal: 300, p: 4, c: 42, g: 13, m: [['unidade (70 g)', 70]] },
  { n: 'Picolé Fruttare morango (Kibon)', kcal: 100, p: 0.3, c: 24, g: 0.2, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Fruttare uva (Kibon)', kcal: 105, p: 0.2, c: 26, g: 0.1, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Fruttare manga (Kibon)', kcal: 105, p: 0.3, c: 25, g: 0.2, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé Fruttare açaí com guaraná (Kibon)', kcal: 115, p: 0.5, c: 26, g: 0.8, m: [['unidade (60 g)', 60]] },

  /* ---- Potes ---- */
  { n: 'Sorvete Kibon pote chocolate', kcal: 200, p: 3.2, c: 26, g: 9, m: [['bola (60 g)', 60], ['porção (75 g)', 75]] },
  { n: 'Sorvete Kibon pote flocos', kcal: 195, p: 3, c: 25, g: 9, m: [['bola (60 g)', 60], ['porção (75 g)', 75]] },
  { n: 'Sorvete Kibon pote morango', kcal: 180, p: 2.8, c: 26, g: 7, m: [['bola (60 g)', 60], ['porção (75 g)', 75]] },
  { n: 'Sorvete Nestlé pote napolitano', kcal: 190, p: 3, c: 25, g: 8.5, m: [['bola (60 g)', 60], ['porção (75 g)', 75]] },
  { n: 'Sorvete Nestlé pote flocos', kcal: 195, p: 3, c: 25, g: 9, m: [['bola (60 g)', 60], ['porção (75 g)', 75]] },
  { n: 'Sorvete Moça pote (Nestlé)', kcal: 230, p: 4, c: 31, g: 10, m: [['bola (60 g)', 60], ['porção (75 g)', 75]] },
  { n: 'Sorvete Nestlé pote creme', kcal: 190, p: 3, c: 24, g: 9, m: [['bola (60 g)', 60]] },
  { n: 'Sorvete Kibon pote napolitano light', kcal: 130, p: 3, c: 20, g: 4, m: [['bola (60 g)', 60]] },

  /* ---- Fruta ---- */
  { n: 'Sorvete La Frutta limão (Nestlé)', kcal: 100, p: 0, c: 25, g: 0, m: [['unidade (60 g)', 60]] },
  { n: 'Sorvete La Frutta uva (Nestlé)', kcal: 105, p: 0, c: 26, g: 0, m: [['unidade (60 g)', 60]] },
  { n: 'Sorvete La Frutta açaí (Nestlé)', kcal: 115, p: 0.5, c: 26, g: 0.8, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé de coco (sorveteria)', kcal: 180, p: 2, c: 25, g: 8, m: [['unidade (70 g)', 70]] },
  { n: 'Picolé de açaí (sorveteria)', kcal: 130, p: 1, c: 26, g: 2.5, m: [['unidade (70 g)', 70]] },
  { n: 'Picolé de morango ao leite (sorveteria)', kcal: 185, p: 3, c: 27, g: 7, m: [['unidade (70 g)', 70]] },
  { n: 'Picolé de leite condensado (sorveteria)', kcal: 230, p: 4, c: 34, g: 8.5, m: [['unidade (70 g)', 70]] },

  /* ---- Importadas e premium ---- */
  { n: 'Sorvete Häagen-Dazs baunilha', kcal: 270, p: 5, c: 21, g: 18, m: [['bola (70 g)', 70], ['pote pequeno (100 g)', 100]] },
  { n: 'Sorvete Häagen-Dazs dulce de leche', kcal: 290, p: 5, c: 30, g: 17, m: [['bola (70 g)', 70], ['pote pequeno (100 g)', 100]] },
  { n: 'Sorvete Häagen-Dazs chocolate belga', kcal: 300, p: 5, c: 28, g: 19, m: [['bola (70 g)', 70], ['pote pequeno (100 g)', 100]] },
  { n: "Sorvete Ben & Jerry's cookie dough", kcal: 280, p: 4, c: 34, g: 14, m: [['bola (70 g)', 70], ['pote pequeno (100 g)', 100]] },
  { n: "Sorvete Ben & Jerry's chocolate fudge brownie", kcal: 265, p: 4.5, c: 34, g: 12.5, m: [['bola (70 g)', 70]] },
  { n: 'Sorvete Diletto chocolate belga', kcal: 235, p: 4, c: 28, g: 12, m: [['bola (60 g)', 60]] },
  { n: 'Sorvete Diletto doce de leite', kcal: 230, p: 4, c: 32, g: 9.5, m: [['bola (60 g)', 60]] },
  { n: 'Paleta mexicana de chocolate', kcal: 250, p: 4, c: 30, g: 12.5, m: [['unidade (90 g)', 90]] },
  { n: 'Paleta mexicana de frutas', kcal: 130, p: 1, c: 28, g: 1.5, m: [['unidade (90 g)', 90]] },

  /* ---- Redes de sorveteria ---- */
  { n: 'Casquinha Chiquinho Sorvetes', kcal: 200, p: 3.5, c: 28, g: 8, m: [['casquinha (120 g)', 120], ['casquinha dupla (180 g)', 180]] },
  { n: 'Sundae Chiquinho Sorvetes', kcal: 250, p: 4, c: 35, g: 10.5, m: [['pequeno (200 g)', 200], ['grande (300 g)', 300]] },
  { n: 'Chiquinho especial (com adicionais)', kcal: 280, p: 4.5, c: 38, g: 12.5, m: [['pote (300 g)', 300], ['pote grande (400 g)', 400]] },
  { n: 'Milk shake Chiquinho Sorvetes', kcal: 180, p: 3.5, c: 26, g: 6.5, m: [['copo (300 ml)', 300], ['copo grande (500 ml)', 500]] },
  { n: 'Açaí com adicionais (sorveteria)', kcal: 175, p: 2, c: 30, g: 5, m: [['pote (300 g)', 300], ['pote grande (500 g)', 500]] },
  { n: 'Casquinha de sorvete (baunilha, sorveteria)', kcal: 210, p: 3.5, c: 30, g: 8, m: [['casquinha (110 g)', 110]] },
  { n: 'Sorvete de massa em bola (sorveteria)', kcal: 200, p: 3.5, c: 25, g: 10, m: [['bola (60 g)', 60], ['duas bolas (120 g)', 120]] },
  { n: 'Milk shake de chocolate (sorveteria)', kcal: 185, p: 3.5, c: 27, g: 6.5, m: [['copo (300 ml)', 300], ['copo grande (500 ml)', 500]] },
];
