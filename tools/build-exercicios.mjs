#!/usr/bin/env node
/**
 * Gera js/exercicios.js: a biblioteca de exercícios disponíveis em uma
 * academia Smart Fit (aparelhos, polias, pesos livres e peso corporal).
 *
 * A lista é curada à mão — o objetivo é cobrir o que existe na sala de
 * musculação de uma unidade padrão, com nomes iguais aos que os professores
 * usam no Brasil, para dar para montar qualquer treino sem cadastrar nada.
 *
 * Uso: node tools/build-exercicios.mjs
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// [nome, grupo, equipamento]
const LISTA = [
  /* ---- Peito ---- */
  ['Supino Reto com Barra', 'Peito', 'Barra'],
  ['Supino Reto com Halteres', 'Peito', 'Halteres'],
  ['Supino Inclinado com Barra Reta', 'Peito', 'Barra'],
  ['Supino Inclinado com Halteres', 'Peito', 'Halteres'],
  ['Supino Declinado com Barra', 'Peito', 'Barra'],
  ['Supino Declinado com Halteres', 'Peito', 'Halteres'],
  ['Supino Reto na Máquina', 'Peito', 'Máquina'],
  ['Supino Inclinado na Máquina', 'Peito', 'Máquina'],
  ['Supino Reto no Smith', 'Peito', 'Smith'],
  ['Supino Inclinado no Smith', 'Peito', 'Smith'],
  ['Crucifixo Reto com Halteres', 'Peito', 'Halteres'],
  ['Crucifixo Inclinado com Halteres', 'Peito', 'Halteres'],
  ['Voador (Peck Deck)', 'Peito', 'Máquina'],
  ['Crossover Polia Alta', 'Peito', 'Polia'],
  ['Crossover Polia Média', 'Peito', 'Polia'],
  ['Crossover Polia Baixa', 'Peito', 'Polia'],
  ['Pullover com Halter', 'Peito', 'Halteres'],
  ['Flexão de Braço', 'Peito', 'Peso corporal'],
  ['Flexão de Braço Inclinada', 'Peito', 'Peso corporal'],
  ['Mergulho nas Paralelas', 'Peito', 'Peso corporal'],

  /* ---- Costas ---- */
  ['Puxada Frontal na Polia Alta', 'Costas', 'Polia'],
  ['Puxada Frontal Pegada Aberta', 'Costas', 'Polia'],
  ['Puxada Frontal Pegada Supinada', 'Costas', 'Polia'],
  ['Puxada Frontal Pegada Neutra (Triângulo)', 'Costas', 'Polia'],
  ['Puxada Articulada na Máquina', 'Costas', 'Máquina'],
  ['Remada Baixa na Polia (Triângulo)', 'Costas', 'Polia'],
  ['Remada Baixa Pegada Aberta', 'Costas', 'Polia'],
  ['Remada Curvada com Barra', 'Costas', 'Barra'],
  ['Remada Curvada com Halteres', 'Costas', 'Halteres'],
  ['Remada Unilateral com Halter (Serrote)', 'Costas', 'Halteres'],
  ['Remada Cavalinho', 'Costas', 'Barra'],
  ['Remada Articulada na Máquina', 'Costas', 'Máquina'],
  ['Remada Máquina Pegada Neutra', 'Costas', 'Máquina'],
  ['Barra Fixa', 'Costas', 'Peso corporal'],
  ['Barra Fixa Assistida (Graviton)', 'Costas', 'Máquina'],
  ['Pulldown com Braços Estendidos', 'Costas', 'Polia'],
  ['Pullover na Polia Alta', 'Costas', 'Polia'],
  ['Remada Baixa Unilateral na Polia', 'Costas', 'Polia'],
  ['Levantamento Terra', 'Costas', 'Barra'],
  ['Levantamento Terra Romeno', 'Costas', 'Barra'],

  /* ---- Trapézio ---- */
  ['Encolhimento com Halteres', 'Trapézio', 'Halteres'],
  ['Encolhimento com Barra', 'Trapézio', 'Barra'],
  ['Encolhimento no Smith', 'Trapézio', 'Smith'],
  ['Encolhimento na Polia', 'Trapézio', 'Polia'],
  ['Remada Alta com Barra', 'Trapézio', 'Barra'],
  ['Remada Alta na Polia', 'Trapézio', 'Polia'],
  ['Face Pull na Polia', 'Trapézio', 'Polia'],

  /* ---- Ombros ---- */
  ['Desenvolvimento com Halteres', 'Ombros', 'Halteres'],
  ['Desenvolvimento com Barra', 'Ombros', 'Barra'],
  ['Desenvolvimento na Máquina', 'Ombros', 'Máquina'],
  ['Desenvolvimento no Smith', 'Ombros', 'Smith'],
  ['Desenvolvimento Arnold', 'Ombros', 'Halteres'],
  ['Elevação Lateral com Halteres', 'Ombros', 'Halteres'],
  ['Elevação Lateral na Polia', 'Ombros', 'Polia'],
  ['Elevação Lateral na Máquina', 'Ombros', 'Máquina'],
  ['Elevação Frontal com Halteres', 'Ombros', 'Halteres'],
  ['Elevação Frontal com Barra', 'Ombros', 'Barra'],
  ['Elevação Frontal na Polia', 'Ombros', 'Polia'],
  ['Crucifixo Inverso na Máquina', 'Ombros', 'Máquina'],
  ['Crucifixo Inverso com Halteres', 'Ombros', 'Halteres'],
  ['Crucifixo Inverso na Polia', 'Ombros', 'Polia'],
  ['Elevação Lateral Inclinada', 'Ombros', 'Halteres'],

  /* ---- Bíceps ---- */
  ['Rosca Direta com Barra', 'Bíceps', 'Barra'],
  ['Rosca Direta com Barra W', 'Bíceps', 'Barra'],
  ['Rosca Direta com Halteres', 'Bíceps', 'Halteres'],
  ['Rosca Alternada com Halteres', 'Bíceps', 'Halteres'],
  ['Rosca Martelo', 'Bíceps', 'Halteres'],
  ['Rosca Concentrada', 'Bíceps', 'Halteres'],
  ['Rosca Scott com Barra W', 'Bíceps', 'Barra'],
  ['Rosca Scott na Máquina', 'Bíceps', 'Máquina'],
  ['Rosca na Polia Baixa', 'Bíceps', 'Polia'],
  ['Rosca Martelo na Polia (Corda)', 'Bíceps', 'Polia'],
  ['Rosca Inclinada com Halteres', 'Bíceps', 'Halteres'],
  ['Rosca 21', 'Bíceps', 'Barra'],

  /* ---- Tríceps ---- */
  ['Tríceps na Polia com Barra Reta', 'Tríceps', 'Polia'],
  ['Tríceps na Polia com Corda', 'Tríceps', 'Polia'],
  ['Tríceps na Polia com Barra V', 'Tríceps', 'Polia'],
  ['Tríceps Unilateral na Polia (Pegada Inversa)', 'Tríceps', 'Polia'],
  ['Tríceps Testa com Barra W', 'Tríceps', 'Barra'],
  ['Tríceps Testa com Halteres', 'Tríceps', 'Halteres'],
  ['Tríceps Francês', 'Tríceps', 'Halteres'],
  ['Tríceps Coice (Kickback)', 'Tríceps', 'Halteres'],
  ['Tríceps na Máquina', 'Tríceps', 'Máquina'],
  ['Mergulho no Banco', 'Tríceps', 'Peso corporal'],
  ['Supino Fechado', 'Tríceps', 'Barra'],
  ['Paralelas para Tríceps', 'Tríceps', 'Peso corporal'],

  /* ---- Antebraço ---- */
  ['Rosca de Punho com Barra', 'Antebraço', 'Barra'],
  ['Rosca de Punho Inversa', 'Antebraço', 'Barra'],
  ['Rosca Inversa com Barra W', 'Antebraço', 'Barra'],
  ['Farmer Walk com Halteres', 'Antebraço', 'Halteres'],

  /* ---- Quadríceps ---- */
  ['Agachamento Livre com Barra', 'Quadríceps', 'Barra'],
  ['Agachamento no Smith', 'Quadríceps', 'Smith'],
  ['Agachamento Hack', 'Quadríceps', 'Máquina'],
  ['Leg Press 45°', 'Quadríceps', 'Máquina'],
  ['Leg Press Horizontal', 'Quadríceps', 'Máquina'],
  ['Cadeira Extensora', 'Quadríceps', 'Máquina'],
  ['Agachamento Búlgaro', 'Quadríceps', 'Halteres'],
  ['Afundo com Halteres', 'Quadríceps', 'Halteres'],
  ['Avanço no Smith', 'Quadríceps', 'Smith'],
  ['Passada (Walking Lunge)', 'Quadríceps', 'Halteres'],
  ['Agachamento Goblet', 'Quadríceps', 'Halteres'],
  ['Agachamento Sumô com Halter', 'Quadríceps', 'Halteres'],
  ['Subida no Banco (Step Up)', 'Quadríceps', 'Halteres'],

  /* ---- Posterior de coxa ---- */
  ['Mesa Flexora', 'Posterior de coxa', 'Máquina'],
  ['Cadeira Flexora', 'Posterior de coxa', 'Máquina'],
  ['Flexora em Pé (Unilateral)', 'Posterior de coxa', 'Máquina'],
  ['Stiff com Barra', 'Posterior de coxa', 'Barra'],
  ['Stiff com Halteres', 'Posterior de coxa', 'Halteres'],
  ['Levantamento Terra Sumô', 'Posterior de coxa', 'Barra'],
  ['Good Morning', 'Posterior de coxa', 'Barra'],
  ['Elevação Pélvica com Barra', 'Posterior de coxa', 'Barra'],

  /* ---- Glúteos ---- */
  ['Elevação Pélvica na Máquina', 'Glúteos', 'Máquina'],
  ['Glúteo na Polia (Coice)', 'Glúteos', 'Polia'],
  ['Glúteo na Máquina (Coice)', 'Glúteos', 'Máquina'],
  ['Cadeira Abdutora', 'Glúteos', 'Máquina'],
  ['Abdução no Cabo', 'Glúteos', 'Polia'],
  ['Ponte de Glúteo no Solo', 'Glúteos', 'Peso corporal'],
  ['Agachamento Sumô no Smith', 'Glúteos', 'Smith'],

  /* ---- Adutores ---- */
  ['Cadeira Adutora', 'Adutores', 'Máquina'],
  ['Adução no Cabo', 'Adutores', 'Polia'],

  /* ---- Panturrilha ---- */
  ['Panturrilha em Pé na Máquina', 'Panturrilha', 'Máquina'],
  ['Panturrilha Sentado na Máquina', 'Panturrilha', 'Máquina'],
  ['Panturrilha no Leg Press', 'Panturrilha', 'Máquina'],
  ['Panturrilha no Smith', 'Panturrilha', 'Smith'],
  ['Panturrilha com Halteres', 'Panturrilha', 'Halteres'],

  /* ---- Abdômen ---- */
  ['Abdominal Supra no Solo', 'Abdômen', 'Peso corporal'],
  ['Abdominal na Máquina', 'Abdômen', 'Máquina'],
  ['Abdominal na Polia Alta (Ajoelhado)', 'Abdômen', 'Polia'],
  ['Abdominal Infra (Elevação de Pernas)', 'Abdômen', 'Peso corporal'],
  ['Elevação de Pernas na Barra Fixa', 'Abdômen', 'Peso corporal'],
  ['Elevação de Pernas no Banco', 'Abdômen', 'Peso corporal'],
  ['Prancha Isométrica', 'Abdômen', 'Peso corporal'],
  ['Prancha Lateral', 'Abdômen', 'Peso corporal'],
  ['Abdominal Bicicleta', 'Abdômen', 'Peso corporal'],
  ['Abdominal Oblíquo', 'Abdômen', 'Peso corporal'],
  ['Russian Twist', 'Abdômen', 'Anilha'],
  ['Abdominal Canivete', 'Abdômen', 'Peso corporal'],
  ['Rotação de Tronco na Polia (Lenhador)', 'Abdômen', 'Polia'],
  ['Roda Abdominal', 'Abdômen', 'Peso corporal'],

  /* ---- Lombar ---- */
  ['Hiperextensão Lombar (Banco Romano)', 'Lombar', 'Peso corporal'],
  ['Extensão Lombar na Máquina', 'Lombar', 'Máquina'],
  ['Superman no Solo', 'Lombar', 'Peso corporal'],

  /* ---- Corpo inteiro / funcional ---- */
  ['Levantamento Terra com Halteres', 'Corpo inteiro', 'Halteres'],
  ['Swing com Kettlebell', 'Corpo inteiro', 'Kettlebell'],
  ['Thruster com Halteres', 'Corpo inteiro', 'Halteres'],
  ['Burpee', 'Corpo inteiro', 'Peso corporal'],
  ['Corda Naval', 'Corpo inteiro', 'Funcional'],
  ['Agachamento com Salto', 'Corpo inteiro', 'Peso corporal'],
  ['Remada Renegada', 'Corpo inteiro', 'Halteres'],

  /* ---- Cardio ---- */
  ['Esteira', 'Cardio', 'Cardio'],
  ['Bicicleta Ergométrica', 'Cardio', 'Cardio'],
  ['Bicicleta Horizontal', 'Cardio', 'Cardio'],
  ['Elíptico (Transport)', 'Cardio', 'Cardio'],
  ['Escada (Stair)', 'Cardio', 'Cardio'],
  ['Remo Ergômetro', 'Cardio', 'Cardio'],
  ['Simulador de Escada', 'Cardio', 'Cardio'],
];

const semAcento = (t) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const idDe = (nome) =>
  semAcento(nome).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const vistos = new Set();
const exercicios = LISTA.map(([nome, grupo, equipamento]) => {
  const id = idDe(nome);
  if (vistos.has(id)) throw new Error(`exercício duplicado: ${nome}`);
  vistos.add(id);
  // exercícios sem carga externa não pedem kg na execução
  const semCarga = equipamento === 'Peso corporal' || equipamento === 'Cardio';
  return { id, nome, grupo, equipamento, semCarga };
});

const js = `/* Biblioteca de exercícios (Smart Fit) — gerado por tools/build-exercicios.mjs. Não editar à mão. */
window.EXERCICIOS = ${JSON.stringify(exercicios)};
window.EXERCICIOS_VERSAO = 1;
`;
writeFileSync(join(ROOT, 'js/exercicios.js'), js);
const grupos = [...new Set(exercicios.map((e) => e.grupo))];
console.log(`js/exercicios.js: ${exercicios.length} exercícios em ${grupos.length} grupos`);
console.log(grupos.join(' · '));
