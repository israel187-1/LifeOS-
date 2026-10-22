import type { Exercise, ExerciseRole, Lesson, Level, Question } from '../domain/types';
import { LEVELS } from './levels';
import { level1 } from './lessons/level1';
import { level2 } from './lessons/level2';
import { level3 } from './lessons/level3';
import { level4 } from './lessons/level4';
import { level5 } from './lessons/level5';
import { level6 } from './lessons/level6';
import { level7 } from './lessons/level7';

export { LEVELS };

/** All lessons in path order. */
export const LESSONS: Lesson[] = [...level1, ...level2, ...level3, ...level4, ...level5, ...level6, ...level7];

const lessonById = new Map(LESSONS.map((l) => [l.id, l]));
const questionIndex = new Map<string, { question: Question; lesson: Lesson }>();
for (const lesson of LESSONS) {
  for (const q of lesson.retrieval) questionIndex.set(q.id, { question: q, lesson });
}

export function getLesson(id: string): Lesson | undefined {
  return lessonById.get(id);
}

export function getLevel(id: number): Level | undefined {
  return LEVELS.find((l) => l.id === id);
}

export function lessonsOfLevel(levelId: number): Lesson[] {
  return LESSONS.filter((l) => l.levelId === levelId);
}

export function getQuestion(id: string): Question | undefined {
  return questionIndex.get(id)?.question;
}

export function lessonOfQuestion(id: string): Lesson | undefined {
  return questionIndex.get(id)?.lesson;
}

export function getExercise(lesson: Lesson, role: ExerciseRole): Exercise {
  return lesson[role];
}

export function allExercises(): { lesson: Lesson; role: ExerciseRole; exercise: Exercise }[] {
  const roles: ExerciseRole[] = ['guided', 'bugfix', 'independent', 'challenge'];
  return LESSONS.flatMap((lesson) => roles.map((role) => ({ lesson, role, exercise: lesson[role] })));
}
