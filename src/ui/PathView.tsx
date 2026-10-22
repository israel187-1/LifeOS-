import { useState } from 'react';
import { LEVELS, lessonsOfLevel } from '../content';
import { canTakePlacement, lessonStatus, levelStatus, type LessonStatus, type LevelStatus } from '../domain/progress';
import type { Mode } from '../domain/types';
import { useStore } from '../state/store';
import type { SessionRequest } from './startSession';

const LEVEL_BADGE: Record<LevelStatus, string> = {
  mastered: 'Dominado',
  'in-progress': 'En curso',
  available: 'Disponible',
  locked: 'Bloqueado',
  'coming-soon': 'Próximamente',
};

const LESSON_BADGE: Record<LessonStatus, string> = {
  mastered: 'Dominada',
  practiced: 'En práctica',
  available: 'Disponible',
  locked: 'Bloqueada',
};

export default function PathView({ onStart }: { onStart: (r: SessionRequest) => void }) {
  const { state } = useStore();
  const mode: Mode = state.settings.mode;
  const firstOpen = LEVELS.find((l) => ['in-progress', 'available'].includes(levelStatus(state, l.id)))?.id;
  const [open, setOpen] = useState<number | undefined>(firstOpen);
  return (
    <div className="page">
      <h1>Ruta de programación</h1>
      <p className="muted">
        16 niveles en orden. Un nivel se abre cuando dominas el anterior. Si ya sabes un tema, haz la prueba de nivel en vez de repetirlo.
      </p>
      <ol className="levels">
        {LEVELS.map((level) => {
          const status = levelStatus(state, level.id);
          const lessons = lessonsOfLevel(level.id);
          const expanded = open === level.id && lessons.length > 0;
          return (
            <li key={level.id} className={`level ${status}`}>
              <button className="level-head" onClick={() => setOpen(expanded ? undefined : level.id)} aria-expanded={expanded} disabled={lessons.length === 0}>
                <span className="num">{level.id}</span>
                <span className="grow">
                  <strong>{level.title}</strong>
                  <span className="muted small block">{level.description}</span>
                </span>
                <span className={`badge ${status}`}>{LEVEL_BADGE[status]}</span>
              </button>
              {expanded && (
                <div className="level-body">
                  <ul className="lessons">
                    {lessons.map((l) => {
                      const ls = lessonStatus(state, l.id);
                      return (
                        <li key={l.id}>
                          <span className="grow">
                            {l.title} <span className={`badge ${ls}`}>{LESSON_BADGE[ls]}</span>
                          </span>
                          <button className="btn small" disabled={ls === 'locked'} onClick={() => onStart({ kind: 'lesson', lessonId: l.id, mode })}>
                            {ls === 'mastered' ? 'Repasar' : ls === 'practiced' ? 'Reforzar' : 'Estudiar'}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                  {canTakePlacement(state, level.id) && (
                    <div className="placement">
                      <p className="small">
                        ¿Ya dominas este nivel? La prueba incluye todas sus preguntas y un ejercicio independiente por lección. Con 80% de aciertos y
                        todos los ejercicios resueltos, se marca como dominado.
                      </p>
                      <button className="btn ghost" onClick={() => onStart({ kind: 'placement', levelId: level.id })}>
                        Hacer prueba de nivel {level.id}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
