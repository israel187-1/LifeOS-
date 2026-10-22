export type ISODate = string; // YYYY-MM-DD (local)
export type ISODateTime = string;

export type Mode = 'minimal' | 'normal' | 'deep';
export const MODE_MINUTES: Record<Mode, number> = { minimal: 5, normal: 25, deep: 50 };

// ---------- Content ----------

export interface StdoutTest {
  name: string;
  stdin?: string[];
  expectedStdout?: string;
  /** Python code executed after the user's code in the same namespace (e.g. `assert f(2) == 4`). */
  assert?: string;
}

interface ExerciseBase {
  id: string;
  title: string;
  prompt: string;
  hints: string[];
  explanation: string;
}

export interface PythonExercise extends ExerciseBase {
  kind: 'python';
  starterCode: string;
  solution: string;
  tests: StdoutTest[];
  /** Whether the program reads with input(); shows an stdin box when running. */
  usesInput?: boolean;
  sampleInput?: string[];
}

export interface ChoiceExercise extends ExerciseBase {
  kind: 'choice';
  code?: string;
  options: { text: string; feedback: string }[];
  correctIndex: number;
}

export interface OrderExercise extends ExerciseBase {
  kind: 'order';
  /** Steps in the correct order; the UI shuffles them. */
  steps: string[];
}

export type Exercise = PythonExercise | ChoiceExercise | OrderExercise;

export interface Question {
  id: string;
  prompt: string;
  code?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface ExampleStep {
  /** 1-based line numbers of the python example highlighted for this step. */
  lines?: number[];
  text: string;
}

export interface Lesson {
  id: string;
  levelId: number;
  title: string;
  objective: string;
  learn: string[];
  concept: string[];
  example: {
    title: string;
    pseint?: string;
    python: string;
    steps: ExampleStep[];
  };
  guided: Exercise;
  bugfix: PythonExercise;
  independent: Exercise;
  retrieval: Question[];
  commonErrors: { error: string; why: string; fix: string }[];
  challenge: Exercise;
  feynman: { prompt: string; keyIdeas: { label: string; keywords: string[] }[] };
  mastery: string;
}

export interface Level {
  id: number;
  title: string;
  description: string;
  topics: string[];
}

// ---------- Progress state ----------

export interface ExerciseProgress {
  attempts: number;
  solved: boolean;
  /** Solved without revealing the solution. */
  solvedIndependently: boolean;
  hintsUsed: number;
  solutionRevealed: boolean;
  lastCode?: string;
}

export interface LessonProgress {
  startedAt?: ISODateTime;
  completedAt?: ISODateTime;
  masteredAt?: ISODateTime;
  independentSolved: boolean;
  retrievalPassed: boolean;
  feynmanDone: boolean;
  challengeSolved: boolean;
  feynmanText?: string;
  /** Mastered through a placement test instead of the lesson. */
  testedOut?: boolean;
}

export interface ReviewItem {
  box: number;
  due: ISODate;
  lastResult?: boolean;
  seen: number;
  correct: number;
}

export type StepType =
  | 'objective'
  | 'concept'
  | 'example'
  | 'exercise'
  | 'errors'
  | 'retrieval'
  | 'feynman'
  | 'welcome-back'
  | 'summary';

export type ExerciseRole = 'guided' | 'bugfix' | 'independent' | 'challenge';

export interface SessionStep {
  type: StepType;
  lessonId?: string;
  role?: ExerciseRole;
  questionIds?: string[];
  optional?: boolean;
}

export type SessionKind = 'lesson' | 'reinforce' | 'recovery' | 'minimal' | 'placement';

export interface ActiveSession {
  id: string;
  kind: SessionKind;
  mode: Mode;
  title: string;
  lessonId?: string;
  levelId?: number;
  steps: SessionStep[];
  stepIndex: number;
  startedAt: ISODateTime;
  lastActiveAt: ISODateTime;
  activeSeconds: number;
  exercisesAttempted: string[];
  exercisesSolved: string[];
  questionsAnswered: number;
  questionsCorrect: number;
  /** Per-question answers for retrieval steps in this session. */
  answers: Record<string, number>;
  drafts: Record<string, string>;
}

export interface SessionLog {
  id: string;
  kind: SessionKind;
  mode: Mode;
  title: string;
  lessonId?: string;
  startedAt: ISODateTime;
  endedAt: ISODateTime;
  date: ISODate;
  activeSeconds: number;
  exercisesAttempted: number;
  exercisesSolved: number;
  questionsAnswered: number;
  questionsCorrect: number;
  lessonsMastered: string[];
  completed: boolean;
  summary: string;
}

export interface Obligation {
  id: string;
  title: string;
  subject: string;
  dueDate: ISODate;
  done: boolean;
}

export interface Idea {
  id: string;
  text: string;
  createdAt: ISODateTime;
}

export interface AppState {
  version: 1;
  createdAt: ISODateTime;
  lessons: Record<string, LessonProgress>;
  exercises: Record<string, ExerciseProgress>;
  review: Record<string, ReviewItem>;
  sessions: SessionLog[];
  activeSession: ActiveSession | null;
  obligations: Obligation[];
  ideas: Idea[];
  englishDays: ISODate[];
  settings: { mode: Mode };
  /** Set on every save; used to pick the freshest copy between IndexedDB and the localStorage mirror. */
  savedAt?: ISODateTime;
}
