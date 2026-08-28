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
  select2 (Tom Select) sobre **~17.800 alimentos** (TACO, **TBCA**, IBGE, USDA,
  marcas brasileiras e pratos curados); quantidade em **gramas, mililitros ou
  medidas caseiras** (unidade, fatia, xícara, concha, lata, dose…) com prévia dos
  macros; monta refeição com vários itens de uma vez (com impacto na meta antes de
  salvar) e a refeição em montagem sobrevive ao app ir para segundo plano; data e
  hora registradas (e editáveis depois). Histórico agrupado por dia, em ordem
  descendente, com totais por dia e ações de repetir/editar/excluir por registro.
- **Relatório para o médico**: o botão **PDF** na barra de filtros abre uma prévia
  com duas saídas. **Baixar PDF** gera o arquivo para impressão (jsPDF, com os
  gráficos como imagem). **Enviar HTML** gera um **arquivo HTML interativo e
  autocontido** (~230 KB, com o Chart.js embutido) para mandar pelo WhatsApp: os
  gráficos têm tooltip, os dias abrem e fecham, e há botões de abrir tudo e de
  imprimir. Nos dois casos a entrega usa a folha de compartilhar do celular
  (`navigator.share`) e cai para download direto no computador.
- **Relatórios** (`relatorios.html`): totais de calorias/proteínas/carboidratos/
  gorduras com filtros por **janelas móveis** (1, 7, 15, 30, 90 dias e 1 ano, com
  navegação entre janelas); gráfico de calorias por dia/mês com linha do gasto
  estimado e da dieta alvo; déficit calórico acumulado; distribuição dos macros;
  **déficit/superávit calórico** do período, calculado a partir do gasto médio
  diário definido em Configurações.
- **Treinos** (`treinos.html`, área Treino): três abas.
  - **Treinos** — no topo, a **frequência da semana**: um círculo por dia
    (segunda a domingo), marcado nos dias em que houve treino (com o número
    quando houve mais de um), o dia de hoje destacado e a média das semanas
    anteriores logo abaixo. Dá para **andar pelas semanas passadas** arrastando
    o cartão para o lado (ou pelas setas ‹ ›), até a semana do primeiro
    registro — o histórico importado entra nessa conta. Em seguida, cartões com os treinos montados (nome, foco,
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
    intervalo do exercício, e um **insight de progressão** quando a carga daquele
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
    semana e uma barra por semana), a **lista das execuções** do período com
    data, treino, quantos exercícios e quanto durou, cada uma com um botão para
    **excluir** um treino que tenha entrado por engano, **duração dos treinos** em barras (com tempo
    total e média) e um gráfico de linha por exercício com a **progressão de
    carga** ao longo das execuções, com o **valor escrito em cada ponto**, uma
    marca no eixo X por execução e no eixo Y por carga registrada. Filtros por
    treino e por período (7, 15, 30, 90, 180 dias, 1 ano ou tudo); execuções
    deixadas abertas por mais de 4 h ficam fora das contas de tempo.
  - **Exercícios** — biblioteca com **166 exercícios** de uma academia padrão
    (Smart Fit): aparelhos, polias, Smith, halteres/barras e peso corporal,
    agrupados por músculo e filtráveis por grupo e equipamento. É de onde saem os
    exercícios ao montar um treino novo.

  Exercícios de **cardio** registram, além da carga, **tempo (min)** e **BPM
  médio** — a biblioteca já marca isso sozinha para os aparelhos de cardio, e
  qualquer exercício pode ligar as duas caixas no editor. Na Evolução esse
  exercício ganha um gráfico com **três eixos** (carga à esquerda, tempo e BPM à
  direita), cada série na sua cor.

  Séries podem ser contadas em **repetições, segundos** (isometrias como a prancha)
  ou **minutos** (cardio). A **carga** é o número que o usuário registra para
  acompanhar a progressão e também tem unidade própria — **kg**, **segundos** (a
  prancha progride em tempo, não em peso), **minutos** ou **nível** —, usada nos
  cartões, na execução e nos eixos dos gráficos de evolução.

  O **histórico de cargas anterior ao app** (vindo da tela "Progresso de Cargas"
  do MFIT Personal) é importado junto com a ficha, com ids determinísticos — as
  execuções antigas já aparecem nos gráficos de evolução e reimportar não
  duplica nada. Para trazer histórico de outro aparelho, o caminho continua sendo
  o backup `.json` em Ajustes.

  Na primeira abertura o app já vem com a ficha atual do usuário (três treinos:
  `P \ Del \ T`, `D \ Trap \ B` e `MMII \ Abs`), com séries, repetições, carga e
  intervalo de cada exercício — é só ajustar ou trocar.
- **Ajustes** (`config.html`): tela própria com gasto energético (TMB/TDEE),
  **dieta alvo** (alvos diários de calorias e macros, com as kcal implícitas
  calculadas), **backup e transferência** e **conta e sincronização**. A dieta alvo
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
- **Conta e sincronização** (opcional, via Supabase): **login com Google**, backup
  na nuvem e sincronização entre aparelhos, com os dados de cada usuário separados.
  Veja abaixo.
- Tema claro/escuro automático (segue o sistema).

## Conta e sincronização (Supabase, plano gratuito)

O app não tem servidor próprio: o login usa o **Supabase Auth** com o provedor
**Google** e os dados ficam em uma tabela com **RLS** — cada usuário só enxerga a
própria linha. As chamadas são REST puras no navegador (sem SDK). Configuração
(uma vez):

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
- Banco de alimentos: `data/foods.json` (~2,3 MB, **17.919 itens**, ~10.900 com
  medidas caseiras e ~890 líquidos medidos em ml/L), carregado no IndexedDB na
  primeira visita. Valores por 100 g (ou 100 ml). Fontes, na ordem de prioridade da
  busca:

  | Fonte | Itens | O que traz |
  | --- | ---: | --- |
  | **TACO** (UNICAMP) | 590 | alimentos brasileiros in natura e preparados, PT nativo |
  | **TBCA** (USP/BRASILFOODS) | 5.340 | a maior fonte em PT: além dos alimentos, muita **preparação e prato pronto** — sushi, feijoada, pizzas, lasanhas, salgados, bolos, saladas, com variações "com/sem sal", "com/sem óleo", frito/assado/cozido |
  | **Marcas** (`tools/marcas.mjs`) | 593 | produtos de marcas brasileiras com valores de rótulo (iogurtes, leites, queijos, congelados, biscoitos, chocolates, bebidas, suplementos…) |
  | **Chocolates** (`tools/chocolates.mjs`) | 159 | catálogo de chocolates e bombons: Cacau Show (Lacreme, Zero, Mil Folhas, trufas, tabletes, bombons, Lanut), Kopenhagen, Brasil Cacau, Lacta, Garoto, Nestlé, Hershey's, Ferrero/Kinder, Lindt, Arcor, Neugebauer, Havanna e os bean-to-bar brasileiros (Dengo, Amma, Luisa Abram, Nugali, Baianí, Mendoá) |
  | **Pastas** (`tools/pastas.mjs`) | 70 | pastas de amendoim, castanhas e sementes: Dr. Peanut e Vitapower (todos os sabores), Amendocrem, Reese's, Skippy, Jif, as integrais de mercado natural (Mandubim, Pura Vida, Vitao, Jasmine, Mãe Terra), as de marcas de suplemento e as de castanha de caju, amêndoa, pistache, gergelim (tahine) e coco |
  | **Curados** (`tools/curados.mjs`) | 515 | pratos de vida real ausentes das tabelas: temaki e sushi, esfihas e salgados de festa, docinhos, fast food, frutos do mar, churrasco, bolos de confeitaria, esfihas doces de esfiharia (chocolate, Nutella, Sonho de Valsa, Ouro Branco, morango com banana, brigadeiro, Romeu e Julieta…) e a mesa de restaurante chinês (banana caramelizada, agridoces, chop suey, yakisoba, bifum, guioza, wonton) |
  | **IBGE/POF** | 1.873 | alimentos e preparações, PT nativo |
  | **USDA SR28** | 8.717 | complemento, nomes traduzidos por glossário EN→PT |

  Medidas caseiras: `WEIGHT.txt` do SR28 + tabela de medidas usuais brasileiras
  (`tools/build-foods.mjs`), incluindo pesos médios por unidade (filé de sassami
  ~50 g, coxa ~65 g, bife ~100 g…) e medidas de líquidos (lata, garrafa, copo, dose).

  A busca (`js/busca.js`) normaliza acentos e grafias populares (kibe→quibe,
  mussarela→mucarela, miojo→macarrão instantâneo), ignora palavras de ligação
  ("filé catupiry" acha "Filé mignon ao catupiry") e ordena priorizando as fontes em
  português — alimentos próprios primeiro, depois TACO/TBCA/marcas/curados, IBGE e,
  por último, o USDA traduzido.

Para regenerar o banco (baixa os dados brutos das fontes públicas no GitHub):

```bash
node tools/build-foods.mjs
```

Ao regenerar com mudanças, incremente o `v` gravado pelo script e o `FOODS_VERSION`
em `js/db.js` (e rode `node tools/stamp-assets.mjs`) para forçar os navegadores a
recarregarem a base.

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
js/relatorios.js               tela Relatórios (Chart.js)
js/treinos.js                  treinos, execução com carga e evolução (Chart.js)
js/exercicios.js               biblioteca de exercícios da academia (gerado)
js/config.js                   tela Ajustes (gasto, dieta alvo, backup, conta)
js/sync.js                     conta (Supabase Auth) + sincronização do backup
js/refresh.js                  pull-to-refresh
data/foods.json                banco de ~17.800 alimentos gerado
vendor/                        Tom Select e Chart.js vendorizados (offline)
tools/build-foods.mjs          gerador do banco de alimentos
tools/curados.mjs              camada curada (pratos de vida real)
tools/marcas.mjs               camada de marcas brasileiras (valores de rótulo)
tools/chocolates.mjs           camada de chocolates e bombons (massa, gourmet, bean-to-bar)
tools/pastas.mjs               camada de pastas de amendoim, castanhas e sementes
tools/build-exercicios.mjs     gerador da biblioteca de exercícios
tools/build-standalone.mjs     gera controle-de-macros.html (arquivo único)
```
