import { getLesson, lessonsOfLevel, LESSONS } from '../content';
import { toISODate, uid } from './dates';
import {
  currentLesson,
  dueReviewIds,
  exerciseProgress,
  isMastered,
  lessonProgress,
  missingMasteryParts,
  patchLesson,
} from './progress';
import type { ActiveSession, AppState, Lesson, Mode, SessionKind, SessionLog, SessionStep } from './types';

function baseSession(kind: SessionKind, mode: Mode, title: string, steps: SessionStep[], now: Date): ActiveSession {
  return {
    id: uid(),
    kind,
    mode,
    title,
    steps,
    stepIndex: 0,
    startedAt: now.toISOString(),
    lastActiveAt: now.toISOString(),
    activeSeconds: 0,
    exercisesAttempted: [],
    exercisesSolved: [],
    questionsAnswered: 0,
    questionsCorrect: 0,
    answers: {},
    drafts: {},
  };
}

export function buildLessonSession(state: AppState, lesson: Lesson, mode: Mode, now: Date): ActiveSession {
  const id = lesson.id;
  const steps: SessionStep[] = [];
  if (mode === 'deep') {
    const warmup = dueReviewIds(state, toISODate(now)).slice(0, 3);
    if (warmup.length) steps.push({ type: 'retrieval', questionIds: warmup });
  }
  steps.push(
    { type: 'objective', lessonId: id },
    { type: 'concept', lessonId: id },
    { type: 'example', lessonId: id },
    { type: 'exercise', lessonId: id, role: 'guided' },
    { type: 'errors', lessonId: id },
    { type: 'exercise', lessonId: id, role: 'bugfix' },
    { type: 'exercise', lessonId: id, role: 'independent' },
    { type: 'retrieval', lessonId: id, questionIds: lesson.retrieval.map((q) => q.id) },
    { type: 'exercise', lessonId: id, role: 'challenge', optional: mode !== 'deep' },
    { type: 'feynman', lessonId: id },
    { type: 'summary', lessonId: id },
  );
  return { ...baseSession('lesson', mode, lesson.title, steps, now), lessonId: id };
}

/** Only the mastery criteria still missing for a lesson that was already practiced. */
export function buildReinforceSession(state: AppState, lesson: Lesson, mode: Mode, now: Date): ActiveSession {
  const id = lesson.id;
  const missing = missingMasteryParts(state, id);
  const steps: SessionStep[] = [];
  if (missing.includes('independent')) {
    steps.push({ type: 'concept', lessonId: id }, { type: 'exercise', lessonId: id, role: 'independent' });
    if (exerciseProgress(state, lesson.independent.id).solutionRevealed) {
      steps.push({ type: 'exercise', lessonId: id, role: 'challenge' });
    }
  }
  if (missing.includes('retrieval')) {
    steps.push({ type: 'retrieval', lessonId: id, questionIds: lesson.retrieval.map((q) => q.id) });
  }
  if (missing.includes('feynman')) steps.push({ type: 'feynman', lessonId: id });
  steps.push({ type: 'summary', lessonId: id });
  return { ...baseSession('reinforce', mode, `Refuerzo: ${lesson.title}`, steps, now), lessonId: id };
}

function lastWorkedLesson(state: AppState): Lesson | undefined {
  for (let i = state.sessions.length - 1; i >= 0; i--) {
    const l = state.sessions[i].lessonId && getLesson(state.sessions[i].lessonId!);
    if (l) return l;
  }
  return LESSONS.filter((l) => isMastered(state, l.id)).pop();
}

/** Short, easier session after several days away: welcome, light review, one familiar exercise. */
export function buildRecoverySession(state: AppState, mode: Mode, now: Date): ActiveSession {
  const today = toISODate(now);
  const lesson = lastWorkedLesson(state) ?? LESSONS[0];
  const due = dueReviewIds(state, today);
  const questionIds = (due.length ? due : lesson.retrieval.map((q) => q.id)).slice(0, 3);
  const steps: SessionStep[] = [
    { type: 'welcome-back', lessonId: lesson.id },
    { type: 'retrieval', questionIds },
    { type: 'exercise', lessonId: lesson.id, role: 'guided' },
    { type: 'summary' },
  ];
  return { ...baseSession('recovery', mode, 'Sesión de regreso', steps, now), lessonId: lesson.id };
}

export type MinimalVariant = 'auto' | 'review' | 'exercise' | 'bugfix' | 'explain';

export const MINIMAL_VARIANTS: { id: Exclude<MinimalVariant, 'auto'>; label: string }[] = [
  { id: 'exercise', label: 'Resolver un ejercicio' },
  { id: 'review', label: 'Repasar 3 preguntas' },
  { id: 'bugfix', label: 'Corregir un error' },
  { id: 'explain', label: 'Explicar un concepto' },
];

/** Five-minute session with exactly one small, useful activity. */
export function buildMinimalSession(state: AppState, now: Date, variant: MinimalVariant = 'auto'): ActiveSession {
  const today = toISODate(now);
  const lesson = currentLesson(state) ?? LESSONS[LESSONS.length - 1];
  const mastered = LESSONS.filter((l) => isMastered(state, l.id));
  const due = dueReviewIds(state, today);
  let chosen = variant;
  if (chosen === 'auto') chosen = due.length >= 3 ? 'review' : 'exercise';
  if (chosen === 'review' && due.length === 0 && mastered.length === 0 && !state.lessons[lesson.id]) chosen = 'exercise';

  const notStarted = !state.lessons[lesson.id]?.startedAt;
  let steps: SessionStep[];
  let title: string;
  switch (chosen) {
    case 'review': {
      const pool = due.length ? due : (mastered.length ? mastered : [lesson]).flatMap((l) => l.retrieval.map((q) => q.id));
      steps = [{ type: 'retrieval', questionIds: pool.slice(0, 3) }];
      title = 'Repaso de 3 preguntas';
      break;
    }
    case 'bugfix': {
      const target = mastered.length && notStarted ? mastered[mastered.length - 1] : lesson;
      steps = [{ type: 'exercise', lessonId: target.id, role: 'bugfix' }];
      title = `Corrige un error: ${target.title}`;
      break;
    }
    case 'explain': {
      const target = mastered.length ? mastered[mastered.length - 1] : lesson;
      steps = [{ type: 'concept', lessonId: target.id }, { type: 'feynman', lessonId: target.id }];
      title = `Explica con tus palabras: ${target.title}`;
      break;
    }
    default: {
      const guided = exerciseProgress(state, lesson.guided.id);
      const role = guided.solved ? (exerciseProgress(state, lesson.bugfix.id).solved ? 'independent' : 'bugfix') : 'guided';
      steps = notStarted
        ? [{ type: 'concept', lessonId: lesson.id }, { type: 'exercise', lessonId: lesson.id, role }]
        : [{ type: 'exercise', lessonId: lesson.id, role }];
      title = `Un ejercicio: ${lesson.title}`;
    }
  }
  steps.push({ type: 'summary' });
  return { ...baseSession('minimal', 'minimal', title, steps, now), lessonId: lesson.id };
}

export const PLACEMENT_PASS_RATIO = 0.8;

export function buildPlacementSession(levelId: number, now: Date): ActiveSession {
  const lessons = lessonsOfLevel(levelId);
  const steps: SessionStep[] = [
    { type: 'retrieval', questionIds: lessons.flatMap((l) => l.retrieval.map((q) => q.id)) },
    ...lessons.map((l) => ({ type: 'exercise' as const, lessonId: l.id, role: 'independent' as const })),
    { type: 'summary' },
  ];
  return { ...baseSession('placement', 'normal', `Prueba de nivel ${levelId}`, steps, now), levelId };
}

export function placementPassed(session: ActiveSession): boolean {
  const total = session.steps.flatMap((s) => (s.type === 'retrieval' ? s.questionIds ?? [] : [])).length;
  const exercises = session.steps.filter((s) => s.type === 'exercise' && s.lessonId);
  const solved = exercises.every((s) => {
    const lesson = getLesson(s.lessonId!)!;
    return session.exercisesSolved.includes(lesson[s.role!].id);
  });
  return total > 0 && session.questionsCorrect / total >= PLACEMENT_PASS_RATIO && solved;
}

/** Closes the active session and appends it to the history. */
export function finishSession(state: AppState, now: Date, completed: boolean): AppState {
  const s = state.activeSession;
  if (!s) return state;
  let next = state;
  if (completed && s.kind === 'lesson' && s.lessonId) {
    const p = lessonProgress(next, s.lessonId);
    if (!p.completedAt) next = patchLesson(next, s.lessonId, { completedAt: now.toISOString() }, now.toISOString());
  }
  const lessonsMastered = Object.entries(next.lessons)
    .filter(([, p]) => p.masteredAt && p.masteredAt >= s.startedAt)
    .map(([id]) => id);
  const log: SessionLog = {
    id: s.id,
    kind: s.kind,
    mode: s.mode,
    title: s.title,
    lessonId: s.lessonId,
    startedAt: s.startedAt,
    endedAt: now.toISOString(),
    date: toISODate(new Date(s.startedAt)),
    activeSeconds: s.activeSeconds,
    exercisesAttempted: s.exercisesAttempted.length,
    exercisesSolved: s.exercisesSolved.length,
    questionsAnswered: s.questionsAnswered,
    questionsCorrect: s.questionsCorrect,
    lessonsMastered,
    completed,
    summary: summarize(s, lessonsMastered, completed),
  };
  return { ...next, activeSession: null, sessions: [...next.sessions, log] };
}

function summarize(s: ActiveSession, mastered: string[], completed: boolean): string {
  const parts: string[] = [];
  if (s.exercisesSolved.length) parts.push(`${s.exercisesSolved.length} ejercicio(s) resuelto(s)`);
  else if (s.exercisesAttempted.length) parts.push(`${s.exercisesAttempted.length} ejercicio(s) intentado(s)`);
  if (s.questionsAnswered) parts.push(`${s.questionsCorrect}/${s.questionsAnswered} preguntas correctas`);
  if (mastered.length) parts.push(`dominaste ${mastered.map((id) => `«${getLesson(id)?.title}»`).join(', ')}`);
  const mins = Math.max(1, Math.round(s.activeSeconds / 60));
  const head = `${s.title} · ${mins} min${completed ? '' : ' (guardada a medias)'}`;
  return parts.length ? `${head}: ${parts.join(', ')}.` : `${head}.`;
}
