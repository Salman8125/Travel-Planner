import type { Money } from "@/types/app";

export function toNumber(value: Money): number {
  return typeof value === "number" ? value : Number(value);
}

export function formatMoney(value: Money, currency = "USD", locale?: string): string {
  const n = toNumber(value);
  if (!Number.isFinite(n)) return String(value);
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);
  } catch {
    return `${currency} ${n.toFixed(2)}`;
  }
}

export function estimateTotal(unit: Money, quantity: number): number {
  return Math.round(toNumber(unit) * quantity * 100) / 100;
}
