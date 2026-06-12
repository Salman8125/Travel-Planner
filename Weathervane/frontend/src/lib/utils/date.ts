import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function formatForecastDate(date: string, fmt = "EEE, MMM d"): string {
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return date;
  return format(new Date(y, m - 1, d, 12, 0, 0), fmt);
}

export function formatInLocation(iso: string, timeZone: string, fmt = "MMM d, HH:mm zzz"): string {
  try {
    return formatInTimeZone(parseISO(iso), timeZone, fmt);
  } catch {
    return iso;
  }
}

export function formatObservedAt(iso: string, timeZone: string): string {
  return formatInLocation(iso, timeZone, "EEE d MMM, HH:mm");
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function isoPlusDays(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split("-").map(Number);
  return format(addDays(new Date(y, m - 1, d), days), "yyyy-MM-dd");
}

export function spanDays(startISO: string, endISO: string): number {
  const [sy, sm, sd] = startISO.split("-").map(Number);
  const [ey, em, ed] = endISO.split("-").map(Number);
  return differenceInCalendarDays(new Date(ey, em - 1, ed), new Date(sy, sm - 1, sd)) + 1;
}
