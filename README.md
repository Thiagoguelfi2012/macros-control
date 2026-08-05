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
  gorduras com filtros **dia, semana, mês, trimestre, semestre e ano** (com navegação
  entre períodos); gráfico de calorias por subperíodo com linha do gasto estimado;
  distribuição dos macros; configuração de **gasto basal (TMB)** e **gasto médio
  diário (TDEE)** para exibir o **déficit/superávit calórico** do período.
- **Alimentos próprios**: no modal de adição, "Não encontrou? Cadastre um alimento
  próprio" — informe os valores do rótulo em qualquer porção de referência (ex.: dose
  de 30 g), com nome de porção opcional para registro rápido. Ficam salvos no
  dispositivo, aparecem no topo da busca como "meu alimento" e podem ser excluídos na
  lista "Meus alimentos" (registros antigos preservam o snapshot).
- Tema claro/escuro automático (segue o sistema).

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
js/db.js                       camada IndexedDB + localStorage
js/busca.js                    busca tokenizada sem acentos, TACO/IBGE priorizados
js/diario.js                   tela Diário
js/relatorios.js               tela Relatórios (Chart.js)
data/foods.json                banco de 10.000 alimentos gerado
vendor/                        Tom Select e Chart.js vendorizados (offline)
tools/build-foods.mjs          gerador do banco de alimentos
```
