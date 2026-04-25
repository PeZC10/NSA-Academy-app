// Export utilities for NSC Academy exam builder

// --- Shuffle helper (seeded optional) ---
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Build an exam: given a selection of topics + count, pick N random questions.
// If a `level` is supplied, only questions whose `audiences` contain that level
// are included in the pool.
function buildExam(bank, { name, topics, count, shuffleOptions = true, level = null }) {
  const pool = bank.filter(q => {
    if (!topics.includes(q.topic)) return false;
    if (level && !(Array.isArray(q.audiences) && q.audiences.includes(level))) return false;
    return true;
  });
  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
  const withShuffledOptions = selected.map(q => {
    if (!shuffleOptions) return q;
    const shuffled = shuffle(q.options.map((o, i) => ({ ...o, origIndex: i })));
    return { ...q, options: shuffled };
  });
  return {
    name: name || 'Examen NSC Academy',
    topics,
    questions: withShuffledOptions,
    createdAt: new Date().toISOString(),
  };
}

// ---- Google Apps Script generator ----
// Produces a .gs file that the user pastes into script.google.com
// which creates a Google Form quiz with all questions + correct answers.
function toGoogleAppsScript(exam) {
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');
  const questionsJson = JSON.stringify(exam.questions.map(q => ({
    question: q.question,
    topic: q.topic,
    options: q.options.map(o => ({ text: o.text, correct: o.correct })),
  })), null, 2);

  return `/**
 * NSC Academy — Generador de Google Form
 *
 * Instrucciones:
 * 1. Abre https://script.google.com y crea un nuevo proyecto.
 * 2. Pega TODO este código reemplazando el contenido por defecto.
 * 3. Haz clic en "Ejecutar" (▶ Run). Autoriza los permisos cuando te los pida.
 * 4. Al terminar, revisa "Ver logs" (Ctrl/Cmd + Enter) para ver el link del Form.
 *
 * Examen generado: ${esc(exam.name)}
 * Preguntas: ${exam.questions.length}
 * Temas: ${exam.topics.join(', ')}
 * Generado: ${exam.createdAt}
 */

function crearExamenNSC() {
  var examData = ${questionsJson};

  var form = FormApp.create(${JSON.stringify(exam.name)});
  form.setIsQuiz(true);
  form.setDescription('Examen NSC Academy · ${exam.questions.length} preguntas · Cada pregunta vale 1 punto.');
  form.setShuffleQuestions(false); // Las preguntas ya vienen en orden aleatorio
  form.setCollectEmail(true);
  form.setLimitOneResponsePerUser(false);

  for (var i = 0; i < examData.length; i++) {
    var q = examData[i];
    var item = form.addMultipleChoiceItem();
    item.setTitle((i + 1) + '. ' + q.question);
    item.setHelpText('Tema: ' + q.topic);
    item.setPoints(1);
    item.setRequired(true);

    var choices = [];
    for (var j = 0; j < q.options.length; j++) {
      var opt = q.options[j];
      choices.push(item.createChoice(opt.text, opt.correct === true));
    }
    item.setChoices(choices);
  }

  var url = form.getPublishedUrl();
  var editUrl = form.getEditUrl();
  Logger.log('✅ Examen creado exitosamente');
  Logger.log('📝 Link para editar: ' + editUrl);
  Logger.log('🔗 Link para compartir: ' + url);
}
`;
}

// ---- Microsoft Forms-compatible DOCX generator ----
// Microsoft Forms "Quick Import" detecta preguntas de opción múltiple cuando:
//  - Cada pregunta está numerada (1., 2., 3., …)
//  - Cada opción está en su propia línea, prefijada con letra y punto (A., B., C., D.)
//  - La respuesta correcta se indica en una línea "Answer: X" después de las opciones
// Si no hay prefijos de letra en las opciones, Forms las interpreta como pregunta
// de texto abierto en vez de opción múltiple.
// Ref: https://support.microsoft.com/en-us/office/66b7e9bc-eb0d-4c65-b7e6-f9f92dcd71cb
async function toMicrosoftFormsDocx(exam) {
  if (!window.docx) {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'vendor/docx.umd.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = window.docx;
  const LETTERS = ['A','B','C','D','E','F'];

  const children = [];

  children.push(new Paragraph({
    text: exam.name,
    heading: HeadingLevel.HEADING_1,
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: `${exam.questions.length} preguntas · Temas: ${exam.topics.join(', ')}`, italics: true, size: 20 })],
  }));
  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Instrucciones para importar a Microsoft Forms:', bold: true, size: 20 })],
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: '1. Abre https://forms.office.com y crea un nuevo Quiz (Cuestionario).', size: 20 })],
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: '2. Clic en "Importación rápida" (Quick Import) y selecciona este archivo .docx.', size: 20 })],
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: '3. Forms detectará las preguntas como opción múltiple gracias a los prefijos A./B./C./D.', size: 20 })],
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: '4. Revisa las respuestas correctas (indicadas en las líneas "Answer:") y márcalas en Forms si es necesario.', size: 20 })],
  }));
  children.push(new Paragraph({ text: '' }));
  children.push(new Paragraph({ text: '— — — — — — — — — —' }));
  children.push(new Paragraph({ text: '' }));

  exam.questions.forEach((q, i) => {
    children.push(new Paragraph({
      children: [new TextRun({ text: `${i + 1}. ${q.question}`, bold: true })],
    }));
    let correctLetter = '';
    q.options.forEach((opt, j) => {
      const letter = LETTERS[j] || '?';
      if (opt.correct) correctLetter = letter;
      children.push(new Paragraph({
        text: `${letter}. ${opt.text}`,
      }));
    });
    if (correctLetter) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `Answer: ${correctLetter}`, italics: true })],
      }));
    }
    children.push(new Paragraph({ text: '' }));
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  const blob = await Packer.toBlob(doc);
  return blob;
}

// Print via hidden iframe — works in both Electron (where window.open is
// intercepted by the window-open handler) and regular browsers (where popup
// blockers can kill window.open). Writes HTML into an off-screen iframe and
// triggers its contentWindow.print().
function printViaIframe(html) {
  const existing = document.getElementById('__print_frame');
  if (existing) existing.remove();

  const iframe = document.createElement('iframe');
  iframe.id = '__print_frame';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.error('Print failed:', err);
    }
  }, 300);
}

// ---- CSV generator (bonus) ----
function toCSV(exam) {
  const escapeCsv = (s) => {
    const str = String(s);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };
  const lines = [];
  lines.push(['#', 'Tema', 'Pregunta', 'Opción A', 'Opción B', 'Opción C', 'Opción D', 'Correcta'].map(escapeCsv).join(','));
  exam.questions.forEach((q, i) => {
    const opts = q.options.map(o => o.text);
    while (opts.length < 4) opts.push('');
    const correctIdx = q.options.findIndex(o => o.correct);
    const correctLetter = ['A','B','C','D','E'][correctIdx] || '';
    lines.push([i + 1, q.topic, q.question, ...opts.slice(0, 4), correctLetter].map(escapeCsv).join(','));
  });
  return lines.join('\n');
}

// ---- Printable HTML generator ----
function toPrintableHTML(exam, { includeAnswerKey = true } = {}) {
  const esc = (s) => String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
  const LETTERS = ['A','B','C','D','E'];
  let html = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><title>${esc(exam.name)}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 760px; margin: 40px auto; padding: 0 40px; color: #1a2231; line-height: 1.4; }
    h1 { font-size: 24px; margin: 0 0 6px; }
    .meta { color: #5a6475; font-size: 12px; margin-bottom: 24px; border-bottom: 1px solid #d7cfbd; padding-bottom: 12px; }
    .q { margin-bottom: 18px; break-inside: avoid; }
    .qn { font-weight: bold; margin-bottom: 4px; }
    .opts { list-style: none; padding: 0; margin: 0; }
    .opts li { padding: 3px 0; display: flex; gap: 8px; font-family: -apple-system, sans-serif; font-size: 14px; }
    .lt { font-weight: bold; min-width: 18px; }
    .ans { page-break-before: always; margin-top: 40px; }
    .ans h2 { font-size: 18px; }
    .ans table { border-collapse: collapse; font-family: monospace; font-size: 12px; }
    .ans td { padding: 4px 12px; border: 1px solid #d7cfbd; }
    @media print { body { margin: 0; padding: 20px; } }
  </style></head><body>
  <h1>${esc(exam.name)}</h1>
  <div class="meta">${exam.questions.length} preguntas · Cada pregunta vale 1 punto · Temas: ${esc(exam.topics.join(', '))}</div>
  <p><strong>Nombre:</strong> _________________________________  &nbsp;&nbsp; <strong>Fecha:</strong> _______________</p>
  <hr>`;
  exam.questions.forEach((q, i) => {
    html += `<div class="q"><div class="qn">${i+1}. ${esc(q.question)}</div><ul class="opts">`;
    q.options.forEach((o, j) => {
      html += `<li><span class="lt">${LETTERS[j]}.</span><span>${esc(o.text)}</span></li>`;
    });
    html += `</ul></div>`;
  });
  if (includeAnswerKey) {
    html += `<div class="ans"><h2>Hoja de respuestas</h2><table><tbody><tr>`;
    exam.questions.forEach((q, i) => {
      const idx = q.options.findIndex(o => o.correct);
      const letter = LETTERS[idx] || '?';
      html += `<td>${i+1}. <strong>${letter}</strong></td>`;
      if ((i+1) % 5 === 0) html += `</tr><tr>`;
    });
    html += `</tr></tbody></table></div>`;
  }
  html += `</body></html>`;
  return html;
}

// Trigger a download in the browser
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function downloadText(content, filename, mime = 'text/plain') {
  downloadBlob(new Blob([content], { type: mime }), filename);
}

Object.assign(window, {
  shuffle, buildExam, toGoogleAppsScript, toMicrosoftFormsDocx,
  toCSV, toPrintableHTML, printViaIframe, downloadBlob, downloadText,
});
