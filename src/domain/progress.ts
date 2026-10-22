import { LESSONS, LEVELS, getLesson, lessonsOfLevel } from '../content';
import { addDays } from './dates';
import type { AppState, ExerciseProgress, ISODate, ISODateTime, LessonProgress, ReviewItem } from './types';

export function emptyState(now: Date = new Date()): AppState {
  return {
    version: 1,
    createdAt: now.toISOString(),
    lessons: {},
    exercises: {},
    review: {},
    sessions: [],
    activeSession: null,
    obligations: [],
    ideas: [],
    englishDays: [],
    settings: { mode: 'normal' },
  };
}

export const emptyLessonProgress = (): LessonProgress => ({
  independentSolved: false,
  retrievalPassed: false,
  feynmanDone: false,
  challengeSolved: false,
});

export const emptyExerciseProgress = (): ExerciseProgress => ({
  attempts: 0,
  solved: false,
  solvedIndependently: false,
  hintsUsed: 0,
  solutionRevealed: false,
});

export function lessonProgress(state: AppState, lessonId: string): LessonProgress {
  return state.lessons[lessonId] ?? emptyLessonProgress();
}

export function exerciseProgress(state: AppState, exerciseId: string): ExerciseProgress {
  return state.exercises[exerciseId] ?? emptyExerciseProgress();
}

export function isMastered(state: AppState, lessonId: string): boolean {
  return Boolean(state.lessons[lessonId]?.masteredAt);
}

export type MasteryPart = 'independent' | 'retrieval' | 'feynman';

export function missingMasteryParts(state: AppState, lessonId: string): MasteryPart[] {
  const p = lessonProgress(state, lessonId);
  if (p.masteredAt) return [];
  const missing: MasteryPart[] = [];
  if (!p.independentSolved) missing.push('independent');
  if (!p.retrievalPassed) missing.push('retrieval');
  if (!p.feynmanDone) missing.push('feynman');
  return missing;
}

/** Applies a patch to lesson progress and marks mastery when all criteria are met. */
export function patchLesson(
  state: AppState,
  lessonId: string,
  patch: Partial<LessonProgress>,
  now: ISODateTime,
): AppState {
  const prev = lessonProgress(state, lessonId);
  const next: LessonProgress = { startedAt: prev.startedAt ?? now, ...prev, ...patch };
  if (!next.masteredAt && next.independentSolved && next.retrievalPassed && next.feynmanDone) {
    next.masteredAt = now;
  }
  return { ...state, lessons: { ...state.lessons, [lessonId]: next } };
}

export function patchExercise(state: AppState, exerciseId: string, patch: Partial<ExerciseProgress>): AppState {
  const prev = exerciseProgress(state, exerciseId);
  return { ...state, exercises: { ...state.exercises, [exerciseId]: { ...prev, ...patch } } };
}

// ---------- Spaced repetition (Leitner) ----------

export const BOX_INTERVALS = [0, 1, 3, 7, 14, 30];

export function answerReview(state: AppState, questionId: string, correct: boolean, today: ISODate): AppState {
  const prev: ReviewItem = state.review[questionId] ?? { box: 0, due: today, seen: 0, correct: 0 };
  const box = correct ? Math.min(prev.box + 1, BOX_INTERVALS.length - 1) : 0;
  const interval = correct ? BOX_INTERVALS[box] : 1;
  const item: ReviewItem = {
    box,
    due: addDays(today, interval),
    lastResult: correct,
    seen: prev.seen + 1,
    correct: prev.correct + (correct ? 1 : 0),
  };
  return { ...state, review: { ...state.review, [questionId]: item } };
}

export function dueReviewIds(state: AppState, today: ISODate): string[] {
  return Object.entries(state.review)
    .filter(([, item]) => item.due <= today)
    .sort((a, b) => a[1].box - b[1].box || a[1].due.localeCompare(b[1].due))
    .map(([id]) => id);
}

// ---------- Path / unlocking ----------

export type LessonStatus = 'mastered' | 'practiced' | 'available' | 'locked';

export function lessonStatus(state: AppState, lessonId: string): LessonStatus {
  const p = state.lessons[lessonId];
  if (p?.masteredAt) return 'mastered';
  if (p?.completedAt) return 'practiced';
  const idx = LESSONS.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return 'available';
  return isMastered(state, LESSONS[idx - 1].id) ? 'available' : 'locked';
}

export type LevelStatus = 'mastered' | 'in-progress' | 'available' | 'locked' | 'coming-soon';

export function levelStatus(state: AppState, levelId: number): LevelStatus {
  const lessons = lessonsOfLevel(levelId);
  if (lessons.length === 0) return 'coming-soon';
  if (lessons.every((l) => isMastered(state, l.id))) return 'mastered';
  if (lessons.some((l) => state.lessons[l.id]?.startedAt || state.lessons[l.id]?.completedAt)) return 'in-progress';
  return canAccessLevel(state, levelId) ? 'available' : 'locked';
}

/** A level is accessible when every lesson of previous levels is mastered (by lesson or placement test). */
export function canAccessLevel(state: AppState, levelId: number): boolean {
  return LESSONS.filter((l) => l.levelId < levelId).every((l) => isMastered(state, l.id));
}

/** Placement test is allowed only for the first non-mastered level that is accessible. */
export function canTakePlacement(state: AppState, levelId: number): boolean {
  const status = levelStatus(state, levelId);
  return (status === 'available' || status === 'in-progress') && canAccessLevel(state, levelId);
}

export function testOutLevel(state: AppState, levelId: number, now: ISODateTime): AppState {
  let next = state;
  for (const lesson of lessonsOfLevel(levelId)) {
    if (isMastered(next, lesson.id)) continue;
    next = patchLesson(
      next,
      lesson.id,
      { independentSolved: true, retrievalPassed: true, feynmanDone: true, testedOut: true, completedAt: now },
      now,
    );
  }
  return next;
}

/** First lesson in path order that is not mastered. */
export function currentLesson(state: AppState) {
  return LESSONS.find((l) => !isMastered(state, l.id));
}

export function pathSummary(state: AppState) {
  const mastered = LESSONS.filter((l) => isMastered(state, l.id)).length;
  const lesson = currentLesson(state);
  const level = lesson ? LEVELS.find((lv) => lv.id === lesson.levelId) : undefined;
  const levelLessons = lesson ? lessonsOfLevel(lesson.levelId) : [];
  return {
    mastered,
    total: LESSONS.length,
    lesson,
    level,
    indexInLevel: lesson ? levelLessons.findIndex((l) => l.id === lesson.id) + 1 : 0,
    lessonsInLevel: levelLessons.length,
  };
}

export function lessonTitle(id: string | undefined): string {
  return (id && getLesson(id)?.title) || '';
}
