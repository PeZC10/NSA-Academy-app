// NSC Academy — Generador de Exámenes
// Filtering is driven by per-question `audiences` arrays in the bank.
// Each question carries: id, parent, subtopic, options, audiences.

const LEVELS = [
  { id: 'NIG', name: 'Nuevo Ingreso',     short: 'NIG', desc: 'Incorporación reciente' },
  { id: 'GEN', name: 'General',           short: 'GEN', desc: 'Personal general de NSC' },
  { id: 'AST', name: 'Asistente',         short: 'AST', desc: 'Asistente de asesoría' },
  { id: 'INT', name: 'Intern',            short: 'INT', desc: 'Programa de interns' },
  { id: 'TRA', name: 'Trainee',           short: 'TRA', desc: 'Programa de trainees' },
  { id: 'ASJ', name: 'Asesor Jr',         short: 'ASJ', desc: 'Asesor financiero junior' },
  { id: 'ASS', name: 'Asesor Sr',         short: 'ASS', desc: 'Asesor financiero senior' },
  { id: 'DIR', name: 'Director',          short: 'DIR', desc: 'Dirección' },
  { id: 'DAS', name: 'Director Asociado', short: 'DAS', desc: 'Dirección asociada' },
];

// Visual organization for the sidebar. Topics that don't appear in the bank
// or that have no questions for the selected level are dropped at render time.
const TOPIC_GROUPS = [
  {
    id: 'institucional',
    label: 'Institucional',
    topics: ['Historia de NSC', 'Asesores Financieros y Bancos', 'Imagen'],
  },
  {
    id: 'fundamentos',
    label: 'Fundamentos',
    topics: ['Matemáticas Financieras', 'Calculadora Financiera', 'Economía', 'Análisis de Estados Financieros', 'Bloomberg'],
  },
  {
    id: 'mercados',
    label: 'Mercados',
    topics: ['Renta Fija', 'Renta Variable', 'Derivados', 'Trading', 'Productos de Inversión'],
  },
  {
    id: 'alternativos',
    label: 'Alternativos',
    topics: [
      'Alternativos (General)',
      'Alternativos: Private Equity',
      'Alternativos: Private Credit',
      'Alternativos: Bienes Raíces',
      'Alternativos: Infraestructura',
      'Alternativos: Real Assets y Recursos Naturales',
      'Alternativos: Hedge Funds',
      'Alternativos: Activos Digitales',
    ],
  },
  {
    id: 'portafolios',
    label: 'Portafolios y Servicio',
    topics: ['Gestión de Portafolio', 'Servicios de Inversión', 'Atención a Clientes', 'Técnicas de Comunicación'],
  },
  {
    id: 'regulatorio',
    label: 'Regulatorio y Fiscal',
    topics: ['Conceptos Fiscales y Estructuras', 'Marco Legal', 'Tesorería', 'Ética', 'PLD'],
  },
];

const LETTERS = ['A','B','C','D','E','F'];

function numberedQuestions(qs) {
  return qs.map((q, i) => ({ ...q, number: i + 1 }));
}

function isVisibleForLevel(q, levelId) {
  return Array.isArray(q.audiences) && q.audiences.includes(levelId);
}

// Parents that have at least one question visible to the level.
function getAllowedTopics(levelId, bank) {
  if (!levelId || !Array.isArray(bank)) return [];
  const topics = new Set();
  for (const q of bank) {
    if (isVisibleForLevel(q, levelId)) topics.add(q.parent);
  }
  return [...topics];
}

// Questions matching the parent topic, optionally filtered to a level.
function getQuestionsForTopic(bank, parent, levelId = null) {
  return bank.filter(q => {
    if (q.parent !== parent) return false;
    if (levelId && !isVisibleForLevel(q, levelId)) return false;
    return true;
  });
}

Object.assign(window, {
  LEVELS, TOPIC_GROUPS, LETTERS,
  isVisibleForLevel, getAllowedTopics, getQuestionsForTopic, numberedQuestions,
});
