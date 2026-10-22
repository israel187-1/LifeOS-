import { useRef, useState } from 'react';
import { answer, INTENTS, type AssistantReply, type Intent } from '../domain/assistant';
import { formatShortDate, toISODate, uid } from '../domain/dates';
import { emptyState } from '../domain/progress';
import { upcomingObligations } from '../domain/recommend';
import type { Mode } from '../domain/types';
import { exportState, importState } from '../data/storage';
import { useStore } from '../state/store';
import { Card } from './common';

export const DEFAULT_SUBJECTS = ['Cálculo II', 'Física II', 'Probabilidad y Estadística', 'Fundamentos de Programación'];

export default function MoreView({ onStart }: { onStart: (mode: Mode) => void }) {
  return (
    <div className="page">
      <Assistant onStart={onStart} />
      <Obligations />
      <Ideas />
      <DataPanel />
    </div>
  );
}

function Assistant({ onStart }: { onStart: (mode: Mode) => void }) {
  const { state } = useStore();
  const [intent, setIntent] = useState<Intent | null>(null);
  const reply: AssistantReply | null = intent ? answer(intent, state, toISODate(new Date())) : null;
  return (
    <Card title="Asistente">
      <p className="muted small">Funciona con reglas locales basadas en tus datos. No hay ninguna IA conectada.</p>
      <div className="chips small wrap">
        {INTENTS.map((i) => (
          <button key={i.id} className={intent === i.id ? 'chip on' : 'chip'} onClick={() => setIntent(i.id)}>
            {i.label}
          </button>
        ))}
      </div>
      {reply && (
        <div className="reply" role="status">
          {reply.text.map((t) => (
            <p key={t}>{t}</p>
          ))}
          {reply.start && (
            <button className="btn primary" onClick={() => onStart(reply.start!.mode)}>
              {reply.start.label}
            </button>
          )}
          {reply.openIdeas && <p className="small">Escríbela abajo en «Lista de espera de ideas».</p>}
        </div>
      )}
    </Card>
  );
}

function Obligations() {
  const { state, update } = useStore();
  const today = toISODate(new Date());
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const upcoming = upcomingObligations(state, today);
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !dueDate) return;
    update((s) => ({ ...s, obligations: [...s.obligations, { id: uid(), title: title.trim(), subject: subject.trim(), dueDate, done: false }] }));
    setTitle('');
    setDueDate('');
  };
  return (
    <Card title="Próximas entregas y exámenes">
      <p className="muted small">Solo fechas reales que tú registras. Calificaciones y porcentajes llegan en la Fase 2.</p>
      <form className="form" onSubmit={add}>
        <input placeholder="Qué es (ej. Examen parcial 2)" value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Título" required />
        <input placeholder="Materia" list="subjects" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Materia" required />
        <datalist id="subjects">
          {DEFAULT_SUBJECTS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Fecha" required />
        <button className="btn" type="submit">Agregar</button>
      </form>
      <ul className="list">
        {upcoming.map((o) => (
          <li key={o.id}>
            <span>
              <strong>{o.title}</strong> · {o.subject} · {formatShortDate(o.dueDate)}
            </span>
            <span className="row tight">
              <button className="btn ghost small" onClick={() => update((s) => ({ ...s, obligations: s.obligations.map((x) => (x.id === o.id ? { ...x, done: true } : x)) }))}>
                Hecho
              </button>
              <button className="btn ghost small" aria-label={`Eliminar ${o.title}`} onClick={() => update((s) => ({ ...s, obligations: s.obligations.filter((x) => x.id !== o.id) }))}>
                ✕
              </button>
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function Ideas() {
  const { state, update } = useStore();
  const [text, setText] = useState('');
  const add = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    update((s) => ({ ...s, ideas: [...s.ideas, { id: uid(), text: text.trim(), createdAt: new Date().toISOString() }] }));
    setText('');
  };
  return (
    <Card title="Lista de espera de ideas">
      <p className="muted small">Las ideas nuevas se guardan aquí y no se convierten en proyectos activos. Se revisan cuando termines lo que tienes en curso.</p>
      <form className="form" onSubmit={add}>
        <input placeholder="Nueva idea de proyecto o negocio" value={text} onChange={(e) => setText(e.target.value)} aria-label="Nueva idea" />
        <button className="btn" type="submit">Guardar idea</button>
      </form>
      <ul className="list">
        {state.ideas.map((i) => (
          <li key={i.id}>
            <span>{i.text}</span>
            <button className="btn ghost small" aria-label="Eliminar idea" onClick={() => update((s) => ({ ...s, ideas: s.ideas.filter((x) => x.id !== i.id) }))}>
              ✕
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function DataPanel() {
  const { state, replace, saveError } = useStore();
  const file = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const download = () => {
    const blob = new Blob([exportState(state)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `lifeos-${toISODate(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const imported = importState(await f.text());
      if (confirm('Esto reemplazará tu progreso actual en este dispositivo por el del archivo. ¿Continuar?')) {
        replace(imported);
        setMsg('Datos importados.');
      }
    } catch (err) {
      setMsg(`No se pudo importar: ${err instanceof Error ? err.message : String(err)}`);
    }
    e.target.value = '';
  };
  return (
    <Card title="Tus datos">
      <p className="muted small">Todo se guarda solo en este navegador (IndexedDB). Nada se envía a ningún servidor. Exporta una copia de vez en cuando o para pasar tu progreso a otro dispositivo.</p>
      {saveError && <p className="feedback bad">Problema al guardar: {saveError}</p>}
      <div className="row">
        <button className="btn" onClick={download}>Exportar copia (JSON)</button>
        <button className="btn" onClick={() => file.current?.click()}>Importar copia</button>
        <input ref={file} type="file" accept="application/json,.json" hidden onChange={onFile} data-testid="import-input" />
        <button
          className="btn ghost danger"
          onClick={() => {
            if (confirm('¿Borrar todo el progreso de este dispositivo? Exporta una copia antes si la quieres conservar.')) replace(emptyState());
          }}
        >
          Borrar todo
        </button>
      </div>
      {msg && <p className="small">{msg}</p>}
    </Card>
  );
}
