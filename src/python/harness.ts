/** Python helper loaded once into Pyodide. Runs learner code in a fresh namespace with fake stdin. */
export const HARNESS = String.raw`
import sys, io, json, traceback

_MAX_OUTPUT = 20000
_MAX_STEPS = 300000

class _Tee:
    def __init__(self, out, transcript):
        self.out = out
        self.transcript = transcript
    def write(self, s):
        self.out.write(s)
        self.transcript.write(s)
        if self.out.tell() > _MAX_OUTPUT:
            raise RuntimeError('Tu programa imprimió demasiado texto (¿un bucle infinito?)')
        return len(s)
    def flush(self):
        pass

def _format_error(e):
    tb = traceback.extract_tb(e.__traceback__)
    user_frames = [f for f in tb if f.filename == '<tu código>']
    in_test = bool(tb) and tb[-1].filename == '<prueba>'
    line = None
    if isinstance(e, SyntaxError) and e.filename == '<tu código>':
        line = e.lineno
    elif user_frames:
        line = user_frames[-1].lineno
    msg = str(e) if not isinstance(e, SyntaxError) else (e.msg or str(e))
    return {'type': type(e).__name__, 'message': msg, 'line': line, 'inTest': in_test}

def _lifeos_run(code, stdin_lines, extra):
    out = io.StringIO()
    transcript = io.StringIO()
    lines = [str(x) for x in stdin_lines]
    def fake_input(prompt=''):
        transcript.write(str(prompt))
        if not lines:
            raise EOFError('input() pidió un dato, pero ya no quedaban datos de entrada')
        value = lines.pop(0)
        transcript.write(value + '\n')
        return value
    namespace = {'__name__': '__main__', 'input': fake_input}
    old_out, old_err = sys.stdout, sys.stderr
    sys.stdout = sys.stderr = _Tee(out, transcript)
    error = None
    steps = [0]
    def tracer(frame, event, arg):
        if event == 'line':
            steps[0] += 1
            if steps[0] > _MAX_STEPS:
                raise TimeoutError('Tu programa ejecutó demasiados pasos')
        return tracer
    sys.settrace(tracer)
    try:
        exec(compile(code, '<tu código>', 'exec'), namespace)
        if extra:
            exec(compile(extra, '<prueba>', 'exec'), namespace)
    except SystemExit:
        pass
    except BaseException as e:
        error = _format_error(e)
    finally:
        sys.settrace(None)
        sys.stdout, sys.stderr = old_out, old_err
    return {'stdout': out.getvalue(), 'transcript': transcript.getvalue(), 'error': error}

def _lifeos_json(code, stdin_lines, extra):
    return json.dumps(_lifeos_run(code, list(stdin_lines), extra))
`;

export interface PyError {
  type: string;
  message: string;
  line: number | null;
  inTest?: boolean;
}

export interface RunResult {
  stdout: string;
  transcript: string;
  error: PyError | null;
}

export interface RunRequest {
  stdin?: string[];
  assert?: string;
}
