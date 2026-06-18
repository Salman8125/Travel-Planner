import { differenceInCalendarDays, format, parseISO } from 'date-fns';

function calendarDate(iso: string): Date | null {
  const parts = iso.split('-').map(Number);
  const [y, m, d] = parts;
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function formatDay(iso: string, fmt = 'EEE, MMM d'): string {
  const date = calendarDate(iso);
  return date ? format(date, fmt) : iso;
}

export function formatRange(startIso: string, endIso: string): string {
  return `${formatDay(startIso, 'MMM d')} – ${formatDay(endIso, 'MMM d, yyyy')}`;
}

export function formatDateTime(iso: string, fmt = 'MMM d, HH:mm'): string {
  try {
    return format(parseISO(iso), fmt);
  } catch {
    return iso;
  }
}

export function todayIso(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function datePart(value: string): string {
  return value.slice(0, 10);
}

export function tripSpanDays(startIso: string, endIso: string): number {
  const start = calendarDate(startIso);
  const end = calendarDate(endIso);
  if (!start || !end) return 0;
  return differenceInCalendarDays(end, start) + 1;
}
