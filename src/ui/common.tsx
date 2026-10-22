import type { ReactNode } from 'react';
import type { ExerciseRole, Mode } from '../domain/types';
import type { MasteryPart } from '../domain/progress';

export const MODE_LABEL: Record<Mode, { label: string; detail: string }> = {
  minimal: { label: '5 min', detail: 'Modo mínimo' },
  normal: { label: '25 min', detail: 'Sesión normal' },
  deep: { label: '50 min', detail: 'Sesión profunda' },
};

export const ROLE_LABEL: Record<ExerciseRole, string> = {
  guided: 'Ejercicio guiado',
  bugfix: 'Corrige el error',
  independent: 'Ejercicio independiente',
  challenge: 'Mini-reto',
};

export const MASTERY_PART_LABEL: Record<MasteryPart, string> = {
  independent: 'resolver el ejercicio independiente sin ver la solución',
  retrieval: 'acertar 2 de 3 preguntas de recuperación',
  feynman: 'explicar el concepto con tus palabras',
};

export function CodeBlock({ code, highlight = [], numbered = true }: { code: string; highlight?: number[]; numbered?: boolean }) {
  return (
    <pre className="code">
      {code.split('\n').map((line, i) => (
        <div key={i} className={highlight.includes(i + 1) ? 'line hl' : 'line'}>
          {numbered && <span className="ln">{i + 1}</span>}
          <span>{line || ' '}</span>
        </div>
      ))}
    </pre>
  );
}

export function Card({ title, children, className = '' }: { title?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      {children}
    </section>
  );
}

export function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function minutesLabel(seconds: number): string {
  const m = Math.round(seconds / 60);
  return m < 1 ? 'menos de 1 min' : `${m} min`;
}
