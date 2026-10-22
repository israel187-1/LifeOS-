import { useState } from 'react';
import { toISODate, formatShortDate, relativeDay, daysBetween } from '../domain/dates';
import { pathSummary } from '../domain/progress';
import { nextAction, upcomingObligations, urgentObligation } from '../domain/recommend';
import { MINIMAL_VARIANTS, type MinimalVariant } from '../domain/sessions';
import { lastSession, weeklyStats } from '../domain/stats';
import type { Mode } from '../domain/types';
import { useStore } from '../state/store';
import { Card, MODE_LABEL, minutesLabel } from './common';
import type { SessionRequest } from './startSession';

const DAY_LETTERS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

export default function Home({ onStart, onNavigate }: { onStart: (r: SessionRequest) => void; onNavigate: (v: 'more' | 'path') => void }) {
  const { state, update } = useStore();
  const today = toISODate(new Date());
  const mode = state.settings.mode;
  const [variant, setVariant] = useState<MinimalVariant>('auto');
  const action = nextAction(state, today, mode);
  const week = weeklyStats(state, today);
  const path = pathSummary(state);
  const urgent = urgentObligation(state, today);
  const nextObligation = upcomingObligations(state, today)[0];
  const last = lastSession(state);
  const englishToday = state.englishDays.includes(today);
  const continuing = action.kind === 'continue';

  const setMode = (m: Mode) => update((s) => ({ ...s, settings: { ...s.settings, mode: m } }));

  return (
    <div className="home">
      {urgent && (
        <div className="banner warn" role="status">
          <strong>Primero la universidad:</strong> «{urgent.title}» ({urgent.subject}) es {relativeDay(urgent.dueDate, today)}. Si solo
          tienes energía para una cosa, que sea esa. Después, 5 minutos de programación bastan para no perder el hilo.
        </div>
      )}

      <Card className="hero">
        <p className="eyebrow">Tu siguiente acción</p>
        <h2 className="hero-title" data-testid="next-action-title">{action.title}</h2>
        <p className="muted">{action.why}</p>
        <p className="first-step">
          <span>Primer paso:</span> {action.firstStep}
        </p>

        {!continuing && (
          <div className="mode-picker" role="radiogroup" aria-label="Tiempo disponible">
            <span className="label">Tiempo disponible</span>
            <div className="chips">
              {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
                <button key={m} role="radio" aria-checked={mode === m} className={mode === m ? 'chip on' : 'chip'} onClick={() => setMode(m)}>
                  {MODE_LABEL[m].label}
                  <small>{MODE_LABEL[m].detail}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        {!continuing && mode === 'minimal' && action.kind === 'minimal' && (
          <div className="variants">
            <span className="label">¿Qué te apetece? (opcional)</span>
            <div className="chips small">
              <button className={variant === 'auto' ? 'chip on' : 'chip'} onClick={() => setVariant('auto')}>
                Elige por mí
              </button>
              {MINIMAL_VARIANTS.map((v) => (
                <button key={v.id} className={variant === v.id ? 'chip on' : 'chip'} onClick={() => setVariant(v.id)}>
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <button className="btn primary big" onClick={() => onStart({ kind: 'next', mode, variant })} data-testid="start-button">
          {continuing ? 'Continuar donde lo dejé' : 'Empezar a programar'}
        </button>
        {!continuing && mode !== 'minimal' && (
          <button className="btn link" onClick={() => { setMode('minimal'); onStart({ kind: 'next', mode: 'minimal' }); }}>
            Solo tengo 5 minutos
          </button>
        )}
      </Card>

      <div className="grid">
        <Card title="Esta semana">
          <div className="week" aria-label="Días con práctica esta semana">
            {week.days.map((d, i) => (
              <span key={d.date} className={`day ${d.practiced ? 'done' : ''} ${d.future ? 'future' : ''} ${d.date === today ? 'today' : ''}`} title={d.date}>
                {DAY_LETTERS[i]}
              </span>
            ))}
          </div>
          <p className="stat-line" data-testid="week-summary">
            <strong>{week.daysPracticed}</strong> días con práctica · <strong>{week.minutes}</strong> min · <strong>{week.exercisesSolved}</strong> ejercicios resueltos
          </p>
          <p className="muted small">La meta es la constancia de la semana, no una racha perfecta.</p>
        </Card>

        <Card title="Ruta de programación">
          {path.lesson && path.level ? (
            <>
              <p>
                Nivel {path.level.id}: {path.level.title}
              </p>
              <p className="muted small">
                Lección {path.indexInLevel} de {path.lessonsInLevel}: {path.lesson.title}
              </p>
            </>
          ) : (
            <p>Dominaste todas las lecciones disponibles.</p>
          )}
          <div className="bar" aria-label="Lecciones dominadas">
            <span style={{ width: `${(path.mastered / path.total) * 100}%` }} />
          </div>
          <p className="muted small">
            {path.mastered} de {path.total} lecciones dominadas ·{' '}
            <button className="btn link inline" onClick={() => onNavigate('path')}>
              Ver ruta
            </button>
          </p>
        </Card>

        <Card title="Próxima obligación académica">
          {nextObligation ? (
            <p>
              <strong>{nextObligation.title}</strong> · {nextObligation.subject}
              <br />
              <span className="muted small">
                {formatShortDate(nextObligation.dueDate)} ({daysBetween(today, nextObligation.dueDate) === 0 ? 'hoy' : `en ${daysBetween(today, nextObligation.dueDate)} días`})
              </span>
            </p>
          ) : (
            <p className="muted small">Sin entregas registradas.</p>
          )}
          <button className="btn link inline" onClick={() => onNavigate('more')}>
            {nextObligation ? 'Gestionar entregas' : 'Agregar entrega o examen'}
          </button>
        </Card>

        <Card title="Inglés">
          {englishToday ? (
            <p>Hoy ya practicaste inglés.</p>
          ) : (
            <p className="muted small">Recordatorio: 20 min de inglés cuando termines o en otro momento del día. El módulo guiado llega en la Fase 3.</p>
          )}
          <label className="check">
            <input
              type="checkbox"
              checked={englishToday}
              onChange={(e) =>
                update((s) => ({
                  ...s,
                  englishDays: e.target.checked ? [...s.englishDays, today] : s.englishDays.filter((d) => d !== today),
                }))
              }
            />
            Practiqué inglés hoy
          </label>
        </Card>

        <Card title="Tu última sesión">
          {last ? (
            <p data-testid="last-session">
              {relativeDay(last.date, today)}: {last.summary}
              <br />
              <span className="muted small">{minutesLabel(last.activeSeconds)} de trabajo efectivo</span>
            </p>
          ) : (
            <p className="muted small">Aún no hay sesiones. La primera empieza con el botón de arriba.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
