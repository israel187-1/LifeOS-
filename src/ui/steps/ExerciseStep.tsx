import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { canRevealSolution, recordAttempt, revealSolution, saveDraft, takeHint } from '../../domain/actions';
import { exerciseProgress } from '../../domain/progress';
import type { ChoiceExercise, ExerciseRole, Lesson, OrderExercise, PythonExercise } from '../../domain/types';
import { explainError, type ErrorExplanation } from '../../python/errors';
import { grade, type Grade } from '../../python/grading';
import type { RunResult } from '../../python/harness';
import { getRunner, type RunnerStatus } from '../../python/runner';
import { useStore } from '../../state/store';
import { CodeBlock, ROLE_LABEL } from '../common';

const CodeEditor = lazy(() => import('../CodeEditor'));

export default function ExerciseStep({ lesson, role, optional }: { lesson: Lesson; role: ExerciseRole; optional?: boolean }) {
  const ex = lesson[role];
  return (
    <div className="step exercise">
      <p className="eyebrow">
        {ROLE_LABEL[role]}
        {optional ? ' · opcional' : ''} · {lesson.title}
      </p>
      <h2>{ex.title}</h2>
      <p className="prompt">{ex.prompt}</p>
      {role === 'independent' && <p className="muted small">Este ejercicio demuestra dominio: intenta sin ver la solución. Las pistas sí están permitidas.</p>}
      {ex.kind === 'python' && <PythonTask key={ex.id} lesson={lesson} role={role} ex={ex} />}
      {ex.kind === 'choice' && <ChoiceTask key={ex.id} lesson={lesson} role={role} ex={ex} />}
      {ex.kind === 'order' && <OrderTask key={ex.id} lesson={lesson} role={role} ex={ex} />}
    </div>
  );
}

function Hints({ id, hints, explanation, solution }: { id: string; hints: string[]; explanation: string; solution?: string }) {
  const { state, update } = useStore();
  const p = exerciseProgress(state, id);
  const canReveal = canRevealSolution(state, id, hints.length);
  const shown = hints.slice(0, p.hintsUsed);
  return (
    <div className="hints">
      {shown.map((h, i) => (
        <p key={i} className="hint">
          <strong>Pista {i + 1}:</strong> {h}
        </p>
      ))}
      <div className="row">
        {p.hintsUsed < hints.length && !p.solved && (
          <button className="btn ghost" onClick={() => update((s) => takeHint(s, id))}>
            {p.hintsUsed === 0 ? 'Necesito una pista' : 'Otra pista'} ({p.hintsUsed}/{hints.length})
          </button>
        )}
        {!p.solutionRevealed && !p.solved && p.hintsUsed >= hints.length && (
          <button
            className="btn ghost"
            disabled={!canReveal}
            title={canReveal ? '' : 'Primero haz al menos un intento'}
            onClick={() => update((s) => revealSolution(s, id))}
          >
            {canReveal ? 'Ver solución explicada' : 'Ver solución (haz un intento primero)'}
          </button>
        )}
      </div>
      {(p.solutionRevealed || p.solved) && (
        <div className="explain">
          {p.solutionRevealed && !p.solved && (
            <p className="muted small">Viste la solución: escríbela tú mismo, sin copiar, para entenderla. Este ejercicio no contará como resuelto sin ayuda.</p>
          )}
          {solution && p.solutionRevealed && <CodeBlock code={solution} />}
          <p>
            <strong>Por qué funciona:</strong> {explanation}
          </p>
        </div>
      )}
    </div>
  );
}

function useRunnerStatus(): RunnerStatus {
  const runner = getRunner();
  const [status, setStatus] = useState(runner.status);
  useEffect(() => {
    runner.preload();
    return runner.onStatus(setStatus);
  }, [runner]);
  return status;
}

function PythonTask({ lesson, role, ex }: { lesson: Lesson; role: ExerciseRole; ex: PythonExercise }) {
  const { state, update } = useStore();
  const p = exerciseProgress(state, ex.id);
  const initial = state.activeSession?.drafts[ex.id] ?? p.lastCode ?? ex.starterCode;
  const [code, setCode] = useState(initial);
  const [stdin, setStdin] = useState((ex.sampleInput ?? []).join('\n'));
  const [busy, setBusy] = useState<'run' | 'check' | null>(null);
  const [runOut, setRunOut] = useState<{ result: RunResult; error?: ErrorExplanation } | null>(null);
  const [result, setResult] = useState<Grade | null>(null);
  const [fatal, setFatal] = useState<string | null>(null);
  const status = useRunnerStatus();
  const runner = getRunner();

  const onChange = (v: string) => {
    setCode(v);
    update((s) => saveDraft(s, ex.id, v));
  };

  const run = async () => {
    setBusy('run');
    setFatal(null);
    setResult(null);
    try {
      const [r] = await runner.run(code, [{ stdin: stdin.split('\n').filter((l, i, a) => l !== '' || i < a.length - 1) }]);
      setRunOut({ result: r, error: r.error ? explainError(r.error) : undefined });
    } catch (e) {
      setFatal(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(null);
    }
  };

  const check = async () => {
    setBusy('check');
    setFatal(null);
    setRunOut(null);
    try {
      const results = await runner.run(code, ex.tests.map((t) => ({ stdin: t.stdin, assert: t.assert })));
      const g = grade(ex.tests, results);
      setResult(g);
      update((s) => recordAttempt(s, lesson, role, g.passed, new Date(), code));
    } catch (e) {
      setFatal(String(e instanceof Error ? e.message : e));
    } finally {
      setBusy(null);
    }
  };

  const firstFail = result?.outcomes.find((o) => !o.passed);

  return (
    <>
      <Suspense fallback={<textarea className="editor-fallback" value={code} readOnly aria-label="Cargando editor" />}>
        <CodeEditor value={code} onChange={onChange} label="Editor de Python" />
      </Suspense>
      {ex.usesInput && (
        <label className="stdin">
          Entrada para «Ejecutar» (un valor por línea)
          <textarea value={stdin} onChange={(e) => setStdin(e.target.value)} rows={2} />
        </label>
      )}
      <div className="row">
        <button className="btn" onClick={run} disabled={busy !== null || status === 'error'}>
          {busy === 'run' ? 'Ejecutando…' : 'Ejecutar'}
        </button>
        <button className="btn primary" onClick={check} disabled={busy !== null || status === 'error'} data-testid="check-button">
          {busy === 'check' ? 'Comprobando…' : 'Comprobar'}
        </button>
        <button className="btn ghost" onClick={() => onChange(ex.starterCode)} disabled={busy !== null}>
          Reiniciar código
        </button>
      </div>
      {status === 'loading' && <p className="muted small">Preparando Python en tu navegador (solo tarda la primera vez)…</p>}
      {status === 'error' && <p className="feedback bad">No se pudo cargar Python. Recarga la página; si sigue, revisa tu conexión la primera vez.</p>}
      {fatal && <p className="feedback bad">{fatal}</p>}

      {runOut && (
        <div className="output" data-testid="run-output">
          <p className="label">Salida</p>
          <pre>{runOut.result.transcript || '(sin salida)'}</pre>
          {runOut.error && <ErrorBox e={runOut.error} line={runOut.result.error?.line} />}
        </div>
      )}

      {result && (
        <div className={`feedback ${result.passed ? 'good' : 'bad'}`} data-testid="check-feedback" role="status">
          {result.passed ? (
            <p>
              <strong>¡Correcto!</strong> Pasaste {result.passedCount} de {result.total} pruebas.
            </p>
          ) : (
            <p>
              <strong>Aún no.</strong> Pasaste {result.passedCount} de {result.total} pruebas. Es normal: lee la diferencia y ajusta.
            </p>
          )}
          <ul className="tests">
            {result.outcomes.map((o) => (
              <li key={o.name} className={o.passed ? 'ok' : 'ko'}>
                {o.passed ? '✓' : '✗'} {o.name}
              </li>
            ))}
          </ul>
          {firstFail && (
            <div className="diff">
              {firstFail.stdin && firstFail.stdin.length > 0 && <p className="small">Entrada: {firstFail.stdin.join(', ')}</p>}
              {firstFail.error ? (
                <ErrorBox e={firstFail.error} />
              ) : (
                <div className="cols">
                  <div>
                    <p className="label">Se esperaba</p>
                    <pre>{firstFail.expected}</pre>
                  </div>
                  <div>
                    <p className="label">Tu programa mostró</p>
                    <pre>{firstFail.got || '(nada)'}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <Hints id={ex.id} hints={ex.hints} explanation={ex.explanation} solution={ex.solution} />
    </>
  );
}

function ErrorBox({ e, line }: { e: ErrorExplanation; line?: number | null }) {
  return (
    <div className="error-box">
      <p>
        <strong>{e.title}</strong>
        {line ? ` (línea ${line})` : ''}
      </p>
      <p>{e.explanation}</p>
      <p className="small">
        <strong>Prueba esto:</strong> {e.tip}
      </p>
    </div>
  );
}

function ChoiceTask({ lesson, role, ex }: { lesson: Lesson; role: ExerciseRole; ex: ChoiceExercise }) {
  const { state, update } = useStore();
  const p = exerciseProgress(state, ex.id);
  const [picked, setPicked] = useState<number | null>(null);
  const pick = (i: number) => {
    if (p.solved) return;
    setPicked(i);
    update((s) => recordAttempt(s, lesson, role, i === ex.correctIndex, new Date()));
  };
  return (
    <>
      {ex.code && <CodeBlock code={ex.code} />}
      <div className="options">
        {ex.options.map((o, i) => (
          <button
            key={i}
            className={`option ${picked === i ? (i === ex.correctIndex ? 'right' : 'wrong') : ''} ${p.solved && i === ex.correctIndex ? 'right' : ''}`}
            onClick={() => pick(i)}
          >
            {o.text}
          </button>
        ))}
      </div>
      {picked !== null && (
        <p className={`feedback ${picked === ex.correctIndex ? 'good' : 'bad'}`} role="status">
          {ex.options[picked].feedback}
        </p>
      )}
      <Hints id={ex.id} hints={ex.hints} explanation={ex.explanation} />
    </>
  );
}

function shuffle(n: number, seed: string): number[] {
  const idx = Array.from({ length: n }, (_, i) => i);
  let h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
  for (let i = n - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  if (idx.every((v, i) => v === i) && n > 1) idx.reverse();
  return idx;
}

function OrderTask({ lesson, role, ex }: { lesson: Lesson; role: ExerciseRole; ex: OrderExercise }) {
  const { state, update } = useStore();
  const p = exerciseProgress(state, ex.id);
  const initial = useMemo(() => (p.solved ? ex.steps.map((_, i) => i) : shuffle(ex.steps.length, ex.id)), [ex, p.solved]);
  const [order, setOrder] = useState(initial);
  const [checked, setChecked] = useState<boolean | null>(null);
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= order.length) return;
    const next = [...order];
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    setChecked(null);
  };
  const check = () => {
    const ok = order.every((v, i) => v === i);
    setChecked(ok);
    update((s) => recordAttempt(s, lesson, role, ok, new Date()));
  };
  return (
    <>
      <ol className="order">
        {order.map((v, i) => (
          <li key={v} className={checked === null ? '' : v === i ? 'ok' : 'ko'}>
            <span>{ex.steps[v]}</span>
            <span className="row tight">
              <button className="btn icon" aria-label="Subir" onClick={() => move(i, -1)} disabled={i === 0}>↑</button>
              <button className="btn icon" aria-label="Bajar" onClick={() => move(i, 1)} disabled={i === order.length - 1}>↓</button>
            </span>
          </li>
        ))}
      </ol>
      <button className="btn primary" onClick={check}>Comprobar orden</button>
      {checked !== null && (
        <p className={`feedback ${checked ? 'good' : 'bad'}`} role="status">
          {checked ? '¡Correcto! El orden tiene sentido.' : 'Algunos pasos (en rojo) no están en su lugar. Piensa qué necesita existir antes de cada paso.'}
        </p>
      )}
      <Hints id={ex.id} hints={ex.hints} explanation={ex.explanation} />
    </>
  );
}
