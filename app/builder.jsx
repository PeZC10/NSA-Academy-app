// Exam Builder component for NSC Academy

const { useState: useStateB, useMemo: useMemoB, useEffect: useEffectB } = React;

function ExamBuilder({ bank, open, onClose }) {
  const [examName, setExamName] = useStateB('');
  const [selectedLevel, setSelectedLevel] = useStateB('');
  const [selectedTopics, setSelectedTopics] = useStateB(new Set());
  const [count, setCount] = useStateB(20);
  const [versions, setVersions] = useStateB(1);
  const [shuffleOpts, setShuffleOpts] = useStateB(true);
  const [step, setStep] = useStateB('build'); // 'build' | 'export'
  const [exams, setExams] = useStateB([]); // always an array; length 1 for single-version
  const [exporting, setExporting] = useStateB(null);

  // Topics filtered by level (if level picked) else all parents with questions
  const availableTopics = useMemoB(() => {
    if (!selectedLevel) return [...new Set(bank.map(q => q.parent))];
    return getAllowedTopics(selectedLevel, bank);
  }, [selectedLevel, bank]);

  // Per-parent counts respect the selected level so the chip numbers match the exam pool.
  const countByTopic = useMemoB(() => {
    const c = {};
    bank.forEach(q => {
      if (selectedLevel && !isVisibleForLevel(q, selectedLevel)) return;
      c[q.parent] = (c[q.parent] || 0) + 1;
    });
    return c;
  }, [bank, selectedLevel]);

  const totalAvailable = useMemoB(() => {
    return [...selectedTopics].reduce((sum, t) => sum + (countByTopic[t] || 0), 0);
  }, [selectedTopics, countByTopic]);

  const toggleTopic = (t) => {
    setSelectedTopics(prev => {
      const n = new Set(prev);
      if (n.has(t)) n.delete(t); else n.add(t);
      return n;
    });
  };

  const selectAllGroup = (topics) => {
    setSelectedTopics(prev => {
      const n = new Set(prev);
      const allIn = topics.every(t => n.has(t));
      if (allIn) topics.forEach(t => n.delete(t));
      else topics.forEach(t => n.add(t));
      return n;
    });
  };

  const handleBuild = () => {
    if (selectedTopics.size === 0 || count < 1) return;
    const baseName = examName || `Examen NSC${selectedLevel ? ' · ' + LEVELS.find(l=>l.id===selectedLevel).name : ''}`;
    const built = [];
    const n = Math.max(1, parseInt(versions) || 1);
    for (let i = 0; i < n; i++) {
      built.push(buildExam(bank, {
        name: n > 1 ? `${baseName} — v${i + 1}` : baseName,
        topics: [...selectedTopics],
        count,
        shuffleOptions: shuffleOpts,
        level: selectedLevel || null,
      }));
    }
    setExams(built);
    setStep('export');
  };

  const handleReset = () => {
    setExams([]);
    setStep('build');
  };

  useEffectB(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  const effectiveCount = Math.min(count, totalAvailable);

  // ---- EXPORT STEP ----
  if (step === 'export' && exams.length > 0) {
    const sleep = (ms) => new Promise(r => setTimeout(r, ms));
    const safeNameOf = (n) => (n || 'examen').replace(/[^a-z0-9áéíóúñ\- ]/gi, '').trim().replace(/\s+/g, '_');

    const doExport = async (kind) => {
      setExporting(kind);
      try {
        if (kind === 'gas') {
          // One .gs creating N forms — preferred even for N=1.
          const baseName = exams[0].name.replace(/ — v\d+$/, '');
          downloadText(toGoogleAppsScript(exams), `${safeNameOf(baseName)}.gs`, 'text/javascript');
        } else if (kind === 'msform') {
          // One .docx per version (Forms imports per file).
          for (let i = 0; i < exams.length; i++) {
            const blob = await toMicrosoftFormsDocx(exams[i]);
            downloadBlob(blob, `${safeNameOf(exams[i].name)}.docx`);
            if (i < exams.length - 1) await sleep(400);
          }
        } else if (kind === 'csv') {
          for (let i = 0; i < exams.length; i++) {
            downloadText(toCSV(exams[i]), `${safeNameOf(exams[i].name)}.csv`, 'text/csv');
            if (i < exams.length - 1) await sleep(400);
          }
        } else if (kind === 'print') {
          // All versions stacked in one document, page-break between.
          printViaIframe(toPrintableHTML(exams));
        }
      } catch (err) {
        alert('Error al exportar: ' + err.message);
      }
      setExporting(null);
    };

    const headerExam = exams[0];
    const headerName = exams.length === 1 ? headerExam.name : headerExam.name.replace(/ — v\d+$/, '');

    return (
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal eb-modal" onClick={e => e.stopPropagation()}>
          <header className="eb-head">
            <div>
              <div className="panel-eyebrow">{exams.length === 1 ? 'Examen generado' : `${exams.length} versiones generadas`}</div>
              <h2 className="eb-title">{headerName}</h2>
              <div className="eb-meta">{headerExam.questions.length} preguntas · {headerExam.topics.length} tema{headerExam.topics.length !== 1 ? 's' : ''} · Orden aleatorio{exams.length > 1 ? ` · ${exams.length} versiones` : ''}</div>
            </div>
            <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
          </header>

          <div className="eb-body">
            <div className="export-intro">
              Elige un formato para exportar. Los exámenes de Google y Microsoft Forms incluyen la calificación automática.
            </div>

            <div className="export-grid">
              <button className="export-card" onClick={() => doExport('gas')} disabled={exporting==='gas'}>
                <div className="ex-icon" style={{background:'#4285f4'}}>G</div>
                <div className="ex-text">
                  <div className="ex-title">Google Forms</div>
                  <div className="ex-desc">Descarga un archivo <code>.gs</code>. Pégalo en <strong>script.google.com</strong> y ejecuta — crea el Form automáticamente con respuestas correctas y puntos.</div>
                </div>
                <div className="ex-arrow">{exporting==='gas' ? '…' : '↓'}</div>
              </button>

              <button className="export-card" onClick={() => doExport('msform')} disabled={exporting==='msform'}>
                <div className="ex-icon" style={{background:'#7719aa'}}>M</div>
                <div className="ex-text">
                  <div className="ex-title">Microsoft Forms</div>
                  <div className="ex-desc">Descarga un <code>.docx</code>. Súbelo desde <strong>forms.office.com</strong> → "Importar preguntas" y Forms detecta todo automáticamente.</div>
                </div>
                <div className="ex-arrow">{exporting==='msform' ? '…' : '↓'}</div>
              </button>

              <button className="export-card" onClick={() => doExport('print')} disabled={exporting==='print'}>
                <div className="ex-icon" style={{background:'#0f2744'}}>P</div>
                <div className="ex-text">
                  <div className="ex-title">Imprimible (PDF)</div>
                  <div className="ex-desc">Genera un examen en papel con hoja de respuestas al final para calificar manualmente.</div>
                </div>
                <div className="ex-arrow">↓</div>
              </button>

              <button className="export-card" onClick={() => doExport('csv')} disabled={exporting==='csv'}>
                <div className="ex-icon" style={{background:'#4a6b3a'}}>C</div>
                <div className="ex-text">
                  <div className="ex-title">CSV genérico</div>
                  <div className="ex-desc">Archivo <code>.csv</code> para importar a Moodle, Canvas u otras plataformas.</div>
                </div>
                <div className="ex-arrow">↓</div>
              </button>
            </div>

            <details className="exam-preview">
              <summary>
                {exams.length === 1
                  ? `Ver preguntas incluidas (${exams[0].questions.length})`
                  : `Ver preguntas de la versión 1 (${exams[0].questions.length}) — las otras versiones tienen el mismo pool en distinto orden`}
              </summary>
              <ol className="preview-list">
                {exams[0].questions.map((q, i) => (
                  <li key={q.id || i}>
                    <div className="pv-q">{q.question}</div>
                    <div className="pv-meta">{q.parent}{q.subtopic ? ` · ${q.subtopic}` : ''}</div>
                  </li>
                ))}
              </ol>
            </details>
          </div>

          <footer className="eb-foot">
            <button className="ghost-btn" onClick={handleReset}>← Modificar examen</button>
            <button className="ghost-btn" onClick={onClose}>Cerrar</button>
          </footer>
        </div>
      </div>
    );
  }

  // ---- BUILD STEP ----
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal eb-modal" onClick={e => e.stopPropagation()}>
        <header className="eb-head">
          <div>
            <div className="panel-eyebrow">Nuevo examen</div>
            <h2 className="eb-title">Generar examen</h2>
            <div className="eb-meta">Selecciona temas, cantidad de preguntas y exporta a Google Forms, Microsoft Forms, PDF o CSV.</div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </header>

        <div className="eb-body">
          <div className="eb-field">
            <label className="eb-label">Nombre del examen</label>
            <input
              className="eb-input"
              placeholder="Ej. Evaluación trimestral — Asesor Jr"
              value={examName}
              onChange={e => setExamName(e.target.value)}
            />
          </div>

          <div className="eb-field">
            <label className="eb-label">Filtrar temas por nivel <span className="eb-optional">(opcional)</span></label>
            <div className="lvl-row">
              <button
                className={`lvl-chip ${selectedLevel === '' ? 'is-on' : ''}`}
                onClick={() => setSelectedLevel('')}
              >Todos</button>
              {LEVELS.map(lv => (
                <button
                  key={lv.id}
                  className={`lvl-chip ${selectedLevel === lv.id ? 'is-on' : ''}`}
                  onClick={() => setSelectedLevel(lv.id)}
                >{lv.short}</button>
              ))}
            </div>
          </div>

          <div className="eb-field">
            <div className="eb-label-row">
              <label className="eb-label">Temas a incluir <span className="count-pill">{selectedTopics.size}</span></label>
              <div className="eb-quick">
                <button className="tiny-btn" onClick={() => setSelectedTopics(new Set(availableTopics))}>Todos</button>
                <button className="tiny-btn" onClick={() => setSelectedTopics(new Set())}>Ninguno</button>
              </div>
            </div>
            <div className="eb-topics">
              {TOPIC_GROUPS.map(g => {
                const visible = g.topics.filter(t => availableTopics.includes(t));
                if (visible.length === 0) return null;
                const allSelected = visible.every(t => selectedTopics.has(t));
                return (
                  <div key={g.id} className="eb-topic-group">
                    <div className="eb-group-head">
                      <span className="topic-group-label">{g.label}</span>
                      <button className="tiny-btn" onClick={() => selectAllGroup(visible)}>
                        {allSelected ? 'Deseleccionar' : 'Todos'}
                      </button>
                    </div>
                    <div className="eb-chip-wrap">
                      {visible.map(t => {
                        const n = countByTopic[t] || 0;
                        const active = selectedTopics.has(t);
                        const empty = n === 0;
                        return (
                          <button
                            key={t}
                            className={`topic-chip ${active ? 'is-on' : ''} ${empty ? 'is-empty' : ''}`}
                            onClick={() => !empty && toggleTopic(t)}
                            disabled={empty}
                          >
                            {t}
                            <span className="topic-chip-n">{n}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="eb-field eb-count-field">
            <label className="eb-label">Número de preguntas</label>
            <div className="count-row">
              <input
                type="number"
                min="1"
                max={Math.max(totalAvailable, 1)}
                value={count}
                onChange={e => setCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="eb-number"
              />
              <input
                type="range"
                min="1"
                max={Math.max(totalAvailable, 1)}
                value={effectiveCount}
                onChange={e => setCount(parseInt(e.target.value))}
                className="eb-range"
                disabled={totalAvailable === 0}
              />
              <div className="count-avail">
                de <strong>{totalAvailable}</strong> disponibles
              </div>
            </div>
            <div className="quick-counts">
              {[10, 20, 30, 50, totalAvailable].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map(v => (
                <button key={v} className="tiny-btn" onClick={() => setCount(Math.min(v, totalAvailable))}>
                  {v === totalAvailable ? `Todas (${v})` : v}
                </button>
              ))}
            </div>
          </div>

          <div className="eb-field">
            <label className="eb-label">Versiones del examen</label>
            <div className="count-row">
              <input
                type="number"
                min="1"
                max="20"
                value={versions}
                onChange={e => setVersions(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                className="eb-number"
              />
              <div className="count-avail">
                {versions === 1
                  ? 'Una sola versión.'
                  : `${versions} versiones — mismo pool de preguntas, distinto orden de preguntas y opciones en cada una. Útil para evitar copia entre examinados.`}
              </div>
            </div>
            <div className="quick-counts">
              {[1, 2, 3, 5, 10].map(v => (
                <button key={v} className="tiny-btn" onClick={() => setVersions(v)}>{v}</button>
              ))}
            </div>
          </div>

          <div className="eb-field">
            <label className="eb-check">
              <input type="checkbox" checked={shuffleOpts} onChange={e => setShuffleOpts(e.target.checked)} />
              <span>Aleatorizar también el orden de opciones A/B/C/D</span>
            </label>
          </div>
        </div>

        <footer className="eb-foot">
          <div className="eb-summary">
            {selectedTopics.size === 0
              ? 'Selecciona al menos un tema'
              : `${effectiveCount} pregunta${effectiveCount !== 1 ? 's' : ''} aleatoria${effectiveCount !== 1 ? 's' : ''} de ${selectedTopics.size} tema${selectedTopics.size !== 1 ? 's' : ''}${versions > 1 ? ` · ${versions} versiones` : ''}`}
          </div>
          <div className="eb-foot-actions">
            <button className="ghost-btn" onClick={onClose}>Cancelar</button>
            <button
              className="primary-btn"
              onClick={handleBuild}
              disabled={selectedTopics.size === 0 || totalAvailable === 0}
            >Generar {versions > 1 ? `${versions} versiones` : 'examen'} →</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

Object.assign(window, { ExamBuilder });
