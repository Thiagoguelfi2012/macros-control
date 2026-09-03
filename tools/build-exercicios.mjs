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
  ['Puxada Fechada com Barra Reta', 'Costas', 'Polia'],
  ['Puxada Articulada na Máquina', 'Costas', 'Máquina'],
  ['Remada Baixa na Polia (Triângulo)', 'Costas', 'Polia'],
  ['Remada Baixa Pegada Aberta', 'Costas', 'Polia'],
  ['Remada Curvada com Barra', 'Costas', 'Barra'],
  ['Remada Curvada com Halteres', 'Costas', 'Halteres'],
  ['Remada Unilateral com Halter (Serrote)', 'Costas', 'Halteres'],
  ['Remada Cavalinho', 'Costas', 'Barra'],
  ['Remada Articulada na Máquina', 'Costas', 'Máquina'],
  ['Remada Máquina (Pegada Neutra)', 'Costas', 'Máquina'],
  ['Barra Fixa', 'Costas', 'Peso corporal'],
  ['Barra Fixa Assistida (Graviton)', 'Costas', 'Máquina'],
  ['Pulldown com Braços Estendidos', 'Costas', 'Polia'],
  ['Pulldown Barra Aberta', 'Costas', 'Polia'],
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
  ['Desenvolvimento Máquina (Pegada Neutra)', 'Ombros', 'Máquina'],
  ['Desenvolvimento no Smith', 'Ombros', 'Smith'],
  ['Desenvolvimento Arnold', 'Ombros', 'Halteres'],
  ['Elevação Lateral com Halteres', 'Ombros', 'Halteres'],
  ['Elevação Lateral Unilateral com Halteres', 'Ombros', 'Halteres'],
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
  ['Rosca Direta com Barra H', 'Bíceps', 'Barra'],
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
  ['Tríceps Testa na Polia com Corda', 'Tríceps', 'Polia'],
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
  ['Tríceps Paralelas no Gráviton', 'Tríceps', 'Máquina'],

  /* ---- Antebraço ---- */
  ['Rosca de Punho (Pegada Supinada)', 'Antebraço', 'Barra'],
  ['Rosca de Punho (Pegada Pronada)', 'Antebraço', 'Barra'],
  ['Rosca Inversa com Barra W', 'Antebraço', 'Barra'],
  ['Farmer Walk com Halteres', 'Antebraço', 'Halteres'],

  /* ---- Quadríceps ---- */
  ['Agachamento Livre com Barra', 'Quadríceps', 'Barra'],
  ['Agachamento no Smith', 'Quadríceps', 'Smith'],
  ['Agachamento Hack', 'Quadríceps', 'Máquina'],
  ['Leg Press 45°', 'Quadríceps', 'Máquina'],
  ['Leg Press Horizontal', 'Quadríceps', 'Máquina'],
  ['Cadeira Extensora', 'Quadríceps', 'Máquina'],
  ['Cadeira Extensora Unilateral', 'Quadríceps', 'Máquina'],
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
  ['Abdução de Quadril na Máquina (Cadeira Abdutora)', 'Glúteos', 'Máquina'],
  ['Abdução no Cabo', 'Glúteos', 'Polia'],
  ['Ponte de Glúteo no Solo', 'Glúteos', 'Peso corporal'],
  ['Agachamento Sumô no Smith', 'Glúteos', 'Smith'],

  /* ---- Adutores ---- */
  ['Adução de Quadril na Máquina (Cadeira Adutora)', 'Adutores', 'Máquina'],
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
  ['Prancha Alta', 'Abdômen', 'Peso corporal'],
  ['Abdominal Dead Bug', 'Abdômen', 'Peso corporal'],
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
  ['Bicicleta', 'Cardio', 'Cardio'],
  ['Bicicleta Horizontal', 'Cardio', 'Cardio'],
  ['Elíptico (Transport)', 'Cardio', 'Cardio'],
  ['Escada (Stair)', 'Cardio', 'Cardio'],
  ['Remo Ergômetro', 'Cardio', 'Cardio'],
  ['Simulador de Escada', 'Cardio', 'Cardio'],
];

// Músculos que o exercício também recruta, além do principal. Vale para a tela
// do treino em andamento: saber que o supino também puxa tríceps e ombro muda
// o que a pessoa espera sentir (e ajuda a não empilhar dois treinos no mesmo
// músculo em dias seguidos). As regras vão do movimento mais específico para o
// mais genérico e são somadas — a primeira que casa não interrompe as outras.
const AJUDANTES = [
  // ---- empurrar (peito/ombro/tríceps) ----
  [/supino|flexao de braco|desenvolvimento/, ['Tríceps', 'Ombros']],
  [/supino declinado/, ['Peito']],
  [/crucifixo (reto|inclinado)|voador|crossover/, ['Ombros']],
  [/pullover/, ['Costas', 'Tríceps']],
  [/mergulho|paralelas/, ['Peito', 'Tríceps', 'Ombros']],
  [/desenvolvimento|elevacao frontal/, ['Trapézio']],
  [/elevacao lateral/, ['Trapézio']],
  [/crucifixo inverso|face pull|remada alta/, ['Trapézio', 'Costas']],
  // ---- puxar (costas/bíceps) ----
  [/puxada|pulldown|barra fixa|remada|serrote/, ['Bíceps', 'Antebraço']],
  [/remada (curvada|cavalinho|unilateral)|serrote/, ['Trapézio', 'Lombar']],
  [/levantamento terra|terra romeno/, ['Lombar', 'Glúteos', 'Posterior de coxa', 'Trapézio']],
  [/rosca/, ['Antebraço']],
  [/encolhimento/, ['Antebraço']],
  [/triceps (testa|frances|coice|banco)/, ['Ombros']],
  // ---- pernas ----
  [/agachamento|leg press|hack|afundo|avanco|bulgaro|passada/, ['Glúteos', 'Posterior de coxa']],
  [/agachamento|afundo|avanco|bulgaro|passada|hack/, ['Abdômen']],
  [/agachamento (livre|frontal)|hack/, ['Lombar']],
  [/stiff|mesa flexora|flexora/, ['Glúteos', 'Lombar']],
  [/elevacao pelvica|gluteo|coice/, ['Posterior de coxa', 'Lombar']],
  [/step up|subida no banco/, ['Glúteos', 'Posterior de coxa', 'Abdômen']],
  [/good morning/, ['Lombar', 'Glúteos', 'Posterior de coxa']],
  [/hiperextensao|extensao lombar|superman/, ['Glúteos', 'Posterior de coxa']],
  [/lenhador|rotacao de tronco|russian twist/, ['Lombar', 'Ombros']],
  [/panturrilha/, []],
  [/extensora/, []],
  // ---- core e corpo inteiro ----
  [/prancha/, ['Abdômen', 'Lombar', 'Ombros']],
  [/abdominal|obliquo|elevacao de pernas/, ['Lombar']],
  [/burpee|thruster|kettlebell|swing|arremesso|clean|snatch/, ['Ombros', 'Quadríceps', 'Glúteos', 'Costas']],
  [/farmer|caminhada do fazendeiro/, ['Antebraço', 'Trapézio', 'Abdômen']],
  [/battle rope|corda naval/, ['Ombros', 'Costas', 'Abdômen']],
  // ---- cardio ----
  [/esteira|corrida|escada|eliptico|transport/, ['Quadríceps', 'Panturrilha', 'Glúteos']],
  [/bicicleta|spinning/, ['Quadríceps', 'Panturrilha']],
  [/remo/, ['Costas', 'Bíceps', 'Quadríceps']],
  [/pular corda/, ['Panturrilha', 'Ombros']],
];

// exercícios que são isolamento mesmo quando o nome contém um movimento
// composto: "Panturrilha no Leg Press" é panturrilha, não é leg press
const ISOLADOS = [/panturrilha/, /extensora/, /rosca de punho/, /aducao|abducao/];

// no máximo três: a lista existe para orientar, não para virar aula de anatomia
const ajudantesDe = (nome, grupo) => {
  const n = semAcento(nome);
  if (ISOLADOS.some((re) => re.test(n))) return [];
  const saida = [];
  for (const [re, grupos] of AJUDANTES)
    if (re.test(n)) for (const g of grupos) if (g !== grupo && !saida.includes(g)) saida.push(g);
  return saida.slice(0, 3);
};

const semAcento = (t) =>
  t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const idDe = (nome) =>
  semAcento(nome).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const vistos = new Set();
const exercicios = LISTA.map(([nome, grupo, equipamento]) => {
  const id = idDe(nome);
  if (vistos.has(id)) throw new Error(`exercício duplicado: ${nome}`);
  vistos.add(id);
  const sec = ajudantesDe(nome, grupo);
  return sec.length ? { id, nome, grupo, equipamento, sec } : { id, nome, grupo, equipamento };
});

const js = `/* Biblioteca de exercícios (Smart Fit) — gerado por tools/build-exercicios.mjs. Não editar à mão. */
window.EXERCICIOS = ${JSON.stringify(exercicios)};
window.EXERCICIOS_VERSAO = 3;
`;
writeFileSync(join(ROOT, 'js/exercicios.js'), js);
const grupos = [...new Set(exercicios.map((e) => e.grupo))];
console.log(`js/exercicios.js: ${exercicios.length} exercícios em ${grupos.length} grupos`);
console.log(grupos.join(' · '));
const semSec = exercicios.filter((e) => !e.sec);
console.log(`com músculos auxiliares: ${exercicios.length - semSec.length} · só o principal: ${semSec.length}`);
console.log(semSec.map((e) => e.nome).join(' | '));
