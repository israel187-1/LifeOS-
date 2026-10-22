import { LESSONS } from '../content';
import { daysBetween } from './dates';
import { currentLesson, dueReviewIds, isMastered, lessonStatus } from './progress';
import {
  buildLessonSession,
  buildMinimalSession,
  buildRecoverySession,
  buildReinforceSession,
} from './sessions';
import { daysSinceLastPractice } from './stats';
import type { ActiveSession, AppState, ISODate, Mode, Obligation } from './types';

export const RECOVERY_GAP_DAYS = 3;

export type ActionKind = 'continue' | 'recovery' | 'lesson' | 'reinforce' | 'minimal' | 'review';

export interface NextAction {
  kind: ActionKind;
  title: string;
  why: string;
  firstStep: string;
  lessonId?: string;
}

export function nextAction(state: AppState, today: ISODate, mode: Mode): NextAction {
  const active = state.activeSession;
  if (active) {
    const pct = Math.round((active.stepIndex / active.steps.length) * 100);
    return {
      kind: 'continue',
      title: `Continuar: ${active.title}`,
      why: `Vas en el paso ${active.stepIndex + 1} de ${active.steps.length} (${pct}%). Tu avance está guardado.`,
      firstStep: 'Retoma exactamente donde lo dejaste.',
      lessonId: active.lessonId,
    };
  }

  const gap = daysSinceLastPractice(state, today);
  if (gap !== undefined && gap >= RECOVERY_GAP_DAYS) {
    return {
      kind: 'recovery',
      title: 'Sesión de regreso (unos 10 min)',
      why: `Han pasado ${gap} días. Tu progreso sigue intacto; empezamos suave con algo que ya conoces.`,
      firstStep: 'Responde una pregunta de repaso.',
    };
  }

  if (mode === 'minimal') {
    const due = dueReviewIds(state, today).length;
    return {
      kind: 'minimal',
      title: 'Modo mínimo: 5 minutos',
      why: due >= 3 ? `Tienes ${due} preguntas listas para repasar.` : 'Una sola actividad corta. Hacer poco cuenta.',
      firstStep: due >= 3 ? 'Responde la primera pregunta.' : 'Lee el enunciado y escribe la primera línea.',
    };
  }

  const practiced = LESSONS.find((l) => lessonStatus(state, l.id) === 'practiced');
  if (practiced) {
    return {
      kind: 'reinforce',
      title: `Refuerzo: ${practiced.title}`,
      why: 'Ya practicaste esta lección; falta demostrar dominio antes de avanzar. Solo repites lo que falta.',
      firstStep: 'Resuelve un ejercicio sin ver la solución.',
      lessonId: practiced.id,
    };
  }

  const lesson = currentLesson(state);
  if (lesson) {
    const started = Boolean(state.lessons[lesson.id]?.startedAt);
    return {
      kind: 'lesson',
      title: lesson.title,
      why: lesson.objective,
      firstStep: started ? 'Retoma la lección desde el objetivo.' : 'Lee el objetivo (30 segundos) y pulsa continuar.',
      lessonId: lesson.id,
    };
  }

  return {
    kind: 'review',
    title: 'Repaso y práctica',
    why: 'Dominaste todas las lecciones disponibles. Repasar mantiene lo aprendido mientras llegan los siguientes niveles.',
    firstStep: 'Responde 3 preguntas de repaso.',
  };
}

export function createSession(state: AppState, action: NextAction, mode: Mode, now: Date): ActiveSession | null {
  switch (action.kind) {
    case 'continue':
      return state.activeSession;
    case 'recovery':
      return buildRecoverySession(state, mode, now);
    case 'minimal':
      return buildMinimalSession(state, now);
    case 'review':
      return buildMinimalSession(state, now, 'review');
    case 'reinforce':
    case 'lesson': {
      const lesson = LESSONS.find((l) => l.id === action.lessonId);
      if (!lesson) return null;
      return action.kind === 'lesson'
        ? buildLessonSession(state, lesson, mode, now)
        : buildReinforceSession(state, lesson, mode, now);
    }
  }
}

/** Pending obligations sorted by date (soonest first). */
export function upcomingObligations(state: AppState, today: ISODate): Obligation[] {
  return state.obligations
    .filter((o) => !o.done && o.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function urgentObligation(state: AppState, today: ISODate): Obligation | undefined {
  const next = upcomingObligations(state, today)[0];
  return next && daysBetween(today, next.dueDate) <= 2 ? next : undefined;
}

export function masteredCount(state: AppState): number {
  return LESSONS.filter((l) => isMastered(state, l.id)).length;
}
