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

- **Diário** (`index.html`): botão "Adicionar alimento" abre um modal com busca
  estilo select2 (Tom Select) sobre **10.000 alimentos**; quantidade em **gramas ou
  medidas caseiras** (unidade, fatia, xícara, concha…) com prévia dos macros; data e
  hora registradas (e editáveis depois). Histórico agrupado por dia, em ordem
  descendente, com totais por dia e ações de editar/excluir por registro.
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
- **Conta e sincronização** (opcional, via Supabase): login por e-mail/senha e
  backup na nuvem, sincronizando entre aparelhos. Veja abaixo.
- Tema claro/escuro automático (segue o sistema).

## Conta e sincronização (Supabase, plano gratuito)

O app não tem servidor próprio: o login usa o **Supabase Auth** (e-mail/senha) e os
dados ficam em uma tabela com **RLS** — cada usuário só enxerga a própria linha. As
chamadas são REST puras no navegador (sem SDK). Configuração (uma vez):

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

3. (Recomendado) Em **Authentication → Sign In / Up → Email**, desligue
   "Confirm email" para o login funcionar sem etapa de confirmação.
4. Em **Settings → API**, copie a **Project URL** e a **anon key** e cole no card
   "Conta e sincronização" dos Relatórios (uma vez por aparelho) — ou grave-as em
   `DEFAULT_URL`/`DEFAULT_ANON_KEY` no `js/sync.js` para valerem para todos os
   aparelhos. A anon key é pública por design; a proteção vem das políticas RLS.

Como sincroniza: baixa o backup remoto, soma com o local (mesma regra do importar —
nada é apagado, registros idênticos não duplicam) e sobe a união. Mudanças locais
sobem sozinhas ~4 s depois; ao abrir o app conectado, sincroniza de novo. Quem
usava só o modo local importa o backup antigo e ele sobe na sequência.

Obs.: dentro da página hospedada no claude.ai o navegador bloqueia chamadas
externas — use o app no endereço próprio (GitHub Pages) ou no arquivo standalone.

## Dados

- Registros de consumo: **IndexedDB** do navegador (persistente, por dispositivo).
- Configurações (TMB/TDEE): `localStorage`.
- Banco de alimentos: `data/foods.json` (~2,1 MB, 16.666 itens), carregado no IndexedDB
  na primeira visita. Valores por 100 g. Fontes:
  - **TACO** (UNICAMP) — ~590 alimentos, PT nativo;
  - **TBCA** (USP/BRASILFOODS) — ~5.340 alimentos em PT, incluindo preparações e pratos
    prontos (sushi, feijoada, pizzas, lasanhas, salgados…);
  - **Curados** (`tools/curados.mjs`) — ~130 itens de vida real ausentes das tabelas
    oficiais (whey e suplementos, temaki, esfiha, redes de fast food, industrializados),
    com valores típicos de rótulo (estimativas);
  - **IBGE/POF** — ~1.880 alimentos, PT nativo;
  - **USDA SR28** — ~8.720 alimentos, nomes traduzidos por glossário EN→PT;
  - Medidas caseiras: `WEIGHT.txt` do SR28 + tabela de medidas usuais brasileiras.

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
