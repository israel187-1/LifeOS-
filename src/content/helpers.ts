import type { ChoiceExercise, OrderExercise, PythonExercise, Question } from '../domain/types';

export const MASTERY =
  'Resuelves el ejercicio independiente sin ver la solución, aciertas al menos 2 de 3 preguntas de recuperación y explicas el concepto con tus palabras.';

/** Trims the leading newline of template literals so code can start on its own line. */
export const code = (s: string) => s.replace(/^\n/, '').replace(/\n$/, '');

export const py = (e: Omit<PythonExercise, 'kind'>): PythonExercise => ({ kind: 'python', ...e });
export const choice = (e: Omit<ChoiceExercise, 'kind'>): ChoiceExercise => ({ kind: 'choice', ...e });
export const order = (e: Omit<OrderExercise, 'kind'>): OrderExercise => ({ kind: 'order', ...e });
export const q = (
  id: string,
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
  codeSnippet?: string,
): Question => ({ id, prompt, options, correctIndex, explanation, code: codeSnippet });
