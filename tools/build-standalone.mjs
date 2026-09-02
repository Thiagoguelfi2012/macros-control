#!/usr/bin/env node
/**
 * Gera controle-de-macros.html: o app inteiro (as duas telas, bibliotecas e o
 * banco de 10.000 alimentos) em um único arquivo HTML auto-contido — para abrir
 * direto no celular ou hospedar em qualquer lugar.
 *
 * Uso: node tools/build-standalone.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(ROOT, p), 'utf8');

const extractMain = (html) => html.match(/<main>([\s\S]*?)<\/main>/)[1];
const mainDiario = extractMain(read('index.html')); // inclui FAB e modais
const mainRelatorios = extractMain(read('relatorios.html'));
const mainConfig = extractMain(read('config.html'));
const mainTreinos = extractMain(read('treinos.html'));
// a execução e os modais de treino vivem fora do <main>
const treinoHtml = read('treinos.html');
const overlayExecucao = treinoHtml.match(/<!-- ---- Execução do treino ---- -->[\s\S]*?<!-- ---- Editor de treino ---- -->/)[0]
  .replace('<!-- ---- Editor de treino ---- -->', '');
const modaisTreino = treinoHtml.match(/<!-- ---- Editor de treino ---- -->[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<script/)[0]
  .replace(/<script$/, '');
// o relatório para impressão vive fora do <main>, mas precisa ir junto
const overlayRelatorio = read('relatorios.html').match(/<div id="relatorio-print"[\s\S]*?<\/div>\s*<\/div>/)[0];

// evita fechar a tag <script> por acidente dentro do JSON
const foodsJs = `window.FOODS_DATA = ${read('data/foods.json').replace(/</g, '\\u003c')};`;

const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Controle de Macros</title>
<style>
${read('vendor/tom-select.min.css')}
</style>
<style>
${read('css/app.css')}
</style>
</head>
<body>
<div class="barras">
  <header class="topbar">
    <div class="brand"><span class="dot"></span> <span class="txt">Controle de Macros</span></div>
    <nav class="nav-areas">
      <a href="#" data-area="nutricao" class="active">Nutrição</a>
      <a href="#" data-area="treino">Treino</a>
      <a href="#" data-area="ajustes" data-view="view-config">Ajustes</a>
    </nav>
  </header>
  <div class="subnav" id="subnav-nutricao">
    <a href="#" data-view="view-diario" class="active">Diário</a>
    <a href="#" data-view="view-relatorios">Relatórios</a>
  </div>
  <div class="subnav" id="subnav-treino" hidden>
    <button data-aba="lista" class="active">Treinos</button>
    <button data-aba="evolucao">Evolução</button>
    <button data-aba="biblioteca">Exercícios</button>
  </div>
</div>

<section id="view-diario">
  <main>${mainDiario}</main>
</section>

<section id="view-relatorios" hidden>
  <main>${mainRelatorios}</main>
</section>

<section id="view-treinos" hidden>
  <main>${mainTreinos}</main>
</section>

<section id="view-config" hidden>
  <main>${mainConfig}</main>
</section>

${overlayRelatorio}

${overlayExecucao}
${modaisTreino}

<script>${foodsJs}</script>
<script>
${read('vendor/tom-select.complete.min.js')}
</script>
<script>
${read('vendor/chart.umd.min.js')}
</script>
<script>
${read('vendor/jspdf.umd.min.js')}
</script>
<script>
${read('vendor/jspdf.plugin.autotable.min.js')}
</script>
<script>
${read('js/db.js')}
</script>
<script>
${read('js/exercicios.js')}
</script>
<script>
${read('js/busca.js')}
</script>
<script>
${read('js/sync.js')}
</script>
<script>
${read('js/sugestao.js')}
</script>
<script>
${read('js/barras.js')}
</script>
<script>
${read('js/diario.js')}
</script>
<script>
${read('js/relatorios.js')}
</script>
<script>
${read('js/treinos.js')}
</script>
<script>
${read('js/config.js')}
</script>
<script>
${read('js/refresh.js')}
</script>
<script>
// navegação em dois níveis da versão de página única
const mostrarView = (id) => {
  document.querySelectorAll('section[id^="view-"]').forEach((s) => (s.hidden = s.id !== id));
  if (id === 'view-relatorios') document.dispatchEvent(new Event('relatorios:refresh'));
  if (id === 'view-diario') document.dispatchEvent(new Event('diario:refresh'));
  if (id === 'view-config') document.dispatchEvent(new Event('config:refresh'));
  if (id === 'view-treinos') document.dispatchEvent(new Event('treinos:refresh'));
};
const VIEW_INICIAL = { nutricao: 'view-diario', treino: 'view-treinos', ajustes: 'view-config' };
document.querySelectorAll('.nav-areas a[data-area]').forEach((a) => {
  a.addEventListener('click', (ev) => {
    ev.preventDefault();
    const area = a.dataset.area;
    document.querySelectorAll('.nav-areas a[data-area]').forEach((x) => x.classList.toggle('active', x === a));
    document.getElementById('subnav-nutricao').hidden = area !== 'nutricao';
    document.getElementById('subnav-treino').hidden = area !== 'treino';
    if (area === 'nutricao') {
      const ativo = document.querySelector('#subnav-nutricao a.active') || document.querySelector('#subnav-nutricao a');
      mostrarView(ativo.dataset.view);
    } else {
      mostrarView(VIEW_INICIAL[area]);
    }
  });
});
document.querySelectorAll('#subnav-nutricao a[data-view]').forEach((a) => {
  a.addEventListener('click', (ev) => {
    ev.preventDefault();
    document.querySelectorAll('#subnav-nutricao a[data-view]').forEach((x) => x.classList.toggle('active', x === a));
    mostrarView(a.dataset.view);
  });
});
</script>
</body>
</html>
`;

const out = join(ROOT, 'controle-de-macros.html');
writeFileSync(out, html);
console.log(`controle-de-macros.html gerado (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
