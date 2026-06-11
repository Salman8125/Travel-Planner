import { format, isValid, parseISO } from 'date-fns';

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parsed = parseISO(iso);
  return isValid(parsed) ? format(parsed, 'd MMM yyyy') : iso;
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const parsed = parseISO(iso);
  return isValid(parsed) ? format(parsed, 'd MMM yyyy, HH:mm') : iso;
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}
