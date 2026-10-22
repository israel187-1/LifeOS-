import { useEffect, useRef, useState } from 'react';
import { getLesson } from '../content';
import { completeRetrieval, goToStep, tick } from '../domain/actions';
import { testOutLevel, exerciseProgress, lessonProgress } from '../domain/progress';
import { finishSession, placementPassed } from '../domain/sessions';
import { MODE_MINUTES, type ActiveSession, type AppState, type SessionStep } from '../domain/types';
import { useStore } from '../state/store';
import { formatClock, MODE_LABEL } from './common';
import ExerciseStep from './steps/ExerciseStep';
import { ConceptStep, ErrorsStep, ExampleStep, FeynmanStep, ObjectiveStep, RetrievalStep, WelcomeBackStep } from './steps/LessonSteps';
import SummaryStep from './steps/SummaryStep';

const IDLE_LIMIT_MS = 120_000;

function useEffectiveTimer(paused: boolean) {
  const { update } = useStore();
  const lastInput = useRef(Date.now());
  const [idle, setIdle] = useState(false);
  useEffect(() => {
    const mark = () => {
      lastInput.current = Date.now();
    };
    const events = ['pointerdown', 'keydown', 'input', 'scroll', 'touchstart'];
    events.forEach((e) => window.addEventListener(e, mark, { passive: true, capture: true }));
    const id = setInterval(() => {
      const isIdle = Date.now() - lastInput.current > IDLE_LIMIT_MS;
      setIdle(isIdle);
      if (!paused && !isIdle && document.visibilityState === 'visible') update((s) => tick(s, 1, new Date()));
    }, 1000);
    return () => {
      clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, mark, { capture: true }));
    };
  }, [paused, update]);
  return idle;
}

function stepLabel(step: SessionStep): string {
  switch (step.type) {
    case 'objective':
      return 'Objetivo';
    case 'concept':
      return 'Concepto';
    case 'example':
      return 'Ejemplo';
    case 'exercise':
      return 'Ejercicio';
    case 'errors':
      return 'Errores frecuentes';
    case 'retrieval':
      return 'Preguntas';
    case 'feynman':
      return 'Explícalo';
    case 'welcome-back':
      return 'Bienvenida';
    case 'summary':
      return 'Resumen';
  }
}

function stepDone(state: AppState, s: ActiveSession, step: SessionStep): boolean {
  const lesson = step.lessonId ? getLesson(step.lessonId) : undefined;
  if (step.type === 'exercise' && lesson && step.role) return exerciseProgress(state, lesson[step.role].id).solved;
  if (step.type === 'retrieval') return (step.questionIds ?? []).every((id) => id in s.answers);
  if (step.type === 'feynman' && lesson) return lessonProgress(state, lesson.id).feynmanDone;
  return true;
}

export default function Session({ onExit }: { onExit: () => void }) {
  const { state, update } = useStore();
  const [paused, setPaused] = useState(false);
  const [dismissedGoal, setDismissedGoal] = useState(false);
  const idle = useEffectiveTimer(paused);
  const s = state.activeSession;
  const top = useRef<HTMLDivElement>(null);

  useEffect(() => {
    top.current?.scrollIntoView?.({ block: 'start' });
  }, [s?.stepIndex]);

  if (!s) return null;
  const step = s.steps[s.stepIndex];
  const lesson = step.lessonId ? getLesson(step.lessonId) : undefined;
  const isLast = s.stepIndex === s.steps.length - 1;
  const done = stepDone(state, s, step);
  const target = MODE_MINUTES[s.mode] * 60;
  const reachedGoal = s.activeSeconds >= target;

  const next = () => {
    update((st) => {
      let n = st;
      if (step.type === 'retrieval' && step.lessonId && step.questionIds) n = completeRetrieval(n, step.lessonId, step.questionIds, new Date());
      return goToStep(n, s.stepIndex + 1, new Date());
    });
  };

  const finish = (completed: boolean) => {
    update((st) => {
      const active = st.activeSession;
      let n = st;
      if (completed && active?.kind === 'placement' && active.levelId && placementPassed(active)) {
        n = testOutLevel(n, active.levelId, new Date().toISOString());
      }
      return finishSession(n, new Date(), completed);
    });
    onExit();
  };

  let nextLabel = 'Continuar';
  if (step.type === 'exercise' && !done) nextLabel = step.optional ? 'Saltar (es opcional)' : 'Saltar por ahora';
  if (step.type === 'feynman' && !done) nextLabel = 'Saltar por ahora';
  const blocked = step.type === 'retrieval' && !done;

  return (
    <div className="session" ref={top}>
      <header className="session-head">
        <div className="session-title">
          <p className="eyebrow">{MODE_LABEL[s.mode].detail}</p>
          <h1>{s.title}</h1>
        </div>
        <div className="timer" aria-label="Temporizador de trabajo efectivo">
          <span className={`clock ${paused || idle ? 'paused' : ''}`} data-testid="timer">
            {formatClock(s.activeSeconds)}
          </span>
          <span className="muted small">/ {MODE_MINUTES[s.mode]} min</span>
          <button className="btn icon" onClick={() => setPaused(!paused)} aria-label={paused ? 'Reanudar temporizador' : 'Pausar temporizador'}>
            {paused ? '▶' : '❚❚'}
          </button>
        </div>
      </header>
      {(paused || idle) && <p className="muted small center">{paused ? 'Temporizador en pausa.' : 'Pausado por inactividad: solo cuenta el tiempo de trabajo efectivo.'}</p>}
      {reachedGoal && !dismissedGoal && !isLast && (
        <div className="banner good">
          {s.mode === 'minimal'
            ? '¡Cumpliste tus 5 minutos! Puedes terminar ahora o seguir si te apetece.'
            : s.mode === 'normal'
              ? `Llevas ${MODE_MINUTES[s.mode]} min. Buen momento para un descanso de 5 minutos (opcional).`
              : `Llevas ${MODE_MINUTES[s.mode]} min. Considera un descanso de 10 minutos.`}
          <button className="btn link inline" onClick={() => setDismissedGoal(true)}>
            Seguir
          </button>
        </div>
      )}

      <div className="progress-steps" aria-label={`Paso ${s.stepIndex + 1} de ${s.steps.length}`}>
        {s.steps.map((st, i) => (
          <span key={i} className={i < s.stepIndex ? 'done' : i === s.stepIndex ? 'current' : ''} title={stepLabel(st)} />
        ))}
      </div>
      <p className="muted small" data-testid="step-indicator">
        Paso {s.stepIndex + 1} de {s.steps.length} · {stepLabel(step)}
      </p>

      <main className="step-body" key={s.stepIndex}>
        {step.type === 'objective' && lesson && <ObjectiveStep lesson={lesson} />}
        {step.type === 'concept' && lesson && <ConceptStep lesson={lesson} />}
        {step.type === 'example' && lesson && <ExampleStep lesson={lesson} />}
        {step.type === 'errors' && lesson && <ErrorsStep lesson={lesson} />}
        {step.type === 'welcome-back' && lesson && <WelcomeBackStep lesson={lesson} />}
        {step.type === 'exercise' && lesson && step.role && <ExerciseStep lesson={lesson} role={step.role} optional={step.optional} />}
        {step.type === 'retrieval' && (
          <RetrievalStep questionIds={step.questionIds ?? []} title={step.lessonId ? '¿Qué recuerdas?' : 'Repaso rápido'} />
        )}
        {step.type === 'feynman' && lesson && <FeynmanStep lesson={lesson} />}
        {step.type === 'summary' && <SummaryStep />}
      </main>

      <footer className="session-nav">
        <button className="btn ghost" onClick={() => update((st) => goToStep(st, s.stepIndex - 1, new Date()))} disabled={s.stepIndex === 0}>
          Atrás
        </button>
        <button className="btn ghost" onClick={onExit} title="Tu avance queda guardado">
          Salir (se guarda)
        </button>
        {isLast ? (
          <button className="btn primary" onClick={() => finish(true)} data-testid="finish-button">
            Terminar sesión
          </button>
        ) : (
          <button className={`btn ${done ? 'primary' : ''}`} onClick={next} disabled={blocked} data-testid="next-button" title={blocked ? 'Responde todas las preguntas' : ''}>
            {blocked ? 'Responde para continuar' : nextLabel}
          </button>
        )}
      </footer>
      {!isLast && (
        <p className="center">
          <button className="btn link small" onClick={() => finish(false)}>
            Terminar aquí por hoy
          </button>
        </p>
      )}
    </div>
  );
}
