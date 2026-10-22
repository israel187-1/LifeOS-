import type { StdoutTest } from '../domain/types';
import { explainError, type ErrorExplanation } from './errors';
import type { RunResult } from './harness';

export function normalizeOutput(s: string): string {
  return s
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.replace(/\s+$/, ''))
    .join('\n')
    .trim();
}

export interface TestOutcome {
  name: string;
  passed: boolean;
  stdin?: string[];
  expected?: string;
  got: string;
  error?: ErrorExplanation;
}

export interface Grade {
  passed: boolean;
  passedCount: number;
  total: number;
  outcomes: TestOutcome[];
}

export function grade(tests: StdoutTest[], results: RunResult[]): Grade {
  const outcomes = tests.map((t, i): TestOutcome => {
    const r = results[i];
    const got = normalizeOutput(r?.stdout ?? '');
    const expected = t.expectedStdout === undefined ? undefined : normalizeOutput(t.expectedStdout);
    const error = r?.error ? explainError(r.error) : undefined;
    const passed = Boolean(r) && !r.error && (expected === undefined || got === expected);
    return { name: t.name, passed, stdin: t.stdin, expected, got, error };
  });
  const passedCount = outcomes.filter((o) => o.passed).length;
  return { passed: passedCount === tests.length, passedCount, total: tests.length, outcomes };
}
