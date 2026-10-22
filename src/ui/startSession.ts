import { startSession } from '../domain/actions';
import { toISODate } from '../domain/dates';
import { createSession, nextAction } from '../domain/recommend';
import { buildLessonSession, buildMinimalSession, buildPlacementSession, buildReinforceSession, finishSession, type MinimalVariant } from '../domain/sessions';
import { lessonStatus } from '../domain/progress';
import { getLesson } from '../content';
import type { ActiveSession, AppState, Mode } from '../domain/types';

export type SessionRequest =
  | { kind: 'next'; mode: Mode; variant?: MinimalVariant }
  | { kind: 'lesson'; lessonId: string; mode: Mode }
  | { kind: 'placement'; levelId: number };

/** Returns the new state with an active session, closing any previous one as interrupted. */
export function beginSession(state: AppState, req: SessionRequest, now = new Date()): AppState {
  if (req.kind === 'next') {
    const action = nextAction(state, toISODate(now), req.mode);
    if (action.kind === 'continue') return state;
    const session =
      action.kind === 'minimal' && req.variant && req.variant !== 'auto'
        ? buildMinimalSession(state, now, req.variant)
        : createSession(state, action, req.mode, now);
    return session ? startSession(state, session) : state;
  }
  const base = state.activeSession ? finishSession(state, now, false) : state;
  let session: ActiveSession | null = null;
  if (req.kind === 'placement') session = buildPlacementSession(req.levelId, now);
  else {
    const lesson = getLesson(req.lessonId);
    if (!lesson) return state;
    session =
      lessonStatus(base, lesson.id) === 'practiced'
        ? buildReinforceSession(base, lesson, req.mode, now)
        : buildLessonSession(base, lesson, req.mode === 'minimal' ? 'normal' : req.mode, now);
  }
  return startSession(base, session);
}
