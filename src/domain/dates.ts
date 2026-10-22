import type { ISODate } from './types';

const pad = (n: number) => String(n).padStart(2, '0');

export function toISODate(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISODate(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(iso: ISODate, n: number): ISODate {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + n);
  return toISODate(d);
}

/** Whole days from a to b (b - a). */
export function daysBetween(a: ISODate, b: ISODate): number {
  const ms = parseISODate(b).getTime() - parseISODate(a).getTime();
  return Math.round(ms / 86_400_000);
}

/** Monday of the week containing iso. */
export function startOfWeek(iso: ISODate): ISODate {
  const d = parseISODate(iso);
  const dow = (d.getDay() + 6) % 7;
  return addDays(iso, -dow);
}

export function startOfMonth(iso: ISODate): ISODate {
  return `${iso.slice(0, 7)}-01`;
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function formatShortDate(iso: ISODate): string {
  const d = parseISODate(iso);
  return `${WEEKDAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function relativeDay(iso: ISODate, today: ISODate): string {
  const diff = daysBetween(today, iso);
  if (diff === 0) return 'hoy';
  if (diff === 1) return 'mañana';
  if (diff === -1) return 'ayer';
  if (diff > 1) return `en ${diff} días`;
  return `hace ${-diff} días`;
}
