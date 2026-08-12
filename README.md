# Controle de Macros

Site para controle de calorias, proteínas, carboidratos e gorduras — 100% front-end
(HTML/CSS/JS puro), sem servidor: funciona offline e roda em qualquer hosting estático.

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
  select2 (Tom Select) sobre **~17.500 alimentos** (TACO, **TBCA**, IBGE, USDA,
  marcas brasileiras e pratos curados); quantidade em **gramas, mililitros ou
  medidas caseiras** (unidade, fatia, xícara, concha, lata, dose…) com prévia dos
  macros; monta refeição com vários itens de uma vez (com impacto na meta antes de
  salvar) e a refeição em montagem sobrevive ao app ir para segundo plano; data e
  hora registradas (e editáveis depois). Histórico agrupado por dia, em ordem
  descendente, com totais por dia e ações de repetir/editar/excluir por registro.
- **Relatórios** (`relatorios.html`): totais de calorias/proteínas/carboidratos/
  gorduras com filtros por **janelas móveis** (1, 7, 15, 30, 90 dias e 1 ano, com
  navegação entre janelas); gráfico de calorias por dia/mês com linha do gasto
  estimado e da dieta alvo; déficit calórico acumulado; distribuição dos macros;
  configuração de **gasto basal (TMB)** e **gasto médio diário (TDEE)** para exibir
  o **déficit/superávit calórico** do período.
- **Dieta alvo**: alvos diários de proteínas/carboidratos/gorduras (com kcal
  implícitas calculadas). Gera o card "Dieta alvo × consumo" (média diária do
  período vs alvo, por macro), o anel do alvo no gráfico de distribuição e as
  barras de progresso de macros no card "Meta de hoje" do Diário.
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

- Registros de consumo: **IndexedDB** do navegador (com fallback em `localStorage`
  quando o IndexedDB é bloqueado, ex.: `file://` e iframes).
- Configurações (TMB/TDEE e dieta alvo): `localStorage`.
- Banco de alimentos: `data/foods.json` (~2,3 MB, **17.496 itens**, ~10.900 com
  medidas caseiras e ~890 líquidos medidos em ml/L), carregado no IndexedDB na
  primeira visita. Valores por 100 g (ou 100 ml). Fontes, na ordem de prioridade da
  busca:

  | Fonte | Itens | O que traz |
  | --- | ---: | --- |
  | **TACO** (UNICAMP) | 590 | alimentos brasileiros in natura e preparados, PT nativo |
  | **TBCA** (USP/BRASILFOODS) | 5.340 | a maior fonte em PT: além dos alimentos, muita **preparação e prato pronto** — sushi, feijoada, pizzas, lasanhas, salgados, bolos, saladas, com variações "com/sem sal", "com/sem óleo", frito/assado/cozido |
  | **Marcas** (`tools/marcas.mjs`) | 593 | produtos de marcas brasileiras com valores de rótulo (iogurtes, leites, queijos, congelados, biscoitos, chocolates, bebidas, suplementos…) |
  | **Curados** (`tools/curados.mjs`) | 383 | pratos de vida real ausentes das tabelas: temaki e sushi, esfihas e salgados de festa, docinhos, fast food, frutos do mar, churrasco, bolos de confeitaria |
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
em `js/db.js` para forçar os navegadores a recarregarem a base.

## Estrutura

```
index.html / relatorios.html   telas
css/app.css                    estilos (tokens de tema claro/escuro)
js/db.js                       camada IndexedDB + localStorage (+ backup/merge)
js/busca.js                    busca tokenizada sem acentos, TACO/IBGE priorizados
js/diario.js                   tela Diário
js/relatorios.js               tela Relatórios (Chart.js)
js/sync.js                     conta (Supabase Auth) + sincronização do backup
js/refresh.js                  pull-to-refresh
data/foods.json                banco de ~17.500 alimentos gerado
vendor/                        Tom Select e Chart.js vendorizados (offline)
tools/build-foods.mjs          gerador do banco de alimentos
tools/curados.mjs              camada curada (pratos de vida real)
tools/marcas.mjs               camada de marcas brasileiras (valores de rótulo)
tools/build-standalone.mjs     gera controle-de-macros.html (arquivo único)
```
