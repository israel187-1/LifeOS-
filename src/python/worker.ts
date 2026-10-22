/// <reference lib="webworker" />
import type { PyodideInterface } from 'pyodide';
import { HARNESS, type RunRequest, type RunResult } from './harness';

let pyodide: Promise<PyodideInterface> | null = null;

function load(indexURL: string): Promise<PyodideInterface> {
  pyodide ??= (async () => {
    const mod = await import(/* @vite-ignore */ `${indexURL}pyodide.mjs`);
    const py: PyodideInterface = await mod.loadPyodide({ indexURL });
    py.runPython(HARNESS);
    return py;
  })();
  return pyodide;
}

function runOne(py: PyodideInterface, code: string, req: RunRequest): RunResult {
  py.globals.set('_code', code);
  py.globals.set('_stdin', py.toPy(req.stdin ?? []));
  py.globals.set('_extra', req.assert ?? null);
  return JSON.parse(py.runPython('_lifeos_json(_code, _stdin, _extra)'));
}

self.onmessage = async (e: MessageEvent) => {
  const { id, type, indexURL, code, runs } = e.data as {
    id: number;
    type: 'init' | 'run';
    indexURL: string;
    code?: string;
    runs?: RunRequest[];
  };
  try {
    const py = await load(indexURL);
    const results = type === 'run' ? (runs ?? []).map((r) => runOne(py, code ?? '', r)) : [];
    self.postMessage({ id, ok: true, results });
  } catch (err) {
    pyodide = null;
    self.postMessage({ id, ok: false, error: String(err) });
  }
};
