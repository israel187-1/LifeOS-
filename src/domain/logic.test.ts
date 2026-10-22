import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { exportState, importState, IndexedDbRepository, normalizeState } from '../data/storage';
import { answer } from './assistant';
import { addDays, toISODate } from './dates';
import { emptyState, testOutLevel, canAccessLevel, lessonStatus } from './progress';
import { nextAction, createSession } from './recommend';
import { beginSession } from '../ui/startSession';
import { finishSession } from './sessions';
import { tick } from './actions';
import { weeklyStats } from './stats';
import type { AppState, SessionLog } from './types';

const now = new Date(2026, 9, 22, 10);
const today = toISODate(now);

function withSession(state: AppState, date: string, seconds = 300): AppState {
  const log: SessionLog = {
    id: date, kind: 'lesson', mode: 'normal', title: 't', startedAt: `${date}T10:00:00.000Z`, endedAt: `${date}T10:20:00.000Z`,
    date, activeSeconds: seconds, exercisesAttempted: 1, exercisesSolved: 1, questionsAnswered: 0, questionsCorrect: 0,
    lessonsMastered: [], completed: true, summary: 's',
  };
  return { ...state, sessions: [...state.sessions, log] };
}

describe('recomendación', () => {
  it('sin datos propone la primera lección', () => {
    const a = nextAction(emptyState(now), today, 'normal');
    expect(a.kind).toBe('lesson');
    expect(a.lessonId).toBe('l1-print');
  });

  it('tras 3 días sin práctica propone sesión de regreso sin culpa y sin borrar progreso', () => {
    const s = withSession(emptyState(now), addDays(today, -4));
    const a = nextAction(s, today, 'normal');
    expect(a.kind).toBe('recovery');
    expect(a.why).toContain('intacto');
    const session = createSession(s, a, 'normal', now)!;
    expect(session.steps[0].type).toBe('welcome-back');
    expect(session.steps.length).toBeLessThanOrEqual(4);
  });

  it('con 2 días de pausa sigue la ruta normal', () => {
    expect(nextAction(withSession(emptyState(now), addDays(today, -2)), today, 'normal').kind).toBe('lesson');
  });

  it('modo mínimo crea una sesión de una sola actividad', () => {
    const s = beginSession(emptyState(now), { kind: 'next', mode: 'minimal' }, now);
    expect(s.activeSession?.kind).toBe('minimal');
    expect(s.activeSession?.steps.filter((st) => st.type === 'exercise' || st.type === 'retrieval')).toHaveLength(1);
  });

  it('una sesión activa se retoma en lugar de crear otra', () => {
    const s = beginSession(emptyState(now), { kind: 'next', mode: 'normal' }, now);
    expect(nextAction(s, today, 'normal').kind).toBe('continue');
    expect(beginSession(s, { kind: 'next', mode: 'normal' }, now)).toBe(s);
  });

  it('prueba de nivel aprobada desbloquea el siguiente nivel sin repetir lecciones', () => {
    let s = emptyState(now);
    expect(canAccessLevel(s, 2)).toBe(false);
    s = testOutLevel(s, 1, now.toISOString());
    expect(canAccessLevel(s, 2)).toBe(true);
    expect(lessonStatus(s, 'l2-descomponer')).toBe('available');
  });
});

describe('constancia', () => {
  it('cuenta días de práctica y minutos de la semana', () => {
    let s = withSession(emptyState(now), today, 600);
    s = withSession(s, today, 300);
    s = withSession(s, addDays(today, -1), 30); // menos de 1 min y completada: cuenta como práctica
    const w = weeklyStats(s, today);
    expect(w.daysPracticed).toBe(2);
    expect(w.minutes).toBe(16);
    expect(w.days).toHaveLength(7);
  });

  it('el tiempo efectivo se acumula y se registra al terminar', () => {
    let s = beginSession(emptyState(now), { kind: 'next', mode: 'normal' }, now);
    for (let i = 0; i < 90; i++) s = tick(s, 1, now);
    s = finishSession(s, now, false);
    expect(s.activeSession).toBeNull();
    expect(s.sessions[0].activeSeconds).toBe(90);
    expect(s.sessions[0].completed).toBe(false);
  });
});

describe('persistencia', () => {
  it('IndexedDB guarda y recupera el estado completo, incluida la sesión activa', async () => {
    const repo = new IndexedDbRepository();
    const s = beginSession(emptyState(now), { kind: 'next', mode: 'normal' }, now);
    await repo.save(s);
    const loaded = await new IndexedDbRepository().load();
    expect(loaded?.activeSession?.id).toBe(s.activeSession?.id);
  });

  it('exportar e importar conserva los datos y rechaza archivos ajenos', () => {
    const s = withSession(emptyState(now), today);
    expect(importState(exportState(s, now))).toEqual(s);
    expect(() => importState('{"app":"otra"}')).toThrow();
  });

  it('normaliza estados incompletos sin perder datos', () => {
    const n = normalizeState({ version: 1, createdAt: now.toISOString(), sessions: [] });
    expect(n.lessons).toEqual({});
    expect(n.settings.mode).toBe('normal');
  });
});

describe('asistente local', () => {
  it('no inventa evaluaciones cuando no hay registradas', () => {
    const r = answer('exams', emptyState(now), today);
    expect(r.text.join(' ')).toContain('No tienes evaluaciones registradas');
  });

  it('prioriza la universidad si hay una entrega próxima', () => {
    const s: AppState = { ...emptyState(now), obligations: [{ id: 'o', title: 'Parcial', subject: 'Cálculo II', dueDate: addDays(today, 1), done: false }] };
    expect(answer('one-hour', s, today).text[0]).toContain('universidad va primero');
  });

  it('las ideas nuevas van a la lista de espera', () => {
    expect(answer('new-idea', emptyState(now), today).openIdeas).toBe(true);
  });
});

describe('respaldo síncrono', () => {
  it('carga la copia más reciente entre IndexedDB y el espejo de localStorage', async () => {
    const { MirroredRepository, LocalStorageRepository } = await import('../data/storage');
    const primary = new IndexedDbRepository('lifeos-mirror-test');
    const mirror = new LocalStorageRepository('mirror-test');
    const old = { ...emptyState(now), savedAt: '2026-10-22T10:00:00.000Z' };
    const fresh = { ...withSession(emptyState(now), today), savedAt: '2026-10-22T10:00:05.000Z' };
    await primary.save(old);
    await mirror.save(fresh);
    const loaded = await new MirroredRepository(primary, mirror).load();
    expect(loaded?.sessions).toHaveLength(1);
  });
});
