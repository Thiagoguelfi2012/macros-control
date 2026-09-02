#!/usr/bin/env node
/**
 * Carimba ?v=<hash> nos js/css das páginas.
 *
 * Sem isso o navegador pode continuar servindo um js antigo depois de
 * publicarmos uma versão nova — foi o que aconteceu quando o carimbo era a
 * FOODS_VERSION: mudar só o JavaScript não mudava a URL, e o celular ficava
 * com o arquivo velho em cache. Agora cada arquivo leva o hash do seu próprio
 * conteúdo, então qualquer alteração muda a URL daquele arquivo (e só dele).
 *
 * Uso: node tools/stamp-assets.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const hashes = new Map();
const hashDe = (rel) => {
  if (!hashes.has(rel))
    hashes.set(rel, createHash('sha1').update(readFileSync(join(ROOT, rel))).digest('hex').slice(0, 8));
  return hashes.get(rel);
};

let n = 0;
for (const arquivo of ['index.html', 'relatorios.html', 'config.html', 'treinos.html']) {
  const caminho = join(ROOT, arquivo);
  const html = readFileSync(caminho, 'utf8').replace(
    /(src|href)="((?:js|css|vendor)\/[^"?]+)(?:\?v=[0-9a-f]+)?"/g,
    (_, attr, rel) => `${attr}="${rel}?v=${hashDe(rel)}"`
  );
  writeFileSync(caminho, html);
  n++;
}
console.log(`assets carimbados em ${n} páginas (${hashes.size} arquivos, hash do conteúdo)`);
