import { addDays, differenceInCalendarDays, format } from 'date-fns';

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function isoFromDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function dateFromISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isoPlusDays(iso: string, days: number): string {
  return format(addDays(dateFromISO(iso), days), 'yyyy-MM-dd');
}

export function nights(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(dateFromISO(checkOut), dateFromISO(checkIn));
}
