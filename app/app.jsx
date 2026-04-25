// NSC Academy — Generador de Exámenes
// Filtering is now driven by per-question `audiences` arrays
// (see app/data/questions.json) rather than a topic-level matrix.

const LEVELS = [
  { id: 'NIG', name: 'Nuevo Ingreso General', short: 'NIG', desc: 'Incorporación reciente' },
  { id: 'AST', name: 'Asistente',             short: 'AST', desc: 'Asistente de asesoría' },
  { id: 'INT', name: 'Intern / Trainee',      short: 'INT', desc: 'Programa de trainees' },
  { id: 'ASJ', name: 'Asesor Jr',             short: 'ASJ', desc: 'Asesor financiero junior' },
  { id: 'ASS', name: 'Asesor Sr',             short: 'ASS', desc: 'Asesor financiero senior' },
  { id: 'DIR', name: 'Director',              short: 'DIR', desc: 'Dirección' },
  { id: 'DAS', name: 'Director Asociado',     short: 'DAS', desc: 'Dirección asociada' },
];

// Topic groupings — visual organization on the left panel.
// Topics that don't appear in the bank are silently skipped at render time.
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
    topics: [
      'Gestión de Portafolio',
      'Conceptos y Disposiciones de Prácticas de Venta',
      'Diferencias entre Gestión y Asesoría',
      'Comité de Análisis y Perfiles de Inversión de Riesgo',
      'Servicio de Asesoría de Inversiones',
      'Prohibiciones y Obligaciones de los Asesores y Medidas Disciplinarias',
      'Disposiciones de Carácter General: Operaciones con Valores',
      'Atención a Clientes',
      'Técnicas de Comunicación',
    ],
  },
  {
    id: 'regulatorio',
    label: 'Regulatorio y Fiscal',
    topics: ['Conceptos Fiscales','Marco Legal','Tesorería','Ética','PLD — Prevención de Lavado de Dinero y Financiamiento al Terrorismo'],
  },
];

const LETTERS = ['A','B','C','D','E','F'];

function numberedQuestions(qs) {
  return qs.map((q, i) => ({ ...q, number: i + 1 }));
}

// Topics that have at least one question whose `audiences` includes the level.
function getAllowedTopics(levelId, bank) {
  if (!levelId || !Array.isArray(bank)) return [];
  const topics = new Set();
  for (const q of bank) {
    if (Array.isArray(q.audiences) && q.audiences.includes(levelId)) {
      topics.add(q.topic);
    }
  }
  return [...topics];
}

// Questions matching the topic, optionally filtered to a specific role.
function getQuestionsForTopic(bank, topic, levelId = null) {
  return bank.filter(q => {
    if (q.topic !== topic) return false;
    if (levelId && !(Array.isArray(q.audiences) && q.audiences.includes(levelId))) return false;
    return true;
  });
}

Object.assign(window, { LEVELS, TOPIC_GROUPS, LETTERS, getAllowedTopics, getQuestionsForTopic, numberedQuestions });
