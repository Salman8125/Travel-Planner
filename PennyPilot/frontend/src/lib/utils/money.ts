import type { Money } from '$lib/api/models';

export function toNumber(value: Money | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMoney(value: Money | null | undefined, currency = 'USD', locale?: string): string {
  const amount = toNumber(value);
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

export function percentOf(part: Money, whole: Money): number {
  const total = toNumber(whole);
  if (total <= 0) return 0;
  const pct = (toNumber(part) / total) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function difference(a: Money, b: Money): number {
  return Math.round((toNumber(a) - toNumber(b)) * 100) / 100;
}

export function isPositiveAmount(value: Money | null | undefined): boolean {
  return toNumber(value) > 0;
}
