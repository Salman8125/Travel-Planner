import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";

export function formatTime(iso: string, timezone: string): string {
  return formatInTimeZone(parseISO(iso), timezone, "HH:mm");
}

export function formatDay(iso: string, timezone: string): string {
  return formatInTimeZone(parseISO(iso), timezone, "EEE, d MMM yyyy");
}

export function formatDateTime(iso: string, timezone: string): string {
  return formatInTimeZone(parseISO(iso), timezone, "d MMM yyyy, HH:mm zzz");
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

export function todayISODate(): string {
  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - tzOffset).toISOString().slice(0, 10);
}

export function addDaysISO(isoDate: string, days: number): string {
  const d = parseISO(isoDate);
  d.setDate(d.getDate() + days);
  const tzOffset = d.getTimezoneOffset() * 60_000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}
