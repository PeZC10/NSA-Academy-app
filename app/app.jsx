// NSC Academy — Generador de Exámenes
// Visibility is driven by the VISIBILITY map below: a (topic, sub) pair is
// shown to a level only if it appears in that level's allow-list. JSON
// `audiences` arrays remain as legacy metadata but no longer drive filtering.

const LEVELS = [
  { id: 'NI',  name: 'Nuevo Ingreso',     short: 'NI',  desc: 'Incorporación reciente' },
  { id: 'GEN', name: 'General',           short: 'GEN', desc: 'Personal general de NSC' },
  { id: 'AST', name: 'Asistente',         short: 'AST', desc: 'Asistente de asesoría' },
  { id: 'INT', name: 'Intern',            short: 'INT', desc: 'Programa de interns' },
  { id: 'TRA', name: 'Trainee',           short: 'TRA', desc: 'Programa de trainees' },
  { id: 'ASJ', name: 'Asesor Jr',         short: 'ASJ', desc: 'Asesor financiero junior' },
  { id: 'ASS', name: 'Asesor Sr',         short: 'ASS', desc: 'Asesor financiero senior' },
  { id: 'DIR', name: 'Director',          short: 'DIR', desc: 'Dirección' },
  { id: 'DAS', name: 'Director Asociado', short: 'DAS', desc: 'Dirección asociada' },
];

// Each rule grants access to a (topic) optionally restricted to specific subs.
// Omit `subs` to grant all sub-topics under that topic.
const VISIBILITY = {
  NI: [
    { topic: 'Historia de NSC' },
    { topic: 'NSC Hoy' },
    { topic: 'Asesores Financieros y Bancos' },
    { topic: 'Ética' },
    { topic: 'PLD — Prevención de Lavado de Dinero y Financiamiento al Terrorismo' },
  ],
  GEN: [
    { topic: 'Historia de NSC' },
    { topic: 'NSC Hoy' },
    { topic: 'Asesores Financieros y Bancos' },
    { topic: 'Asesor Independiente' },
    { topic: 'Matemáticas Financieras', subs: ['El Valor del Dinero en el Tiempo'] },
    { topic: 'Excel' },
    { topic: 'Economía', subs: ['Política Fiscal'] },
    { topic: 'Renta Fija', subs: ['Características de los Bonos'] },
    // null sub catches one legacy intro question on primary markets that
    // wasn't tagged with a sub in the bank.
    { topic: 'Renta Variable', subs: ['Importancia de la Renta Variable', 'Características de Renta Variable', 'Productos de Inversión en Renta Variable', null] },
    { topic: 'Conceptos Fiscales', subs: ['Persona Física y Persona Moral', 'Utilidad Fiscal y Costo de Adquisición', 'SIC, Estate Tax y ETFs UCITS'] },
    { topic: 'Imagen Corporativa' },
    { topic: 'Ética' },
    { topic: 'Conceptos y Disposiciones de Prácticas de Venta' },
    { topic: 'Diferencias entre Gestión y Asesoría' },
    { topic: 'Comité de Análisis y Perfiles de Inversión de Riesgo' },
    { topic: 'Servicio de Asesoría de Inversiones' },
    { topic: 'Prohibiciones y Obligaciones de los Asesores y Medidas Disciplinarias' },
    { topic: 'Disposiciones de Carácter General: Operaciones con Valores' },
    { topic: 'PLD — Prevención de Lavado de Dinero y Financiamiento al Terrorismo' },
    { topic: 'Marco Legal' },
  ],
  AST: [
    { topic: 'Historia de NSC' },
    { topic: 'NSC Hoy' },
    { topic: 'Asesores Financieros y Bancos' },
    { topic: 'Matemáticas Financieras', subs: ['El Valor del Dinero en el Tiempo'] },
    { topic: 'Renta Fija', subs: ['Características de los Bonos'] },
    { topic: 'Renta Variable', subs: ['Importancia de la Renta Variable', 'Características de Renta Variable'] },
    { topic: 'Conceptos Fiscales', subs: ['Persona Física y Persona Moral', 'Utilidad Fiscal y Costo de Adquisición', 'SIC, Estate Tax y ETFs UCITS'] },
    { topic: 'Trading' },
    { topic: 'Imagen Corporativa' },
    { topic: 'Atención a Clientes' },
    { topic: 'Ética' },
    { topic: 'PLD — Prevención de Lavado de Dinero y Financiamiento al Terrorismo' },
    { topic: 'Marco Legal' },
    { topic: 'Tesorería' },
  ],
  INT: [
    { topic: 'Asesores Financieros y Bancos' },
    { topic: 'Renta Fija', subs: ['Características de los Bonos'] },
    { topic: 'Productos de Inversión' },
    { topic: 'Trading' },
    { topic: 'Imagen Corporativa' },
    { topic: 'Atención a Clientes' },
    { topic: 'Ética' },
    { topic: 'Conceptos y Disposiciones de Prácticas de Venta' },
    { topic: 'Diferencias entre Gestión y Asesoría' },
    { topic: 'Comité de Análisis y Perfiles de Inversión de Riesgo' },
    { topic: 'Servicio de Asesoría de Inversiones' },
    { topic: 'Prohibiciones y Obligaciones de los Asesores y Medidas Disciplinarias' },
    { topic: 'Disposiciones de Carácter General: Operaciones con Valores' },
    { topic: 'PLD — Prevención de Lavado de Dinero y Financiamiento al Terrorismo' },
    { topic: 'Marco Legal' },
    { topic: 'Tesorería' },
  ],
  TRA: [
    { topic: 'Matemáticas Financieras', subs: ['El Valor del Dinero en el Tiempo'] },
    { topic: 'Calculadora Financiera' },
    { topic: 'Economía', subs: ['Microeconomía: Fundamentos', 'Macroeconomía: Fundamentos', 'Macroeconomía: Políticas Macroeconómicas'] },
    { topic: 'Renta Fija', subs: ['Características de los Bonos', 'Bonos Soberanos y Corporativos', 'Riesgos de Renta Fija'] },
    { topic: 'Renta Variable', subs: ['Importancia de la Renta Variable', 'Características de Renta Variable'] },
    { topic: 'Análisis Estados Financieros' },
    { topic: 'Productos de Inversión' },
    { topic: 'Trading' },
    { topic: 'Imagen Corporativa' },
    { topic: 'Atención a Clientes' },
    { topic: 'Ética' },
    { topic: 'Conceptos y Disposiciones de Prácticas de Venta' },
    { topic: 'Diferencias entre Gestión y Asesoría' },
    { topic: 'Comité de Análisis y Perfiles de Inversión de Riesgo' },
    { topic: 'Servicio de Asesoría de Inversiones' },
    { topic: 'Prohibiciones y Obligaciones de los Asesores y Medidas Disciplinarias' },
    { topic: 'Disposiciones de Carácter General: Operaciones con Valores' },
    { topic: 'PLD — Prevención de Lavado de Dinero y Financiamiento al Terrorismo' },
    { topic: 'Marco Legal' },
    { topic: 'Tesorería' },
  ],
  ASJ: [
    { topic: 'Historia de NSC' },
    { topic: 'NSC Hoy' },
    { topic: 'Matemáticas Financieras' },
    { topic: 'Calculadora Financiera' },
    { topic: 'Economía', subs: ['Microeconomía: Fundamentos', 'Macroeconomía: Fundamentos', 'Macroeconomía: Políticas Macroeconómicas', 'Economía Internacional: Fundamentos'] },
    { topic: 'Renta Fija', subs: ['Características de los Bonos', 'Bonos Soberanos y Corporativos', 'Riesgos de Renta Fija'] },
    { topic: 'Renta Variable', subs: ['Importancia de la Renta Variable', 'Características de Renta Variable', 'Características de Riesgo y Rendimiento', 'Análisis de Industrias y Empresas'] },
    { topic: 'Productos de Inversión' },
    { topic: 'Análisis Estados Financieros' },
    { topic: 'Bloomberg' },
    { topic: 'Conceptos Fiscales', subs: ['Persona Física y Persona Moral', 'Utilidad Fiscal y Costo de Adquisición', 'SIC, Estate Tax y ETFs UCITS'] },
    { topic: 'Alternativos (General)' },
    { topic: 'Técnicas de Comunicación', subs: ['Hablar en Público'] },
    { topic: 'Ética' },
  ],
  ASS: [
    { topic: 'Economía', subs: ['Microeconomía: Fundamentos', 'Macroeconomía: Fundamentos', 'Macroeconomía: Políticas Macroeconómicas', 'Economía Internacional: Fundamentos'] },
    { topic: 'Renta Fija', subs: ['Características de los Bonos', 'Bonos Soberanos y Corporativos', 'Riesgos de Renta Fija'] },
    // 'Construcción de Carteras y Expectativas del Mercado de Capitales' on the
    // curriculum is treated as 'Construcción de Carteras y Métricas de Desempeño'
    // in the bank — closest match.
    { topic: 'Gestión de Portafolio', subs: ['Políticas y Objetivos de Inversión', 'Riesgo', 'Impulsores y Métricas de Riesgo', 'Comportamiento del Mercado y Behavioral Finance', 'Construcción de Carteras y Métricas de Desempeño', 'Principios de Construcción de Carteras'] },
    { topic: 'Derivados' },
    { topic: 'Conceptos Fiscales', subs: ['Persona Física y Persona Moral', 'Utilidad Fiscal y Costo de Adquisición', 'SIC, Estate Tax y ETFs UCITS', 'CUCA y CUFIN'] },
    { topic: 'Alternativos (General)' },
    { topic: 'Técnicas de Comunicación', subs: ['Hablar en Público'] },
    { topic: 'Ética' },
    { topic: 'Conceptos y Disposiciones de Prácticas de Venta' },
    { topic: 'Diferencias entre Gestión y Asesoría' },
    { topic: 'Comité de Análisis y Perfiles de Inversión de Riesgo' },
    { topic: 'Servicio de Asesoría de Inversiones' },
    { topic: 'Prohibiciones y Obligaciones de los Asesores y Medidas Disciplinarias' },
    { topic: 'Disposiciones de Carácter General: Operaciones con Valores' },
    { topic: 'PLD — Prevención de Lavado de Dinero y Financiamiento al Terrorismo' },
    { topic: 'Marco Legal' },
  ],
  DIR: [
    { topic: 'Conceptos Fiscales' },
    { topic: 'Private Equity' },
    { topic: 'Private Credit' },
    { topic: 'Bienes Raíces' },
    { topic: 'Infraestructura' },
    { topic: 'Real Assets y Recursos Nat.' },
    { topic: 'Hedge Funds' },
    { topic: 'Activos Digitales' },
    { topic: 'Técnicas de Comunicación', subs: ['Hablar en Público'] },
    { topic: 'Atención a Clientes' },
  ],
  DAS: [
    { topic: 'Conceptos Fiscales' },
    { topic: 'Private Equity' },
    { topic: 'Private Credit' },
    { topic: 'Bienes Raíces' },
    { topic: 'Infraestructura' },
    { topic: 'Real Assets y Recursos Nat.' },
    { topic: 'Hedge Funds' },
    { topic: 'Activos Digitales' },
    { topic: 'Atención a Clientes' },
  ],
};

// Topic groupings for the sidebar layout. Topics that no level can see
// (or that have no questions) are silently dropped at render time.
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

// Returns true if the (topic, sub) of `q` is allowed for the given level.
function isVisibleForLevel(q, levelId) {
  const rules = VISIBILITY[levelId];
  if (!rules) return false;
  for (const rule of rules) {
    if (rule.topic !== q.topic) continue;
    if (!rule.subs) return true;
    if (rule.subs.includes(q.sub)) return true;
  }
  return false;
}

// Topics that have at least one question visible to the level. A topic is
// listed even if some of its sub-topics are hidden, as long as at least one
// matching question exists in the bank.
function getAllowedTopics(levelId, bank) {
  if (!levelId || !Array.isArray(bank)) return [];
  const topics = new Set();
  for (const q of bank) {
    if (isVisibleForLevel(q, levelId)) topics.add(q.topic);
  }
  return [...topics];
}

// Questions matching the topic, optionally filtered by visibility for a level.
function getQuestionsForTopic(bank, topic, levelId = null) {
  return bank.filter(q => {
    if (q.topic !== topic) return false;
    if (levelId && !isVisibleForLevel(q, levelId)) return false;
    return true;
  });
}

Object.assign(window, {
  LEVELS, TOPIC_GROUPS, LETTERS, VISIBILITY,
  isVisibleForLevel, getAllowedTopics, getQuestionsForTopic, numberedQuestions,
});
