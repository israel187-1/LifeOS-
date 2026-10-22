import { LESSONS } from '../content';
import { daysBetween } from './dates';
import { exerciseProgress, isMastered, lessonStatus } from './progress';
import { nextAction, upcomingObligations } from './recommend';
import { daysSinceLastPractice } from './stats';
import type { AppState, ISODate, Mode } from './types';

export type Intent = 'no-energy' | 'one-hour' | 'stuck' | 'exams' | 'lost-week' | 'new-idea';

export const INTENTS: { id: Intent; label: string }[] = [
  { id: 'no-energy', label: 'No tengo ganas de estudiar, ¿por dónde empiezo?' },
  { id: 'one-hour', label: 'Tengo una hora libre, ¿qué me conviene hacer?' },
  { id: 'stuck', label: 'No entiendo este ejercicio de Python' },
  { id: 'exams', label: 'Tengo exámenes próximos, ayúdame a priorizar' },
  { id: 'lost-week', label: 'Perdí varios días de práctica, ¿cómo retomo?' },
  { id: 'new-idea', label: 'Tengo una idea nueva, ¿la empiezo o la guardo?' },
];

export interface AssistantReply {
  text: string[];
  start?: { mode: Mode; label: string };
  openIdeas?: boolean;
}

/** Rule-based answers from the learner's registered data. No AI model is involved. */
export function answer(intent: Intent, state: AppState, today: ISODate): AssistantReply {
  const obligations = upcomingObligations(state, today);
  const soon = obligations.filter((o) => daysBetween(today, o.dueDate) <= 3);
  switch (intent) {
    case 'no-energy':
      return {
        text: [
          'Normal que pase. No necesitas motivación para empezar; solo una acción pequeña.',
          'Haz el modo mínimo: una sola actividad de 5 minutos. Si al terminar quieres seguir, sigue; si no, ya cuenta como día de práctica.',
          ...(soon.length ? [`Ojo: tienes "${soon[0].title}" (${soon[0].subject}) el ${soon[0].dueDate}. Si tienes energía para una sola cosa, que sea esa.`] : []),
        ],
        start: { mode: 'minimal', label: 'Empezar 5 minutos' },
      };
    case 'one-hour': {
      if (soon.length)
        return {
          text: [
            `Tienes "${soon[0].title}" (${soon[0].subject}) para el ${soon[0].dueDate}. La universidad va primero: dedica unos 35–40 min a eso.`,
            'Con lo que quede, haz una sesión mínima de programación para no perder continuidad.',
          ],
          start: { mode: 'minimal', label: 'Programar 5 minutos después' },
        };
      const a = nextAction(state, today, 'deep');
      return {
        text: [
          'Sin entregas urgentes registradas: buen momento para una sesión profunda (40–50 min) y un descanso.',
          `Siguiente paso: ${a.title}. ${a.why}`,
          'Después: 10–20 min de inglés si te queda energía.',
        ],
        start: { mode: 'deep', label: 'Empezar sesión profunda' },
      };
    }
    case 'stuck': {
      const practiced = LESSONS.find((l) => lessonStatus(state, l.id) === 'practiced' || !isMastered(state, l.id));
      const revealed = practiced && exerciseProgress(state, practiced.independent.id).solutionRevealed;
      return {
        text: [
          '1) Lee el enunciado y escribe con tus palabras: ¿qué entra?, ¿qué sale?',
          '2) Ejecuta tu código aunque esté incompleto y lee el error: la app te dice la línea y qué significa.',
          '3) Haz una prueba de escritorio: anota el valor de cada variable línea por línea.',
          '4) Pide una pista (son progresivas). La solución se desbloquea al usar todas, pero intenta antes.',
          ...(practiced ? [`Si es de "${practiced.title}", repasa el ejemplo paso a paso de esa lección.`] : []),
          ...(revealed ? ['Ya viste una solución en esa lección: la app te pedirá un ejercicio nuevo sin ayuda para comprobar que lo dominas.'] : []),
        ],
      };
    }
    case 'exams': {
      if (!obligations.length)
        return {
          text: [
            'No tienes evaluaciones registradas. Agrégalas en "Próximas entregas" con su fecha real para que pueda priorizarlas.',
            'Las calificaciones y porcentajes llegarán en la Fase 2; no los voy a inventar.',
          ],
        };
      return {
        text: [
          'Orden sugerido (por fecha más cercana; los pesos se añadirán en la Fase 2):',
          ...obligations.slice(0, 5).map((o, i) => `${i + 1}. ${o.title} — ${o.subject} — ${o.dueDate} (en ${daysBetween(today, o.dueDate)} días)`),
          'Mientras haya exámenes en 3 días o menos, usa solo el modo mínimo de programación para mantener la continuidad sin quitarle tiempo a la universidad.',
        ],
      };
    }
    case 'lost-week': {
      const gap = daysSinceLastPractice(state, today);
      return {
        text: [
          gap === undefined ? 'Aún no hay sesiones registradas: empezar hoy ya es retomar.' : `Han pasado ${gap} días. Tu progreso está intacto.`,
          'Haz una sesión de regreso: repaso ligero + un ejercicio conocido. Es más fácil a propósito.',
          'Mañana, aunque sea 5 minutos. La meta es practicar varios días por semana, no una racha perfecta.',
        ],
        start: { mode: 'normal', label: 'Empezar sesión de regreso' },
      };
    }
    case 'new-idea':
      return {
        text: [
          'Guárdala en la lista de espera. No se pierde, pero tampoco te quita foco.',
          'Regla: una idea pasa a proyecto activo solo cuando termines el proyecto actual y tengas las bases que necesita.',
          `Hoy tu foco es la ruta de programación (${LESSONS.filter((l) => isMastered(state, l.id)).length}/${LESSONS.length} lecciones dominadas).`,
        ],
        openIdeas: true,
      };
  }
}
