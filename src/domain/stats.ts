import { addDays, daysBetween, startOfMonth, startOfWeek } from './dates';
import type { AppState, ISODate, SessionLog } from './types';

/** A day counts as practice when a session was completed or had at least one minute of active work. */
export function isPracticeSession(s: SessionLog): boolean {
  return s.completed || s.activeSeconds >= 60;
}

export function practiceDays(state: AppState): ISODate[] {
  return [...new Set(state.sessions.filter(isPracticeSession).map((s) => s.date))].sort();
}

export interface PeriodStats {
  daysPracticed: number;
  daysElapsed: number;
  minutes: number;
  exercisesAttempted: number;
  exercisesSolved: number;
  lessonsMastered: number;
  sessions: number;
}

function periodStats(state: AppState, from: ISODate, today: ISODate): PeriodStats {
  const inRange = state.sessions.filter((s) => s.date >= from && s.date <= today);
  const days = new Set(inRange.filter(isPracticeSession).map((s) => s.date));
  return {
    daysPracticed: days.size,
    daysElapsed: daysBetween(from, today) + 1,
    minutes: Math.round(inRange.reduce((acc, s) => acc + s.activeSeconds, 0) / 60),
    exercisesAttempted: inRange.reduce((acc, s) => acc + s.exercisesAttempted, 0),
    exercisesSolved: inRange.reduce((acc, s) => acc + s.exercisesSolved, 0),
    lessonsMastered: inRange.reduce((acc, s) => acc + s.lessonsMastered.length, 0),
    sessions: inRange.length,
  };
}

export function weeklyStats(state: AppState, today: ISODate) {
  const monday = startOfWeek(today);
  const practiced = new Set(practiceDays(state));
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return { date, practiced: practiced.has(date), future: date > today };
  });
  return { ...periodStats(state, monday, today), days };
}

export function monthlyStats(state: AppState, today: ISODate): PeriodStats {
  return periodStats(state, startOfMonth(today), today);
}

export function lastPracticeDay(state: AppState): ISODate | undefined {
  const days = practiceDays(state);
  return days[days.length - 1];
}

export function daysSinceLastPractice(state: AppState, today: ISODate): number | undefined {
  const last = lastPracticeDay(state);
  return last ? daysBetween(last, today) : undefined;
}

/** Average number of days between consecutive practice days. */
export function averageGapDays(state: AppState): number | undefined {
  const days = practiceDays(state);
  if (days.length < 2) return undefined;
  let total = 0;
  for (let i = 1; i < days.length; i++) total += daysBetween(days[i - 1], days[i]);
  return Math.round((total / (days.length - 1)) * 10) / 10;
}

/** Days without practice since the first session (excluding today if not practiced yet). */
export function daysWithoutPractice(state: AppState, today: ISODate): number {
  const days = practiceDays(state);
  if (days.length === 0) return 0;
  const span = daysBetween(days[0], today) + 1;
  const todayPracticed = days.includes(today);
  return span - days.length - (todayPracticed ? 0 : 1);
}

export function totals(state: AppState) {
  const ex = Object.values(state.exercises);
  return {
    exercisesAttempted: ex.filter((e) => e.attempts > 0).length,
    exercisesSolved: ex.filter((e) => e.solved).length,
    exercisesSolvedIndependently: ex.filter((e) => e.solvedIndependently).length,
    lessonsMastered: Object.values(state.lessons).filter((l) => l.masteredAt).length,
    minutes: Math.round(state.sessions.reduce((a, s) => a + s.activeSeconds, 0) / 60),
    projectsFinished: 0,
  };
}

export function lastSession(state: AppState): SessionLog | undefined {
  return state.sessions[state.sessions.length - 1];
}
