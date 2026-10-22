import { toISODate, formatShortDate } from '../domain/dates';
import { averageGapDays, daysWithoutPractice, monthlyStats, totals, weeklyStats, type PeriodStats } from '../domain/stats';
import { useStore } from '../state/store';
import { Card, minutesLabel } from './common';

function Period({ title, p }: { title: string; p: PeriodStats }) {
  return (
    <Card title={title}>
      <ul className="facts">
        <li><strong>{p.daysPracticed}</strong> de {p.daysElapsed} días con práctica</li>
        <li><strong>{p.minutes}</strong> min de trabajo efectivo</li>
        <li><strong>{p.exercisesSolved}</strong> ejercicios resueltos · {p.exercisesAttempted} intentados</li>
        <li><strong>{p.lessonsMastered}</strong> lecciones dominadas</li>
        <li><strong>{p.sessions}</strong> sesiones</li>
      </ul>
    </Card>
  );
}

export default function ProgressView() {
  const { state } = useStore();
  const today = toISODate(new Date());
  const t = totals(state);
  const gap = averageGapDays(state);
  const history = [...state.sessions].reverse().slice(0, 15);
  return (
    <div className="page">
      <h1>Progreso con evidencia</h1>
      <p className="muted">El tiempo no es aprendizaje. Lo que cuenta: ejercicios resueltos sin ayuda, conceptos dominados y constancia semanal.</p>
      <div className="grid">
        <Period title="Esta semana" p={weeklyStats(state, today)} />
        <Period title="Este mes" p={monthlyStats(state, today)} />
        <Card title="Total">
          <ul className="facts">
            <li><strong>{t.lessonsMastered}</strong> conceptos dominados</li>
            <li><strong>{t.exercisesSolvedIndependently}</strong> ejercicios resueltos sin ver la solución</li>
            <li><strong>{t.exercisesSolved}</strong> resueltos · {t.exercisesAttempted} intentados</li>
            <li><strong>{t.minutes}</strong> min de trabajo efectivo</li>
            <li><strong>{t.projectsFinished}</strong> proyectos terminados (módulo en Fase 3)</li>
          </ul>
        </Card>
        <Card title="Ritmo">
          <ul className="facts">
            <li><strong>{daysWithoutPractice(state, today)}</strong> días sin práctica desde tu primera sesión</li>
            <li>{gap === undefined ? 'Aún no hay suficientes sesiones para medir el tiempo entre ellas.' : <><strong>{gap.toFixed(1)}</strong> días de media entre días de práctica</>}</li>
          </ul>
        </Card>
      </div>
      <Card title="Historial">
        {history.length === 0 ? (
          <p className="muted small">Aún no hay sesiones.</p>
        ) : (
          <ul className="history">
            {history.map((s) => (
              <li key={s.id}>
                <span className="muted small">{formatShortDate(s.date)}</span> <strong>{s.title}</strong>
                <br />
                <span className="small">{s.summary} · {minutesLabel(s.activeSeconds)}{s.completed ? '' : ' · interrumpida'}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
