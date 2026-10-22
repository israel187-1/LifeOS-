import { indentUnit } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';

const extensions = [python(), indentUnit.of('    ')];

export default function CodeEditor({ value, onChange, label }: { value: string; onChange: (v: string) => void; label: string }) {
  return (
    <div className="editor" data-testid="code-editor">
      <CodeMirror
        value={value}
        onChange={onChange}
        theme={oneDark}
        extensions={extensions}
        aria-label={label}
        minHeight="140px"
        basicSetup={{ tabSize: 4, foldGutter: false, autocompletion: false, highlightActiveLine: true }}
      />
    </div>
  );
}
