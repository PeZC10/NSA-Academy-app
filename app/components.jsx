// UI Components for NSC Academy exam app

const { useState, useEffect, useMemo, useRef } = React;

function LevelSelector({ currentLevel, onSelect }) {
  return (
    <div className="level-selector">
      <div className="panel-eyebrow">Paso 1 · Nivel del empleado</div>
      <div className="level-grid">
        {LEVELS.map(lv => {
          const active = currentLevel === lv.id;
          return (
            <button
              key={lv.id}
              className={`level-btn ${active ? 'is-active' : ''}`}
              onClick={() => onSelect(lv.id)}
            >
              <span className="level-short">{lv.short}</span>
              <span className="level-name">{lv.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TopicList({ level, topics, bank, selectedTopic, onSelectTopic, query, setQuery }) {
  const grouped = useMemo(() => {
    return TOPIC_GROUPS.map(g => ({
      ...g,
      topics: g.topics.filter(t => topics.includes(t)),
    })).filter(g => g.topics.length > 0);
  }, [topics]);

  const countFor = (parent) => bank.filter(q =>
    q.parent === parent && isVisibleForLevel(q, level)
  ).length;

  const q = (query || '').toLowerCase().trim();

  return (
    <div className="topic-list">
      <div className="panel-eyebrow">Paso 2 · Temas válidos <span className="count-pill">{topics.length}</span></div>
      {topics.length > 0 && (
        <div className="search-box">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="5" />
            <path d="M10.5 10.5L14 14" strokeLinecap="round" />
          </svg>
          <input
            placeholder="Buscar tema…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      )}
      <div className="topic-groups">
        {grouped.map(g => {
          const visible = q ? g.topics.filter(t => t.toLowerCase().includes(q)) : g.topics;
          if (visible.length === 0) return null;
          return (
            <div key={g.id} className="topic-group">
              <div className="topic-group-label">{g.label}</div>
              <ul>
                {visible.map(t => {
                  const n = countFor(t);
                  const active = selectedTopic === t;
                  const empty = n === 0;
                  return (
                    <li key={t}>
                      <button
                        className={`topic-btn ${active ? 'is-active' : ''} ${empty ? 'is-empty' : ''}`}
                        onClick={() => onSelectTopic(t)}
                      >
                        <span className="topic-name">{t}</span>
                        <span className="topic-count">{n}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuestionCard({ q, index, revealed, onReveal }) {
  return (
    <article className="qcard">
      <header className="qcard-head">
        <div className="qnum">
          <span className="qnum-label">Pregunta</span>
          <span className="qnum-val">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <button
          className={`reveal-btn ${revealed ? 'is-on' : ''}`}
          onClick={onReveal}
        >
          {revealed ? 'Ocultar respuesta' : 'Ver respuesta'}
        </button>
      </header>
      <h3 className="qtext">{q.question}</h3>
      <ol className="qopts">
        {q.options.map((opt, i) => {
          const isCorrect = opt.correct;
          const show = revealed && isCorrect;
          return (
            <li key={i} className={`qopt ${show ? 'is-correct' : ''}`}>
              <span className="qopt-letter">{LETTERS[i]}</span>
              <span className="qopt-text">{opt.text}</span>
              {show && (
                <span className="qopt-mark" aria-label="Respuesta correcta">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 8.5L6.5 12L13 4.5" />
                  </svg>
                  Correcta
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {q.subtopic && <div className="qsub">Sección: {q.subtopic}</div>}
    </article>
  );
}

function QuestionsPanel({ level, topic, questions, allRevealed, setAllRevealed }) {
  const [revealedIds, setRevealedIds] = useState(new Set());

  useEffect(() => { setRevealedIds(new Set()); }, [topic, level]);

  const toggleOne = (i) => {
    setRevealedIds(prev => {
      const s = new Set(prev);
      if (s.has(i)) s.delete(i); else s.add(i);
      return s;
    });
  };

  const revealAll = () => {
    if (revealedIds.size === questions.length) {
      setRevealedIds(new Set());
    } else {
      setRevealedIds(new Set(questions.map((_, i) => i)));
    }
  };

  if (!level) {
    return (
      <div className="empty-state">
        <div className="empty-mark">NSC</div>
        <h2>Generador de exámenes</h2>
        <p>Selecciona un nivel de empleado a la izquierda para ver los temas disponibles y generar el examen correspondiente.</p>
      </div>
    );
  }
  if (!topic) {
    const lv = LEVELS.find(l => l.id === level);
    return (
      <div className="empty-state">
        <div className="empty-eyebrow">Nivel seleccionado</div>
        <h2>{lv.name}</h2>
        <p>Elige un tema de la lista para ver las preguntas correspondientes a este nivel.</p>
      </div>
    );
  }

  const lv = LEVELS.find(l => l.id === level);
  const allOpen = revealedIds.size === questions.length && questions.length > 0;

  return (
    <div className="qpanel">
      <header className="qpanel-head">
        <div>
          <div className="qpanel-crumb">{lv.name}  ·  {questions.length} {questions.length === 1 ? 'pregunta' : 'preguntas'}</div>
          <h2 className="qpanel-title">{topic}</h2>
        </div>
        {questions.length > 0 && (
          <div className="qpanel-actions">
            <button className="ghost-btn" onClick={revealAll}>
              {allOpen ? 'Ocultar todas' : 'Mostrar todas las respuestas'}
            </button>
            <button className="ghost-btn" onClick={() => window.print()}>
              Imprimir
            </button>
          </div>
        )}
      </header>

      {questions.length === 0 ? (
        <div className="no-questions">
          <div className="no-questions-dot" />
          <h3>No hay preguntas registradas para este tema.</h3>
          <p>El tema <strong>{topic}</strong> aplica para el nivel <strong>{lv.name}</strong> según la matriz, pero el banco actual aún no incluye reactivos para esta sección.</p>
        </div>
      ) : (
        <div className="qlist">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id || i}
              q={q}
              index={i}
              revealed={revealedIds.has(i)}
              onReveal={() => toggleOne(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function App({ bank }) {
  const [level, setLevel] = useState(null);
  const [topic, setTopic] = useState(null);
  const [query, setQuery] = useState('');
  const [builderOpen, setBuilderOpen] = useState(false);

  const topics = useMemo(() => level ? getAllowedTopics(level, bank) : [], [level, bank]);
  const questions = useMemo(() => topic ? getQuestionsForTopic(bank, topic, level) : [], [topic, bank, level]);

  // When level changes, clear topic if not valid
  useEffect(() => {
    if (topic && !topics.includes(topic)) setTopic(null);
  }, [level]);

  const totalQuestions = bank.length;
  const levelQuestionCount = useMemo(() => {
    if (!level) return 0;
    return bank.filter(q => isVisibleForLevel(q, level)).length;
  }, [level, bank]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <span>NSC</span>
          </div>
          <div className="brand-text">
            <div className="brand-title">NSC Academy</div>
            <div className="brand-sub">Generador de Exámenes · Herramienta interna</div>
          </div>
        </div>
        <div className="topbar-meta">
          <button className="primary-btn topbar-cta" onClick={() => setBuilderOpen(true)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 3v10M3 8h10"/></svg>
            Generar examen
          </button>
          <div className="meta-divider" />
          {level ? (
            <>
              <div className="meta-block">
                <div className="meta-label">Nivel</div>
                <div className="meta-val">{LEVELS.find(l=>l.id===level).name}</div>
              </div>
              <div className="meta-divider" />
              <div className="meta-block">
                <div className="meta-label">Temas válidos</div>
                <div className="meta-val">{topics.length}</div>
              </div>
              <div className="meta-divider" />
              <div className="meta-block">
                <div className="meta-label">Reactivos disponibles</div>
                <div className="meta-val">{levelQuestionCount}</div>
              </div>
            </>
          ) : (
            <div className="meta-block">
              <div className="meta-label">Banco de preguntas</div>
              <div className="meta-val">{totalQuestions} reactivos</div>
            </div>
          )}
        </div>
      </header>

      <main className="layout">
        <aside className="sidebar">
          <LevelSelector currentLevel={level} onSelect={setLevel} />
          {level && (
            <TopicList
              level={level}
              topics={topics}
              bank={bank}
              selectedTopic={topic}
              onSelectTopic={setTopic}
              query={query}
              setQuery={setQuery}
            />
          )}
        </aside>
        <section className="content">
          <QuestionsPanel
            level={level}
            topic={topic}
            questions={questions}
          />
        </section>
      </main>

      <footer className="footbar">
        <div>NSC Academy · {bank.length} reactivos en banco</div>
        <div>Respuestas correctas marcadas en el documento fuente</div>
      </footer>

      <ExamBuilder bank={bank} open={builderOpen} onClose={() => setBuilderOpen(false)} />
    </div>
  );
}

Object.assign(window, { App, LevelSelector, TopicList, QuestionCard, QuestionsPanel });
