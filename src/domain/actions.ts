import { getLesson, getQuestion } from '../content';
import { toISODate } from './dates';
import { answerReview, exerciseProgress, patchExercise, patchLesson } from './progress';
import type { ActiveSession, AppState, ExerciseRole, Lesson } from './types';

export const RETRIEVAL_PASS = 2;
export const FEYNMAN_MIN_WORDS = 12;

function patchSession(state: AppState, patch: Partial<ActiveSession> | ((s: ActiveSession) => Partial<ActiveSession>)): AppState {
  const s = state.activeSession;
  if (!s) return state;
  const p = typeof patch === 'function' ? patch(s) : patch;
  return { ...state, activeSession: { ...s, ...p } };
}

export function startSession(state: AppState, session: ActiveSession): AppState {
  let next: AppState = { ...state, activeSession: session };
  if (session.lessonId && session.kind === 'lesson') {
    next = patchLesson(next, session.lessonId, {}, session.startedAt);
  }
  return next;
}

export function goToStep(state: AppState, index: number, now: Date): AppState {
  return patchSession(state, (s) => ({
    stepIndex: Math.max(0, Math.min(index, s.steps.length - 1)),
    lastActiveAt: now.toISOString(),
  }));
}

export function tick(state: AppState, seconds: number, now: Date): AppState {
  return patchSession(state, (s) => ({ activeSeconds: s.activeSeconds + seconds, lastActiveAt: now.toISOString() }));
}

export function saveDraft(state: AppState, exerciseId: string, code: string): AppState {
  return patchSession(state, (s) => ({ drafts: { ...s.drafts, [exerciseId]: code } }));
}

export function takeHint(state: AppState, exerciseId: string): AppState {
  const p = exerciseProgress(state, exerciseId);
  return patchExercise(state, exerciseId, { hintsUsed: p.hintsUsed + 1 });
}

/** The solution is unlocked only after at least one attempt and all hints. */
export function canRevealSolution(state: AppState, exerciseId: string, hintCount: number): boolean {
  const p = exerciseProgress(state, exerciseId);
  return p.solved || (p.attempts >= 1 && p.hintsUsed >= hintCount);
}

export function revealSolution(state: AppState, exerciseId: string): AppState {
  return patchExercise(state, exerciseId, { solutionRevealed: true });
}

export function recordAttempt(
  state: AppState,
  lesson: Lesson,
  role: ExerciseRole,
  passed: boolean,
  now: Date,
  code?: string,
): AppState {
  const ex = lesson[role];
  const prev = exerciseProgress(state, ex.id);
  const independently = passed && !prev.solutionRevealed;
  let next = patchExercise(state, ex.id, {
    attempts: prev.attempts + 1,
    solved: prev.solved || passed,
    solvedIndependently: prev.solvedIndependently || independently,
    lastCode: code ?? prev.lastCode,
  });
  next = patchSession(next, (s) => ({
    exercisesAttempted: s.exercisesAttempted.includes(ex.id) ? s.exercisesAttempted : [...s.exercisesAttempted, ex.id],
    exercisesSolved: passed && !s.exercisesSolved.includes(ex.id) ? [...s.exercisesSolved, ex.id] : s.exercisesSolved,
    lastActiveAt: now.toISOString(),
  }));
  const iso = now.toISOString();
  if (role === 'independent' && independently && next.activeSession?.kind !== 'placement') {
    next = patchLesson(next, lesson.id, { independentSolved: true }, iso);
  } else if (role === 'challenge' && passed) {
    // Solving the harder challenge without help also demonstrates independent mastery.
    next = patchLesson(next, lesson.id, independently ? { challengeSolved: true, independentSolved: true } : { challengeSolved: true }, iso);
  } else {
    next = patchLesson(next, lesson.id, {}, iso);
  }
  return next;
}

export function answerQuestion(state: AppState, questionId: string, choice: number, now: Date): AppState {
  const q = getQuestion(questionId);
  const s = state.activeSession;
  if (!q || !s || questionId in s.answers) return state;
  const correct = choice === q.correctIndex;
  let next = answerReview(state, questionId, correct, toISODate(now));
  next = patchSession(next, (a) => ({
    answers: { ...a.answers, [questionId]: choice },
    questionsAnswered: a.questionsAnswered + 1,
    questionsCorrect: a.questionsCorrect + (correct ? 1 : 0),
    lastActiveAt: now.toISOString(),
  }));
  return next;
}

/** Called when a lesson's retrieval step is finished; records mastery evidence if enough answers were right. */
export function completeRetrieval(state: AppState, lessonId: string, questionIds: string[], now: Date): AppState {
  const s = state.activeSession;
  if (!s || s.kind === 'placement') return state;
  const correct = questionIds.filter((id) => s.answers[id] === getQuestion(id)?.correctIndex).length;
  if (correct < Math.min(RETRIEVAL_PASS, questionIds.length)) return state;
  return patchLesson(state, lessonId, { retrievalPassed: true }, now.toISOString());
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

export interface FeynmanReview {
  words: number;
  covered: string[];
  missing: string[];
  enoughWords: boolean;
  passed: boolean;
}

/** Local keyword check of a learner's explanation. It is a heuristic, not an AI grader. */
export function reviewExplanation(lessonId: string, text: string): FeynmanReview {
  const lesson = getLesson(lessonId);
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const t = normalize(text);
  const covered: string[] = [];
  const missing: string[] = [];
  for (const idea of lesson?.feynman.keyIdeas ?? []) {
    (idea.keywords.some((k) => t.includes(normalize(k))) ? covered : missing).push(idea.label);
  }
  const needed = Math.min(2, covered.length + missing.length);
  const enoughWords = words >= FEYNMAN_MIN_WORDS;
  return { words, covered, missing, enoughWords, passed: enoughWords && covered.length >= needed };
}

export function submitExplanation(state: AppState, lessonId: string, text: string, selfConfirmed: boolean, now: Date): AppState {
  const r = reviewExplanation(lessonId, text);
  const done = r.passed || (r.enoughWords && selfConfirmed);
  return patchLesson(state, lessonId, done ? { feynmanText: text, feynmanDone: true } : { feynmanText: text }, now.toISOString());
}
