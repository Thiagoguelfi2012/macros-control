# Controle de Macros

Site para controle de **nutrição** (calorias, proteínas, carboidratos e gorduras) e de
**treino** (montagem de treinos, registro de carga e progressão) — 100% front-end
(HTML/CSS/JS puro), sem servidor: funciona offline e roda em qualquer hosting estático.

A navegação é em dois níveis para as duas áreas não se misturarem: a barra de cima
escolhe **Nutrição · Treino · Ajustes** e a de baixo mostra as telas da área escolhida.

## Como rodar

Sirva a pasta com qualquer servidor estático e abra o `index.html`:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

(Abrir o arquivo direto com `file://` não funciona porque o navegador bloqueia o
`fetch` do banco de alimentos.)

## Funcionalidades

- **Diário** (`index.html`): botão "+ Adicionar" abre um modal com busca estilo
  select2 (Tom Select) sobre **~18.000 alimentos** (TACO, **TBCA**, IBGE, USDA,
  marcas brasileiras e pratos curados); quantidade em **gramas, mililitros ou
  medidas caseiras** (unidade, fatia, xícara, concha, lata, dose…) com prévia dos
  macros; monta refeição com vários itens de uma vez (com impacto na meta antes de
  salvar, e cada linha mostrando **quantidade, macros e gramas por 100 kcal** do
  item), cada item da refeição pode ser **editado sem sair da tela** (o lápis
  devolve o alimento para o topo do modal com a quantidade e a medida dele, e o
  botão vira "Salvar alteração no item" — antes era preciso excluir e adicionar
  de novo) e a refeição em montagem sobrevive ao app ir para segundo plano; data e
  hora registradas (e editáveis depois). Histórico agrupado por dia, em ordem
  descendente, com totais por dia e ações de repetir/editar/excluir por registro.
  Refeições com mais de um item viram um **subcard** com nome e horário; tocar no
  cabeçalho (ou no ícone de lápis) abre a **refeição inteira para editar** — os
  itens voltam para a cesta do modal, onde dá para trocar quantidades, remover,
  acrescentar alimentos e mudar o horário de todos de uma vez.
- **Meta de água, com ritmo do dia**: um cartão no Diário mostra quanto você já
  bebeu hoje contra a meta, com **atalhos de um toque** — +200 ml (copo),
  +330 ml (garrafinha) e +500 ml (garrafa) — e um "desfazer" para o último
  registro. A meta é definida em **Ajustes** (a tela mostra a conversão em copos
  e garrafas; a referência comum é ~35 ml por quilo de peso). Cada toque cria um
  **registro normal** de água, de 0 kcal: aparece no histórico, pode ser editado
  ou apagado como qualquer outro item, entra no backup e não mexe em caloria nem
  macro.

  O dia tem **ritmo**: metade da meta até as **13h** e o restante até as **18h**.
  A barra marca os dois pontos (verde quando cumprido, vermelho quando passou
  sem cumprir) e o texto diz o que falta para o próximo — ou avisa o atraso, com
  o cartão inteiro em vermelho. Nos horários, o app pode **notificar**: a
  permissão é pedida em Ajustes e o aviso pode ser desligado por lá. O limite é
  honesto e está escrito na tela — um site estático só dispara a notificação com
  o app aberto; **fechado, o aviso sai assim que o app é aberto de novo**, e o
  cartão mostra o atraso de qualquer jeito.
- **Aviso de carga glicêmica**: enquanto a refeição é montada, o app estima a
  **carga glicêmica** dela (índice glicêmico × carboidrato ÷ 100, item a item) e
  avisa quando ela fica alta. O índice sai de uma tabela por tipo de alimento
  com os valores clássicos das tabelas internacionais (arroz branco ~73, pão
  francês ~73, tapioca ~85, feijão ~32, salada ~15), casada pelo nome, com um
  palpite pela composição quando nada casa — é estimativa, e o aviso diz isso.
  O tom muda conforme o prato: **carga alta e desamparada** (sem proteína,
  gordura nem vegetal junto) recebe o alerta cheio; **carga alta mas amortecida**
  vira nota de rodapé, porque a proteína, a gordura e a fibra do prato já
  seguram a subida — e leguminosa, aveia e semente contam como fibra, já que
  as tabelas não trazem esse dado. Junto vêm as **formas de diluir sem pesar na conta**, da mais barata
  para a mais cara — e **combinando com o que está no prato**: o app separa a
  refeição em salgada, doce/láctea ou pão, e não oferece salada para um lanche
  de iogurte com granola. No prato salgado: comer na ordem (salada e proteína
  primeiro, carboidrato por último — custa zero), limão ou vinagre (+3 a +4
  kcal), pepino ou brócolis, ovo, frango, azeite. No lanche doce: comer a parte
  proteica antes da doce (zero), chia ou linhaça (+44), cottage, iogurte
  natural, whey, castanhas. No pão: comer o recheio junto em vez do pão sozinho
  (zero), abacate, pasta de amendoim, ovo, queijo. Nada que já esteja na
  refeição é sugerido de novo, e cada opção entra na cesta com um toque.
- **Gramas por 100 kcal**: cada alimento mostra, na busca, na prévia, na cesta
  e nas sugestões, **quantas gramas dele cabem em 100 kcal** — 407 g de
  brócolis contra 19 g de chocolate ao leite. A etiqueta é colorida pela
  densidade (leve, moderado, denso, muito denso), então dá para escolher pelo
  que enche mais sem contar nada.
- **Código de barras**: no modal de adicionar, o botão **📷 Código de barras**
  abre a câmera e lê o código da embalagem (BarcodeDetector do próprio
  navegador — no iPhone, que não tem, dá para digitar os números). O produto é
  consultado no **Open Food Facts** (sai daqui só o número do código) e, ao
  usar, fica gravado como alimento próprio: da segunda vez em diante ele é
  encontrado **offline**, na busca normal, sem nova consulta à rede. Porção e
  tamanho da embalagem do rótulo viram medidas caseiras.
- **Sugestão de refeição**: o botão **✨ Sugestão** monta um **prato inteiro**
  para o horário. O prato nunca é combinado item a item — sai de uma
  **montagem**: ou uma **combinação típica brasileira** escrita à mão (PF de
  arroz, feijão, carne e salada; arroz com feijão e ovo frito; macarrão com
  carne moída; strogonoff; tapioca com queijo; cuscuz com ovo; pão com ovo e
  café; japonês; sopa com frango…), ou uma **refeição que a própria pessoa já
  fez naquele horário**, tirada do histórico pelos alimentos que ela registrou
  juntos no mesmo dia e na mesma janela. É por isso que temaki não aparece com
  feijão: ninguém nunca comeu os dois juntos, e nenhuma receita típica os
  combina.

  Escolhida a montagem, as **porções são calculadas** para bater no alvo da
  refeição: a proteína manda, a gordura entra depois e o carboidrato fecha a
  conta. O alvo segue a **mesma régua do painel "Como o dia deve terminar"**:
  do que ainda falta hoje, **reserva-se o que as refeições seguintes
  historicamente custam** (a mediana da pessoa naquela janela), e o que sobra é
  desta refeição. Ratear por peso do plano dava um almoço folgado para quem
  janta muito — o plano diz como o dia *deveria* ser dividido, o histórico diz
  como ele *é*. Quantas refeições existem depende de **quantas por dia** você
  faz (3 a 6, configurável em **Ajustes**), refeição já registrada hoje sai da
  reserva, e refeição sem histórico suficiente volta a valer pelo peso do plano.

  O painel **diz a reserva em voz alta** ("Reservando 1.209 kcal para lanche da
  tarde e jantar, do que você costuma comer neles"), porque senão a pergunta
  óbvia fica sem resposta: por que o almoço sugerido encolheu. E quando o resto
  do dia, do jeito de sempre, **não cabe** no que falta, a conta pura mandaria
  sugerir um almoço de 190 kcal — correto e inútil. Aí entra um **piso** de 60%
  da fatia do plano e o conflito é **dito**: "mesmo assim sobrariam só 61 kcal
  para agora; para fechar o dia na meta, esses também precisam ficar abaixo do
  de costume". Quem precisa encolher é o resto do dia, não só este prato. A escolha entre as montagens é **sorteada** entre
  as melhores colocadas (as que a pessoa mais come pesam mais, o que já foi
  comido hoje pesa menos), e **"Trocar" percorre as montagens**: as últimas seis
  mostradas ficam de fora da próxima escolha, então cada toque traz uma opção
  nova até a rodada recomeçar.

  O que a sugestão **afirma sobre cada alimento é só o que os números dizem**:
  "50 g de proteína", "53 g de carboidrato" — nunca uma categoria inventada. O
  painel mostra **o prato contra o alvo da refeição** e **como o dia fica depois
  dela**, na mesma leitura do "Impacto na meta de hoje" — `+35 → 69 / 153 g ·
  45%`, com a barra na cor do macro mostrando a parte já consumida e, mais
  clara, a que o prato acrescenta —, e **Montar refeição** joga todos os itens de uma vez na cesta do modal. Quando
  o dia já estourou (ou está perto), entra o **modo saciedade**: o prato encurta
  e vale o que enche mais por caloria, estourando o mínimo possível.

  Nas horas que antecedem o treino a sugestão vira **pré-treino**. O horário não
  é configurado: sai dos **treinos já feitos**, pela **mediana da hora de início
  naquele dia da semana** nos últimos 70 dias (a partir de dois treinos
  registrados no dia, arredondada em 15 min) — quem treina às quintas às 19h
  recebe pré-treino entre 16h30 e 18h30. Aí o prato sai de um conjunto próprio
  de montagens, de carboidrato acessível e gordura baixa (banana com aveia e
  whey, pão com mel e whey, tapioca com queijo, batata doce com frango, cuscuz
  com ovo…), e o cabeçalho diz de onde veio o palpite: "você costuma treinar às
  19h às quintas".
- **Como o dia deve terminar**: o painel de impacto responde "o que esta refeição
  faz com o dia até agora"; este responde **"e depois dela, ainda vem o quê?"**.
  Sem ele um almoço folgado às 13h vira um dia estourado às 21h. A conta é
  `já comeu + esta refeição + ainda vem = previsto`, comparada com a dieta alvo.

  O **"ainda vem"** não é regra de três em cima da meta: é a **mediana do que a
  pessoa realmente come em cada refeição**, nos últimos 60 dias, por janela do
  plano (as mesmas janelas da Sugestão, conforme as refeições por dia de
  Ajustes). Mediana e não média porque um rodízio de sexta não pode virar a
  expectativa de todas as sextas. Só entram dias em que aquela refeição existiu —
  dia sem jantar registrado não conta como "jantar de 0 kcal", senão a projeção
  prometeria um dia que nunca acontece. Sem três dias de histórico numa refeição,
  aí sim cai no peso do plano, e o texto diz que aquele trecho é estimado.
  Refeições que **já têm registro hoje** saem do "ainda vem": elas já estão no
  "já comeu".

  O aviso tem direção: em **déficit** (alvo abaixo do gasto) alerta sobre
  **passar do teto**; em **superávit**, sobre **não chegar ao piso** — quem está
  em bulking erra por comer de menos. Em manutenção não há aviso, porque não há
  teto nem piso a defender. Dois níveis, 5% e 15% de distância da meta, porque
  projeção é palpite e palpite não pode gritar por 20 kcal.
- **Aviso de alimento caro**: ao escolher um alimento que está na lista de
  **alimentos caros** (a mesma do cartão "O que mudou", calculada sobre os
  últimos 90 dias), o modal mostra um aviso vermelho com a evidência — em
  quantos dias sem déficit ele apareceu, em quantas das vezes que você comeu e
  quantas kcal tem a porção — e **pede confirmação** antes de incluir na
  refeição ou salvar. O aviso só existe quando a **dieta alvo é menor que o
  gasto**: fora do déficit não há dia caro, há dia normal.
- **Relatório para o médico**: o botão **PDF** na barra de filtros abre uma prévia
  com duas saídas. **Baixar PDF** gera o arquivo para impressão (jsPDF, com os
  gráficos como imagem). **Enviar HTML** gera um **arquivo HTML interativo e
  autocontido** (~230 KB, com o Chart.js embutido) para mandar pelo WhatsApp: os
  gráficos têm tooltip, os dias abrem e fecham, e há botões de abrir tudo e de
  imprimir. Nos dois casos a entrega usa a folha de compartilhar do celular
  (`navigator.share`) e cai para download direto no computador.
- **Relatórios** (`relatorios.html`): totais de calorias/proteínas/carboidratos/
  gorduras com filtros por **janelas móveis** (1, 7, 15, 30, 90 dias e 1 ano, com
  navegação entre janelas); gráfico de calorias com **uma barra por dia** em
  toda janela até 90 dias — só a de 1 ano agrupa por mês, que é onde a barra
  diária vira um traço fino demais para ler. A média semanal saiu de propósito:
  ela escondia justamente o que interessa, porque o dia fora da curva some
  dentro da semana. Os gráficos com eixo de tempo **cortam as pontas vazias**:
  a janela de 90 dias costuma começar muito antes do primeiro registro, e
  desenhar esse vazio gastava metade da largura à toa. Só as **pontas** saem —
  buraco no meio é dia sem registro de verdade, e apagá-lo faria o eixo mentir
  sobre o intervalo entre as barras. Cada gráfico usa a própria régua do que é
  "ter dado": um dia com água e sem comida conta para o gráfico de água e não
  conta para o de calorias. O gráfico traz linha do gasto estimado e da dieta alvo;
  déficit calórico acumulado; distribuição dos macros;
  **déficit/superávit calórico** do período, calculado a partir do gasto médio
  diário definido em Configurações. Tem também um **gráfico de água**: uma barra
  por dia (ou por mês, na janela de 1 ano), **cheia nos dias em que a meta foi
  batida** e vazada nos outros, com a linha da meta por cima e, embaixo, o total
  do trecho mostrado, a média por dia e **quantos dias bateram a meta**. A média
  sai do **trecho desenhado**, não da janela inteira: com água anotada só nos
  últimos dias, dividir por 90 daria um número que não descreve nada — e aí o
  rodapé diz "desde o primeiro registro de água" em vez de "no período". O
  cartão só aparece quando há água registrada na janela. O **último cartão da tela** é
  **O que mudou**: o período é dividido em dois por um **divisor** (uma data que você escolhe, ou o
  botão **achar sozinho**, que procura o ponto de virada — o corte que deixa as
  duas metades mais diferentes entre si). O cartão devolve o **déficit médio por
  dia de cada lado**, o custo do trecho em kcal e em kg de gordura, e uma tabela
  com três linhas: **antes**, **depois nos dias normais** e **depois nos dias
  caros**. Dia caro é o dia em que o déficit não chegou a 200 kcal.

  O bloco principal é **Alimentos caros**: não o mais calórico da tabela, e sim
  o que aparece nos *seus* dias caros e quase não aparece nos outros. Ovo mexido
  tem caloria e está em todos os dias, inclusive nos estourados — ele não explica
  nada; um alimento que apareceu seis vezes e cinco delas em dia estourado
  explica. A régua exige as três coisas: porção de **200 kcal ou mais**,
  **60% ou mais** das aparições em dia caro, e **duas aparições** (ou uma só, se
  a porção passar de 400 kcal e estourar o dia sozinha). A lista para em 12 itens
  de propósito — aviso que dispara à toa vira aviso ignorado. Logo abaixo, os
  **Dias caros** ficam **retráteis e fechados**, com a proporção de cada lado no
  resumo ("0 antes · 9 depois") — é o que separa "a dieta inteira afrouxou" de
  "apareceram alguns dias fora da curva". Fecha com **o que entrou** e **o que
  saiu**, por kcal/dia e por número de vezes, comparando alimento a alimento pelo
  nome inteiro.

  Dois cuidados que mudam o resultado: dias **meio registrados** (abaixo de
  metade do dia mediano da pessoa — o jantar que ninguém anotou, ou hoje de
  manhã) ficam **fora das médias**, porque entrariam como jejum e inventariam
  déficit; e o cartão diz quais foram. E tudo é lido em **dia local**, não em
  UTC, senão a ceia da meia-noite cai no dia seguinte.
- **Treinos** (`treinos.html`, área Treino): três abas.
  - **Treinos** — no topo, a **frequência da semana**: um círculo por dia
    (segunda a domingo), marcado nos dias em que houve treino (com o número
    quando houve mais de um), o dia de hoje destacado e a média das semanas
    anteriores logo abaixo. Dá para **andar pelas semanas passadas** arrastando
    o cartão para o lado (ou pelas setas ‹ ›), até a semana do primeiro
    registro. No mesmo cartão vem o
    **próximo treino**: o app escolhe sozinho o treino **ativo que está há mais
    tempo sem ser executado** (nunca executado vem primeiro) e oferece o botão
    para começar. Um treino pode ser tirado da rotação pelo editor (caixa "ativo
    na rotação"): ele continua na lista, marcado como **fora da rotação**, e
    ainda pode ser iniciado à mão — só não é sugerido. Em seguida, cartões com os treinos montados (nome, foco,
    quantas vezes foi executado, quando e por quanto tempo), botões de
    **Iniciar treino** e **Evolução** (que abre a aba de evolução já filtrada
    naquele treino) e editor
    completo para criar, reordenar e excluir. Cada exercício da lista traz uma
    **miniatura ilustrada** (desenho do equipamento, colorido pelo grupo muscular)
    que abre a **busca do exercício no YouTube**, e a carga atual ao lado. A carga
    se muda ao executar o treino (ou no editor, para ajustar a ficha).
  - **Execução** — ao iniciar, a tela mostra cada exercício com miniatura, alvo de
    séries e repetições, **caixa para marcar como concluído**, campo de **carga do
    dia** (já preenchido com o **último valor registrado para aquele exercício**,
    em qualquer treino), repetições feitas e um cronômetro de **descanso** com o
    intervalo do exercício. Abaixo dos campos vem o **último registro daquele
    exercício** — carga, repetições feitas e, no cardio, tempo e BPM —, com as
    repetições das vezes anteriores em uma segunda linha, para acompanhar a
    evolução em repetição e não só em carga; o campo de repetições usa a última
    marca como placeholder. Há ainda um **insight de progressão** quando a carga daquele
    exercício não muda há três registros ou mais, com sugestão do próximo degrau
    plausível (+1, +2, +2,5 ou +5 kg conforme a faixa) e um botão para aceitar.
    **Marcar a caixa é o que cria o registro**: o ponto no gráfico nasce ali, não
    no Finalizar — corrigir a carga de um exercício já
    marcado regrava, desmarcar remove o ponto. Um valor digitado sem marcar fica
    guardado (`cargaAnotada`), mas não vira ponto. O **tempo de treino** corre no
    topo desde o Iniciar e é gravado ao Finalizar; um treino sem nenhum exercício
    marcado ainda conta para a frequência e para o tempo treinado.

    O treino começado é **guardado continuamente** (no `localStorage` a cada
    toque e no IndexedDB a cada exercício marcado, com gravação imediata ao
    minimizar ou fechar o app), então fechar sem querer não perde nada: ao
    reabrir, a execução volta de onde parou por até 24 h, e uma faixa
    **"treino em andamento"** no topo da lista permite retomar ou descartar.
    Tocar em "Iniciar treino" no mesmo treino retoma em vez de recomeçar.

    Enquanto não é finalizado, o treino é só um rascunho: **não conta** na
    frequência, nas contagens nem nos gráficos. Descartar apaga o rascunho, e um
    rascunho abandonado (app fechado sem finalizar nem descartar) é removido na
    próxima abertura — só treino finalizado vira registro.
  - **Evolução** — card de **frequência** (dias com treino no período, média por
    semana e uma barra por semana), **duração dos treinos** em barras (com tempo
    total e média) e um gráfico de linha por exercício com a **progressão de
    carga** ao longo das execuções, com o **valor escrito em cada ponto**, e as
    **repetições numa linha própria**, no eixo da direita — é assim que dá para
    ler 120 kg em 12 reps virando 140 kg em 8 sem os dois números se
    embaralharem. A linha é a **média de repetições por série** daquele dia; nos
    dias sem nada anotado o trecho fica **pontilhado** e assume o **mínimo
    previsto no treino** (3x10-12 → 10), com o tooltip avisando que é
    suposição. Ao iniciar
    o treino o campo de repetições já vem preenchido com o último registro, ou
    com o previsto do plano, para o dado não faltar. O subtítulo fecha a conta
    com o **volume** (carga × repetições) do primeiro ao último registro.
    O card marca a **progressão pela força estimada** (fórmula de Epley: carga ×
    repetições numa conta só), que é o que enxerga 20 kg × 10 virando 40 kg × 6
    como avanço de **+80%** — e o caminho inverso como recuo. Ela também vai ao
    gráfico como **linha tracejada**, no mesmo eixo da carga, e decide o card
    "Com evolução". Vale saber o que ela é: **uma métrica de força usada como
    termômetro de sobrecarga progressiva**, não uma medida de estímulo de
    hipertrofia — para isso o número que a literatura liga ao crescimento é o de
    séries duras por músculo por semana, que tem painel próprio logo abaixo.
    A fórmula também degrada acima de ~12 repetições e não se aplica a máquina
    de assistência, onde o app a desliga.

    Cada exercício tem um campo de **RIR** (repetições em reserva: quantas ainda
    dariam quando a série parou), de "0 · falha" a "5+". Ele é o dado que separa
    série dura de série que sobrou, e serve a três coisas: **entra na força
    estimada** — Epley pressupõe série até a falha, então 40 kg × 6 parando com
    2 na reserva vale o mesmo que 40 kg × 8 até a falha —, vira o **RIR médio**
    no resumo do card, e muda a dica de carga parada: com 3 ou mais na reserva
    o app deixa de sugerir mais peso e diz para chegar mais perto da falha
    primeiro, porque é ali que o estímulo está faltando. Sem RIR anotado o dia
    entra como se tivesse ido à falha — a suposição que a fórmula já fazia
    calada —, e o card diz em quantos dias ela valeu.

    Máquinas de **assistência** (gráviton, barra fixa assistida) contam ao
    contrário: o peso é contrapeso, e tirar peso é que é progresso. A
    biblioteca marca esses exercícios sozinha (dá para ligar a caixa "carga de
    assistência" em qualquer outro no editor do treino), o campo passa a se
    chamar **Assistência (kg)**, o indicador do card inverte o sinal, o eixo do
    gráfico vira de cabeça para baixo — a linha sobe quando o contrapeso cai —
    e a dica de progressão sugere **tirar** peso, não pôr.

    A **carga de aquecimento** tem campo próprio na execução (e no editor do
    treino), fica guardada em cada registro, entra no "última vez", vira o
    padrão da próxima vez e aparece no gráfico como uma linha discreta — sem se
    misturar com a carga de trabalho na conta da progressão.

    Acima dos gráficos vem **Séries por músculo por semana**, uma barra por
    grupo muscular com a **referência de 10 séries semanais** marcada — a faixa
    a partir da qual a literatura costuma ver ganho consistente, mostrada como
    referência grosseira e não como meta. Barra cheia é grupo na faixa, barra
    apagada é grupo abaixo dela, e o total do período vira média semanal pela
    janela do filtro. A conta usa a **série fracionada**: o músculo principal do
    exercício leva a série inteira e os auxiliares levam meia, cardio fica de
    fora, e "série" é o que foi anotado em `12/10/8` (três) ou, sem anotação, o
    número de séries previsto no treino. O subtítulo fecha com **quanto das
    séries com RIR anotado parou a 2 ou menos da falha** — é o par que importa:
    o volume diz quanto, o RIR diz se foi duro.

    Uma marca no eixo X por execução e no eixo Y por carga registrada (com as
    linhas de força e aquecimento o eixo passa a ser automático, para não virar
    uma parede de números). Filtros
    por treino e por período (7, 15, 30, 90, 180 dias, 1 ano ou tudo); execuções
    com mais de 4 h ficam fora das contas de tempo. No fim da aba, depois de
    todos os gráficos, vem a **lista das execuções** do período — data, treino e
    quantos exercícios —, cada uma com a **duração editável** (para corrigir o
    treino que ficou aberto porque você esqueceu de finalizar) e um botão para
    **excluir** um registro que tenha entrado por engano.
  - **Exercícios** — biblioteca com **166 exercícios** de uma academia padrão
    (Smart Fit): aparelhos, polias, Smith, halteres/barras e peso corporal,
    agrupados por músculo e filtráveis por grupo e equipamento. É de onde saem os
    exercícios ao montar um treino novo. Cada exercício também sabe os
    **músculos auxiliares** que recruta (supino → tríceps e ombros; puxada →
    bíceps e antebraço), derivados por regra do movimento no gerador — e é o
    que o **treino em andamento** mostra em etiquetas coloridas dentro do card
    de cada exercício: o músculo principal preenchido, os auxiliares
    contornados.

  Exercícios de **cardio** registram, além da carga, **tempo (min)** e **BPM
  médio** — a biblioteca já marca isso sozinha para os aparelhos de cardio, e
  qualquer exercício pode ligar as duas caixas no editor. Na Evolução esse
  exercício ganha um gráfico com **três eixos**, cada série na sua cor — e no
  cardio a ordem se inverte: **tempo à esquerda** (é a linha principal, a que
  manda no indicador de evolução do card), **BPM** em seguida e a **carga**
  (nível/velocidade) por último, porque ali o que conta é quanto tempo e a que
  batimento, não o peso.

  Exercícios de peso do corpo (sem carga nenhuma) não ficam sem gráfico: a linha
  passa a ser o **total de repetições** da execução, com o detalhe das séries
  escrito embaixo do ponto.

  Séries podem ser contadas em **repetições, segundos** (isometrias como a prancha)
  ou **minutos** (cardio). A **carga** é o número que o usuário registra para
  acompanhar a progressão e também tem unidade própria — **kg**, **segundos** (a
  prancha progride em tempo, não em peso), **minutos** ou **nível** —, usada nos
  cartões, na execução e nos eixos dos gráficos de evolução.

  Na primeira abertura de uma conta nova o app semeia uma **ficha inicial** de
  três treinos (`P \ Del \ T`, `D \ Trap \ B` e `MMII \ Abs`) com séries,
  repetições e intervalo — **e nenhuma carga**. Carga é dado de pessoa: ela vem
  da conta pela sincronização, nunca do código do app. Para trazer histórico de
  outro aparelho o caminho é entrar na mesma conta, ou o backup `.json` em
  Ajustes.
- **Ajustes** (`config.html`): tela própria com gasto energético (TMB/TDEE),
  **dieta alvo** (alvos diários de calorias e macros, com as kcal implícitas
  calculadas), **meta de água**, **refeições por dia** (3 a 6 — a divisão que a Sugestão usa para
  repartir o que falta da meta entre as refeições que ainda vêm, com a prévia
  de quantas kcal cabem em cada uma), **backup e transferência** e **conta e
  sincronização**. A dieta alvo
  alimenta o card "Dieta alvo × consumo" e o anel do gráfico de distribuição nos
  Relatórios, além das barras de progresso do card "Meta de hoje" no Diário.
- **Alimentos próprios**: no modal de adição, "Não encontrou? Cadastre um alimento
  próprio" — informe os valores do rótulo em qualquer porção de referência (ex.: dose
  de 30 g), com nome de porção opcional para registro rápido. Ficam salvos no
  dispositivo, aparecem no topo da busca como "meu alimento" e podem ser excluídos na
  lista "Meus alimentos" (registros antigos preservam o snapshot).
- **Backup e transferência**: exportar/importar os dados em arquivo `.json` (ou
  copiar/colar em texto), com importação somando sem duplicar — é também o caminho
  de migração para quem usava o app só no modo local.
- **Conta obrigatória** (via Supabase): o app abre atrás de um **véu translúcido**
  com o botão de **entrar com Google** — dá para ver o app ao fundo, não dá para
  usar. Enquanto não há sessão o conteúdo fica `inert`, fora do alcance do clique,
  do foco e do leitor de tela. Backup na nuvem e sincronização entre aparelhos,
  com os dados de cada usuário separados. Veja abaixo.
- Tema claro/escuro automático (segue o sistema).

## Conta e sincronização (Supabase, plano gratuito)

O app não tem servidor próprio: o login usa o **Supabase Auth** com o provedor
**Google** e os dados ficam em uma tabela com **RLS** — cada usuário só enxerga a
própria linha. As chamadas são REST puras no navegador (sem SDK).

**O que a porta de entrada é e o que ela não é.** Este é um site estático e a
trava vive no JavaScript da própria página: ela decide **quem usa a interface**,
não **quem pode ler os dados**. Quem protege dado aqui é o **RLS** — o servidor
só devolve a linha do dono do token. Duas consequências práticas: o que já está
no IndexedDB deste aparelho continua legível neste aparelho (é por isso que sair
da conta limpa o local), e **nada de pessoal pode morar no código do app**, que é
público. O OAuth do Google precisa abrir a página inteira em `https`, então em
`file://` ou dentro de um iframe não há login possível — nesses casos a porta
explica o motivo e oferece usar sem conta, só naquele navegador e sem backup.

Configuração (uma vez):

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No **SQL Editor**, rode:

   ```sql
   create table public.backups (
     user_id uuid primary key references auth.users(id) on delete cascade,
     dados jsonb not null,
     atualizado_em timestamptz not null default now()
   );
   alter table public.backups enable row level security;
   create policy "ler o proprio" on public.backups
     for select using (auth.uid() = user_id);
   create policy "criar o proprio" on public.backups
     for insert with check (auth.uid() = user_id);
   create policy "atualizar o proprio" on public.backups
     for update using (auth.uid() = user_id);
   ```

3. **Login com Google**: em **Authentication → Sign In / Up → Google**, ative o
   provedor e cole o Client ID/Secret de um "ID do cliente OAuth" criado no
   [Google Cloud Console](https://console.cloud.google.com) (tipo Aplicativo da
   Web). No Google, o **Authorized redirect URI** é o callback do Supabase:
   `https://SEU-PROJETO.supabase.co/auth/v1/callback`. No Supabase, em
   **Authentication → URL Configuration**, adicione o endereço do app (ex.:
   `https://SEU-USUARIO.github.io/macros-control/`) em Site URL / Redirect URLs.
   O botão "Entrar com Google" só aparece em https fora de iframe (o OAuth
   precisa sair da página); em arquivo local ou página incorporada o app segue
   funcionando local, com Exportar/Importar para levar os dados a outro aparelho.
4. Em **Settings → API**, copie a **Project URL** e a **anon key**. Elas já estão
   gravadas em `DEFAULT_URL`/`DEFAULT_ANON_KEY` no `js/sync.js` (valem para todos os
   aparelhos); para apontar para outro projeto, use o card "Conta e sincronização"
   dos Relatórios. A anon key é pública por design; a proteção vem das políticas RLS.

Como sincroniza: baixa o backup remoto, soma com o local (mesma regra do importar —
nada é apagado, registros idênticos não duplicam) e sobe a união. Mudanças locais
sobem sozinhas ~4 s depois; ao abrir o app conectado, sincroniza de novo. Quem
usava só o modo local importa o backup antigo e ele sobe na sequência.

**Separação entre usuários.** No servidor, cada conta tem uma linha própria em
`backups` e as políticas RLS (`auth.uid() = user_id`) impedem qualquer acesso à
linha alheia. No aparelho, o navegador tem um banco só — por isso o app marca de
quem são os dados locais (`sbDonoLocal`):

- dados locais **sem dono** (uso antes de qualquer login) são adotados pela primeira
  conta que entrar — é a migração de quem já usava o app;
- ao entrar com **outra conta**, os dados do usuário anterior são apagados deste
  aparelho antes de baixar os da conta nova (os do anterior seguem na nuvem dele);
- ao **sair**, o app sobe o que estiver pendente e limpa o aparelho, para o próximo
  usuário não ver o diário de quem saiu (o botão pede confirmação em dois toques).

Obs.: dentro da página hospedada no claude.ai o navegador bloqueia chamadas
externas — use o app no endereço próprio (GitHub Pages) ou no arquivo standalone.

## Dados

- Registros de consumo, treinos e execuções de treino: **IndexedDB** do navegador
  (com fallback em `localStorage` quando o IndexedDB é bloqueado, ex.: `file://` e
  iframes). Tudo entra no backup e na sincronização.
- Biblioteca de exercícios: `js/exercicios.js`, gerado por
  `tools/build-exercicios.mjs` a partir de uma lista curada — não depende de rede.
- Configurações (TMB/TDEE e dieta alvo): `localStorage`.
- **Abertura do app**: o histórico entra **em levas, conforme a rolagem**. Antes
  ele era montado inteiro de uma vez — com 45 dias registrados isso dava **13 mil
  nós no DOM e 75 telas de rolagem**, e era o que mais atrasava a abertura. Agora
  a primeira leva traz **4 dias** (~1.100 nós) e cada vez que a rolagem se
  aproxima do fim entram mais **6**, avisados por um `IntersectionObserver` com
  600 px de antecedência, para os dias já estarem prontos quando você chegar
  neles. Montar o histórico caiu de **até 840 ms para ~40 ms**. Um re-render
  (editar, excluir, repetir um item) **mantém o tanto que já estava aberto** em
  vez de jogar você de volta ao topo. Navegador sem `IntersectionObserver`
  desenha tudo de uma vez — lento, mas ninguém fica sem ver o próprio histórico.

  A base de alimentos **também não segura a tela**. O diário do dia
  sai inteiro dos registros — cada registro guarda o próprio nome e os próprios
  macros —, então ele desenha primeiro; a base começa a carregar depois, porque
  quem precisa dela é a **busca**, e a busca só existe quando alguém abre o modal
  de adicionar. Enquanto o índice não fica pronto (18 mil nomes normalizados, o
  passo mais caro da abertura), o campo de alimento aparece desabilitado dizendo
  que está carregando.

  A base também não é baixada a cada visita. O que o app busca ao abrir é o
  **manifesto** (`data/foods-manifest.json`, uns 50 bytes com a versão, o hash do
  conteúdo e a contagem): se o hash bate com o que está guardado no aparelho,
  **nada é baixado**. O hash resolve dois problemas que o número de versão
  sozinho não resolvia — um `v` novo com conteúdo igual deixa de custar 2,3 MB a
  todo mundo, e conteúdo novo chega mesmo que alguém esqueça de subir o `v`.
  O hash gravado é o do arquivo que **realmente chegou**, nunca o que o
  manifesto prometeu: se um cache servir conteúdo velho, a próxima visita
  percebe em vez de se achar em dia para sempre. Sem rede o manifesto falha em
  silêncio e a base local é usada assim mesmo — o app abre offline.

  A base fica no IndexedDB em **um registro só**. Guardada como 18 mil registros
  soltos, relê-la custava um `getAll()` de 18 mil desserializações a cada
  abertura de página; em um registro é uma leitura (120 ms → 34 ms no
  laboratório, proporcionalmente mais no celular). Quem já tinha a base no
  formato antigo é migrado sem baixar nada de novo.
- Banco de alimentos: `data/foods.json` (~2,3 MB, **18.134 itens**, ~10.900 com
  medidas caseiras e ~890 líquidos medidos em ml/L), carregado no IndexedDB na
  primeira visita. Valores por 100 g (ou 100 ml). Fontes, na ordem de prioridade da
  busca:

  | Fonte | Itens | O que traz |
  | --- | ---: | --- |
  | **TACO** (UNICAMP) | 590 | alimentos brasileiros in natura e preparados, PT nativo |
  | **TBCA** (USP/BRASILFOODS) | 5.340 | a maior fonte em PT: além dos alimentos, muita **preparação e prato pronto** — sushi, feijoada, pizzas, lasanhas, salgados, bolos, saladas, com variações "com/sem sal", "com/sem óleo", frito/assado/cozido |
  | **Marcas** (`tools/marcas.mjs`) | 669 | produtos de marcas brasileiras com valores de rótulo (iogurtes, leites, queijos, congelados, biscoitos, chocolates, bebidas, suplementos, as guloseimas e biscoitos da **Arcor** — 7Belo, Poosh, Big Big, Aymoré e Triunfo…). As gelaterias entram com os **tamanhos do próprio cardápio**: os gelatos da Bacio di Latte vão de *piccolo* a *massimo*, não em "pequeno/médio/grande" genéricos |
  | **Chocolates** (`tools/chocolates.mjs`) | 169 | catálogo de chocolates e bombons: Cacau Show (Lacreme, Zero, Mil Folhas, trufas, tabletes, bombons, Lanut), Kopenhagen, Brasil Cacau, Lacta, Garoto, Nestlé, Hershey's, Ferrero/Kinder, Lindt, Arcor, Neugebauer, Havanna, **Arcor** (Block, Bon o Bon, Tortuguita), **Dois Frades** (o "chocolate do padre") e os bean-to-bar brasileiros (Dengo, Amma, Luisa Abram, Nugali, Baianí, Mendoá) |
  | **Pastas** (`tools/pastas.mjs`) | 70 | pastas de amendoim, castanhas e sementes: Dr. Peanut e Vitapower (todos os sabores), Amendocrem, Reese's, Skippy, Jif, as integrais de mercado natural (Mandubim, Pura Vida, Vitao, Jasmine, Mãe Terra), as de marcas de suplemento e as de castanha de caju, amêndoa, pistache, gergelim (tahine) e coco |
  | **Sorvetes** (`tools/sorvetes.mjs`) | 58 | picolés, sorvetes e gelaterias: a linha licenciada de picolé (Prestígio, Sonho de Valsa, Ouro Branco, Diamante Negro, Bis, Laka, Oreo, Nescau, Kit Kat, Moça, Alpino, Brigadeiro, Serenata, Chokito), Kibon (Magnum, Cornetto, Sandubon, Fruttare), os potes de Kibon/Nestlé/Moça e os light, La Frutta, os premium (Häagen-Dazs, Ben & Jerry's, Diletto, paleta mexicana) e as redes de sorveteria (Chiquinho: casquinha, sundae, especial, milk shake, açaí com adicionais) |
  | **Curados** (`tools/curados.mjs`) | 650 | pratos de vida real ausentes das tabelas: temaki e sushi, esfihas e salgados de festa, docinhos, fast food, frutos do mar, churrasco, bolos de confeitaria, batatas congeladas e o preparo **na airfryer** (sorriso/carinha, palito, noisette, rústica, gomos), granolas de marca (linha Vitalin Granola Whey, as tradicionais e a linha proteica da Taeq), castanhas caramelizadas de quiosque (Bavarian Nuts), esfihas doces de esfiharia (chocolate, Nutella, Sonho de Valsa, Ouro Branco, morango com banana, brigadeiro, Romeu e Julieta…) a mesa de restaurante chinês (banana caramelizada, agridoces, chop suey, yakisoba, bifum, guioza, wonton) e as **hamburguerias artesanais** que as tabelas ignoram — o cardápio da Patties (Original, Big Patties, Fat Greg, Ultra, frango, vegetariano, skinny fries) e os genéricos de smash burger para as outras redes, e a leva de **cookies** (caseiro de gotas de chocolate, aveia com passas, integral, proteico, vegano, e os recheados estilo americano de Nutella, doce de leite, Ninho, brigadeiro, pistache, Ovomaltine, paçoca, Oreo, red velvet, Kinder) e as **tortas e quiches salgadas** de padaria e buffet (camarão com cream cheese e com catupiry, atum, palmito, queijo com presunto, quiche de camarão, de alho-poró e Lorraine, empadão de camarão) |
  | **IBGE/POF** | 1.873 | alimentos e preparações, PT nativo |
  | **USDA SR28** | 8.717 | complemento, nomes traduzidos por glossário EN→PT |

  Medidas caseiras: `WEIGHT.txt` do SR28 + tabela de medidas usuais brasileiras
  (`tools/build-foods.mjs`), incluindo pesos médios por unidade (filé de sassami
  ~50 g, coxa ~65 g, bife ~100 g…) e medidas de líquidos (lata, garrafa, copo, dose).

  A busca (`js/busca.js`) normaliza acentos e grafias populares (kibe→quibe,
  mussarela→mucarela, miojo→macarrão instantâneo), ignora palavras de ligação
  ("filé catupiry" acha "Filé mignon ao catupiry") e ordena priorizando as fontes em
  português — alimentos próprios primeiro, depois TACO/TBCA/marcas/curados, IBGE e,
  por último, o USDA traduzido. O **plural digitado** também encontra: as tabelas
  guardam "cookie" e "pão de queijo", e a busca aceita "cookies recheados" e
  "pães de queijo" (inclusive os plurais que mudam a palavra — pastéis, feijões,
  pudins).

Para regenerar o banco (baixa os dados brutos das fontes públicas no GitHub):

```bash
node tools/build-foods.mjs
```

Ao regenerar com mudanças, incremente o `v` gravado pelo script e o `FOODS_VERSION`
em `js/db.js` para forçar os navegadores a recarregarem a base.

Depois de **qualquer** alteração em `js/` ou `css/`, rode `node
tools/stamp-assets.mjs`: ele carimba `?v=<hash do conteúdo>` em cada arquivo nas
quatro páginas. É o que impede o navegador de continuar servindo um JavaScript
antigo — quando o carimbo era a versão da base, mexer só no código não mudava a
URL e o celular ficava com o arquivo velho em cache.

O app também **se recupera sozinho de cache preso**, que é o modo de falha mais
comum em site estático: se o `foods.json` que chegou tiver versão **menor** que a
esperada, ele refaz o download furando o cache; se tiver versão **maior** (sinal de
que o HTML e o `js/db.js` é que ficaram velhos no cache), recarrega a página com a
URL marcada, uma vez. O card "Lista de alimentos" em Ajustes mostra a versão que
realmente entrou na busca e avisa em vermelho quando ela está atrás da esperada.

## Estrutura

```
index.html                     Nutrição › Diário
relatorios.html                Nutrição › Relatórios
treinos.html                   Treino › treinos, execução, evolução e exercícios
config.html                    Ajustes
css/app.css                    estilos (tokens de tema claro/escuro)
js/db.js                       camada IndexedDB + localStorage (+ backup/merge)
js/busca.js                    busca tokenizada sem acentos, TACO/IBGE priorizados
js/diario.js                   tela Diário
js/sugestao.js                 monta o prato: montagens típicas, histórico e porções
js/barras.js                   leitor de código de barras + Open Food Facts
js/glicemia.js                 carga glicêmica estimada da refeição e o que dilui
js/agua-aviso.js               ritmo da água (13h/18h), alerta e notificação
js/relatorios.js               tela Relatórios (Chart.js)
js/treinos.js                  treinos, execução com carga e evolução (Chart.js)
js/exercicios.js               biblioteca de exercícios da academia (gerado)
js/config.js                   tela Ajustes (gasto, dieta alvo, backup, conta)
js/sync.js                     conta (Supabase Auth) + sincronização do backup
js/login-gate.js               porta de entrada: sem conta, sem app
js/caros.js                    alimentos caros: os que fazem o dia estourar
js/projecao.js                 projeção do fim do dia (mediana por refeição)
js/refresh.js                  pull-to-refresh
data/foods.json                banco de ~18.000 alimentos gerado
vendor/                        Tom Select e Chart.js vendorizados (offline)
tools/build-foods.mjs          gerador do banco de alimentos
tools/curados.mjs              camada curada (pratos de vida real)
tools/marcas.mjs               camada de marcas brasileiras (valores de rótulo)
tools/chocolates.mjs           camada de chocolates e bombons (massa, gourmet, bean-to-bar)
tools/pastas.mjs               camada de pastas de amendoim, castanhas e sementes
tools/sorvetes.mjs             camada de sorvetes, picolés e gelaterias
tools/build-exercicios.mjs     gerador da biblioteca de exercícios
tools/build-standalone.mjs     gera controle-de-macros.html (arquivo único)
tools/stamp-assets.mjs         carimba ?v=<hash do conteúdo> nos js/css das páginas
```
