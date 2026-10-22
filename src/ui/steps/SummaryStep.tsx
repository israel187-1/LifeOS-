import { getLesson } from '../../content';
import { toISODate } from '../../domain/dates';
import { isMastered, missingMasteryParts } from '../../domain/progress';
import { nextAction } from '../../domain/recommend';
import { finishSession, placementPassed } from '../../domain/sessions';
import { useStore } from '../../state/store';
import { MASTERY_PART_LABEL, minutesLabel } from '../common';

export default function SummaryStep() {
  const { state } = useStore();
  const s = state.activeSession!;
  const lesson = s.lessonId ? getLesson(s.lessonId) : undefined;
  const after = finishSession(state, new Date(), true);
  const next = nextAction(after, toISODate(new Date()), state.settings.mode === 'minimal' ? 'normal' : state.settings.mode);
  const missing = lesson ? missingMasteryParts(state, lesson.id) : [];
  const showLesson = lesson && (s.kind === 'lesson' || s.kind === 'reinforce');
  return (
    <div className="step">
      <p className="eyebrow">Resumen</p>
      <h2>{s.kind === 'minimal' ? 'Hecho. Esto cuenta.' : 'Sesión completada'}</h2>
      <ul className="facts">
        <li>
          <strong>{minutesLabel(s.activeSeconds)}</strong> de trabajo efectivo
        </li>
        <li>
          <strong>
            {s.exercisesSolved.length}/{s.exercisesAttempted.length}
          </strong>{' '}
          ejercicios resueltos de los intentados
        </li>
        {s.questionsAnswered > 0 && (
          <li>
            <strong>
              {s.questionsCorrect}/{s.questionsAnswered}
            </strong>{' '}
            preguntas de recuperación acertadas
          </li>
        )}
      </ul>
      {s.kind === 'placement' && (
        <p className={`feedback ${placementPassed(s) ? 'good' : 'bad'}`}>
          {placementPassed(s)
            ? 'Demostraste que ya dominas este nivel. Al terminar se marcará como dominado y podrás seguir con el siguiente.'
            : 'Aún no alcanzas el 80% de preguntas y todos los ejercicios. No pasa nada: el nivel queda disponible para estudiarlo normal, y lo que ya sabes irá rápido.'}
        </p>
      )}
      {showLesson &&
        (isMastered(state, lesson.id) ? (
          <p className="feedback good">
            <strong>Dominaste «{lesson.title}».</strong> Tienes evidencia: ejercicio sin ayuda, recuperación y explicación propia.
          </p>
        ) : (
          <p className="feedback neutral">
            «{lesson.title}» queda en práctica. Para dominarla falta: {missing.map((m) => MASTERY_PART_LABEL[m]).join('; ')}. La próxima sesión
            solo repetirá eso.
          </p>
        ))}
      <div className="next">
        <p className="label">Lo siguiente</p>
        <p>
          <strong>{next.title}</strong>
        </p>
        <p className="muted small">{next.why}</p>
      </div>
    </div>
  );
}
