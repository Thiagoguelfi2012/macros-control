#!/usr/bin/env node
/**
 * Carimba ?v=<versão> nos js/css das páginas.
 *
 * Sem isso o navegador pode continuar servindo um js/db.js antigo (com a
 * versão anterior da base) e o app fica preso numa lista de alimentos velha,
 * mesmo depois de publicarmos uma nova. A versão usada é a FOODS_VERSION.
 *
 * Uso: node tools/stamp-assets.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const versao = readFileSync(join(ROOT, 'js/db.js'), 'utf8').match(/FOODS_VERSION = (\d+)/)[1];

for (const arquivo of ['index.html', 'relatorios.html', 'config.html']) {
  const caminho = join(ROOT, arquivo);
  const html = readFileSync(caminho, 'utf8')
    .replace(/(src|href)="((?:js|css|vendor)\/[^"?]+)(?:\?v=\d+)?"/g, `$1="$2?v=${versao}"`);
  writeFileSync(caminho, html);
}
console.log(`assets carimbados com ?v=${versao}`);
