import { useState } from 'react';
import { answerQuestion, reviewExplanation, submitExplanation, FEYNMAN_MIN_WORDS } from '../../domain/actions';
import { lessonProgress } from '../../domain/progress';
import type { Lesson } from '../../domain/types';
import { getQuestion, lessonOfQuestion } from '../../content';
import { useStore } from '../../state/store';
import { CodeBlock } from '../common';

export function ObjectiveStep({ lesson }: { lesson: Lesson }) {
  return (
    <div className="step">
      <p className="eyebrow">Objetivo de la sesión</p>
      <h2>{lesson.objective}</h2>
      <p className="label">Vas a aprender</p>
      <ul className="checklist">
        {lesson.learn.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <p className="muted small">
        <strong>Cuándo cuenta como dominada:</strong> {lesson.mastery}
      </p>
    </div>
  );
}

export function ConceptStep({ lesson }: { lesson: Lesson }) {
  return (
    <div className="step">
      <p className="eyebrow">Concepto · {lesson.title}</p>
      <h2>La idea en pocas líneas</h2>
      {lesson.concept.map((c) => (
        <p key={c}>{c}</p>
      ))}
    </div>
  );
}

export function ExampleStep({ lesson }: { lesson: Lesson }) {
  const { example } = lesson;
  const [i, setI] = useState(0);
  const step = example.steps[i];
  return (
    <div className="step">
      <p className="eyebrow">Ejemplo paso a paso</p>
      <h2>{example.title}</h2>
      <div className={example.pseint ? 'cols' : ''}>
        {example.pseint && (
          <div>
            <p className="label">PSeInt (lo que ya conoces)</p>
            <CodeBlock code={example.pseint} numbered={false} />
          </div>
        )}
        <div>
          <p className="label">Python</p>
          <CodeBlock code={example.python} highlight={step?.lines ?? []} />
        </div>
      </div>
      <div className="walk" aria-live="polite">
        <p className="label">
          Paso {i + 1} de {example.steps.length}
        </p>
        <p>{step?.text}</p>
        <div className="row">
          <button className="btn ghost" onClick={() => setI(i - 1)} disabled={i === 0}>
            Paso anterior
          </button>
          <button className="btn" onClick={() => setI(i + 1)} disabled={i >= example.steps.length - 1}>
            Siguiente paso del ejemplo
          </button>
        </div>
      </div>
    </div>
  );
}

export function ErrorsStep({ lesson }: { lesson: Lesson }) {
  return (
    <div className="step">
      <p className="eyebrow">Errores frecuentes</p>
      <h2>Antes de seguir: errores que todos cometemos</h2>
      {lesson.commonErrors.map((e) => (
        <div key={e.error} className="error-item">
          <p>
            <strong>{e.error}</strong>
          </p>
          <p className="small">{e.why}</p>
          <p className="small">
            <span className="muted">Solución:</span> <code>{e.fix}</code>
          </p>
        </div>
      ))}
    </div>
  );
}

export function WelcomeBackStep({ lesson }: { lesson: Lesson }) {
  return (
    <div className="step">
      <p className="eyebrow">Bienvenido de vuelta</p>
      <h2>Qué bueno verte. Tu progreso está intacto.</h2>
      <p>Pausar es parte de cualquier proceso largo. Hoy no hay que recuperar nada: solo volver a ponerse en marcha.</p>
      <p>
        Esta sesión es más ligera a propósito: unas preguntas de repaso y un ejercicio de «{lesson.title}», algo que ya practicaste. Después
        seguimos con la ruta normal.
      </p>
    </div>
  );
}

export function RetrievalStep({ questionIds, title }: { questionIds: string[]; title: string }) {
  const { state, update } = useStore();
  const answers = state.activeSession?.answers ?? {};
  return (
    <div className="step">
      <p className="eyebrow">Recuperación activa</p>
      <h2>{title}</h2>
      <p className="muted small">Responde de memoria, sin volver atrás. Equivocarte aquí también ayuda a recordar.</p>
      {questionIds.map((id, n) => {
        const q = getQuestion(id);
        if (!q) return null;
        const picked = answers[id];
        const answered = picked !== undefined;
        return (
          <div key={id} className="question" data-testid="question">
            <p>
              <strong>{n + 1}.</strong> {q.prompt}
              {lessonOfQuestion(id) && <span className="muted small"> · {lessonOfQuestion(id)!.title}</span>}
            </p>
            {q.code && <CodeBlock code={q.code} />}
            <div className="options">
              {q.options.map((o, i) => (
                <button
                  key={i}
                  disabled={answered}
                  className={`option ${answered && i === q.correctIndex ? 'right' : ''} ${answered && picked === i && i !== q.correctIndex ? 'wrong' : ''}`}
                  onClick={() => update((s) => answerQuestion(s, id, i, new Date()))}
                >
                  {o}
                </button>
              ))}
            </div>
            {answered && (
              <p className={`feedback ${picked === q.correctIndex ? 'good' : 'bad'}`}>
                {picked === q.correctIndex ? 'Correcto. ' : 'No exactamente. '}
                {q.explanation}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FeynmanStep({ lesson }: { lesson: Lesson }) {
  const { state, update } = useStore();
  const p = lessonProgress(state, lesson.id);
  const [text, setText] = useState(p.feynmanText ?? '');
  const [reviewed, setReviewed] = useState(p.feynmanDone);
  const [confirm, setConfirm] = useState(false);
  const r = reviewExplanation(lesson.id, text);
  const submit = () => {
    setReviewed(true);
    update((s) => submitExplanation(s, lesson.id, text, confirm, new Date()));
  };
  const done = lessonProgress(state, lesson.id).feynmanDone;
  return (
    <div className="step">
      <p className="eyebrow">Método Feynman</p>
      <h2>Explícalo con tus palabras</h2>
      <p>{lesson.feynman.prompt}</p>
      <p className="muted small">Como si se lo contaras a un compañero que no vino a clase. Sin copiar del texto. Mínimo {FEYNMAN_MIN_WORDS} palabras.</p>
      <textarea className="feynman" rows={5} value={text} onChange={(e) => setText(e.target.value)} aria-label="Tu explicación" />
      <p className="muted small">{r.words} palabras</p>
      {reviewed && !done && r.missing.length > 0 && r.enoughWords && (
        <label className="check">
          <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} />
          Revisé mi explicación y sí incluye estas ideas aunque use otras palabras
        </label>
      )}
      <button className="btn primary" onClick={submit} disabled={!text.trim()}>
        Revisar mi explicación
      </button>
      {reviewed && (
        <div className={`feedback ${done ? 'good' : 'bad'}`} role="status">
          {done ? <p><strong>Explicación registrada.</strong></p> : !r.enoughWords ? <p>Escribe un poco más: explica qué es, cómo se usa y un ejemplo.</p> : <p>Casi. Intenta incluir las ideas que faltan.</p>}
          {r.covered.length > 0 && <p className="small">Ideas que detecté: {r.covered.join(', ')}.</p>}
          {r.missing.length > 0 && <p className="small">Ideas que podrías añadir: {r.missing.join(', ')}.</p>}
          <p className="muted small">Revisión por palabras clave (reglas locales, sin IA): es orientativa.</p>
        </div>
      )}
    </div>
  );
}
