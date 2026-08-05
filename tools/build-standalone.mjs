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
<header class="topbar">
  <div class="brand"><span class="dot"></span> Controle de Macros</div>
  <nav>
    <a href="#" data-view="view-diario" class="active">Diário</a>
    <a href="#" data-view="view-relatorios">Relatórios</a>
  </nav>
</header>

<section id="view-diario">
  <main>${mainDiario}</main>
</section>

<section id="view-relatorios" hidden>
  <main>${mainRelatorios}</main>
</section>

<script>${foodsJs}</script>
<script>
${read('vendor/tom-select.complete.min.js')}
</script>
<script>
${read('vendor/chart.umd.min.js')}
</script>
<script>
${read('js/db.js')}
</script>
<script>
${read('js/busca.js')}
</script>
<script>
${read('js/diario.js')}
</script>
<script>
${read('js/relatorios.js')}
</script>
<script>
// troca de abas da versão de página única
document.querySelectorAll('.topbar nav a[data-view]').forEach((a) => {
  a.addEventListener('click', (ev) => {
    ev.preventDefault();
    document.querySelectorAll('.topbar nav a[data-view]').forEach((x) => x.classList.toggle('active', x === a));
    document.querySelectorAll('section[id^="view-"]').forEach((s) => (s.hidden = s.id !== a.dataset.view));
    if (a.dataset.view === 'view-relatorios') document.dispatchEvent(new Event('relatorios:refresh'));
    if (a.dataset.view === 'view-diario') document.dispatchEvent(new Event('diario:refresh'));
  });
});
</script>
</body>
</html>
`;

const out = join(ROOT, 'controle-de-macros.html');
writeFileSync(out, html);
console.log(`controle-de-macros.html gerado (${(html.length / 1024 / 1024).toFixed(2)} MB)`);
