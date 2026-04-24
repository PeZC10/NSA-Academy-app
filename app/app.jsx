// NSC Academy — Generador de Exámenes
// Matrix of which topics apply to each employee level

const LEVELS = [
  { id: 'NI',    name: 'Nuevo Ingreso',      short: 'NI',    desc: 'Incorporación reciente' },
  { id: 'GEN',   name: 'General',            short: 'GEN',   desc: 'Personal general de NSC' },
  { id: 'ASIST', name: 'Asistente',          short: 'ASIST', desc: 'Asistente de asesoría' },
  { id: 'INT',   name: 'Intern / Trainee',   short: 'INT',   desc: 'Programa de trainees' },
  { id: 'JR',    name: 'Asesor Jr',          short: 'JR',    desc: 'Asesor financiero junior' },
  { id: 'SR',    name: 'Asesor Sr',          short: 'SR',    desc: 'Asesor financiero senior' },
  { id: 'DIR',   name: 'Director',           short: 'DIR',   desc: 'Dirección' },
  { id: 'ASOC', name: 'Director Asociado',  short: 'ASOC', desc: 'Dirección asociada' },
];

// Matrix: for each topic, which levels it applies to (exactly as the user's table)
const MATRIX = [
  { topic: 'Historia de NSC',               levels: ['NI','GEN','ASIST','INT'] },
  { topic: 'NSC Hoy',                       levels: ['NI','GEN','ASIST','INT'] },
  { topic: 'Asesores Financieros y Bancos', levels: ['NI','GEN','ASIST','INT'] },
  { topic: 'Asesor Independiente',          levels: ['NI','GEN','ASIST','INT'] },
  { topic: 'Matemáticas Financieras',       levels: ['GEN','ASIST','INT','JR'] },
  { topic: 'Calculadora Financiera',        levels: ['ASIST','INT'] },
  { topic: 'Economía',                      levels: ['GEN','ASIST','INT','JR','SR'] },
  { topic: 'Renta Fija',                    levels: ['GEN','ASIST','INT','JR','SR','DIR','ASOC'] },
  { topic: 'Renta Variable',                levels: ['GEN','ASIST','INT','JR','SR','DIR','ASOC'] },
  { topic: 'Análisis Estados Financieros',  levels: ['ASIST','INT','JR'] },
  { topic: 'Gestión de Portafolio',         levels: ['JR','SR','DIR','ASOC'] },
  { topic: 'Derivados',                     levels: ['JR','SR','DIR','ASOC'] },
  { topic: 'Bloomberg',                     levels: ['GEN'] },
  { topic: 'Excel',                         levels: ['INT','JR','SR'] },
  { topic: 'Conceptos Fiscales',            levels: ['GEN','ASIST','INT','JR','SR','DIR','ASOC'] },
  { topic: 'Productos de Inversión',        levels: ['ASIST','INT'] },
  { topic: 'Trading',                       levels: ['GEN','ASIST','INT'] },
  { topic: 'Alternativos (General)',        levels: ['ASIST','INT'] },
  { topic: 'Private Equity',                levels: ['ASIST','INT'] },
  { topic: 'Private Credit',                levels: ['ASIST','INT'] },
  { topic: 'Bienes Raíces',                 levels: ['ASIST','INT'] },
  { topic: 'Infraestructura',               levels: ['ASIST','INT'] },
  { topic: 'Real Assets y Recursos Nat.',   levels: ['ASIST','INT'] },
  { topic: 'Hedge Funds',                   levels: ['ASIST','INT'] },
  { topic: 'Activos Digitales',             levels: ['ASIST','INT'] },
  { topic: 'Imagen Corporativa',            levels: ['NI','GEN','ASIST','INT'] },
  { topic: 'Técnicas de Comunicación',      levels: ['GEN','ASIST','INT'] },
  { topic: 'Atención a Clientes',           levels: ['GEN','ASIST','INT'] },
  { topic: 'Ética',                         levels: ['NI','GEN','ASIST','INT','JR','SR','DIR','ASOC'] },
  { topic: 'Servicios de Inversión',        levels: ['GEN','ASIST','INT','JR','SR','DIR','ASOC'] },
  { topic: 'Marco Legal',                   levels: ['GEN','ASIST','INT','DIR','ASOC'] },
  { topic: 'Tesorería',                     levels: ['GEN','ASIST','INT'] },
  { topic: 'PLD',                           levels: ['NI','GEN','ASIST','INT','JR','SR','DIR','ASOC'] },
];

// Topic groupings — for visual organization on the left panel
const TOPIC_GROUPS = [
  {
    id: 'institucional',
    label: 'Institucional',
    topics: ['Historia de NSC','NSC Hoy','Asesores Financieros y Bancos','Asesor Independiente','Imagen Corporativa'],
  },
  {
    id: 'fundamentos',
    label: 'Fundamentos',
    topics: ['Matemáticas Financieras','Calculadora Financiera','Excel','Economía','Análisis Estados Financieros','Bloomberg'],
  },
  {
    id: 'mercados',
    label: 'Mercados',
    topics: ['Renta Fija','Renta Variable','Derivados','Trading','Productos de Inversión'],
  },
  {
    id: 'alternativos',
    label: 'Alternativos',
    topics: ['Alternativos (General)','Private Equity','Private Credit','Bienes Raíces','Infraestructura','Real Assets y Recursos Nat.','Hedge Funds','Activos Digitales'],
  },
  {
    id: 'portafolios',
    label: 'Portafolios y Servicio',
    topics: ['Gestión de Portafolio','Servicios de Inversión','Atención a Clientes','Técnicas de Comunicación'],
  },
  {
    id: 'regulatorio',
    label: 'Regulatorio y Fiscal',
    topics: ['Conceptos Fiscales','Marco Legal','Tesorería','Ética','PLD'],
  },
];

const LETTERS = ['A','B','C','D','E'];

function numberedQuestions(qs) {
  // Assign 1-indexed numbers; letters come from option index
  return qs.map((q, i) => ({ ...q, number: i + 1 }));
}

function getAllowedTopics(levelId) {
  return MATRIX.filter(m => m.levels.includes(levelId)).map(m => m.topic);
}

function getQuestionsForTopic(bank, topic) {
  return bank.filter(q => q.topic === topic);
}

Object.assign(window, { LEVELS, MATRIX, TOPIC_GROUPS, LETTERS, getAllowedTopics, getQuestionsForTopic, numberedQuestions });
