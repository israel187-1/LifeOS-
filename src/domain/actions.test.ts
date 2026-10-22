import { describe, expect, it } from 'vitest';
import { getLesson } from '../content';
import { answerQuestion, canRevealSolution, completeRetrieval, recordAttempt, reviewExplanation, revealSolution, startSession, submitExplanation, takeHint } from './actions';
import { isMastered, emptyState, exerciseProgress, lessonStatus } from './progress';
import { buildLessonSession, finishSession } from './sessions';
import { nextAction } from './recommend';

const now = new Date(2026, 9, 22, 10);
const lesson = getLesson('l1-print')!;

function inLesson() {
  return startSession(emptyState(now), buildLessonSession(emptyState(now), lesson, 'normal', now));
}

describe('acciones de sesión', () => {
  it('no permite ver la solución antes de intentar y usar las pistas', () => {
    let s = inLesson();
    const id = lesson.independent.id;
    expect(canRevealSolution(s, id, lesson.independent.hints.length)).toBe(false);
    s = recordAttempt(s, lesson, 'independent', false, now);
    expect(canRevealSolution(s, id, lesson.independent.hints.length)).toBe(false);
    for (let i = 0; i < lesson.independent.hints.length; i++) s = takeHint(s, id);
    expect(canRevealSolution(s, id, lesson.independent.hints.length)).toBe(true);
  });

  it('resolver tras ver la solución no cuenta como dominio independiente', () => {
    let s = inLesson();
    s = recordAttempt(s, lesson, 'independent', false, now);
    s = revealSolution(s, lesson.independent.id);
    s = recordAttempt(s, lesson, 'independent', true, now);
    expect(exerciseProgress(s, lesson.independent.id).solved).toBe(true);
    expect(exerciseProgress(s, lesson.independent.id).solvedIndependently).toBe(false);
    expect(s.lessons[lesson.id].independentSolved).toBe(false);
  });

  it('leer la lección no la completa; dominio requiere ejercicio, recuperación y Feynman', () => {
    let s = inLesson();
    s = finishSession(s, now, true);
    expect(isMastered(s, lesson.id)).toBe(false);
    expect(lessonStatus(s, lesson.id)).toBe('practiced');
    expect(nextAction(s, '2026-10-22', 'normal').kind).toBe('reinforce');
  });

  it('flujo completo marca la lección como dominada', () => {
    let s = inLesson();
    s = recordAttempt(s, lesson, 'independent', true, now, 'print(1)');
    const qs = lesson.retrieval.map((q) => q.id);
    lesson.retrieval.forEach((q, i) => (s = answerQuestion(s, q.id, i === 0 ? (q.correctIndex + 1) % q.options.length : q.correctIndex, now)));
    s = completeRetrieval(s, lesson.id, qs, now);
    expect(s.lessons[lesson.id].retrievalPassed).toBe(true);
    s = submitExplanation(s, lesson.id, 'print muestra texto en la pantalla, el texto va entre comillas dentro de paréntesis y cada print hace una línea', false, now);
    expect(isMastered(s, lesson.id)).toBe(true);
    s = finishSession(s, now, true);
    expect(s.sessions.at(-1)?.lessonsMastered).toEqual([lesson.id]);
    expect(s.sessions.at(-1)?.questionsCorrect).toBe(2);
  });

  it('recuperación con menos de 2 aciertos no cuenta', () => {
    let s = inLesson();
    lesson.retrieval.forEach((q) => (s = answerQuestion(s, q.id, (q.correctIndex + 1) % q.options.length, now)));
    s = completeRetrieval(s, lesson.id, lesson.retrieval.map((q) => q.id), now);
    expect(s.lessons[lesson.id].retrievalPassed).toBe(false);
  });

  it('una pregunta solo se responde una vez por sesión', () => {
    let s = inLesson();
    const q = lesson.retrieval[0];
    s = answerQuestion(s, q.id, q.correctIndex, now);
    s = answerQuestion(s, q.id, q.correctIndex, now);
    expect(s.activeSession?.questionsAnswered).toBe(1);
  });

  it('la explicación Feynman exige palabras suficientes', () => {
    expect(reviewExplanation(lesson.id, 'print pantalla').passed).toBe(false);
    const r = reviewExplanation('l6-if-else', 'if revisa una condición; si es verdadera ejecuta el bloque con sangría, si no se ejecuta el else del caso contrario');
    expect(r.passed).toBe(true);
    expect(r.missing).toEqual([]);
  });
});
