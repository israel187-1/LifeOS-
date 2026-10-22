import type { RunRequest, RunResult } from './harness';

export type RunnerStatus = 'idle' | 'loading' | 'ready' | 'error';

/** Executes Python in a Web Worker (browser sandbox). Never runs learner code on a server. */
export interface CodeRunner {
  run(code: string, runs: RunRequest[]): Promise<RunResult[]>;
  status: RunnerStatus;
  onStatus(fn: (s: RunnerStatus) => void): () => void;
  preload(): void;
}

export const RUN_TIMEOUT_MS = 6000;

type Pending = { resolve: (r: RunResult[]) => void; reject: (e: Error) => void };

export class PyodideRunner implements CodeRunner {
  status: RunnerStatus = 'idle';
  private worker: Worker | null = null;
  private ready: Promise<void> | null = null;
  private pending = new Map<number, Pending>();
  private seq = 0;
  private listeners = new Set<(s: RunnerStatus) => void>();
  private indexURL: string;

  constructor(indexURL?: string) {
    this.indexURL = indexURL ?? new URL(`${import.meta.env.BASE_URL}pyodide/`, location.href).href;
  }

  onStatus(fn: (s: RunnerStatus) => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private setStatus(s: RunnerStatus) {
    this.status = s;
    this.listeners.forEach((fn) => fn(s));
  }

  private spawn() {
    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent) => {
      const { id, ok, results, error } = e.data;
      const p = this.pending.get(id);
      if (!p) return;
      this.pending.delete(id);
      if (ok) p.resolve(results);
      else p.reject(new Error(error));
    };
    worker.onerror = (e) => {
      this.pending.forEach((p) => p.reject(new Error(e.message || 'Error en el entorno de Python')));
      this.pending.clear();
    };
    this.worker = worker;
  }

  private send(type: 'init' | 'run', payload: object = {}): Promise<RunResult[]> {
    const id = ++this.seq;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.worker!.postMessage({ id, type, indexURL: this.indexURL, ...payload });
    });
  }

  private ensureReady(): Promise<void> {
    if (!this.worker) this.spawn();
    if (!this.ready) {
      this.setStatus('loading');
      this.ready = this.send('init').then(
        () => this.setStatus('ready'),
        (err) => {
          this.ready = null;
          this.worker?.terminate();
          this.worker = null;
          this.setStatus('error');
          throw err;
        },
      );
    }
    return this.ready;
  }

  preload() {
    this.ensureReady().catch(() => {});
  }

  async run(code: string, runs: RunRequest[]): Promise<RunResult[]> {
    await this.ensureReady();
    const timeout = RUN_TIMEOUT_MS + runs.length * 500;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timed = new Promise<RunResult[]>((resolve) => {
      timer = setTimeout(() => {
        // Infinite loop or too slow: kill the worker and start a fresh one next time.
        this.worker?.terminate();
        this.pending.clear();
        this.worker = null;
        this.ready = null;
        this.setStatus('idle');
        resolve(
          runs.map(() => ({
            stdout: '',
            transcript: '',
            error: { type: 'Timeout', message: `Tu programa tardó más de ${Math.round(timeout / 1000)} s`, line: null },
          })),
        );
      }, timeout);
    });
    try {
      return await Promise.race([this.send('run', { code, runs }), timed]);
    } finally {
      clearTimeout(timer);
    }
  }
}

let shared: CodeRunner | null = null;
export function getRunner(): CodeRunner {
  shared ??= new PyodideRunner();
  return shared;
}
export function setRunner(r: CodeRunner) {
  shared = r;
}
