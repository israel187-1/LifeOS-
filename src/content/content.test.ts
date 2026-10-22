// @vitest-environment node
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { beforeAll, describe, expect, it } from 'vitest';
import { HARNESS, type RunResult } from '../python/harness';
import { grade } from '../python/grading';
import { allExercises, LESSONS, LEVELS } from './index';
import type { PythonExercise } from '../domain/types';

let py: PyodideInterface;

function run(code: string, ex: PythonExercise): RunResult[] {
  return ex.tests.map((t) => {
    py.globals.set('_code', code);
    py.globals.set('_stdin', py.toPy(t.stdin ?? []));
    py.globals.set('_extra', t.assert ?? null);
    return JSON.parse(py.runPython('_lifeos_json(_code, _stdin, _extra)'));
  });
}

beforeAll(async () => {
  py = await loadPyodide();
  py.runPython(HARNESS);
}, 120000);

describe('contenido de la ruta', () => {
  it('tiene 16 niveles y lecciones en orden de nivel', () => {
    expect(LEVELS).toHaveLength(16);
    const levels = LESSONS.map((l) => l.levelId);
    expect([...levels].sort((a, b) => a - b)).toEqual(levels);
  });

  it('ids únicos de lecciones, ejercicios y preguntas', () => {
    const ids = [
      ...LESSONS.map((l) => l.id),
      ...allExercises().map((e) => e.exercise.id),
      ...LESSONS.flatMap((l) => l.retrieval.map((q) => q.id)),
    ];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(LESSONS.map((l) => [l.id, l] as const))('%s tiene todos los componentes pedagógicos', (_id, l) => {
    expect(l.concept.length).toBeGreaterThan(0);
    expect(l.example.steps.length).toBeGreaterThan(0);
    expect(l.retrieval).toHaveLength(3);
    expect(l.commonErrors.length).toBeGreaterThanOrEqual(3);
    expect(l.feynman.keyIdeas.length).toBeGreaterThan(0);
    for (const q of l.retrieval) expect(q.correctIndex).toBeLessThan(q.options.length);
    for (const { exercise } of allExercises().filter((e) => e.lesson.id === l.id)) {
      expect(exercise.hints.length).toBeGreaterThanOrEqual(2);
      if (exercise.kind === 'choice') expect(exercise.correctIndex).toBeLessThan(exercise.options.length);
    }
  });

  const pyExercises = allExercises().filter((e) => e.exercise.kind === 'python');
  it.each(pyExercises.map((e) => [e.exercise.id, e.exercise as PythonExercise] as const))(
    '%s: la solución pasa y el código inicial no',
    (_id, ex) => {
      const ok = grade(ex.tests, run(ex.solution, ex));
      expect(ok.outcomes.filter((o) => !o.passed)).toEqual([]);
      const starter = grade(ex.tests, run(ex.starterCode, ex));
      expect(starter.passed).toBe(false);
    },
  );
});
