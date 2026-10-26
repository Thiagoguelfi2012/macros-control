/**
 * Camada curada de "vida real": itens que não existem nas tabelas oficiais
 * (suplementos, salgados, comida japonesa, redes de fast food, industrializados
 * comuns). Valores por 100 g (ou 100 ml) baseados em rótulos típicos e médias de
 * mercado — são estimativas boas para controle diário, não análises de laboratório.
 *
 * Formato: { n, kcal, p, c, g, m?: [[rótulo, gramas]] }
 */
export const CURADOS = [
  // ---- Suplementos ----
  { n: 'Whey protein concentrado, pó', kcal: 400, p: 75, c: 10, g: 6, m: [['dose (30 g)', 30], ['colher de sopa', 15]] },
  { n: 'Whey protein isolado (iso whey), pó', kcal: 380, p: 87, c: 4, g: 2, m: [['dose (30 g)', 30]] },
  { n: 'Whey protein hidrolisado, pó', kcal: 380, p: 85, c: 5, g: 2, m: [['dose (30 g)', 30]] },
  { n: 'Caseína, pó', kcal: 370, p: 80, c: 8, g: 2, m: [['dose (30 g)', 30]] },
  { n: 'Albumina (clara de ovo em pó)', kcal: 380, p: 80, c: 6, g: 0.5, m: [['dose (30 g)', 30]] },
  { n: 'Proteína vegetal (ervilha/arroz), pó', kcal: 390, p: 75, c: 10, g: 5, m: [['dose (30 g)', 30]] },
  { n: 'Creatina monohidratada, pó', kcal: 0, p: 0, c: 0, g: 0, m: [['dose (3 g)', 3], ['dose (5 g)', 5]] },
  { n: 'Hipercalórico (mass gainer), pó', kcal: 400, p: 15, c: 75, g: 4, m: [['dose (100 g)', 100], ['dose (150 g)', 150]] },
  { n: 'Barra de proteína', kcal: 380, p: 30, c: 38, g: 12, m: [['unidade (45 g)', 45], ['unidade (60 g)', 60]] },
  { n: 'Pré-treino, pó', kcal: 20, p: 0, c: 5, g: 0, m: [['dose (10 g)', 10]] },
  { n: 'Maltodextrina, pó', kcal: 380, p: 0, c: 95, g: 0, m: [['dose (30 g)', 30]] },
  { n: 'Dextrose, pó', kcal: 375, p: 0, c: 94, g: 0, m: [['dose (30 g)', 30]] },
  { n: 'Palatinose (isomaltulose), pó', kcal: 380, p: 0, c: 95, g: 0, m: [['dose (25 g)', 25]] },
  { n: 'BCAA, pó', kcal: 360, p: 90, c: 0, g: 0, m: [['dose (10 g)', 10]] },
  { n: 'Glutamina, pó', kcal: 340, p: 85, c: 0, g: 0, m: [['dose (10 g)', 10]] },
  { n: 'Colágeno hidrolisado, pó', kcal: 360, p: 90, c: 0, g: 0, m: [['dose (10 g)', 10]] },
  { n: 'Pasta de amendoim integral', kcal: 590, p: 25, c: 18, g: 47, m: [['colher de sopa', 20]] },
  { n: 'Pasta de amendoim com whey', kcal: 560, p: 32, c: 16, g: 40, m: [['colher de sopa', 20]] },

  // ---- Comida japonesa ----
  { n: 'Temaki de salmão (com arroz)', kcal: 230, p: 10, c: 30, g: 8, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki de salmão com cream cheese (com arroz)', kcal: 250, p: 10, c: 29, g: 11, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki de salmão sem arroz', kcal: 168, p: 19, c: 0.6, g: 9.6, m: [['unidade (180 g)', 180], ['unidade grande (220 g)', 220]] },
  { n: 'Temaki de salmão com cream cheese, sem arroz', kcal: 198, p: 17.7, c: 1.5, g: 13.3, m: [['unidade (180 g)', 180], ['unidade grande (220 g)', 220]] },
  { n: 'Temaki de atum', kcal: 200, p: 12, c: 30, g: 4, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki hot (salmão empanado frito)', kcal: 290, p: 10, c: 33, g: 13, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Sushi (niguiri) de salmão', kcal: 160, p: 8, c: 24, g: 3.5, m: [['unidade (30 g)', 30]] },
  { n: 'Sushi (niguiri) de atum', kcal: 145, p: 9, c: 24, g: 1.5, m: [['unidade (30 g)', 30]] },
  { n: 'Uramaki filadélfia (salmão com cream cheese)', kcal: 190, p: 7, c: 27, g: 6, m: [['unidade (25 g)', 25]] },
  { n: 'Hossomaki de salmão', kcal: 155, p: 7, c: 27, g: 2, m: [['unidade (20 g)', 20]] },
  { n: 'Hot roll (sushi empanado frito)', kcal: 280, p: 8, c: 36, g: 11, m: [['unidade (30 g)', 30]] },
  { n: 'Sashimi de salmão', kcal: 208, p: 20, c: 0, g: 13, m: [['fatia (15 g)', 15]] },
  { n: 'Sashimi de atum', kcal: 130, p: 28, c: 0, g: 1, m: [['fatia (15 g)', 15]] },
  { n: 'Temaki de atum sem arroz', kcal: 115, p: 24, c: 1, g: 2, m: [['unidade (180 g)', 180], ['unidade grande (220 g)', 220]] },
  { n: 'Temaki de atum com cream cheese', kcal: 220, p: 11, c: 28, g: 7, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki de atum com cream cheese, sem arroz', kcal: 148, p: 21.8, c: 1.2, g: 5.8, m: [['unidade (180 g)', 180], ['unidade grande (220 g)', 220]] },
  { n: 'Temaki de atum picante (spicy)', kcal: 210, p: 12, c: 29, g: 5, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki de salmão maçaricado (hot philadelphia)', kcal: 260, p: 11, c: 28, g: 12, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki de salmão picante (spicy)', kcal: 240, p: 10, c: 29, g: 10, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki de camarão', kcal: 200, p: 11, c: 30, g: 4, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki de camarão empanado', kcal: 260, p: 10, c: 32, g: 10, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki de camarão sem arroz', kcal: 140, p: 17.7, c: 1.5, g: 6.3, m: [['unidade (180 g)', 180], ['unidade grande (220 g)', 220]] },
  { n: 'Temaki de kani com cream cheese', kcal: 220, p: 7, c: 32, g: 8, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki califórnia (kani, manga e pepino)', kcal: 180, p: 5, c: 33, g: 3, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki de skin (pele de salmão)', kcal: 240, p: 12, c: 28, g: 9, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Temaki vegetariano (pepino e manga)', kcal: 150, p: 3, c: 32, g: 1, m: [['unidade (130 g)', 130], ['unidade grande (180 g)', 180]] },
  { n: 'Niguiri de kani', kcal: 130, p: 5, c: 25, g: 1, m: [['unidade (30 g)', 30]] },
  { n: 'Niguiri de camarão', kcal: 140, p: 7, c: 25, g: 1, m: [['unidade (30 g)', 30]] },
  { n: 'Niguiri de peixe branco', kcal: 135, p: 7, c: 25, g: 1, m: [['unidade (30 g)', 30]] },
  { n: 'Gunkan (joy) de salmão com cream cheese', kcal: 200, p: 8, c: 24, g: 8, m: [['unidade (35 g)', 35]] },
  { n: 'Sashimi de peixe branco (tilápia/saint peter)', kcal: 100, p: 20, c: 0, g: 2, m: [['fatia (15 g)', 15]] },
  { n: 'Ceviche de peixe branco', kcal: 90, p: 13, c: 6, g: 1.5, m: [['porção (200 g)', 200]] },
  { n: 'Carpaccio de salmão com molho', kcal: 190, p: 15, c: 2, g: 13, m: [['porção (120 g)', 120]] },
  { n: 'Tartar de salmão', kcal: 200, p: 16, c: 3, g: 13, m: [['porção (100 g)', 100]] },
  { n: 'Hossomaki de atum', kcal: 140, p: 8, c: 26, g: 1, m: [['unidade (20 g)', 20]] },
  { n: 'Hossomaki de pepino (kappamaki)', kcal: 110, p: 2, c: 25, g: 0.3, m: [['unidade (20 g)', 20]] },
  { n: 'Hossomaki de kani', kcal: 130, p: 4, c: 26, g: 1, m: [['unidade (20 g)', 20]] },
  { n: 'Uramaki califórnia', kcal: 170, p: 5, c: 30, g: 3, m: [['unidade (25 g)', 25]] },
  { n: 'Uramaki de skin (pele de salmão)', kcal: 200, p: 8, c: 28, g: 6, m: [['unidade (25 g)', 25]] },
  { n: 'Hot filadélfia (peça)', kcal: 280, p: 9, c: 34, g: 12, m: [['peça (30 g)', 30], ['porção 10 peças (300 g)', 300]] },
  { n: 'Tempurá de camarão', kcal: 240, p: 10, c: 22, g: 13, m: [['unidade (40 g)', 40]] },
  { n: 'Sunomono (salada de pepino agridoce)', kcal: 50, p: 1, c: 11, g: 0.2, m: [['porção (100 g)', 100]] },
  { n: 'Salada de wakame (alga temperada)', kcal: 90, p: 2, c: 8, g: 5, m: [['porção (100 g)', 100]] },
  { n: 'Edamame', kcal: 120, p: 11, c: 9, g: 5, m: [['porção (100 g)', 100]] },
  { n: 'Shimeji na manteiga', kcal: 90, p: 3, c: 6, g: 6, m: [['porção (150 g)', 150]] },
  { n: 'Arroz japonês (gohan)', kcal: 150, p: 2.5, c: 33, g: 0.3, m: [['tigela (150 g)', 150]] },
  { n: 'Yakimeshi (arroz frito japonês)', kcal: 180, p: 6, c: 28, g: 5, m: [['porção (300 g)', 300]] },
  { n: 'Udon (macarrão japonês em caldo)', kcal: 90, p: 4, c: 16, g: 1, m: [['tigela (400 g)', 400]] },
  { n: 'Lámen (ramen) com carne suína', kcal: 120, p: 6, c: 15, g: 4, m: [['tigela (500 g)', 500]] },
  { n: 'Teppan de salmão', kcal: 200, p: 20, c: 1, g: 13, m: [['porção (200 g)', 200]] },
  { n: 'Teppan de frango', kcal: 160, p: 22, c: 1, g: 8, m: [['porção (200 g)', 200]] },
  { n: 'Frango ao molho teriyaki', kcal: 160, p: 16, c: 10, g: 6, m: [['porção (250 g)', 250]] },
  { n: 'Salmão ao molho teriyaki', kcal: 210, p: 18, c: 6, g: 12, m: [['porção (250 g)', 250]] },
  { n: 'Hot roll doce de banana com chocolate', kcal: 290, p: 4, c: 45, g: 11, m: [['unidade (30 g)', 30]] },
  { n: 'Mochi de sorvete', kcal: 220, p: 3, c: 38, g: 6, m: [['unidade (60 g)', 60]] },
  { n: 'Molho tarê (agridoce)', kcal: 130, p: 2, c: 30, g: 0, m: [['colher de sopa', 15]] },
  { n: 'Gengibre em conserva (gari)', kcal: 50, p: 0.2, c: 12, g: 0, m: [['colher de sopa', 15]] },
  { n: 'Combinado de sushi e sashimi (média)', kcal: 150, p: 9, c: 20, g: 4, m: [['porção (300 g)', 300], ['porção (500 g)', 500]] },
  { n: 'Gyoza (guioza) de porco', kcal: 200, p: 9, c: 25, g: 7, m: [['unidade (25 g)', 25]] },
  { n: 'Rolinho primavera (harumaki)', kcal: 250, p: 5, c: 30, g: 12, m: [['unidade (40 g)', 40]] },
  { n: 'Yakisoba de carne e legumes', kcal: 130, p: 7, c: 17, g: 4, m: [['prato (400 g)', 400]] },
  { n: 'Missoshiro (sopa de missô)', kcal: 35, p: 3, c: 4, g: 1, m: [['tigela (200 ml)', 200]] },
  { n: 'Shoyu (molho de soja)', kcal: 60, p: 8, c: 6, g: 0, m: [['colher de sopa', 15], ['sachê (8 ml)', 8]] },

  // ---- Salgados de padaria e lanchonete ----
  { n: 'Esfiha aberta de carne', kcal: 250, p: 11, c: 32, g: 9, m: [['unidade (80 g)', 80], ['mini (35 g)', 35]] },
  { n: 'Esfiha aberta de frango', kcal: 255, p: 12, c: 32, g: 9, m: [['unidade (80 g)', 80], ['mini (35 g)', 35]] },
  { n: 'Esfiha aberta de queijo', kcal: 280, p: 11, c: 32, g: 12, m: [['unidade (80 g)', 80], ['mini (35 g)', 35]] },
  { n: 'Esfiha aberta de queijo branco (tipo minas)', kcal: 255, p: 12, c: 31, g: 9.5, m: [['unidade (80 g)', 80], ['mini (35 g)', 35]] },
  { n: 'Esfiha aberta de queijo com orégano', kcal: 280, p: 11, c: 32, g: 12, m: [['unidade (80 g)', 80], ['mini (35 g)', 35]] },
  { n: 'Esfiha aberta de calabresa', kcal: 290, p: 11.5, c: 31, g: 13.5, m: [['unidade (80 g)', 80], ['mini (35 g)', 35]] },
  { n: 'Esfiha aberta de escarola com queijo', kcal: 245, p: 9, c: 31, g: 9.5, m: [['unidade (80 g)', 80], ['mini (35 g)', 35]] },
  { n: 'Esfiha fechada de queijo', kcal: 320, p: 12, c: 37, g: 13.5, m: [['unidade (100 g)', 100], ['mini (40 g)', 40]] },
  { n: 'Esfiha fechada de frango com catupiry', kcal: 315, p: 13, c: 36, g: 13, m: [['unidade (100 g)', 100], ['mini (40 g)', 40]] },
  { n: 'Esfiha fechada de carne', kcal: 300, p: 10, c: 38, g: 12, m: [['unidade (100 g)', 100], ['mini (40 g)', 40]] },
  { n: 'Mini esfiha de frango', kcal: 255, p: 12, c: 32, g: 9, m: [['unidade (35 g)', 35]] },
  { n: 'Coxinha de frango', kcal: 290, p: 9, c: 32, g: 14, m: [['unidade (100 g)', 100], ['mini (30 g)', 30]] },
  { n: 'Coxinha de frango com catupiry', kcal: 300, p: 9, c: 32, g: 15, m: [['unidade (100 g)', 100], ['mini (30 g)', 30]] },
  { n: 'Quibe frito (lanchonete)', kcal: 280, p: 12, c: 22, g: 16, m: [['unidade (100 g)', 100], ['mini (30 g)', 30]] },
  { n: 'Enroladinho de salsicha', kcal: 300, p: 9, c: 35, g: 14, m: [['unidade (90 g)', 90], ['mini (35 g)', 35]] },
  { n: 'Enroladinho de presunto e queijo', kcal: 310, p: 12, c: 34, g: 14, m: [['unidade (90 g)', 90], ['mini (35 g)', 35]] },
  { n: 'Joelho (pão com presunto e queijo)', kcal: 300, p: 12, c: 36, g: 12, m: [['unidade (120 g)', 120]] },
  { n: 'Folhado de frango', kcal: 330, p: 9, c: 30, g: 19, m: [['unidade (100 g)', 100]] },
  { n: 'Croissant simples', kcal: 405, p: 8, c: 45, g: 21, m: [['unidade (60 g)', 60]] },
  { n: 'Croissant de presunto e queijo', kcal: 350, p: 13, c: 35, g: 18, m: [['unidade (90 g)', 90]] },
  // Pastel de feira. A massa frita é quase toda a caloria e não muda de sabor
  // para sabor — o que muda é o recheio, que mexe na proteína e na gordura. Por
  // isso os sabores saem dos dois de sempre (carne e queijo) variando só o
  // recheio, e não de uma tabela nova para cada um. O de feira é grande: 100 g
  // é o comum e 130 g o tamanhão.
  { n: 'Pastel de feira, carne', kcal: 320, p: 9, c: 33, g: 17, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, queijo (mussarela)', kcal: 340, p: 10, c: 33, g: 19, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, carne seca com mussarela (charque)', kcal: 355, p: 14, c: 31, g: 19.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, carne seca com catupiry (charque)', kcal: 360, p: 13, c: 31, g: 20.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, carne com queijo', kcal: 345, p: 12, c: 32, g: 19, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, frango com catupiry', kcal: 340, p: 12, c: 32, g: 18, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, frango com queijo', kcal: 345, p: 13, c: 31, g: 19, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, pizza (mussarela, tomate e orégano)', kcal: 335, p: 10, c: 34, g: 17.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, calabresa com queijo', kcal: 370, p: 12, c: 31, g: 22, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, quatro queijos', kcal: 365, p: 13, c: 31, g: 21, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, palmito', kcal: 315, p: 6, c: 35, g: 17, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, camarão', kcal: 320, p: 11, c: 33, g: 16, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, bacalhau', kcal: 325, p: 12, c: 33, g: 16, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, chocolate', kcal: 375, p: 6, c: 46, g: 19, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, banana com canela e açúcar', kcal: 330, p: 5, c: 47, g: 14, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, Romeu e Julieta (queijo com goiabada)', kcal: 365, p: 8, c: 48, g: 16, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },

  // Mais sabores da barraca. A massa e a fritura são as mesmas em todos — o
  // que muda é o recheio, e é ele que move a conta: o de legumes fica em 305
  // kcal por 100 g e o de bacon com queijo em 390, quase 100 kcal de diferença
  // na mesma unidade de 100 g.
  { n: 'Pastel de feira, bauru (presunto, mussarela, tomate e orégano)', kcal: 345, p: 12, c: 32, g: 18.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, misto (presunto com queijo)', kcal: 350, p: 13, c: 32, g: 19, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, portuguesa (presunto, ovo, cebola, azeitona e mussarela)', kcal: 355, p: 13, c: 31, g: 20, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, carne com ovo', kcal: 335, p: 12, c: 32, g: 18, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, carne com azeitona', kcal: 325, p: 10, c: 32, g: 17.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, carne com catupiry', kcal: 350, p: 11, c: 32, g: 20, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, calabresa', kcal: 375, p: 12, c: 31, g: 22.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, calabresa com cebola', kcal: 365, p: 11, c: 32, g: 21.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, bacon com queijo', kcal: 390, p: 13, c: 30, g: 24, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, cheddar com bacon', kcal: 385, p: 13, c: 31, g: 23, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, frango com milho', kcal: 330, p: 12, c: 34, g: 16.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, frango com cheddar', kcal: 350, p: 13, c: 32, g: 19, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, atum', kcal: 320, p: 12, c: 33, g: 16, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, atum com queijo', kcal: 340, p: 14, c: 32, g: 18, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, escarola com bacon', kcal: 350, p: 9, c: 33, g: 20, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, palmito com queijo', kcal: 335, p: 9, c: 34, g: 18, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, milho com queijo', kcal: 340, p: 10, c: 35, g: 18, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, camarão com catupiry', kcal: 340, p: 11, c: 32, g: 18.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, carne de sol com queijo coalho', kcal: 360, p: 14, c: 31, g: 20, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, pernil com queijo', kcal: 365, p: 14, c: 31, g: 20.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, costela', kcal: 350, p: 13, c: 32, g: 19, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, brócolis com queijo', kcal: 330, p: 9, c: 34, g: 17.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, legumes (vegetariano)', kcal: 305, p: 7, c: 36, g: 15, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira, strogonoff de frango', kcal: 345, p: 12, c: 33, g: 18, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, doce de leite', kcal: 360, p: 7, c: 48, g: 16, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, Nutella', kcal: 385, p: 7, c: 47, g: 19.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, chocolate com morango', kcal: 360, p: 6, c: 46, g: 18, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, prestígio (chocolate com coco)', kcal: 390, p: 6, c: 45, g: 21, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, brigadeiro', kcal: 375, p: 7, c: 47, g: 18.5, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, leite ninho com morango', kcal: 370, p: 8, c: 46, g: 18, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Pastel de feira doce, abacaxi com canela', kcal: 320, p: 5, c: 46, g: 13, m: [['unidade (100 g)', 100], ['unidade grande (130 g)', 130]] },
  { n: 'Empada de frango', kcal: 380, p: 9, c: 36, g: 22, m: [['unidade (60 g)', 60]] },
  { n: 'Empadão de frango (fatia)', kcal: 310, p: 11, c: 28, g: 17, m: [['fatia (120 g)', 120]] },
  { n: 'Bauru (misto quente com tomate)', kcal: 260, p: 13, c: 27, g: 11, m: [['unidade (160 g)', 160]] },
  { n: 'Misto quente', kcal: 280, p: 13, c: 30, g: 12, m: [['unidade (140 g)', 140]] },
  { n: 'Pão na chapa (com manteiga)', kcal: 340, p: 8, c: 46, g: 13, m: [['unidade (60 g)', 60]] },
  { n: 'Pão de queijo (assado)', kcal: 335, p: 6, c: 38, g: 17, m: [['unidade média (40 g)', 40], ['unidade grande (70 g)', 70], ['mini (20 g)', 20]] },
  { n: 'Torta salgada de frango (fatia de padaria)', kcal: 260, p: 10, c: 24, g: 13, m: [['fatia (130 g)', 130]] },
  { n: 'Cachorro-quente completo', kcal: 250, p: 9, c: 27, g: 11, m: [['unidade (250 g)', 250]] },

  // ---- Fast food (redes) ----
  { n: 'McDonald’s Big Mac', kcal: 233, p: 12, c: 20, g: 12, m: [['unidade (216 g)', 216]] },
    { n: 'McDonald’s Cheeseburger', kcal: 263, p: 13, c: 27, g: 11, m: [['unidade (115 g)', 115]] },
  { n: 'McDonald’s McChicken', kcal: 249, p: 9, c: 25, g: 12, m: [['unidade (170 g)', 170]] },
  { n: 'McDonald’s batata frita', kcal: 310, p: 4, c: 41, g: 15, m: [['pequena (70 g)', 70], ['média (110 g)', 110], ['grande (150 g)', 150]] },
  { n: 'McDonald’s McNuggets', kcal: 300, p: 15, c: 18, g: 18, m: [['unidade (17 g)', 17], ['caixa 10 un (170 g)', 170]] },
  { n: 'McDonald’s sundae', kcal: 190, p: 4, c: 32, g: 5, m: [['unidade (150 g)', 150]] },
  { n: 'Burger King Whopper', kcal: 233, p: 11, c: 18, g: 13, m: [['unidade (280 g)', 280]] },
  { n: 'Burger King Whopper Jr.', kcal: 240, p: 11, c: 20, g: 13, m: [['unidade (140 g)', 140]] },
  { n: 'Burger King onion rings', kcal: 320, p: 4, c: 41, g: 16, m: [['porção (90 g)', 90]] },
  { n: 'Subway 15 cm frango teriyaki', kcal: 160, p: 10, c: 24, g: 2.5, m: [['sanduíche (220 g)', 220]] },
  { n: 'Subway 15 cm frango defumado', kcal: 150, p: 10, c: 22, g: 2.5, m: [['sanduíche (210 g)', 210]] },
  { n: 'Subway 15 cm B.M.T. italiano', kcal: 200, p: 10, c: 22, g: 8, m: [['sanduíche (210 g)', 210]] },
  { n: 'Subway cookie', kcal: 480, p: 5, c: 63, g: 23, m: [['unidade (45 g)', 45]] },
  { n: 'Bob’s Big Bob', kcal: 240, p: 12, c: 19, g: 13, m: [['unidade (250 g)', 250]] },
  { n: 'Habib’s esfiha de carne', kcal: 250, p: 11, c: 32, g: 9, m: [['unidade (60 g)', 60]] },
  { n: 'KFC frango frito (pedaço)', kcal: 260, p: 19, c: 9, g: 17, m: [['pedaço (110 g)', 110]] },
  { n: 'Giraffas filé com fritas (prato)', kcal: 160, p: 9, c: 16, g: 7, m: [['prato (450 g)', 450]] },

  // ---- Industrializados e itens de mercado comuns ----
  { n: 'Atum em lata, ao natural (em água)', kcal: 100, p: 23, c: 0, g: 1, m: [['lata escorrida (120 g)', 120], ['colher de sopa', 20]] },
  { n: 'Atum em lata, em óleo (escorrido)', kcal: 190, p: 26, c: 0, g: 9, m: [['lata escorrida (120 g)', 120], ['colher de sopa', 20]] },
  { n: 'Sardinha em lata, em óleo', kcal: 210, p: 24, c: 0, g: 12, m: [['lata (84 g escorrida)', 84]] },
  { n: 'Peito de peru defumado, fatiado', kcal: 100, p: 17, c: 3, g: 2, m: [['fatia (15 g)', 15]] },
  { n: 'Requeijão light', kcal: 180, p: 10, c: 4, g: 14, m: [['colher de sopa', 30]] },
  { n: 'Cream cheese', kcal: 250, p: 6, c: 5, g: 23, m: [['colher de sopa', 30]] },
  { n: 'Cream cheese light', kcal: 170, p: 8, c: 6, g: 13, m: [['colher de sopa', 30]] },
  { n: 'Iogurte natural integral', kcal: 60, p: 4, c: 5, g: 3, m: [['pote (170 g)', 170], ['copo (200 g)', 200]] },
  { n: 'Iogurte natural desnatado', kcal: 42, p: 4.5, c: 6, g: 0, m: [['pote (170 g)', 170]] },
  { n: 'Iogurte grego tradicional', kcal: 110, p: 6, c: 14, g: 4, m: [['pote (90 g)', 90], ['pote (170 g)', 170]] },
  { n: 'Iogurte grego zero (alto teor de proteína)', kcal: 60, p: 10, c: 5, g: 0, m: [['pote (140 g)', 140], ['pote (170 g)', 170]] },
  { n: 'Iogurte proteico (tipo YoPRO/Piracanjuba Whey)', kcal: 65, p: 10, c: 6, g: 0.5, m: [['garrafa (250 ml)', 250], ['pote (160 g)', 160]] },
  { n: 'Leite fermentado (tipo Yakult)', kcal: 65, p: 1.2, c: 15, g: 0, m: [['frasco (80 g)', 80]] },
  { n: 'Tomate-cereja', kcal: 18, p: 0.9, c: 3.9, g: 0.2, m: [['unidade (15 g)', 15], ['punhado (100 g)', 100]] },
  { n: 'Mussarela de búfala', kcal: 280, p: 17, c: 2, g: 23, m: [['bolinha (30 g)', 30]] },
  { n: 'Queijo minas padrão', kcal: 320, p: 22, c: 3, g: 25, m: [['fatia (30 g)', 30]] },
  { n: 'Queijo coalho (espeto)', kcal: 330, p: 23, c: 3, g: 26, m: [['espeto (100 g)', 100]] },
  { n: 'Ovo de codorna cozido', kcal: 160, p: 13, c: 1, g: 11, m: [['unidade (10 g)', 10]] },
  { n: 'Pão de forma integral', kcal: 250, p: 12, c: 44, g: 3.5, m: [['fatia (25 g)', 25]] },
  { n: 'Pão low carb', kcal: 240, p: 15, c: 20, g: 11, m: [['fatia (25 g)', 25]] },
  { n: 'Wrap / rap10 integral', kcal: 300, p: 9, c: 52, g: 6, m: [['unidade (35 g)', 35]] },
  { n: 'Biscoito de arroz integral', kcal: 390, p: 8, c: 82, g: 3, m: [['unidade (9 g)', 9]] },
  { n: 'Granola tradicional', kcal: 430, p: 10, c: 68, g: 13, m: [['colher de sopa', 15], ['xícara (100 g)', 100]] },
  { n: 'Aveia em flocos', kcal: 390, p: 14, c: 66, g: 8, m: [['colher de sopa', 15]] },
  { n: 'Leite condensado', kcal: 320, p: 7, c: 55, g: 8, m: [['colher de sopa', 20]] },
  { n: 'Chocolate 70% cacau', kcal: 580, p: 8, c: 34, g: 44, m: [['quadrado (10 g)', 10], ['barra (25 g)', 25]] },
  { n: 'Chocolate ao leite (barra)', kcal: 550, p: 7, c: 57, g: 32, m: [['quadrado (10 g)', 10], ['barra (25 g)', 25], ['barra (90 g)', 90]] },
  { n: 'Bombom (tipo Sonho de Valsa)', kcal: 500, p: 7, c: 60, g: 26, m: [['unidade (21 g)', 21]] },
  { n: 'Paçoca rolha', kcal: 480, p: 14, c: 52, g: 24, m: [['unidade (16 g)', 16]] },
  { n: 'Barra de cereal comum', kcal: 380, p: 5, c: 75, g: 6, m: [['unidade (22 g)', 22]] },
  { n: 'Bolacha recheada (tipo Oreo/Negresco)', kcal: 480, p: 5, c: 70, g: 20, m: [['unidade (11 g)', 11], ['pacote (90 g)', 90]] },
  { n: 'Salgadinho de pacote (tipo Doritos)', kcal: 500, p: 7, c: 60, g: 26, m: [['pacote pequeno (55 g)', 55]] },
  { n: 'Pipoca de micro-ondas (pronta)', kcal: 480, p: 9, c: 55, g: 25, m: [['pacote (50 g)', 50]] },
  { n: 'Sorvete de massa (bola)', kcal: 200, p: 3.5, c: 25, g: 10, m: [['bola (60 g)', 60]] },
  { n: 'Açaí na tigela com granola e banana', kcal: 160, p: 2, c: 26.7, g: 5, m: [['tigela pequena (300 g)', 300], ['tigela média (500 g)', 500]] },
  { n: 'Açaí puro (polpa batida com xarope de guaraná)', kcal: 110, p: 1, c: 18.6, g: 3.5, m: [['copo (300 g)', 300], ['copo (500 g)', 500]] },

  // ---- Docinhos de festa e doces gourmet ----
  { n: 'Brigadeiro tradicional', kcal: 330, p: 4, c: 55, g: 11, m: [['unidade (20 g)', 20], ['colher (brigadeiro de colher)', 40]] },
  { n: 'Brigadeiro de leite ninho', kcal: 380, p: 6, c: 50, g: 17, m: [['unidade (20 g)', 20]] },
  { n: 'Brigadeiro de ninho com Nutella', kcal: 400, p: 6, c: 48, g: 20, m: [['unidade (25 g)', 25]] },
  { n: 'Brigadeiro de pistache', kcal: 390, p: 7, c: 45, g: 20, m: [['unidade (20 g)', 20]] },
  { n: 'Brigadeiro de churros (doce de leite com canela)', kcal: 360, p: 4, c: 55, g: 13, m: [['unidade (20 g)', 20]] },
  { n: 'Brigadeiro de café', kcal: 340, p: 4, c: 54, g: 12, m: [['unidade (20 g)', 20]] },
  { n: 'Brigadeiro de paçoca', kcal: 400, p: 8, c: 48, g: 19, m: [['unidade (20 g)', 20]] },
  { n: 'Surpresa de uva (docinho de ninho com uva)', kcal: 280, p: 4, c: 40, g: 11, m: [['unidade (30 g)', 30]] },
  { n: 'Bombom de morango (brigadeiro branco e chocolate)', kcal: 300, p: 4, c: 38, g: 15, m: [['unidade (40 g)', 40]] },
  { n: 'Morango do amor', kcal: 330, p: 2, c: 60, g: 9, m: [['unidade (90 g)', 90]] },
  { n: 'Maçã do amor', kcal: 280, p: 1, c: 65, g: 3, m: [['unidade (130 g)', 130]] },
  { n: 'Cajuzinho', kcal: 380, p: 8, c: 50, g: 16, m: [['unidade (20 g)', 20]] },

  // ---- Família Dadinho: o que veio depois da bala ----
  // A bala clássica tem rótulo e está em marcas.mjs. Estes quatro são a linha
  // que a marca abriu a partir de 2016 (Zero, Duo, Roll e os bombons) e para
  // os quais não achei tabela publicada: os valores são estimativa a partir da
  // bala tradicional mais a cobertura ou o wafer de cada um, e os pesos de
  // unidade também. O app marca tudo isto como estimativa — vale conferir na
  // embalagem antes de usar como referência.
  { n: 'Bala Dadinho Zero (sem adição de açúcar)', kcal: 480, p: 7, c: 55, g: 27, m: [['unidade (6 g)', 6], ['porção (30 g)', 30]] },
  { n: 'Bala Dadinho Duo (com chocolate)', kcal: 530, p: 7, c: 57, g: 31, m: [['unidade (15 g)', 15], ['porção (30 g)', 30]] },
  { n: 'Wafer Dadinho Roll (coberto de chocolate)', kcal: 510, p: 6, c: 58, g: 28, m: [['unidade (20 g)', 20], ['porção (30 g)', 30]] },
  { n: 'Bombom de Dadinho (creme de amendoim com chocolate)', kcal: 520, p: 6.5, c: 57, g: 30, m: [['unidade (15 g)', 15], ['porção (30 g)', 30]] },
  { n: 'Bicho de pé (docinho de morango)', kcal: 350, p: 4, c: 55, g: 12, m: [['unidade (20 g)', 20]] },
  { n: 'Olho de sogra', kcal: 370, p: 4, c: 58, g: 13, m: [['unidade (25 g)', 25]] },
  { n: 'Camafeu de nozes', kcal: 420, p: 6, c: 50, g: 21, m: [['unidade (25 g)', 25]] },
  { n: 'Palha italiana tradicional', kcal: 400, p: 5, c: 55, g: 18, m: [['quadrado (60 g)', 60]] },
  { n: 'Palha italiana de leite ninho', kcal: 420, p: 6, c: 52, g: 21, m: [['quadrado (60 g)', 60]] },
  { n: 'Trufa de chocolate', kcal: 450, p: 5, c: 48, g: 26, m: [['unidade (30 g)', 30]] },
  { n: 'Cone trufado', kcal: 430, p: 6, c: 48, g: 24, m: [['unidade (90 g)', 90]] },
  { n: 'Copo da felicidade (morango, ninho e chocolate)', kcal: 250, p: 4, c: 30, g: 12, m: [['copo (250 g)', 250]] },
  { n: 'Bolo de pote (ninho com morango, prestígio etc.)', kcal: 270, p: 4, c: 35, g: 12, m: [['pote (200 g)', 200]] },
  { n: 'Torta gelada de limão (fatia)', kcal: 280, p: 4, c: 34, g: 14, m: [['fatia (100 g)', 100]] },
  { n: 'Torta de limão (fatia)', kcal: 350, p: 5, c: 40, g: 19, m: [['fatia (110 g)', 110]] },
  { n: 'Pudim de leite condensado (fatia)', kcal: 200, p: 5, c: 33, g: 5.5, m: [['fatia (110 g)', 110]] },
  { n: 'Quindim', kcal: 400, p: 6, c: 55, g: 18, m: [['unidade (35 g)', 35]] },
  { n: 'Cocada branca', kcal: 440, p: 2, c: 65, g: 19, m: [['unidade (40 g)', 40]] },
  { n: 'Pé de moleque', kcal: 470, p: 12, c: 55, g: 22, m: [['unidade (30 g)', 30]] },
  { n: 'Maria mole', kcal: 300, p: 3, c: 70, g: 1, m: [['unidade (30 g)', 30]] },
  { n: 'Suspiro', kcal: 380, p: 5, c: 90, g: 0, m: [['unidade (10 g)', 10]] },
  { n: 'Geladinho (dindin) gourmet de ninho', kcal: 150, p: 2, c: 20, g: 6.5, m: [['unidade (100 g)', 100]] },
  { n: 'Brownie de chocolate (padaria)', kcal: 420, p: 5, c: 50, g: 22, m: [['unidade (80 g)', 80]] },
  { n: 'Cookie recheado (estilo americano)', kcal: 470, p: 5, c: 60, g: 23, m: [['unidade (70 g)', 70]] },
  { n: 'Bolo vulcão de chocolate (fatia)', kcal: 340, p: 4, c: 48, g: 15, m: [['fatia (100 g)', 100]] },
  { n: 'Bolo vulcão de leite ninho (fatia)', kcal: 350, p: 5, c: 47, g: 16, m: [['fatia (100 g)', 100]] },
  { n: 'Bolo red velvet (fatia)', kcal: 380, p: 4, c: 45, g: 20, m: [['fatia (100 g)', 100]] },
  { n: 'Donut confeitado', kcal: 400, p: 5, c: 50, g: 20, m: [['unidade (70 g)', 70]] },
  { n: 'Sonho de padaria (com creme)', kcal: 300, p: 6, c: 40, g: 13, m: [['unidade (90 g)', 90], ['mini (40 g)', 40]] },
  { n: 'Sonho de padaria com doce de leite', kcal: 320, p: 5.5, c: 44, g: 14, m: [['unidade (90 g)', 90], ['mini (40 g)', 40]] },
  { n: 'Sonho de padaria com chocolate (brigadeiro)', kcal: 330, p: 5.5, c: 44, g: 15, m: [['unidade (90 g)', 90], ['mini (40 g)', 40]] },
  { n: 'Sonho de padaria com goiabada', kcal: 305, p: 5, c: 45, g: 12, m: [['unidade (90 g)', 90], ['mini (40 g)', 40]] },
  { n: 'Rocambole de doce de leite (fatia)', kcal: 330, p: 5, c: 50, g: 12, m: [['fatia (80 g)', 80]] },
  { n: 'Alfajor', kcal: 450, p: 5, c: 60, g: 21, m: [['unidade (50 g)', 50]] },
  { n: 'Ovo de Páscoa ao leite', kcal: 550, p: 7, c: 57, g: 33, m: [['pedaço (25 g)', 25]] },
  { n: 'Chocolate branco (barra)', kcal: 560, p: 6, c: 58, g: 33, m: [['quadrado (10 g)', 10], ['barra (25 g)', 25]] },
  { n: 'Picolé de frutas', kcal: 90, p: 0, c: 22, g: 0, m: [['unidade (60 g)', 60]] },
  { n: 'Picolé de chocolate', kcal: 220, p: 3, c: 28, g: 10, m: [['unidade (65 g)', 65]] },
  { n: 'Açaí com leite ninho e Nutella (copo)', kcal: 200, p: 3, c: 29.0, g: 8, m: [['copo (300 g)', 300], ['copo (500 g)', 500]] },
  { n: 'Milk-shake de chocolate', kcal: 160, p: 3, c: 24, g: 6, m: [['copo (400 ml)', 400]] },
  { n: 'Chocolate quente cremoso', kcal: 120, p: 3, c: 18, g: 4, m: [['xícara (200 ml)', 200]] },
  { n: 'Gelatina (pote)', kcal: 60, p: 1, c: 14, g: 0, m: [['pote (110 g)', 110]] },
  { n: 'Petit suisse (tipo Danoninho)', kcal: 100, p: 6, c: 13, g: 2.5, m: [['unidade (45 g)', 45]] },
  { n: 'Arroz doce', kcal: 150, p: 3, c: 28, g: 3, m: [['taça (120 g)', 120]] },
  { n: 'Canjica doce (mungunzá)', kcal: 130, p: 3, c: 24, g: 2.5, m: [['tigela (200 g)', 200]] },

  // ---- Bebidas comuns ----
  { n: 'Refrigerante zero/diet', kcal: 0, p: 0, c: 0, g: 0, m: [['lata (350 ml)', 350], ['copo (250 ml)', 250]] },
  { n: 'Água de coco', kcal: 22, p: 0, c: 5.3, g: 0, m: [['copo (250 ml)', 250], ['caixinha (200 ml)', 200]] },
  { n: 'Bebida isotônica (tipo Gatorade)', kcal: 24, p: 0, c: 6, g: 0, m: [['garrafa (500 ml)', 500]] },
  { n: 'Energético (tipo Red Bull/Monster)', kcal: 45, p: 0, c: 11, g: 0, m: [['lata (250 ml)', 250], ['lata (473 ml)', 473]] },
  { n: 'Energético zero', kcal: 3, p: 0, c: 0.5, g: 0, m: [['lata (250 ml)', 250], ['lata (473 ml)', 473]] },
  { n: 'Café com leite (média, sem açúcar)', kcal: 35, p: 2, c: 3, g: 1.5, m: [['xícara (150 ml)', 150], ['copo (200 ml)', 200]] },
  { n: 'Cappuccino de máquina', kcal: 45, p: 2, c: 6, g: 1.5, m: [['xícara (180 ml)', 180]] },
  // ---- Sucos naturais: a fruta batida na hora, sem açúcar ----
  // O banco tinha suco de quase toda fruta, mas vindo das tabelas
  // internacionais: "Suco, pêssego, enlatado, em calda", "Suco de uva,
  // enlatado ou bottled". Nenhum deles é o copo que sai do liquidificador de
  // casa ou do balcão da lanchonete, que é o que se toma aqui.
  //
  // Todos sem açúcar — é o "puro" que se pede. Quem adoça soma à parte: uma
  // colher de sopa rasa num copo de 250 ml põe cerca de 48 kcal.
  //
  // Banana e abacate não dão suco, dão vitamina: a fruta não solta líquido, vai
  // batida com leite. Estão mais abaixo, com o nome que as pessoas usam entre
  // parênteses, senão quem procura "suco de banana" não acha nada — que foi
  // exatamente o que aconteceu.
  { n: 'Suco de laranja natural (sem açúcar)', kcal: 45, p: 0.7, c: 10.4, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200], ['copo grande (400 ml)', 400], ['jarra (1 L)', 1000]] },
  { n: 'Suco de kiwi natural (sem açúcar)', kcal: 45, p: 0.9, c: 10, g: 0.3, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de morango natural (sem açúcar)', kcal: 32, p: 0.6, c: 7, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de abacaxi natural (sem açúcar)', kcal: 48, p: 0.4, c: 11.5, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de maracujá natural (sem açúcar)', kcal: 45, p: 0.8, c: 10.2, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de limão natural (limonada sem açúcar)', kcal: 22, p: 0.4, c: 4.7, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de melancia natural (sem açúcar)', kcal: 30, p: 0.6, c: 6.7, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de manga natural (sem açúcar)', kcal: 55, p: 0.5, c: 13.2, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200]] },
  { n: 'Suco de goiaba natural (sem açúcar)', kcal: 45, p: 0.7, c: 10.4, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200]] },
  { n: 'Suco de acerola natural (sem açúcar)', kcal: 25, p: 0.4, c: 5.4, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de caju natural (sem açúcar)', kcal: 42, p: 0.8, c: 9.6, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de uva integral natural (sem açúcar)', kcal: 60, p: 0.4, c: 14.6, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200]] },
  { n: 'Suco de maçã natural (sem açúcar)', kcal: 48, p: 0.2, c: 11.7, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200]] },
  { n: 'Suco de mamão natural (sem açúcar)', kcal: 40, p: 0.6, c: 9.4, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de melão natural (sem açúcar)', kcal: 32, p: 0.6, c: 7.2, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de pêssego natural (sem açúcar)', kcal: 42, p: 0.7, c: 9.8, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200]] },
  { n: 'Suco de tangerina / mexerica natural (sem açúcar)', kcal: 43, p: 0.6, c: 10, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de graviola natural (sem açúcar)', kcal: 48, p: 0.7, c: 11.2, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo pequeno (200 ml)', 200]] },
  { n: 'Suco de cajá natural (sem açúcar)', kcal: 40, p: 0.6, c: 9.3, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },

  // ---- Misturas de balcão ----
  { n: 'Suco de laranja com acerola natural (sem açúcar)', kcal: 42, p: 0.6, c: 9.8, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de laranja com morango natural (sem açúcar)', kcal: 40, p: 0.7, c: 8.9, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de morango com kiwi natural (sem açúcar)', kcal: 38, p: 0.8, c: 8.3, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de abacaxi com hortelã natural (sem açúcar)', kcal: 45, p: 0.4, c: 10.8, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de abacaxi com gengibre natural (sem açúcar)', kcal: 46, p: 0.4, c: 11, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco de melancia com limão natural (sem açúcar)', kcal: 30, p: 0.6, c: 6.7, g: 0.1, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Limonada suíça (com açúcar)', kcal: 60, p: 0.4, c: 14.6, g: 0.2, l: 1, m: [['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Suco verde (couve, limão, gengibre)', kcal: 30, p: 1, c: 6.4, g: 0, l: 1, m: [['copo (300 ml)', 300], ['copo (250 ml)', 250]] },

  // ---- Montevérgine: o resto do catálogo ----
  // O site da marca está fora do alcance daqui (o proxy de saída não resolve
  // o domínio), então a lista de linhas veio de resumo de busca e as tabelas
  // destes itens não vieram de lugar nenhum. Os valores são de categoria, e
  // por isso estão aqui e não em marcas.mjs.
  //
  // Entra o que dá para afirmar o que É: a própria marca se descreve como
  // líder em torrone e em bombom de cereja, e os nomes de Tomallows, Pingo de
  // Leite, Nougat Whey, Mix Nuts, barra de cereais e doce de leite dizem a
  // categoria sozinhos. Ficaram de fora Tubin, Tu-Big, Tocata, Palitos,
  // Matinal e Torrone Sports: sei que existem, não sei o que são — chutar
  // entre wafer e barra move a conta em 100 kcal, e isso não é estimativa, é
  // invenção.
  { n: 'Pastilha Mentinha Montevérgine 70% cacau (chocolate amargo com menta)', kcal: 570, p: 6, c: 44, g: 40, m: [['pastilha (3,5 g)', 3.5], ['porção 7 pastilhas (25 g)', 25], ['caixa (70 g)', 70]] },
  { n: 'Torrone Vermelho Montevérgine (o clássico)', kcal: 415, p: 6, c: 74, g: 10.5, m: [['unidade (17 g)', 17], ['barra (45 g)', 45], ['barra (90 g)', 90]] },
  { n: 'Torrone Premium Montevérgine (com castanhas)', kcal: 430, p: 7, c: 70, g: 13, m: [['barra (45 g)', 45], ['barra (90 g)', 90]] },
  { n: 'Pick Nick Montevérgine (torrone com chocolate)', kcal: 440, p: 6, c: 68, g: 16, m: [['unidade (20 g)', 20], ['barra (45 g)', 45]] },
  { n: 'Pick Nick Zero Montevérgine (sem açúcar)', kcal: 400, p: 6, c: 60, g: 16, m: [['unidade (20 g)', 20], ['barra (45 g)', 45]] },
  { n: 'Nougat Whey Montevérgine (nougat proteico)', kcal: 380, p: 20, c: 50, g: 10, m: [['unidade (30 g)', 30], ['barra (45 g)', 45]] },
  { n: 'Bombom de cereja Montevérgine', kcal: 400, p: 3, c: 62, g: 16, m: [['unidade (15 g)', 15], ['caixa (100 g)', 100]] },
  { n: 'Tomallows Montevérgine (marshmallow)', kcal: 330, p: 4, c: 78, g: 0.5, m: [['unidade (7 g)', 7], ['pacote (80 g)', 80]] },
  { n: 'Pingo de Leite Montevérgine (bala de leite)', kcal: 390, p: 1.5, c: 88, g: 3.5, m: [['unidade (5 g)', 5], ['pacote (100 g)', 100]] },
  { n: 'Barra de cereais Montevérgine', kcal: 400, p: 6, c: 70, g: 10, m: [['unidade (25 g)', 25]] },
  { n: 'Mix Nuts Montevérgine', kcal: 600, p: 18, c: 20, g: 50, m: [['punhado (30 g)', 30], ['pacote (100 g)', 100]] },
  { n: 'Doce de leite Montevérgine', kcal: 315, p: 5.5, c: 58, g: 6.5, m: [['colher de sopa (20 g)', 20], ['pote (400 g)', 400]] },

  // ---- Açaí ----
  // Duas coisas diferentes com o mesmo nome, e misturá-las erra a conta pela
  // metade. O SUCO é a polpa batida com água, bebida de copo, e vai aqui em
  // ml. O CREME é a polpa batida grossa que se come de colher, e vai em grama
  // logo abaixo — o mesmo copo de 300 traz 93 kcal de suco com banana e 118
  // de creme com banana, porque o creme é quase só polpa.
  //
  // A gordura é a assinatura do açaí e a razão de ele não se parecer com suco
  // de fruta nenhum: mesmo o puro sem açúcar tem 2,4 g de gordura por 100 ml,
  // mais que qualquer outro suco desta lista. Metade da caloria dele vem daí,
  // não do açúcar — por isso a versão "sem açúcar" ainda tem 47 kcal, enquanto
  // o suco de morango sem açúcar tem 32.
  { n: 'Suco de açaí puro', kcal: 47, p: 0.9, c: 5.5, g: 2.4, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com açúcar (tradicional)', kcal: 81, p: 0.9, c: 14, g: 2.4, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com guaraná (xarope)', kcal: 88, p: 0.8, c: 16, g: 2.3, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com banana', kcal: 93, p: 1.2, c: 16.5, g: 2.5, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com morango', kcal: 78, p: 1, c: 13, g: 2.4, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com kiwi', kcal: 82, p: 1.1, c: 14, g: 2.4, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com manga', kcal: 88, p: 1, c: 15.5, g: 2.4, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com abacaxi', kcal: 83, p: 0.9, c: 14.5, g: 2.4, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com maracujá', kcal: 82, p: 1, c: 14, g: 2.4, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com laranja', kcal: 82, p: 1, c: 14, g: 2.4, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com leite', kcal: 95, p: 2.6, c: 13.5, g: 3.4, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },
  { n: 'Suco de açaí com leite condensado', kcal: 118, p: 2.2, c: 20, g: 3.2, l: 1, m: [['copo (300 ml)', 300], ['copo pequeno (200 ml)', 200], ['copo grande (500 ml)', 500]] },

  { n: 'Açaí no copo com banana', kcal: 118, p: 1.5, c: 20, g: 3.5, m: [['copo (300 g)', 300], ['copo pequeno (200 g)', 200], ['copo grande (500 g)', 500]] },
  { n: 'Açaí no copo com morango', kcal: 108, p: 1.3, c: 18, g: 3.4, m: [['copo (300 g)', 300], ['copo pequeno (200 g)', 200], ['copo grande (500 g)', 500]] },
  { n: 'Açaí no copo com banana e granola', kcal: 149, p: 2.2, c: 25, g: 4.5, m: [['copo (300 g)', 300], ['copo pequeno (200 g)', 200], ['copo grande (500 g)', 500]] },
  { n: 'Açaí no copo com morango e leite em pó', kcal: 138, p: 2.4, c: 23, g: 4, m: [['copo (300 g)', 300], ['copo pequeno (200 g)', 200], ['copo grande (500 g)', 500]] },

  // ---- Vitaminas: a fruta que não vira suco ----
  { n: 'Suco de banana — na verdade vitamina, com leite', kcal: 85, p: 3.2, c: 14, g: 1.8, l: 1, m: [['copo (300 ml)', 300], ['copo (250 ml)', 250], ['copo grande (400 ml)', 400]] },
  { n: 'Vitamina de banana com aveia e leite', kcal: 90, p: 3, c: 15, g: 2, l: 1, m: [['copo (300 ml)', 300], ['copo (250 ml)', 250]] },
  { n: 'Vitamina de banana com morango e leite', kcal: 78, p: 3.1, c: 12.5, g: 1.8, l: 1, m: [['copo (300 ml)', 300], ['copo (250 ml)', 250]] },
  { n: 'Vitamina de morango com leite', kcal: 65, p: 3, c: 9.5, g: 1.7, l: 1, m: [['copo (300 ml)', 300], ['copo (250 ml)', 250]] },
  { n: 'Suco de abacate — na verdade vitamina, com leite', kcal: 120, p: 2.8, c: 9, g: 8, l: 1, m: [['copo (300 ml)', 300], ['copo (250 ml)', 250]] },
  { n: 'Vitamina de mamão com leite', kcal: 70, p: 3, c: 11, g: 1.7, l: 1, m: [['copo (300 ml)', 300], ['copo (250 ml)', 250]] },
  { n: 'Caipirinha', kcal: 190, p: 0, c: 21, g: 0, m: [['copo (200 ml)', 200]] },
  { n: 'Gin tônica', kcal: 76, p: 0, c: 7, g: 0, m: [['taça (300 ml)', 300]] },
  { n: 'Chope (claro)', kcal: 41, p: 0.5, c: 3.3, g: 0, m: [['tulipa (300 ml)', 300], ['caldereta (350 ml)', 350]] },
  { n: 'Cerveja zero álcool', kcal: 22, p: 0.3, c: 5, g: 0, m: [['lata (350 ml)', 350], ['long neck (330 ml)', 330]] },
  { n: 'Vinho tinto seco', kcal: 85, p: 0, c: 2.6, g: 0, m: [['taça (150 ml)', 150]] },
  { n: 'Whisky', kcal: 250, p: 0, c: 0, g: 0, m: [['dose (50 ml)', 50]] },

  // ---- Pratos de restaurante e delivery ----
  { n: 'Catupiry (requeijão cremoso culinário)', kcal: 260, p: 9, c: 3, g: 24, m: [['colher de sopa', 30]] },
  { n: 'Filé mignon ao catupiry', kcal: 190, p: 20, c: 2, g: 11, m: [['porção (250 g)', 250]] },
  { n: 'Filé mignon à parmegiana', kcal: 180, p: 14, c: 8, g: 10, m: [['porção (300 g)', 300]] },
  { n: 'Filé mignon à parmegiana com arroz e fritas (prato)', kcal: 160, p: 9, c: 15, g: 7, m: [['prato (500 g)', 500]] },
  { n: 'Filé mignon ao molho madeira', kcal: 150, p: 18, c: 4, g: 7, m: [['porção (250 g)', 250]] },
  { n: 'Filé mignon ao molho mostarda', kcal: 170, p: 17, c: 3, g: 10, m: [['porção (250 g)', 250]] },
  { n: 'Filé mignon ao molho gorgonzola', kcal: 200, p: 18, c: 2, g: 13, m: [['porção (250 g)', 250]] },

  // Molho de cerveja: cerveja reduzida com cebola, manteiga e um pouco de
  // creme — prato de casa alemã, comum em Gramado e Blumenau. O álcool evapora
  // na redução; o que fica é o malte, e por isso o molho tem carboidrato onde
  // o madeira quase não tem.
  //
  // O par do pato é o que vale olhar: com pele, a porção tem quase 50% mais
  // caloria que a mesma porção de filé, e a diferença é gordura da pele quase
  // inteira. Tirar a pele derruba a porção de 635 para 405 kcal — por isso as
  // duas versões estão separadas, e não numa média que não corresponde a
  // nenhum prato real.
  { n: 'Filé mignon ao molho de cerveja com cogumelos', kcal: 170, p: 19.5, c: 3, g: 8.8, m: [['porção (250 g)', 250]] },
  { n: 'Pato ao molho de cerveja (com pele)', kcal: 254, p: 13.4, c: 2.2, g: 21.2, m: [['porção (250 g)', 250]] },
  { n: 'Pato ao molho de cerveja (sem a pele)', kcal: 162, p: 18.2, c: 2.2, g: 8.7, m: [['porção (250 g)', 250]] },
  { n: 'Molho de cerveja com cogumelos', kcal: 95, p: 2, c: 6, g: 7, m: [['colher de sopa (20 g)', 20], ['porção (90 g)', 90]] },
  { n: 'Frango à parmegiana', kcal: 190, p: 14, c: 12, g: 10, m: [['porção (300 g)', 300]] },
  { n: 'Frango ao catupiry', kcal: 180, p: 16, c: 6, g: 10, m: [['porção (250 g)', 250]] },
  { n: 'Frango xadrez', kcal: 120, p: 11, c: 8, g: 5, m: [['porção (300 g)', 300]] },
  { n: 'Frango grelhado com legumes (executivo)', kcal: 110, p: 12, c: 8, g: 4, m: [['prato (400 g)', 400]] },
  { n: 'Frango empanado frito (tipo karaagê)', kcal: 260, p: 16, c: 12, g: 16, m: [['porção (200 g)', 200]] },
  { n: 'Picanha grelhada (churrascaria)', kcal: 290, p: 25, c: 0, g: 21, m: [['porção (150 g)', 150]] },
  { n: 'Bife à cavalo (com ovo frito)', kcal: 230, p: 22, c: 1, g: 16, m: [['porção (220 g)', 220]] },
  { n: 'Bife à rolê', kcal: 170, p: 17, c: 4, g: 9, m: [['unidade (150 g)', 150]] },
  { n: 'Carne de panela com mandioca', kcal: 140, p: 12, c: 9, g: 6, m: [['porção (300 g)', 300]] },
  { n: 'Carne louca (desfiada)', kcal: 160, p: 18, c: 3, g: 8, m: [['porção (150 g)', 150]] },
  { n: 'Carne seca acebolada', kcal: 250, p: 26, c: 3, g: 15, m: [['porção (150 g)', 150]] },
  { n: 'Rabada', kcal: 290, p: 18, c: 2, g: 23, m: [['porção (300 g)', 300]] },
  { n: 'Vaca atolada', kcal: 180, p: 12, c: 10, g: 10, m: [['porção (350 g)', 350]] },
  { n: 'Escondidinho de carne seca', kcal: 160, p: 9, c: 14, g: 8, m: [['porção (350 g)', 350]] },
  { n: 'Escondidinho de frango', kcal: 150, p: 10, c: 14, g: 6, m: [['porção (350 g)', 350]] },
  { n: 'Parmegiana de berinjela', kcal: 130, p: 6, c: 10, g: 8, m: [['porção (300 g)', 300]] },
  { n: 'Strogonoff de frango com arroz e batata palha (prato)', kcal: 180, p: 9, c: 18, g: 8, m: [['prato (450 g)', 450]] },
  { n: 'Strogonoff de carne com arroz e batata palha (prato)', kcal: 185, p: 9, c: 18, g: 9, m: [['prato (450 g)', 450]] },
  { n: 'Feijoada completa com arroz, couve e farofa (prato)', kcal: 190, p: 10, c: 17, g: 9, m: [['prato (500 g)', 500]] },
  { n: 'Virado à paulista (prato)', kcal: 200, p: 11, c: 16, g: 10, m: [['prato (450 g)', 450]] },
  { n: 'Baião de dois', kcal: 160, p: 9, c: 20, g: 5, m: [['porção (300 g)', 300]] },
  { n: 'Arroz carreteiro', kcal: 170, p: 10, c: 18, g: 7, m: [['porção (300 g)', 300]] },
  { n: 'Galinhada', kcal: 150, p: 10, c: 18, g: 5, m: [['porção (350 g)', 350]] },
  { n: 'Arroz de forno com frango e catupiry', kcal: 170, p: 9, c: 20, g: 6, m: [['porção (350 g)', 350]] },
  { n: 'Moqueca de peixe', kcal: 120, p: 12, c: 4, g: 7, m: [['porção (350 g)', 350]] },
  { n: 'Bobó de camarão', kcal: 140, p: 8, c: 10, g: 8, m: [['porção (300 g)', 300]] },
  { n: 'Camarão ao alho e óleo', kcal: 150, p: 18, c: 1, g: 8, m: [['porção (200 g)', 200]] },
  { n: 'Camarão empanado frito', kcal: 250, p: 14, c: 18, g: 13, m: [['porção (150 g)', 150]] },
  { n: 'Filé de tilápia empanado frito', kcal: 220, p: 18, c: 12, g: 11, m: [['filé (150 g)', 150]] },
  { n: 'Salmão grelhado com legumes', kcal: 160, p: 18, c: 3, g: 8, m: [['porção (300 g)', 300]] },
  { n: 'Peixada (peixe cozido com legumes)', kcal: 110, p: 13, c: 4, g: 5, m: [['porção (400 g)', 400]] },
  { n: 'Macarrão à bolonhesa', kcal: 150, p: 7, c: 20, g: 4, m: [['prato (400 g)', 400]] },
  { n: 'Macarrão alho e óleo', kcal: 180, p: 5, c: 26, g: 6, m: [['prato (350 g)', 350]] },
  { n: 'Macarrão à carbonara', kcal: 190, p: 8, c: 22, g: 8, m: [['prato (400 g)', 400]] },
  { n: 'Macarrão ao molho branco com frango', kcal: 170, p: 9, c: 19, g: 7, m: [['prato (400 g)', 400]] },
  { n: 'Nhoque ao sugo', kcal: 140, p: 4, c: 24, g: 3, m: [['prato (350 g)', 350]] },

  // Nhoque de banana da terra: a massa é banana cozida amassada com um pouco
  // de farinha e gema — as receitas com peso ficam em torno de 90% banana e
  // 10% farinha, não o contrário. Daí vem o aviso que a conta dá: trocar a
  // batata pela banana da terra tira pouca caloria (150 contra 181 por 100 g
  // do nhoque de batata da TACO) e não tira carboidrato nenhum, porque
  // banana da terra é amido. É uma troca de sabor e de glúten, não de macro.
  //
  // A soma de Atwater fica ~5% acima da caloria, e isso vem da própria
  // banana: ela tem fibra e amido resistente, que entram no carboidrato mas
  // rendem menos energia que 4 kcal/g.
  { n: 'Nhoque de banana da terra (cozido, sem molho)', kcal: 150, p: 2.7, c: 33.5, g: 1.5, m: [['porção (150 g)', 150], ['prato (300 g)', 300]] },
  { n: 'Nhoque de banana da terra ao sugo', kcal: 124, p: 2.4, c: 25.9, g: 1.9, m: [['prato (350 g)', 350], ['porção (175 g)', 175]] },
  { n: 'Nhoque de banana da terra com carne seca', kcal: 167, p: 7.6, c: 26.2, g: 4.2, m: [['prato (320 g)', 320], ['porção (160 g)', 160]] },
  { n: 'Nhoque de banana da terra na manteiga com sálvia', kcal: 202, p: 3.7, c: 30.1, g: 8.3, m: [['prato (280 g)', 280], ['porção (140 g)', 140]] },

  // ---- Joelho de porco (Eisbein) com chucrute ----
  // O que o restaurante traz é o joelho COM OSSO, e o osso, a pele que
  // ninguém come e a gordura que fica no prato são mais da metade do peso:
  // de um joelho de 900 g sai algo perto de 350 g de carne. Por isso as
  // medidas daqui falam em grama de CARNE, não do que veio à mesa — pesar o
  // prato inteiro contaria o osso como se fosse comida.
  //
  // A carne com pele fica em 260-280 kcal por 100 g nas fontes, com proteína
  // e gordura quase empatadas. É o oposto do lombo (210 kcal, P 35,7, G 6,4
  // na TACO): mesmo porco, outro corte, outra conta.
  { n: 'Joelho de porco assado (Eisbein, só a carne)', kcal: 268, p: 20.5, c: 0, g: 20.5, m: [['porção de carne (180 g)', 180], ['joelho inteiro, só a carne (350 g)', 350]] },
  { n: 'Joelho de porco com chucrute (prato, Eisbein)', kcal: 207, p: 14.9, c: 1.3, g: 15.7, m: [['prato (420 g)', 420], ['meia porção (210 g)', 210]] },
  { n: 'Joelho de porco com chucrute e purê de batata (prato, Eisbein)', kcal: 182, p: 11.5, c: 4.9, g: 12.8, m: [['prato (570 g)', 570], ['meia porção (285 g)', 285]] },
  { n: 'Chucrute refogado', kcal: 55, p: 1, c: 4.5, g: 3.8, m: [['porção (120 g)', 120], ['colher de sopa (25 g)', 25]] },
  { n: 'Ravióli de queijo ao sugo', kcal: 180, p: 8, c: 26, g: 5, m: [['prato (350 g)', 350]] },
  { n: 'Risoto de camarão', kcal: 160, p: 7, c: 20, g: 6, m: [['prato (400 g)', 400]] },
  { n: 'Risoto de frango', kcal: 170, p: 9, c: 21, g: 6, m: [['prato (400 g)', 400]] },
  // O resto da carta de risoto, no prato de 400 g como os dois acima. Montados
  // pela composição: base de arroz com manteiga, parmesão e caldo (~160 kcal
  // por 100 g) mais o que dá nome ao prato.
  //
  // O de linguiça com tomate seco pesa por um motivo que não está no nome: o
  // tomate seco vem conservado em óleo, então ele e a calabresa empilham
  // gordura em cima de uma base que já leva manteiga e queijo. Dá 793 kcal no
  // prato, contra 680 do de frango e 540 do de funghi — só o de quatro queijos
  // passa dele, com 832.
  { n: 'Risoto de linguiça com tomate seco', kcal: 198, p: 6.5, c: 18.3, g: 11.2, m: [['prato (400 g)', 400], ['meia porção (200 g)', 200]] },
  { n: 'Risoto de funghi (cogumelos)', kcal: 135, p: 3.3, c: 19.8, g: 4.5, m: [['prato (400 g)', 400], ['meia porção (200 g)', 200]] },
  { n: 'Risoto de quatro queijos', kcal: 208, p: 8.1, c: 18, g: 11.1, m: [['prato (400 g)', 400], ['meia porção (200 g)', 200]] },
  { n: 'Risoto de filé mignon', kcal: 176, p: 11.9, c: 16.3, g: 6.7, m: [['prato (400 g)', 400], ['meia porção (200 g)', 200]] },
  { n: 'Risoto de abóbora com gorgonzola', kcal: 157, p: 5, c: 17.3, g: 7.3, m: [['prato (400 g)', 400], ['meia porção (200 g)', 200]] },
  { n: 'X-burguer', kcal: 250, p: 12, c: 23, g: 12, m: [['unidade (200 g)', 200]] },
  { n: 'X-salada', kcal: 230, p: 12, c: 20, g: 11, m: [['unidade (250 g)', 250]] },
  { n: 'X-bacon', kcal: 280, p: 14, c: 20, g: 16, m: [['unidade (250 g)', 250]] },
  { n: 'X-tudo', kcal: 260, p: 13, c: 19, g: 15, m: [['unidade (350 g)', 350]] },
  { n: 'X-egg', kcal: 250, p: 13, c: 20, g: 13, m: [['unidade (270 g)', 270]] },
  { n: 'Hambúrguer artesanal (pão brioche, queijo)', kcal: 280, p: 15, c: 18, g: 16, m: [['unidade (300 g)', 300]] },
  { n: 'Beirute de rosbife', kcal: 220, p: 13, c: 22, g: 9, m: [['unidade (350 g)', 350]] },
  { n: 'Sanduíche natural de frango', kcal: 180, p: 11, c: 20, g: 6, m: [['unidade (150 g)', 150]] },
  { n: 'Wrap de frango com salada', kcal: 190, p: 13, c: 20, g: 6, m: [['unidade (200 g)', 200]] },
  { n: 'Tapioca com frango e catupiry', kcal: 170, p: 9, c: 25, g: 4, m: [['unidade (180 g)', 180]] },
  { n: 'Tapioca com queijo coalho', kcal: 210, p: 8, c: 28, g: 7, m: [['unidade (150 g)', 150]] },
  { n: 'Crepe de frango com catupiry', kcal: 190, p: 10, c: 20, g: 8, m: [['unidade (200 g)', 200]] },
  { n: 'Batata recheada com frango e catupiry', kcal: 130, p: 8, c: 15, g: 4, m: [['unidade (400 g)', 400]] },
  { n: 'Pastel de forno de frango', kcal: 320, p: 9, c: 40, g: 13, m: [['unidade (90 g)', 90]] },
  { n: 'Croquete de carne', kcal: 290, p: 13, c: 22, g: 17, m: [['unidade (60 g)', 60]] },
  { n: 'Bolinho de bacalhau', kcal: 250, p: 13, c: 20, g: 13, m: [['unidade (40 g)', 40]] },
  { n: 'Bolinha de queijo (bolinho)', kcal: 320, p: 12, c: 28, g: 17, m: [['unidade (35 g)', 35]] },

  // ---- Salgadinhos de festa ----
  { n: 'Mini esfiha de carne', kcal: 250, p: 11, c: 32, g: 9, m: [['unidade (35 g)', 35]] },
  { n: 'Mini esfiha de queijo', kcal: 280, p: 11, c: 32, g: 12, m: [['unidade (35 g)', 35]] },
  { n: 'Esfiha aberta de ricota', kcal: 240, p: 11, c: 31, g: 8, m: [['unidade (80 g)', 80], ['mini (35 g)', 35]] },
  { n: 'Mini esfiha de ricota', kcal: 240, p: 11, c: 31, g: 8, m: [['unidade (35 g)', 35]] },
  { n: 'Quibe (kibe) recheado com catupiry', kcal: 290, p: 12, c: 21, g: 17, m: [['unidade (120 g)', 120], ['mini (40 g)', 40]] },
  { n: 'Quibe (kibe) recheado com queijo', kcal: 290, p: 13, c: 21, g: 17, m: [['unidade (120 g)', 120], ['mini (40 g)', 40]] },
  { n: 'Mini quibe (kibe) frito', kcal: 280, p: 12, c: 22, g: 16, m: [['unidade (30 g)', 30]] },
  { n: 'Mini coxinha de frango', kcal: 290, p: 9, c: 32, g: 14, m: [['unidade (30 g)', 30]] },
  { n: 'Mini pastel de festa (carne ou queijo)', kcal: 330, p: 9, c: 33, g: 18, m: [['unidade (25 g)', 25]] },
  { n: 'Mini pizza de lanchonete', kcal: 270, p: 10, c: 33, g: 11, m: [['unidade (80 g)', 80]] },
  { n: 'Mini churros de doce de leite', kcal: 380, p: 5, c: 50, g: 17, m: [['unidade (30 g)', 30]] },
  { n: 'Mini quiche de queijo', kcal: 340, p: 10, c: 24, g: 22, m: [['unidade (40 g)', 40]] },
  { n: 'Mini hot dog (enroladinho de festa)', kcal: 300, p: 9, c: 35, g: 14, m: [['unidade (40 g)', 40]] },
  { n: 'Mini empada de frango', kcal: 380, p: 9, c: 36, g: 22, m: [['unidade (30 g)', 30]] },
  { n: 'Risole (rissole) de carne', kcal: 290, p: 11, c: 30, g: 14, m: [['unidade (60 g)', 60], ['mini (30 g)', 30]] },
  { n: 'Risole (rissole) de queijo e presunto', kcal: 310, p: 12, c: 30, g: 16, m: [['unidade (60 g)', 60], ['mini (30 g)', 30]] },
  { n: 'Risole (rissole) de camarão', kcal: 280, p: 11, c: 30, g: 13, m: [['unidade (60 g)', 60], ['mini (30 g)', 30]] },
  { n: 'Risole (rissole) de palmito', kcal: 270, p: 7, c: 32, g: 13, m: [['unidade (60 g)', 60], ['mini (30 g)', 30]] },
  { n: 'Bolinho de aipim com carne seca', kcal: 270, p: 10, c: 28, g: 13, m: [['unidade (50 g)', 50]] },
  { n: 'Salgadinhos de festa fritos (média)', kcal: 300, p: 10, c: 30, g: 15, m: [['unidade (30 g)', 30]] },
  { n: 'Quibe assado', kcal: 200, p: 14, c: 16, g: 9, m: [['fatia (120 g)', 120]] },
  { n: 'Pão de batata com catupiry', kcal: 300, p: 8, c: 45, g: 9, m: [['unidade (90 g)', 90]] },
  { n: 'Rolinho primavera de queijo', kcal: 300, p: 9, c: 30, g: 16, m: [['unidade (50 g)', 50]] },
  { n: 'Tempurá de legumes', kcal: 230, p: 4, c: 25, g: 12, m: [['porção (150 g)', 150]] },
  { n: 'Mousse de maracujá', kcal: 250, p: 4, c: 28, g: 13, m: [['taça (120 g)', 120]] },
  { n: 'Mousse de chocolate', kcal: 270, p: 5, c: 30, g: 14, m: [['taça (120 g)', 120]] },
  { n: 'Pavê de chocolate', kcal: 280, p: 5, c: 32, g: 15, m: [['fatia (120 g)', 120]] },
  { n: 'Petit gâteau com sorvete', kcal: 380, p: 5, c: 45, g: 20, m: [['unidade (180 g)', 180]] },
  { n: 'Torta holandesa', kcal: 380, p: 5, c: 38, g: 23, m: [['fatia (120 g)', 120]] },
  { n: 'Banoffee', kcal: 340, p: 4, c: 40, g: 18, m: [['fatia (130 g)', 130]] },
  { n: 'Beijinho', kcal: 420, p: 3, c: 60, g: 18, m: [['unidade (20 g)', 20]] },
  { n: 'Churros com doce de leite', kcal: 380, p: 5, c: 50, g: 17, m: [['unidade (80 g)', 80], ['mini (30 g)', 30]] },
  { n: 'Panqueca americana com mel', kcal: 230, p: 6, c: 40, g: 5, m: [['unidade (100 g)', 100]] },
  { n: 'Pão com ovo', kcal: 250, p: 11, c: 28, g: 10, m: [['unidade (120 g)', 120]] },
  { n: 'Cuscuz nordestino com ovo', kcal: 140, p: 6, c: 20, g: 4, m: [['porção (250 g)', 250]] },

  // ---- Pratos e refeições comuns ----
  { n: 'Prato feito (arroz, feijão, bife, batata frita e salada)', kcal: 150, p: 8, c: 17, g: 6, m: [['prato (600 g)', 600]] },
  { n: 'Marmita fit (arroz integral, frango e legumes)', kcal: 120, p: 10, c: 13, g: 3, m: [['marmita (400 g)', 400], ['marmita (500 g)', 500]] },
  { n: 'Crepioca (tapioca com ovo)', kcal: 160, p: 9, c: 18, g: 6, m: [['unidade (120 g)', 120]] },
  { n: 'Panqueca proteica (banana, ovo e aveia)', kcal: 180, p: 8, c: 24, g: 6, m: [['unidade (80 g)', 80]] },
  { n: 'Omelete de 2 ovos com queijo', kcal: 190, p: 14, c: 2, g: 14, m: [['unidade (140 g)', 140]] },
  { n: 'Salada Caesar com frango', kcal: 130, p: 10, c: 5, g: 8, m: [['prato (350 g)', 350]] },
  { n: 'Poke de salmão (bowl completo)', kcal: 130, p: 8, c: 16, g: 4, m: [['bowl (450 g)', 450]] },
  { n: 'Burrito de carne', kcal: 200, p: 10, c: 24, g: 7, m: [['unidade (300 g)', 300]] },
  { n: 'Shawarma / churrasco grego (no pão sírio)', kcal: 220, p: 12, c: 24, g: 9, m: [['unidade (300 g)', 300]] },
  { n: 'Espetinho de churrasco (carne)', kcal: 220, p: 26, c: 2, g: 12, m: [['espeto (100 g)', 100]] },
  { n: 'Pizza de mussarela (fatia de pizzaria)', kcal: 270, p: 12, c: 31, g: 11, m: [['fatia (125 g)', 125]] },
  { n: 'Pizza de calabresa (fatia de pizzaria)', kcal: 280, p: 11, c: 30, g: 13, m: [['fatia (125 g)', 125]] },
  { n: 'Pizza de frango com catupiry (fatia de pizzaria)', kcal: 265, p: 13, c: 30, g: 11, m: [['fatia (125 g)', 125]] },
  // ---- Frutos do mar e cozinha japonesa/peruana (complemento) ----
  { n: "Sashimi de polvo", kcal: 82, p: 15, c: 2.2, g: 1, m: [["fatia (15 g)", 15], ["porção 5 fatias (75 g)", 75]] },
  { n: "Sashimi de kani", kcal: 95, p: 7.5, c: 14, g: 0.4, m: [["fatia (20 g)", 20]] },
  { n: "Ceviche de polvo", kcal: 100, p: 14, c: 6, g: 1.5, m: [["porção (200 g)", 200], ["porção pequena (120 g)", 120]] },
  { n: "Ceviche de camarão", kcal: 95, p: 15, c: 6, g: 1, m: [["porção (200 g)", 200]] },
  { n: "Ceviche de salmão", kcal: 130, p: 13, c: 5, g: 6.5, m: [["porção (200 g)", 200]] },
  { n: "Ceviche misto (peixe, polvo e camarão)", kcal: 105, p: 14, c: 6, g: 2.5, m: [["porção (200 g)", 200]] },
  { n: "Tako sunomono (sunomono de polvo)", kcal: 80, p: 8, c: 10, g: 0.5, m: [["porção (100 g)", 100]] },
  { n: "Polvo grelhado", kcal: 100, p: 18, c: 2, g: 2, m: [["porção (150 g)", 150], ["porção (200 g)", 200]] },
  { n: "Polvo à lagareiro (com azeite e batata)", kcal: 180, p: 14, c: 8, g: 10, m: [["porção (250 g)", 250]] },
  { n: "Arroz de polvo", kcal: 130, p: 8, c: 18, g: 3, m: [["prato (350 g)", 350]] },
  { n: "Salada de polvo", kcal: 110, p: 12, c: 4, g: 5, m: [["porção (150 g)", 150]] },
  { n: "Carpaccio de polvo", kcal: 90, p: 13, c: 2, g: 3.5, m: [["porção (100 g)", 100]] },
  { n: "Lula grelhada", kcal: 105, p: 17, c: 3, g: 2.5, m: [["porção (150 g)", 150]] },
  { n: "Lula à dorê (anéis empanados fritos)", kcal: 250, p: 12, c: 20, g: 13, m: [["porção (150 g)", 150], ["anel (15 g)", 15]] },
  { n: "Tartar de salmão", kcal: 180, p: 16, c: 2, g: 12, m: [["porção (120 g)", 120]] },
  { n: "Tartar de atum", kcal: 130, p: 20, c: 3, g: 4, m: [["porção (120 g)", 120]] },
  { n: "Poke de atum (bowl completo)", kcal: 120, p: 9, c: 15, g: 2.5, m: [["bowl (450 g)", 450]] },
  { n: "Ostra fresca (crua)", kcal: 65, p: 9, c: 3, g: 2, m: [["unidade (30 g)", 30], ["dúzia (360 g)", 360]] },
  { n: "Ostra gratinada", kcal: 160, p: 10, c: 5, g: 11, m: [["unidade (35 g)", 35]] },
  { n: "Mexilhão cozido (marisco)", kcal: 130, p: 18, c: 6, g: 3.5, m: [["porção (100 g)", 100]] },
  { n: "Paella à valenciana", kcal: 140, p: 9, c: 16, g: 4.5, m: [["prato (400 g)", 400]] },
  { n: "Casquinha de siri", kcal: 160, p: 11, c: 8, g: 9, m: [["unidade (90 g)", 90]] },
  { n: "Isca de peixe frita (tilápia empanada)", kcal: 240, p: 15, c: 16, g: 12, m: [["porção (150 g)", 150], ["unidade (25 g)", 25]] },
  { n: "Camarão à baiana", kcal: 130, p: 12, c: 6, g: 6.5, m: [["porção (300 g)", 300]] },

  // ---- Churrasco (cortes e acompanhamentos como servidos) ----
  { n: "Maminha grelhada (churrasco)", kcal: 180, p: 28, c: 0, g: 7.5, m: [["fatia (40 g)", 40], ["porção (150 g)", 150]] },
  { n: "Fraldinha grelhada (churrasco)", kcal: 200, p: 27, c: 0, g: 10, m: [["fatia (40 g)", 40], ["porção (150 g)", 150]] },
  { n: "Costela bovina assada", kcal: 320, p: 22, c: 0, g: 26, m: [["porção (200 g)", 200], ["pedaço (100 g)", 100]] },
  { n: "Cupim assado", kcal: 330, p: 23, c: 0, g: 26, m: [["porção (150 g)", 150], ["fatia (50 g)", 50]] },
  { n: "Coração de frango grelhado (espetinho)", kcal: 175, p: 22, c: 0.5, g: 9, m: [["unidade (7 g)", 7], ["espeto (80 g)", 80]] },
  { n: "Torresmo frito", kcal: 550, p: 30, c: 0, g: 47, m: [["porção (50 g)", 50], ["pedaço (10 g)", 10]] },
  { n: "Vinagrete (molho à campanha)", kcal: 45, p: 1, c: 8, g: 1, m: [["colher de sopa (30 g)", 30]] },
  { n: "Farofa de churrasco (pronta na mesa)", kcal: 410, p: 4.5, c: 68, g: 13, m: [["colher de sopa (15 g)", 15]] },
  { n: "Queijo coalho de espeto (churrasco)", kcal: 330, p: 21, c: 3, g: 26, m: [["espeto (70 g)", 70]] },
  { n: "Caldo verde", kcal: 60, p: 2.5, c: 8, g: 2, m: [["tigela (300 g)", 300], ["caneca (200 g)", 200]] },
  // ---- Panificação e confeitaria (bolos de festa, tortas e pães de padaria) ----
  { n: "Bolo floresta negra (fatia)", kcal: 320, p: 4.5, c: 38, g: 17, m: [["fatia (120 g)", 120], ["fatia pequena (80 g)", 80]] },
  { n: "Bolo prestígio (chocolate com coco)", kcal: 350, p: 4, c: 45, g: 17.5, m: [["fatia (120 g)", 120]] },
  { n: "Bolo de ninho com morango (fatia)", kcal: 330, p: 5, c: 40, g: 17, m: [["fatia (120 g)", 120]] },
  { n: "Bolo de ninho com Nutella (fatia)", kcal: 380, p: 5.5, c: 45, g: 20, m: [["fatia (120 g)", 120]] },
  { n: "Bolo de brigadeiro (fatia)", kcal: 380, p: 5, c: 50, g: 18, m: [["fatia (120 g)", 120]] },
  { n: "Bolo de aniversário (massa, recheio e cobertura, média)", kcal: 330, p: 4.5, c: 45, g: 15, m: [["fatia (120 g)", 120], ["fatia pequena (80 g)", 80]] },
  { n: "Bolo de morango com chantilly (fatia)", kcal: 300, p: 4, c: 38, g: 14, m: [["fatia (120 g)", 120]] },
  { n: "Bolo gelado de coco (toalha felpuda)", kcal: 260, p: 3.5, c: 35, g: 12, m: [["fatia (110 g)", 110]] },
  { n: "Bolo gelado de abacaxi com coco", kcal: 250, p: 3, c: 38, g: 10, m: [["fatia (110 g)", 110]] },
  { n: "Naked cake de ninho com frutas vermelhas (fatia)", kcal: 340, p: 4.5, c: 42, g: 17, m: [["fatia (120 g)", 120]] },
  { n: "Bolo vulcão de chocolate (fatia)", kcal: 390, p: 4.5, c: 48, g: 20, m: [["fatia (120 g)", 120]] },
  { n: "Bolo vulcão de ninho (fatia)", kcal: 385, p: 5, c: 47, g: 20, m: [["fatia (120 g)", 120]] },
  { n: "Bolo de churros (doce de leite e canela, fatia)", kcal: 370, p: 5, c: 48, g: 18, m: [["fatia (120 g)", 120]] },
  { n: "Bolo de paçoca (fatia)", kcal: 380, p: 7, c: 45, g: 19, m: [["fatia (120 g)", 120]] },
  { n: "Bolo de nozes com baba de moça (fatia)", kcal: 380, p: 5, c: 44, g: 20, m: [["fatia (120 g)", 120]] },
  { n: "Bolo de fubá com goiabada (fatia)", kcal: 300, p: 4, c: 52, g: 8, m: [["fatia (90 g)", 90]] },
  { n: "Bolo de milho cremoso (fatia)", kcal: 250, p: 4, c: 40, g: 8.5, m: [["fatia (100 g)", 100]] },
  { n: "Cuca de banana (fatia)", kcal: 320, p: 4.5, c: 50, g: 11, m: [["fatia (100 g)", 100]] },

  // Tortas doces
  { n: "Torta alemã (fatia)", kcal: 380, p: 4.5, c: 35, g: 25, m: [["fatia (110 g)", 110]] },
  { n: "Torta banoffee (banana com doce de leite, fatia)", kcal: 330, p: 4, c: 40, g: 17, m: [["fatia (110 g)", 110]] },
  { n: "Torta de maçã (fatia)", kcal: 240, p: 2.5, c: 35, g: 10, m: [["fatia (110 g)", 110]] },
  { n: "Torta mousse de chocolate (fatia)", kcal: 350, p: 5, c: 35, g: 22, m: [["fatia (110 g)", 110]] },
  { n: "Torta de nozes com doce de leite (fatia)", kcal: 400, p: 6, c: 40, g: 25, m: [["fatia (110 g)", 110]] },
  { n: "Carolina com recheio de doce de leite", kcal: 330, p: 6, c: 42, g: 15, m: [["unidade (25 g)", 25]] },
  { n: "Pastel de nata (pastel de Belém)", kcal: 300, p: 6, c: 38, g: 14, m: [["unidade (45 g)", 45]] },

  // ---- Pavlova ----
  // Merengue assado por fora e macio por dentro, chantilly e fruta por cima.
  // Não tem farinha nem gordura na base: a gordura toda vem do chantilly, e o
  // carboidrato quase todo do açúcar do merengue. Por isso a conta fica num
  // lugar inesperado para uma sobremesa de confeitaria — 248 kcal por 100 g na
  // de frutas vermelhas, contra 380 da torta de nozes com doce de leite e 350
  // da torta mousse de chocolate que já estão aqui. A fruta fresca e o ar
  // batido no merengue ocupam volume sem peso.
  //
  // Proporção usada: ~35% merengue, ~35% chantilly, ~30% fruta. As de maracujá
  // e limão sobem porque a cobertura é calda ou curd, não fruta in natura.
  { n: 'Pavlova de frutas vermelhas (fatia)', kcal: 248, p: 2.9, c: 39.1, g: 8.8, m: [['fatia (120 g)', 120], ['mini, unidade (90 g)', 90]] },
  { n: 'Pavlova de morango (fatia)', kcal: 248, p: 2.9, c: 39.1, g: 8.8, m: [['fatia (120 g)', 120], ['mini, unidade (90 g)', 90]] },
  { n: 'Pavlova de maracujá (fatia)', kcal: 292, p: 2.9, c: 48.1, g: 9.7, m: [['fatia (120 g)', 120], ['mini, unidade (90 g)', 90]] },
  { n: 'Pavlova de limão (fatia)', kcal: 292, p: 2.9, c: 48.1, g: 9.7, m: [['fatia (120 g)', 120], ['mini, unidade (90 g)', 90]] },

  // ---- Tortinhas de padaria (a individual da vitrine) ----
  // Não é fatia de torta: é a tortinha inteira, de massa podre com creme de
  // confeiteiro e cobertura. A vitrine varia de 90 a 130 g, e 110 é o meio —
  // a medida "mini" é a do tamanho de festa. Os valores saem da composição
  // (massa ~35% do peso, creme ~40%, fruta e brilho o resto), porque padaria
  // não publica tabela; o que muda de um sabor para o outro é a cobertura.
  { n: 'Tortinha de morango (padaria)', kcal: 245, p: 3.9, c: 31, g: 11.2, m: [['unidade (110 g)', 110], ['mini (50 g)', 50]] },
  { n: 'Tortinha de frutas (padaria)', kcal: 245, p: 3.9, c: 31, g: 11.2, m: [['unidade (110 g)', 110], ['mini (50 g)', 50]] },
  { n: 'Tortinha de uva (padaria)', kcal: 245, p: 3.9, c: 31, g: 11.2, m: [['unidade (110 g)', 110], ['mini (50 g)', 50]] },
  { n: 'Tortinha de limão com merengue (padaria)', kcal: 300, p: 4, c: 44, g: 12, m: [['unidade (110 g)', 110], ['mini (50 g)', 50]] },
  { n: 'Tortinha de maracujá (padaria)', kcal: 270, p: 4, c: 36, g: 12, m: [['unidade (110 g)', 110], ['mini (50 g)', 50]] },
  { n: 'Tortinha de banana com chocolate (padaria)', kcal: 280, p: 4, c: 37, g: 13, m: [['unidade (110 g)', 110], ['mini (50 g)', 50]] },
  { n: 'Tortinha de leite ninho com morango (padaria)', kcal: 300, p: 5, c: 36, g: 15, m: [['unidade (110 g)', 110], ['mini (50 g)', 50]] },
  { n: 'Tortinha de chocolate com ganache (padaria)', kcal: 330, p: 4.5, c: 38, g: 17.5, m: [['unidade (110 g)', 110], ['mini (50 g)', 50]] },
  { n: 'Tortinha de doce de leite (padaria)', kcal: 320, p: 4.5, c: 42, g: 15, m: [['unidade (110 g)', 110], ['mini (50 g)', 50]] },

  // ---- Trudel: o doce romeno de espeto (kürtőskalács / trdelník) ----
  // Massa doce enrolada num cilindro, assada girando, caramelizada por fora e
  // passada no açúcar com canela — depois recheada. No Brasil quem popularizou
  // foi a Royal Trudel, de Gramado, e é por ela que as pessoas procuram; daí o
  // "tipo Royal Trudel" no nome. A marca não publica tabela, então os valores
  // saem da composição: a massa assada (~180 g, no padrão de pão doce
  // enriquecido) mais o peso de cada recheio.
  //
  // Vale dizer o que a conta mostra: com recheio isto passa de 800 kcal na
  // unidade. Por isso cada um tem também a medida "metade" — é um doce que
  // normalmente se divide, e registrar a unidade inteira sem dividir é o que
  // faz o dia estourar sem a pessoa entender por quê.
  { n: 'Trudel tradicional com açúcar e canela (doce romeno, tipo Royal Trudel)', kcal: 330, p: 7.5, c: 52, g: 10, m: [['unidade (180 g)', 180], ['metade (90 g)', 90]] },
  { n: 'Trudel de doce de leite com amendoim (tipo Royal Trudel)', kcal: 348, p: 8.7, c: 49.7, g: 12.6, m: [['unidade (250 g)', 250], ['metade (125 g)', 125]] },
  { n: 'Trudel de doce de leite (tipo Royal Trudel)', kcal: 326, p: 7.1, c: 52.8, g: 9.3, m: [['unidade (240 g)', 240], ['metade (120 g)', 120]] },
  { n: 'Trudel de Nutella (tipo Royal Trudel)', kcal: 380, p: 7.1, c: 53.3, g: 15.3, m: [['unidade (240 g)', 240], ['metade (120 g)', 120]] },
  { n: 'Trudel de Nutella com leite Ninho (tipo Royal Trudel)', kcal: 380, p: 8.7, c: 51.8, g: 15.3, m: [['unidade (245 g)', 245], ['metade (122 g)', 122]] },
  { n: 'Trudel de sorvete com Nutella (tipo Royal Trudel)', kcal: 322, p: 6.2, c: 45.2, g: 12.8, m: [['unidade (300 g)', 300], ['metade (150 g)', 150]] },
  { n: 'Trudel banoffee, banana com doce de leite (tipo Royal Trudel)', kcal: 283, p: 5.9, c: 44.9, g: 9, m: [['unidade (300 g)', 300], ['metade (150 g)', 150]] },
  { n: 'Trudel de chocolate (tipo Royal Trudel)', kcal: 377, p: 7.4, c: 53.2, g: 14.7, m: [['unidade (235 g)', 235], ['metade (117 g)', 117]] },
  { n: 'Trudel salgado de cheddar com bacon (tipo Royal Trudel)', kcal: 341, p: 14.1, c: 34.9, g: 15.6, m: [['unidade (245 g)', 245], ['metade (122 g)', 122]] },
  { n: 'Trudel salgado de requeijão com calabresa (tipo Royal Trudel)', kcal: 293, p: 9.8, c: 33.3, g: 13.1, m: [['unidade (260 g)', 260], ['metade (130 g)', 130]] },

  // Pães e salgados de padaria
  { n: "Pão italiano", kcal: 270, p: 9, c: 54, g: 2, m: [["fatia (30 g)", 30], ["unidade pequena (170 g)", 170]] },
  { n: "Pão australiano", kcal: 260, p: 8, c: 48, g: 4, m: [["fatia (25 g)", 25], ["unidade (85 g)", 85]] },
  { n: "Ciabatta", kcal: 270, p: 9, c: 52, g: 3, m: [["unidade (90 g)", 90], ["fatia (30 g)", 30]] },
  { n: "Pão de milho de padaria", kcal: 290, p: 7, c: 52, g: 6, m: [["unidade (60 g)", 60], ["fatia (30 g)", 30]] },
  { n: "Pão doce de padaria (com creme)", kcal: 320, p: 7, c: 55, g: 8, m: [["unidade (60 g)", 60]] },
  { n: "Rosca húngara (fatia)", kcal: 380, p: 6, c: 52, g: 17, m: [["fatia (80 g)", 80]] },
  { n: "Pão de batata recheado com catupiry", kcal: 300, p: 7, c: 45, g: 10, m: [["unidade (80 g)", 80], ["mini (40 g)", 40]] },
  { n: "Croissant de chocolate", kcal: 400, p: 6, c: 45, g: 22, m: [["unidade (70 g)", 70], ["mini (35 g)", 35]] },
  { n: "Folhado de frango", kcal: 330, p: 8, c: 32, g: 19, m: [["unidade (100 g)", 100]] },
  { n: "Torta salgada de frango de padaria (fatia)", kcal: 250, p: 10, c: 24, g: 13, m: [["fatia (120 g)", 120]] },
  { n: "Empadão de frango (fatia)", kcal: 300, p: 9, c: 28, g: 17, m: [["fatia (150 g)", 150]] },

  // Tortas e quiches salgadas (padaria, buffet e casa)
  { n: "Torta de camarão com cream cheese (fatia)", kcal: 255, p: 9, c: 17, g: 16.5, m: [["fatia (120 g)", 120], ["pedaço pequeno (80 g)", 80]] },
  { n: "Torta de camarão com catupiry (fatia)", kcal: 265, p: 9, c: 17, g: 17.5, m: [["fatia (120 g)", 120], ["pedaço pequeno (80 g)", 80]] },
  { n: "Torta salgada de camarão (fatia de padaria)", kcal: 235, p: 9, c: 22, g: 12, m: [["fatia (120 g)", 120], ["pedaço pequeno (80 g)", 80]] },
  { n: "Quiche de camarão (fatia)", kcal: 275, p: 11, c: 14, g: 19, m: [["fatia (110 g)", 110], ["mini quiche (50 g)", 50]] },
  { n: "Empadão de camarão (fatia)", kcal: 295, p: 10, c: 27, g: 16, m: [["fatia (150 g)", 150]] },
  { n: "Torta de atum (fatia)", kcal: 250, p: 11, c: 22, g: 13, m: [["fatia (120 g)", 120], ["pedaço pequeno (80 g)", 80]] },
  { n: "Torta de palmito (fatia)", kcal: 240, p: 6, c: 24, g: 13, m: [["fatia (120 g)", 120], ["pedaço pequeno (80 g)", 80]] },
  { n: "Torta de queijo com presunto (fatia)", kcal: 270, p: 12, c: 22, g: 15, m: [["fatia (120 g)", 120], ["pedaço pequeno (80 g)", 80]] },
  { n: "Quiche de alho-poró (fatia)", kcal: 280, p: 8, c: 18, g: 19, m: [["fatia (110 g)", 110], ["mini quiche (50 g)", 50]] },
  { n: "Quiche Lorraine (bacon e queijo, fatia)", kcal: 300, p: 10, c: 17, g: 21, m: [["fatia (110 g)", 110], ["mini quiche (50 g)", 50]] },
  // ---- Fast food: cardápios das principais redes (valores do sanduíche montado) ----

  // McDonald's
  // Molhos do McDonald's. Os de mergulhar vêm no blíster de 23 g — é o peso
  // que a própria rede informa, e é por isso que o sachê inteiro é a medida.
  //
  // Nenhum destes é tabela oficial: a rede não publica a dos molhos, e os
  // números vêm de base de terceiros. Dois deles dão para conferir contra
  // fonte independente e batem — o ranch sai em 474 kcal por 100 g, contra as
  // 468 do registro do USDA para o mesmo molho, e o barbecue em 174 contra as
  // 172 do barbecue genérico. Isso dá confiança no agridoce e no caipira, que
  // vêm da mesma base. Mostarda e mel, ketchup, maionese e o molho especial
  // são estimativa por composição.
  //
  // O que a conta mostra e surpreende: o ranch tem mais caloria que dois
  // sachês de agridoce e dois de barbecue somados. Molho cremoso é gordura.
  { n: "McDonald's molho agridoce (sachê 23 g)", kcal: 191, p: 0.9, c: 47.8, g: 0.1, m: [['sachê (23 g)', 23]] },
  { n: "McDonald's molho barbecue (sachê 23 g)", kcal: 174, p: 0.8, c: 41, g: 0.6, m: [['sachê (23 g)', 23]] },
  { n: "McDonald's molho caipira (sachê 23 g)", kcal: 222, p: 1, c: 27.4, g: 11.7, m: [['sachê (23 g)', 23]] },
  { n: "McDonald's molho ranch (sachê 23 g)", kcal: 474, p: 1.1, c: 3.5, g: 52, m: [['sachê (23 g)', 23]] },
  { n: "McDonald's molho mostarda e mel (sachê 23 g)", kcal: 250, p: 0.8, c: 30, g: 13.5, m: [['sachê (23 g)', 23]] },
  { n: "McDonald's ketchup (sachê)", kcal: 100, p: 1.2, c: 24, g: 0.1, m: [['sachê (9 g)', 9]] },
  { n: "McDonald's maionese (sachê)", kcal: 650, p: 1, c: 2, g: 70, m: [['sachê (10 g)', 10]] },
  { n: "McDonald's molho especial do Big Mac", kcal: 370, p: 1, c: 15, g: 34, m: [['colher de sopa (15 g)', 15], ['porção do sanduíche (20 g)', 20]] },

  { n: "McDonald's Big Tasty", kcal: 233, p: 12, c: 14, g: 14, m: [['unidade (348 g)', 348]] },
  { n: "McDonald's Big Tasty Bacon", kcal: 245, p: 13, c: 14, g: 15, m: [['unidade (365 g)', 365]] },
  { n: "McDonald's McNífico Bacon", kcal: 250, p: 13, c: 20, g: 13, m: [['unidade (232 g)', 232]] },
  { n: "McDonald's Cheddar McMelt", kcal: 245, p: 12, c: 21, g: 12.5, m: [['unidade (232 g)', 232]] },
  { n: "McDonald's Duplo Burger", kcal: 260, p: 14, c: 22, g: 13, m: [['unidade (155 g)', 155]] },
  { n: "McDonald's Quarteirão com Queijo", kcal: 244, p: 14, c: 18, g: 13, m: [['unidade (215 g)', 215]] },
  { n: "McDonald's Quarteirão Duplo", kcal: 262, p: 17, c: 14, g: 16, m: [['unidade (280 g)', 280]] },
  { n: "McDonald's McFish (filé de peixe)", kcal: 240, p: 10, c: 26, g: 11, m: [['unidade (140 g)', 140]] },
  // o Duplo McFish tem 512 kcal no sanduíche (dois filés e dois queijos)
  { n: "McDonald's Duplo McFish (McFish duplo)", kcal: 244, p: 12.4, c: 21, g: 12.4, m: [['unidade (210 g)', 210]] },
  { n: "McDonald's McChicken Duplo", kcal: 242, p: 12, c: 21.5, g: 12, m: [['unidade (260 g)', 260]] },
  { n: "McDonald's McChicken Bacon", kcal: 255, p: 10, c: 24, g: 13, m: [['unidade (190 g)', 190]] },
  // Chicken Jr.: o frango pequeno, que a rede já chamou de McChicken Júnior e
  // hoje lista como Chicken Jr. Os dois nomes estão aqui porque os dois
  // circulam, e quem procura por um não acharia o outro.
  //
  // O rótulo de terceiros dá 349 kcal com P 12, C 43 e G 15 na unidade, e
  // fecha em Atwater. O peso não vinha junto: 140 g é o que sai quando se
  // aplica a densidade do McChicken grande (249 kcal por 100 g) às 349 kcal
  // declaradas. Serve para pesar meia unidade; para a unidade inteira, o que
  // vale é o total.
  { n: "McDonald's Chicken Jr. (McChicken Júnior)", kcal: 249, p: 8.6, c: 30.7, g: 10.7, m: [['unidade (140 g)', 140]] },
  { n: "McDonald's McCrispy Chicken Deluxe", kcal: 238, p: 11.9, c: 23.3, g: 10.5, m: [['unidade (215 g)', 215]] },
  { n: "McDonald's hambúrguer simples", kcal: 255, p: 13, c: 30, g: 9, m: [['unidade (100 g)', 100]] },
  { n: "McDonald's McMuffin ovo com bacon", kcal: 245, p: 14, c: 23, g: 11, m: [['unidade (135 g)', 135]] },
  { n: "McDonald's McFritas (batata frita)", kcal: 310, p: 4, c: 41, g: 15, m: [['pequena (70 g)', 70], ['média (110 g)', 110], ['grande (150 g)', 150]] },

  // Burger King
  { n: 'Burger King Whopper com queijo', kcal: 245, p: 12, c: 17, g: 14.5, m: [['unidade (300 g)', 300]] },
  { n: 'Burger King Whopper duplo', kcal: 260, p: 15, c: 13, g: 17, m: [['unidade (375 g)', 375]] },
  { n: 'Burger King Big King', kcal: 245, p: 13, c: 18, g: 13.5, m: [['unidade (220 g)', 220]] },
  { n: 'Burger King Rodeio', kcal: 255, p: 11, c: 26, g: 12, m: [['unidade (150 g)', 150]] },
  { n: 'Burger King Chicken Junior', kcal: 270, p: 10, c: 26, g: 14, m: [['unidade (125 g)', 125]] },
  { n: 'Burger King Steakhouse Angus', kcal: 250, p: 14, c: 17, g: 14, m: [['unidade (290 g)', 290]] },
  { n: 'Burger King cheeseburger', kcal: 265, p: 14, c: 26, g: 12, m: [['unidade (125 g)', 125]] },
  { n: 'Burger King batata frita', kcal: 300, p: 3.5, c: 40, g: 14, m: [['pequena (75 g)', 75], ['média (115 g)', 115], ['grande (155 g)', 155]] },
  { n: 'Burger King nuggets', kcal: 290, p: 14, c: 17, g: 18, m: [['unidade (17 g)', 17], ['porção 10 un (170 g)', 170]] },
  { n: 'Burger King milk shake', kcal: 135, p: 3, c: 22, g: 4, l: 1, m: [['copo (300 ml)', 300], ['copo grande (500 ml)', 500]] },

  // Bob's
  { n: "Bob's cheddar australiano", kcal: 255, p: 12, c: 22, g: 13, m: [['unidade (240 g)', 240]] },
  { n: "Bob's Big Bob duplo", kcal: 265, p: 14, c: 18, g: 15, m: [['unidade (300 g)', 300]] },
  { n: "Bob's cheeseburger", kcal: 260, p: 13, c: 27, g: 11, m: [['unidade (120 g)', 120]] },
  { n: "Bob's batata frita", kcal: 305, p: 4, c: 40, g: 15, m: [['pequena (75 g)', 75], ['média (110 g)', 110]] },
  { n: "Bob's milk shake Ovomaltine", kcal: 150, p: 3.5, c: 24, g: 4.5, l: 1, m: [['copo (300 ml)', 300], ['copo grande (500 ml)', 500]] },

  // Batata recheada (tipo Baked Potato)
  { n: 'Batata recheada (baked potato) com cheddar e bacon', kcal: 175, p: 6, c: 18, g: 9, m: [['porção (400 g)', 400], ['porção pequena (250 g)', 250]] },
  { n: 'Batata recheada (baked potato) com frango e catupiry', kcal: 165, p: 8, c: 18, g: 7, m: [['porção (400 g)', 400], ['porção pequena (250 g)', 250]] },
  { n: 'Batata recheada (baked potato) com carne seca', kcal: 170, p: 9, c: 18, g: 7.5, m: [['porção (400 g)', 400], ['porção pequena (250 g)', 250]] },
  { n: 'Batata recheada (baked potato) com calabresa', kcal: 180, p: 7, c: 18, g: 9.5, m: [['porção (400 g)', 400], ['porção pequena (250 g)', 250]] },
  { n: 'Batata recheada (baked potato) com brócolis e queijo', kcal: 150, p: 6, c: 18, g: 6.5, m: [['porção (400 g)', 400], ['porção pequena (250 g)', 250]] },

  // Outras redes
  { n: 'KFC balde de frango frito (peça)', kcal: 280, p: 22, c: 9, g: 17, m: [['peça (100 g)', 100], ['2 peças (200 g)', 200]] },
  { n: 'KFC frango crispy (tiras)', kcal: 265, p: 20, c: 15, g: 14, m: [['porção (150 g)', 150]] },
  { n: 'Subway 15 cm atum', kcal: 195, p: 9, c: 22, g: 8, m: [['sanduíche (220 g)', 220]] },
  { n: 'Subway 15 cm peito de peru', kcal: 145, p: 9, c: 23, g: 2, m: [['sanduíche (210 g)', 210]] },
  { n: 'Subway 15 cm steak com queijo', kcal: 185, p: 11, c: 22, g: 6, m: [['sanduíche (230 g)', 230]] },
  { n: "Habib's esfiha de queijo", kcal: 280, p: 11, c: 32, g: 12, m: [['unidade (60 g)', 60]] },
  { n: "Habib's Bib's esfiha de frango", kcal: 255, p: 12, c: 32, g: 9, m: [['unidade (60 g)', 60]] },
  { n: "Habib's kibe", kcal: 275, p: 12, c: 25, g: 14, m: [['unidade (70 g)', 70]] },
  { n: 'Giraffas prato de frango grelhado com arroz e feijão', kcal: 145, p: 10, c: 17, g: 4, m: [['prato (500 g)', 500]] },
  { n: 'Outback batata frita com cheddar e bacon (Aussie Cheese Fries)', kcal: 330, p: 9, c: 26, g: 21, m: [['porção (300 g)', 300], ['meia porção (150 g)', 150]] },
  { n: 'Pizza Hut fatia de pizza pepperoni', kcal: 270, p: 12, c: 30, g: 11, m: [['fatia (100 g)', 100]] },
  { n: 'Domino’s fatia de pizza mussarela', kcal: 265, p: 11, c: 32, g: 10, m: [['fatia (100 g)', 100]] },
  { n: 'Spoleto massa com molho de tomate e frango', kcal: 150, p: 9, c: 20, g: 4, m: [['prato (450 g)', 450]] },
  { n: 'Sanduíche natural de frango com cenoura', kcal: 195, p: 11, c: 24, g: 6, m: [['unidade (150 g)', 150]] },
  // ---- Pães funcionais / sem glúten de padaria e mercado ----
  { n: 'Pão de cará (inhame)', kcal: 240, p: 6, c: 45, g: 3.5, m: [['unidade (60 g)', 60], ['fatia (30 g)', 30], ['mini (35 g)', 35]] },
  { n: 'Pão de cará com queijo', kcal: 265, p: 8.5, c: 42, g: 6.5, m: [['unidade (60 g)', 60], ['mini (35 g)', 35]] },
  { n: 'Pão de inhame integral', kcal: 235, p: 6.5, c: 43, g: 3.5, m: [['fatia (30 g)', 30], ['unidade (60 g)', 60]] },
  { n: 'Pão de batata doce', kcal: 250, p: 6, c: 46, g: 4, m: [['unidade (60 g)', 60], ['fatia (30 g)', 30]] },
  { n: 'Pão de mandioca (polvilho)', kcal: 280, p: 5, c: 47, g: 8, m: [['unidade (50 g)', 50]] },
  { n: 'Pão sem glúten (mercado, fatia)', kcal: 250, p: 4, c: 44, g: 6, m: [['fatia (30 g)', 30], ['2 fatias (60 g)', 60]] },
  { n: 'Pão de linhaça caseiro', kcal: 265, p: 9, c: 40, g: 8, m: [['fatia (30 g)', 30]] },
  { n: 'Pão de aveia caseiro', kcal: 255, p: 10, c: 40, g: 6, m: [['fatia (30 g)', 30]] },
  { n: 'Broa de milho', kcal: 290, p: 6, c: 50, g: 7, m: [['fatia (50 g)', 50], ['unidade (80 g)', 80]] },
  { n: 'Pão de fermentação natural (sourdough)', kcal: 260, p: 9, c: 51, g: 1.5, m: [['fatia (40 g)', 40], ['fatia grande (60 g)', 60]] },
  // ---- Batatas congeladas e preparo na airfryer ----
  { n: 'Batata sorriso (carinha, smiles) congelada, crua', kcal: 190, p: 2.5, c: 28, g: 7.5, m: [['unidade (11 g)', 11], ['porção (100 g)', 100], ['porção pequena (80 g)', 80]] },
  { n: 'Batata sorriso (carinha, smiles) frita em óleo', kcal: 320, p: 3.5, c: 38, g: 16.5, m: [['unidade (11 g)', 11], ['porção (100 g)', 100], ['porção pequena (80 g)', 80]] },
  { n: 'Batata sorriso (carinha, smiles) na airfryer', kcal: 215, p: 3, c: 31, g: 8.5, m: [['unidade (11 g)', 11], ['porção (100 g)', 100], ['porção pequena (80 g)', 80]] },
  { n: 'Batata sorriso (carinha, smiles) assada no forno', kcal: 205, p: 3, c: 31, g: 7.5, m: [['unidade (11 g)', 11], ['porção (100 g)', 100], ['porção pequena (80 g)', 80]] },
  { n: 'Batata sorriso McCain Smiles frita', kcal: 320, p: 3.5, c: 38, g: 16.5, m: [['unidade (11 g)', 11], ['porção (100 g)', 100], ['porção pequena (80 g)', 80]] },
  { n: 'Batata sorriso McCain Smiles na airfryer', kcal: 215, p: 3, c: 31, g: 8.5, m: [['unidade (11 g)', 11], ['porção (100 g)', 100], ['porção pequena (80 g)', 80]] },
  { n: 'Batata frita na airfryer (palito congelado)', kcal: 200, p: 3, c: 30, g: 7, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata frita em óleo (palito congelado)', kcal: 310, p: 3.5, c: 38, g: 15, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata palito congelada, crua', kcal: 170, p: 2.5, c: 26, g: 6, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata palito frita em óleo', kcal: 310, p: 3.5, c: 38, g: 15, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata palito na airfryer', kcal: 200, p: 3, c: 30, g: 7, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata palito assada no forno', kcal: 190, p: 3, c: 30, g: 6, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata palito McCain frita', kcal: 310, p: 3.5, c: 38, g: 15, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata palito McCain na airfryer', kcal: 200, p: 3, c: 30, g: 7, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata palito Bem Brasil na airfryer', kcal: 200, p: 3, c: 30, g: 7, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata noisette frita em óleo', kcal: 300, p: 3, c: 37, g: 15, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata noisette na airfryer', kcal: 195, p: 2.8, c: 30, g: 6.8, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata rústica (com casca) frita em óleo', kcal: 290, p: 3.5, c: 36, g: 14.5, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata rústica (com casca) na airfryer', kcal: 185, p: 3, c: 29, g: 6, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata em gomos (wedges) temperada, frita', kcal: 285, p: 3.5, c: 36, g: 14, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata em gomos (wedges) temperada, na airfryer', kcal: 180, p: 3, c: 29, g: 5.5, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata frita caseira (batata crua frita em óleo)', kcal: 305, p: 3.5, c: 37, g: 15, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata caseira em palitos na airfryer', kcal: 155, p: 3, c: 29, g: 3, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Batata doce em cubos na airfryer', kcal: 130, p: 2, c: 27, g: 1.5, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Mandioca (aipim) frita em óleo', kcal: 320, p: 2, c: 40, g: 16.5, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Mandioca (aipim) na airfryer', kcal: 200, p: 2, c: 36, g: 5, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Polenta frita em óleo', kcal: 250, p: 3, c: 33, g: 11.5, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Polenta na airfryer', kcal: 165, p: 3, c: 31, g: 3, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Nuggets de frango na airfryer', kcal: 230, p: 14, c: 16, g: 12, m: [['unidade (18 g)', 18], ['porção 6 un (108 g)', 108]] },
  { n: 'Anéis de cebola (onion rings) na airfryer', kcal: 245, p: 4, c: 34, g: 10, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },
  { n: 'Nhoque frito na airfryer', kcal: 195, p: 4.5, c: 34, g: 4, m: [['porção (100 g)', 100], ['porção pequena (80 g)', 80], ['porção grande (150 g)', 150]] },

  // ---- Granolas de marca (linha proteica com whey e as tradicionais) ----
  // ---- Outros sabores da barra YoPRO ----
  // O chocolate tem tabela e está em marcas.mjs. Estes dois repetem o perfil
  // da linha: mesma barra de 55 g com os mesmos 15 g de proteína que a marca
  // estampa na frente, mudando cobertura e recheio. O YoPRO+ ainda leva
  // 75 mg de cafeína, que não entra em macro nenhum.
  { n: 'Barra de proteína YoPRO Nutrata morango com chocolate branco (15 g de proteína, 55 g)', kcal: 416, p: 27.3, c: 27.3, g: 20, m: [['unidade (55 g)', 55]] },
  { n: 'Barra de proteína YoPRO+ Nutrata cappuccino com nibs de cacau (15 g de proteína, 55 g)', kcal: 416, p: 27.3, c: 27.3, g: 20, m: [['unidade (55 g)', 55]] },

  // ---- Da Magrinha: as duas cujo rótulo não consegui ler inteiro ----
  // A Protein Granola 7 Grãos Amendoim leva whey e colágeno além da soja
  // texturizada, e a frente do pacote estampa "30 g PROTEÍNA" sem dizer por
  // quanto. Pelo lugar do carimbo — o dos grãos integrais, ao lado, diz "23 g
  // por porção", e este não diz nada — li como por 100 g, e é esse o número
  // guardado. Montando pela lista de ingredientes eu chegaria perto de 22 g,
  // então os dois valores não fecham entre si: fiquei com o do pacote, que é
  // declaração regulada, mas vale conferir na tabela do verso.
  //
  // O resto dos macros é modelado em cima dessa proteína. Da "sem açúcar" só
  // a caloria por 100 g é de fonte (345); proteína, carboidrato e gordura são
  // estimativa pelo perfil da linha.
  { n: 'Granola Da Magrinha Protein 7 grãos amendoim (whey e colágeno)', kcal: 400, p: 30, c: 40, g: 13, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60], ['pacote (200 g)', 200]] },
  { n: 'Granola Da Magrinha 7 grãos sem açúcar', kcal: 345, p: 11, c: 54, g: 9.8, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },

  { n: 'Granola Whey Vitalin tradicional', kcal: 425, p: 20, c: 55, g: 12.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Whey Vitalin cacau (chocolate)', kcal: 430, p: 20, c: 54, g: 13.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Whey Vitalin banana com canela', kcal: 420, p: 19, c: 57, g: 11.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Whey Vitalin frutas vermelhas', kcal: 415, p: 19, c: 57, g: 11, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Whey Vitalin coco', kcal: 440, p: 19, c: 52, g: 16, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Whey Vitalin castanhas', kcal: 450, p: 20, c: 48, g: 18.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Whey Vitalin baunilha', kcal: 425, p: 20, c: 56, g: 12, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Whey Vitalin morango', kcal: 420, p: 19.5, c: 56, g: 11.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Vitalin tradicional', kcal: 430, p: 9, c: 65, g: 14, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Vitalin zero açúcar', kcal: 415, p: 11, c: 58, g: 15, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Vitalin light', kcal: 390, p: 10, c: 63, g: 10, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Vitalin sem glúten', kcal: 425, p: 9, c: 64, g: 14, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Vitalin kids', kcal: 425, p: 8, c: 68, g: 12.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Vitalin salgada', kcal: 450, p: 12, c: 55, g: 19, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Vitalin proteica vegana', kcal: 420, p: 18, c: 55, g: 13, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Vitalin premium com castanhas', kcal: 455, p: 11, c: 55, g: 20, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Aveia em flocos Vitalin', kcal: 390, p: 14, c: 67, g: 8, m: [['colher de sopa (15 g)', 15], ['porção (30 g)', 30]] },
  { n: 'Mix de sementes Vitalin', kcal: 520, p: 20, c: 25, g: 38, m: [['colher de sopa (12 g)', 12], ['porção (25 g)', 25]] },
  { n: 'Granola proteica Mãe Terra', kcal: 420, p: 17, c: 55, g: 13, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola proteica Jasmine', kcal: 425, p: 18, c: 54, g: 13.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola proteica Puravida', kcal: 430, p: 14, c: 52, g: 17, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Nesfit (Nestlé)', kcal: 400, p: 8, c: 70, g: 9, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Granolight tradicional', kcal: 415, p: 10, c: 65, g: 12, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Feito de Grãos', kcal: 435, p: 11, c: 60, g: 16, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Yoki tradicional', kcal: 420, p: 9, c: 66, g: 12.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Naturale tradicional', kcal: 425, p: 9, c: 65, g: 13.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola com whey protein (média)', kcal: 425, p: 20, c: 55, g: 12.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },

  // Taeq (marca própria do GPA — Pão de Açúcar e Extra). A linha proteica saiu
  // em dois sabores, Chocolate com Café e Cúrcuma com Gengibre, e a marca
  // anuncia 10 g de proteína por porção; a proteína aqui está calibrada para
  // fechar esses 10 g na porção de 40 g. O resto do rótulo é estimativa da
  // categoria — quem tiver o pacote na mão fecha a conta lendo o código de barras.
  { n: 'Granola proteica Taeq chocolate com café', kcal: 420, p: 25, c: 48, g: 14, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola proteica Taeq cúrcuma com gengibre', kcal: 410, p: 25, c: 50, g: 12, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Taeq castanha-de-caju, uva-passa e maçã', kcal: 420, p: 9, c: 66, g: 12.5, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },
  { n: 'Granola Taeq light de soja, cacau e linhaça', kcal: 385, p: 12, c: 60, g: 10, m: [['porção (40 g)', 40], ['colher de sopa (15 g)', 15], ['xícara (60 g)', 60]] },

  // ---- Castanhas caramelizadas de quiosque (Bavarian Nuts e similares) ----
  { n: 'Bavarian Nuts amendoim caramelizado', kcal: 480, p: 16, c: 45, g: 26, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts castanha de caju caramelizada', kcal: 520, p: 13, c: 42, g: 33, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts amêndoa caramelizada', kcal: 535, p: 15, c: 36, g: 36, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts macadâmia caramelizada', kcal: 630, p: 7, c: 30, g: 53, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts nozes caramelizadas', kcal: 585, p: 12, c: 33, g: 45, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts pistache caramelizado', kcal: 540, p: 17, c: 42, g: 33, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts mix de castanhas caramelizadas', kcal: 535, p: 13, c: 39, g: 36, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts castanha de caju com chocolate', kcal: 535, p: 12, c: 45, g: 34, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts amêndoa com chocolate', kcal: 540, p: 13, c: 42, g: 35, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts amendoim com chocolate', kcal: 510, p: 14, c: 47, g: 29, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts castanha de caju salgada', kcal: 585, p: 18, c: 30, g: 44, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Bavarian Nuts amêndoa com canela', kcal: 540, p: 15, c: 37, g: 36, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Castanha de caju caramelizada (quiosque)', kcal: 520, p: 13, c: 42, g: 33, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Amêndoa caramelizada (quiosque)', kcal: 535, p: 15, c: 36, g: 36, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Amendoim caramelizado (quiosque)', kcal: 480, p: 16, c: 45, g: 26, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Macadâmia caramelizada (quiosque)', kcal: 630, p: 7, c: 30, g: 53, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Nozes caramelizadas (quiosque)', kcal: 585, p: 12, c: 33, g: 45, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Mix de castanhas caramelizadas (quiosque)', kcal: 535, p: 13, c: 39, g: 36, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Amendoim japonês caramelizado', kcal: 470, p: 14, c: 52, g: 22, m: [['punhado (30 g)', 30], ['saquinho (50 g)', 50], ['pacote (100 g)', 100]] },
  { n: 'Praliné de amêndoas', kcal: 540, p: 12, c: 45, g: 34, m: [['colher de sopa (15 g)', 15], ['punhado (30 g)', 30]] },

  // ---- Esfihas doces (esfiharia e Habib's) ----
  { n: 'Esfiha doce de chocolate', kcal: 370, p: 6, c: 50, g: 16, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de chocolate branco', kcal: 395, p: 6.5, c: 53, g: 17.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de Nutella (creme de avelã)', kcal: 385, p: 6.5, c: 51, g: 17.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de Sonho de Valsa', kcal: 395, p: 7, c: 49, g: 19, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de Ouro Branco', kcal: 400, p: 6.5, c: 52, g: 19, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de morango com banana', kcal: 245, p: 5.5, c: 45, g: 5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de morango com Nutella', kcal: 340, p: 6, c: 48, g: 14, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de morango com chocolate', kcal: 330, p: 6, c: 47, g: 13, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de morango com leite condensado', kcal: 300, p: 6, c: 50, g: 8.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de morango com leite Ninho', kcal: 340, p: 8, c: 50, g: 11, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de banana com canela', kcal: 250, p: 5.5, c: 47, g: 4.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de banana com chocolate', kcal: 320, p: 6, c: 48, g: 12, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de brigadeiro', kcal: 375, p: 6.5, c: 53, g: 15, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de beijinho', kcal: 370, p: 6, c: 52, g: 15, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de prestígio (chocolate com coco)', kcal: 390, p: 6.5, c: 50, g: 18, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de doce de leite', kcal: 340, p: 7, c: 55, g: 9.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de Romeu e Julieta (goiabada com queijo)', kcal: 330, p: 9, c: 52, g: 9, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de goiabada', kcal: 290, p: 5.5, c: 58, g: 4, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de leite Ninho', kcal: 375, p: 8.5, c: 52, g: 14.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de avelã com chocolate (Ferrero)', kcal: 410, p: 7.5, c: 47, g: 21, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de Oreo (cookies com creme)', kcal: 380, p: 6, c: 53, g: 16, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de paçoca', kcal: 400, p: 9, c: 49, g: 18.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de pistache', kcal: 400, p: 8, c: 47, g: 19.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de coco', kcal: 355, p: 6, c: 48, g: 15, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de abacaxi', kcal: 240, p: 5, c: 47, g: 3.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: 'Esfiha doce de maçã com canela', kcal: 250, p: 5, c: 48, g: 4.5, m: [['unidade (70 g)', 70], ['mini (35 g)', 35]] },
  { n: "Habib's esfiha doce de chocolate", kcal: 370, p: 6, c: 50, g: 16, m: [['unidade (55 g)', 55]] },
  { n: "Habib's esfiha doce de Romeu e Julieta", kcal: 330, p: 9, c: 52, g: 9, m: [['unidade (55 g)', 55]] },
  { n: "Habib's esfiha doce de banana", kcal: 250, p: 5.5, c: 47, g: 4.5, m: [['unidade (55 g)', 55]] },

  // ---- Restaurante chinês no Brasil (rodízio, delivery e pratos de wok) ----
  { n: 'Banana caramelizada chinesa (banana frita com calda)', kcal: 285, p: 1.6, c: 46, g: 11, m: [['unidade (45 g)', 45], ['porção 3 pedaços (120 g)', 120]] },
  { n: 'Banana caramelizada chinesa com gergelim', kcal: 300, p: 2.2, c: 45, g: 12.5, m: [['unidade (45 g)', 45], ['porção 3 pedaços (120 g)', 120]] },
  { n: 'Maçã caramelizada chinesa', kcal: 270, p: 1.2, c: 47, g: 9, m: [['porção (100 g)', 100]] },
  { n: 'Banana frita empanada (restaurante chinês)', kcal: 265, p: 2, c: 40, g: 11, m: [['unidade (45 g)', 45]] },
  { n: 'Biscoito da sorte', kcal: 380, p: 4, c: 84, g: 3, m: [['unidade (8 g)', 8]] },
  { n: 'Bolinho de banana frito (chinês)', kcal: 300, p: 3, c: 44, g: 12.5, m: [['unidade (40 g)', 40]] },
  { n: 'Frango agridoce (chinês)', kcal: 215, p: 14, c: 22, g: 8, m: [['porção (150 g)', 150], ['concha (100 g)', 100]] },
  { n: 'Frango empanado ao molho agridoce', kcal: 245, p: 14, c: 26, g: 10, m: [['porção (150 g)', 150]] },
  { n: 'Frango com castanha de caju (chinês)', kcal: 205, p: 16, c: 11, g: 11, m: [['porção (150 g)', 150]] },
  { n: 'Frango xadrez com legumes', kcal: 150, p: 14, c: 9, g: 6.5, m: [['porção (150 g)', 150]] },
  { n: 'Carne com brócolis (chinês)', kcal: 165, p: 15, c: 6, g: 9, m: [['porção (150 g)', 150]] },
  { n: 'Carne com pimentão e cebola (chinês)', kcal: 170, p: 15, c: 7, g: 9.5, m: [['porção (150 g)', 150]] },
  { n: 'Porco agridoce (chinês)', kcal: 250, p: 13, c: 24, g: 11, m: [['porção (150 g)', 150]] },
  { n: 'Costelinha agridoce (chinês)', kcal: 285, p: 15, c: 20, g: 16, m: [['porção (150 g)', 150]] },
  { n: 'Camarão empanado agridoce (chinês)', kcal: 235, p: 13, c: 26, g: 9, m: [['porção (150 g)', 150]] },
  { n: 'Peixe empanado agridoce (chinês)', kcal: 225, p: 14, c: 25, g: 8, m: [['porção (150 g)', 150]] },
  { n: 'Chop suey de legumes', kcal: 95, p: 3, c: 10, g: 5, m: [['porção (150 g)', 150], ['concha (100 g)', 100]] },
  { n: 'Chop suey de frango', kcal: 130, p: 11, c: 9, g: 5.5, m: [['porção (150 g)', 150]] },
  { n: 'Bifum (macarrão de arroz com legumes)', kcal: 160, p: 5, c: 27, g: 3.5, m: [['porção (200 g)', 200]] },
  { n: 'Bifum de frango', kcal: 175, p: 9, c: 25, g: 4.5, m: [['porção (200 g)', 200]] },
  { n: 'Yakisoba de carne', kcal: 165, p: 9, c: 21, g: 5, m: [['porção (300 g)', 300], ['prato (400 g)', 400]] },
  { n: 'Yakisoba de frango', kcal: 155, p: 9.5, c: 21, g: 4, m: [['porção (300 g)', 300], ['prato (400 g)', 400]] },
  { n: 'Yakisoba misto (carne, frango e legumes)', kcal: 165, p: 9.5, c: 21, g: 5, m: [['porção (300 g)', 300], ['prato (400 g)', 400]] },
  { n: 'Yakisoba de legumes', kcal: 135, p: 4.5, c: 22, g: 3.5, m: [['porção (300 g)', 300]] },
  { n: 'Arroz frito chinês (com ovo e legumes)', kcal: 175, p: 5, c: 28, g: 4.5, m: [['porção (200 g)', 200], ['concha (100 g)', 100]] },
  { n: 'Arroz frito chinês com camarão', kcal: 180, p: 8, c: 27, g: 4.5, m: [['porção (200 g)', 200]] },
  { n: 'Wonton frito (com carne)', kcal: 320, p: 11, c: 30, g: 17, m: [['unidade (18 g)', 18], ['porção 6 un (108 g)', 108]] },
  { n: 'Sopa wonton', kcal: 60, p: 4, c: 7, g: 1.8, m: [['tigela (300 ml)', 300]] },
  { n: 'Sopa de milho chinesa', kcal: 55, p: 2, c: 10, g: 0.8, m: [['tigela (300 ml)', 300]] },
  { n: 'Rolinho primavera de carne', kcal: 265, p: 8, c: 27, g: 13.5, m: [['unidade (35 g)', 35], ['porção 3 un (105 g)', 105]] },
  { n: 'Rolinho primavera de legumes', kcal: 240, p: 5, c: 30, g: 11, m: [['unidade (35 g)', 35], ['porção 3 un (105 g)', 105]] },
  { n: 'Guioza frito (porco)', kcal: 250, p: 11, c: 25, g: 11.5, m: [['unidade (20 g)', 20], ['porção 6 un (120 g)', 120]] },
  { n: 'Guioza cozido no vapor (porco)', kcal: 190, p: 11, c: 24, g: 5.5, m: [['unidade (20 g)', 20], ['porção 6 un (120 g)', 120]] },
  { n: 'Bolinho de camarão empanado (chinês)', kcal: 255, p: 12, c: 23, g: 12.5, m: [['unidade (25 g)', 25]] },
  { n: 'Pastelzinho chinês frito', kcal: 300, p: 9, c: 30, g: 16, m: [['unidade (25 g)', 25]] },
  { n: 'Lombo à moda chinesa (agridoce)', kcal: 235, p: 16, c: 18, g: 11, m: [['porção (150 g)', 150]] },
  { n: 'Frango xadrez ao molho de ostra', kcal: 160, p: 14, c: 10, g: 7, m: [['porção (150 g)', 150]] },
  { n: 'Legumes salteados no wok (chinês)', kcal: 80, p: 2.5, c: 8, g: 4.5, m: [['porção (150 g)', 150]] },
  { n: 'Molho agridoce (chinês)', kcal: 165, p: 0.4, c: 40, g: 0.2, m: [['colher de sopa (18 g)', 18]] },

  // ---- Hamburguerias artesanais: as redes de smash burger que as tabelas não
  // cobrem. A Patties trabalha com discos ultrafinos de 40 g ("ultra smashed"):
  // o Original é o cheeseburger da casa, dois discos com queijo americano,
  // cebola, picles, ketchup e mostarda. Valores estimados pela composição.
  { n: 'Patties Original (hambúrguer cheeseburger, 2 discos de 40 g)', kcal: 287, p: 15.6, c: 20, g: 15.6, m: [['unidade (160 g)', 160]] },
  { n: 'Patties Original com bacon (hambúrguer)', kcal: 305, p: 17, c: 18.5, g: 18, m: [['unidade (175 g)', 175]] },
  { n: 'Patties simples (hambúrguer de 1 disco de 40 g com queijo)', kcal: 283, p: 13.7, c: 25, g: 13.3, m: [['unidade (120 g)', 120]] },
  { n: 'Patties triplo (hambúrguer de 3 discos com queijo)', kcal: 310, p: 17.5, c: 15.5, g: 20, m: [['unidade (210 g)', 210]] },
  { n: 'Patties Ultra (hambúrguer de 4 discos com queijo)', kcal: 322, p: 18.5, c: 13, g: 22.5, m: [['unidade (255 g)', 255]] },
  { n: 'Patties Big Patties (hambúrguer, 2 discos com queijo duplo e molho)', kcal: 270, p: 15, c: 18, g: 15.5, m: [['unidade (230 g)', 230]] },
  { n: 'Patties Fat Greg (hambúrguer com bacon, cheddar e molho)', kcal: 318, p: 16.5, c: 15, g: 20.5, m: [['unidade (220 g)', 220]] },
  { n: 'Patties de frango (sanduíche de frango empanado)', kcal: 275, p: 14, c: 22, g: 13.5, m: [['unidade (200 g)', 200]] },
  { n: 'Patties vegetariano (hambúrguer de arroz negro, 2 discos)', kcal: 255, p: 8, c: 32, g: 9.5, m: [['unidade (165 g)', 165]] },
  { n: 'Patties skinny fries (batata palito fina)', kcal: 340, p: 4, c: 42, g: 17, m: [['porção (120 g)', 120], ['porção grande (200 g)', 200]] },
  { n: 'Patties milk shake', kcal: 150, p: 3.5, c: 20, g: 6, m: [['copo (300 ml)', 300]], l: 1 },
  // genéricos de hamburgueria artesanal/smash, para as redes fora da lista
  { n: 'Smash burger simples (hambúrguer de 1 disco com queijo)', kcal: 285, p: 14, c: 24, g: 14, m: [['unidade (130 g)', 130]] },
  { n: 'Smash burger duplo (hambúrguer de 2 discos com queijo)', kcal: 295, p: 16, c: 19, g: 16.5, m: [['unidade (180 g)', 180]] },
  { n: 'Smash burger duplo com bacon e cheddar (hambúrguer)', kcal: 315, p: 17, c: 17, g: 19, m: [['unidade (210 g)', 210]] },
  { n: 'Hambúrguer artesanal 180 g com cheddar e bacon', kcal: 270, p: 16, c: 15, g: 16, m: [['unidade (330 g)', 330]] },
  { n: 'Hambúrguer artesanal de frango grelhado', kcal: 210, p: 15, c: 20, g: 7.5, m: [['unidade (280 g)', 280]] },
  { n: 'Batata rústica de hamburgueria', kcal: 290, p: 3.5, c: 38, g: 14, m: [['porção (150 g)', 150], ['porção grande (250 g)', 250]] },
  { n: 'Batata frita com cheddar e bacon', kcal: 330, p: 8, c: 30, g: 20, m: [['porção (250 g)', 250]] },

  // ---- Cookies: o caseiro de gotas de chocolate e a leva de recheados
  // "estilo americano" das cookerias, que as tabelas não cobrem. Unidade de
  // 100 g é o tamanho padrão do recheado; o caseiro fica em 40 g.
  { n: 'Cookie caseiro com gotas de chocolate', kcal: 470, p: 5.5, c: 60, g: 23, m: [['unidade (40 g)', 40], ['unidade grande (60 g)', 60]] },
  { n: 'Cookie caseiro de aveia com passas', kcal: 440, p: 6, c: 65, g: 17, m: [['unidade (40 g)', 40]] },
  { n: 'Cookie caseiro integral de aveia com mel', kcal: 420, p: 7, c: 62, g: 15, m: [['unidade (40 g)', 40]] },
  { n: 'Cookie caseiro de castanhas', kcal: 490, p: 7, c: 55, g: 26, m: [['unidade (40 g)', 40]] },
  { n: 'Cookie caseiro de chocolate branco com macadâmia', kcal: 500, p: 6, c: 55, g: 28, m: [['unidade (40 g)', 40]] },
  { n: 'Cookie proteico (com whey)', kcal: 400, p: 20, c: 45, g: 14, m: [['unidade (60 g)', 60]] },
  { n: 'Cookie vegano de cacau', kcal: 450, p: 6, c: 60, g: 20, m: [['unidade (40 g)', 40]] },
  { n: 'Massa de cookie (cookie dough)', kcal: 450, p: 5, c: 58, g: 22, m: [['porção (50 g)', 50]] },
  { n: 'Cookie recheado com Nutella (estilo americano)', kcal: 480, p: 6, c: 57, g: 25, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie recheado com doce de leite', kcal: 465, p: 6, c: 62, g: 21, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie recheado com leite Ninho', kcal: 490, p: 7, c: 58, g: 25, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie recheado com brigadeiro', kcal: 470, p: 6, c: 61, g: 22, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie recheado com pistache', kcal: 500, p: 8, c: 52, g: 28, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie recheado com Ovomaltine', kcal: 480, p: 6.5, c: 60, g: 23.5, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie recheado com paçoca (amendoim)', kcal: 500, p: 9, c: 52, g: 27, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie recheado cookies & cream (Oreo)', kcal: 475, p: 5.5, c: 62, g: 23, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie recheado red velvet com cream cheese', kcal: 460, p: 5.5, c: 60, g: 22, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie recheado com Kinder Bueno', kcal: 495, p: 7, c: 56, g: 26.5, m: [['unidade (100 g)', 100], ['metade (50 g)', 50]] },
  { n: 'Cookie gigante recheado (cookeria)', kcal: 480, p: 6, c: 58, g: 24.5, m: [['unidade (150 g)', 150]] },
  { n: 'Cookie Mr. Cheney (unidade)', kcal: 470, p: 5.5, c: 59, g: 23, m: [['unidade (60 g)', 60]] },

  // ---- Demais sabores da linha Parmalat Fit ----
  // Chocolate (nas duas sublinhas) tem rótulo e está em marcas.mjs. Destes não
  // achei tabela: repetem o perfil da própria sublinha, que é o que a marca
  // promete em todos os sabores — zero lactose, zero açúcar adicionado e a
  // proteína estampada na frente.
  { n: 'Bebida láctea Parmalat Fit FlexForce morango (23 g de proteína, 8 g de colágeno)', kcal: 65, p: 9.2, c: 4.8, g: 1, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Bebida láctea Parmalat Fit WheyFit cappuccino (15 g de proteína, zero lactose)', kcal: 58, p: 6, c: 5.6, g: 1.2, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Bebida láctea Parmalat Fit WheyFit coco com batata doce (15 g de proteína, zero lactose)', kcal: 58, p: 6, c: 5.6, g: 1.2, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Bebida láctea Parmalat Fit WheyFit abacate (15 g de proteína, zero lactose)', kcal: 58, p: 6, c: 5.6, g: 1.2, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Bebida láctea Parmalat Fit WheyFit milho (15 g de proteína, zero lactose)', kcal: 58, p: 6, c: 5.6, g: 1.2, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Bebida láctea Parmalat Fit WheyFit pistache (15 g de proteína, zero lactose)', kcal: 58, p: 6, c: 5.6, g: 1.2, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Whey protein em pó Parmalat Fit WheyFit baunilha', kcal: 394, p: 63.6, c: 21.2, g: 6, m: [['dose (33 g)', 33], ['pote (450 g)', 450]] },

  // ---- Demais sabores da linha Piracanjuba ProForce ----
  // Cacau, cookies and cream e chocolate têm tabela e estão em marcas.mjs.
  // Destes não achei rótulo: repetem o perfil da própria versão, que é o que
  // a marca promete em todos os sabores — zero lactose, zero açúcar
  // adicionado, baixa gordura e a proteína estampada na frente.
  //
  // Os 15 g são o lado mais frágil disto: há varejista publicando 120 kcal na
  // caixinha e outro 150, e não consegui abrir o site da marca para desempatar.
  // Fiquei com o perfil que já estava no banco. Vale conferir na embalagem.
  { n: 'Piracanjuba ProForce frutas vermelhas (bebida láctea whey, 23 g de proteína, 250 ml)', kcal: 68, p: 9.2, c: 6.8, g: 0.3, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Piracanjuba ProForce pasta de amendoim (bebida láctea whey, 23 g de proteína, 250 ml)', kcal: 68, p: 9.2, c: 6.8, g: 0.3, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Piracanjuba ProForce banoffee (bebida láctea whey, 23 g de proteína, 250 ml)', kcal: 68, p: 9.2, c: 6.8, g: 0.3, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Piracanjuba ProForce morango (bebida láctea whey, 15 g de proteína, 250 ml)', kcal: 60, p: 6, c: 8.4, g: 0, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Piracanjuba ProForce coco (bebida láctea whey, 15 g de proteína, 250 ml)', kcal: 60, p: 6, c: 8.4, g: 0, l: 1, m: [['caixinha (250 ml)', 250], ['caixa (1 L)', 1000]] },
  { n: 'Piracanjuba ProForce café+ (bebida láctea whey, 15 g de proteína, 250 ml)', kcal: 60, p: 6, c: 8.4, g: 0, l: 1, m: [['caixinha (250 ml)', 250]] },
  { n: 'Whey protein em pó Piracanjuba ProForce chocolate', kcal: 393, p: 70, c: 8, g: 6.7, m: [['dose (30 g)', 30], ['pote (450 g)', 450]] },
  { n: 'Whey protein em pó Piracanjuba ProForce milk', kcal: 393, p: 70, c: 8, g: 6.7, m: [['dose (30 g)', 30], ['pote (450 g)', 450]] },

  // ---- Demais sabores das barras BOLD ----
  // Os sabores com tabela publicada estão em marcas.mjs. Destes eu não achei
  // rótulo, então repetem o perfil da própria linha: dentro de uma linha o que
  // muda é o recheio e a cobertura, e isso mexe pouco na conta. As duas
  // exceções são pistache e avelã, que levam castanha de verdade e por isso
  // entram mais gordas. A unidade é a mesma da linha — 60 g na BOLD e na
  // Crunch, 40 g no Tube.
  { n: 'Barra de proteína BOLD cookies & cream (21 g de proteína, 60 g)', kcal: 385, p: 35, c: 30, g: 15.5, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD cookies black (21 g de proteína, 60 g)', kcal: 385, p: 35, c: 30, g: 15.5, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD trufa de chocolate (21 g de proteína, 60 g)', kcal: 385, p: 35, c: 30, g: 15.5, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD mousse de maracujá (21 g de proteína, 60 g)', kcal: 385, p: 35, c: 30, g: 15.5, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD brownie (21 g de proteína, 60 g)', kcal: 385, p: 35, c: 30, g: 15.5, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD paçoca com chocolate (21 g de proteína, 60 g)', kcal: 385, p: 35, c: 30, g: 15.5, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD frutas vermelhas (21 g de proteína, 60 g)', kcal: 385, p: 35, c: 30, g: 15.5, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD pistache (21 g de proteína, 60 g)', kcal: 405, p: 33.3, c: 28.3, g: 18.3, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD leite e avelã (21 g de proteína, 60 g)', kcal: 405, p: 33.3, c: 28.3, g: 18.3, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD Crunch morango com chantilly (18 g de proteína, 60 g)', kcal: 354, p: 30, c: 28.3, g: 16, m: [['unidade (60 g)', 60]] },
  { n: 'Barra de proteína BOLD Crunch pistache (18 g de proteína, 60 g)', kcal: 372, p: 30, c: 26.7, g: 18.3, m: [['unidade (60 g)', 60]] },
  { n: 'BOLD Tube speculoos (tubo de wafer recheado, 10 g de proteína, 40 g)', kcal: 447.5, p: 25, c: 27.5, g: 30, m: [['unidade (40 g)', 40]] },
  { n: 'BOLD Tube trufa de chocolate (tubo de wafer recheado, 10 g de proteína, 40 g)', kcal: 447.5, p: 25, c: 27.5, g: 30, m: [['unidade (40 g)', 40]] },
  { n: 'BOLD Tube pistache (tubo de wafer recheado, 10 g de proteína, 40 g)', kcal: 460, p: 25, c: 26.3, g: 31.5, m: [['unidade (40 g)', 40]] },
  { n: 'BOLD Tube paçoca (tubo de wafer recheado, 10 g de proteína, 40 g)', kcal: 447.5, p: 25, c: 27.5, g: 30, m: [['unidade (40 g)', 40]] },

  // ---- Queijos do Laticínio Scala ----
  // A marca é conhecida pela mussarela de pizzaria, e o requeijão dela (esse
  // sim com rótulo) está em marcas.mjs. Para as peças a Scala não publica
  // tabela, então estes valores são os típicos da categoria — queijo maturado
  // varia pouco entre fabricantes, mas é estimativa, e o app diz isso.
  { n: "Cream cheese Scala", kcal: 250, p: 6, c: 4.5, g: 23, m: [["colher de sopa (30 g)", 30], ["pote (150 g)", 150]] },
  { n: "Queijo mussarela Scala (peça)", kcal: 330, p: 22.7, c: 3, g: 25.3, m: [["fatia (20 g)", 20], ["porção (30 g)", 30], ["peça (500 g)", 500]] },
  { n: "Queijo mussarela Scala ralada para pizza", kcal: 330, p: 22.7, c: 3, g: 25.3, m: [["porção (30 g)", 30], ["pacote (500 g)", 500]] },
  { n: "Queijo prato Scala", kcal: 360, p: 25, c: 2, g: 28, m: [["fatia (20 g)", 20]] },
  { n: "Queijo parmesão Scala (pedaço)", kcal: 440, p: 36, c: 3.5, g: 31.5, m: [["fatia (20 g)", 20], ["colher ralado (10 g)", 10]] },
  { n: "Queijo parmesão ralado Scala", kcal: 450, p: 35, c: 4, g: 32, m: [["colher de sopa (10 g)", 10], ["sachê (50 g)", 50]] },
  { n: "Queijo provolone Scala", kcal: 370, p: 25, c: 2, g: 29, m: [["fatia (20 g)", 20]] },
  { n: "Queijo gorgonzola Scala", kcal: 350, p: 20, c: 2.5, g: 29, m: [["fatia (30 g)", 30]] },
  { n: "Queijo minas padrão Scala", kcal: 330, p: 22, c: 2.5, g: 26, m: [["fatia (30 g)", 30]] },
  { n: "Queijo colonial Scala", kcal: 350, p: 24, c: 2.5, g: 27, m: [["fatia (30 g)", 30]] },
  { n: "Queijo meia-cura Scala", kcal: 340, p: 23, c: 2.8, g: 26.5, m: [["fatia (30 g)", 30]] },
  { n: "Queijo de coalho Scala", kcal: 325, p: 22.5, c: 3.2, g: 25.5, m: [["fatia (30 g)", 30], ["espeto (100 g)", 100]] },
  { n: "Manteiga Scala com sal", kcal: 733, p: 0.7, c: 0, g: 81.3, m: [["colher de chá (10 g)", 10], ["ponta de faca (5 g)", 5]] },

  // ---- Café puro ----
  // Correção de valor. Estes itens entraram com 4 kcal e 0,3 g de proteína
  // por 100 ml, por eu ter ficado no meio do caminho entre a TBCA (6 a 10
  // kcal, conforme a força da infusão) e as medições internacionais (1 a 2).
  // Esse meio-termo estava errado, e o erro tem explicação física.
  //
  // A TBCA conta como CARBOIDRATO tudo que a água extrai do pó, e boa parte
  // do que ela extrai não é alimento: cafeína, ácidos clorogênicos,
  // melanoidinas e minerais são massa dissolvida que o corpo não queima. São
  // 1 a 2 kcal por 100 ml de verdade, e é isso que está aqui agora.
  //
  // Sobre a proteína: ela existe, só é quase nada. O grão tem proteína e um
  // pouco dela passa para a bebida — as medições dão 0,1 g por 100 ml, ou
  // 0,15 g na xícara de 150. Zerar seria tão errado quanto os 0,45 g que a
  // versão anterior mostrava; o certo é o número pequeno de verdade.
  //
  // O expresso continua em 9 kcal porque é medido assim: mesma bebida, muito
  // menos água por grama de pó.
  { n: 'Café coado sem açúcar', kcal: 2, p: 0.1, c: 0.3, g: 0, l: 1, m: [['xícara (150 ml)', 150], ['xícara pequena (50 ml)', 50], ['copo americano (100 ml)', 100], ['caneca (200 ml)', 200]] },
  { n: 'Café expresso sem açúcar', kcal: 9, p: 0.1, c: 1.7, g: 0.2, l: 1, m: [['dose (30 ml)', 30], ['xícara (50 ml)', 50], ['duplo (60 ml)', 60]] },
  { n: 'Café descafeinado coado sem açúcar', kcal: 1, p: 0.1, c: 0.2, g: 0, l: 1, m: [['xícara (150 ml)', 150], ['xícara pequena (50 ml)', 50], ['caneca (200 ml)', 200]] },

  // ---- Água: o que o app precisa para acompanhar a meta de hidratação ----
  { n: 'Água', kcal: 0, p: 0, c: 0, g: 0, l: 1, m: [['copo (200 ml)', 200], ['copo grande (300 ml)', 300], ['garrafinha (330 ml)', 330], ['garrafa (500 ml)', 500], ['garrafa (1 L)', 1000], ['garrafa (1,5 L)', 1500], ['garrafa (2 L)', 2000]] },
  { n: 'Água com gás', kcal: 0, p: 0, c: 0, g: 0, l: 1, m: [['copo (200 ml)', 200], ['garrafa (300 ml)', 300], ['garrafa (500 ml)', 500]] },
  { n: 'Água mineral sem gás', kcal: 0, p: 0, c: 0, g: 0, l: 1, m: [['copo (200 ml)', 200], ['garrafinha (330 ml)', 330], ['garrafa (500 ml)', 500], ['garrafa (1,5 L)', 1500]] },
];
