import { Decimal } from "decimal.js";

export function toMoney(amount: string | number): string {
  return new Decimal(amount).toFixed(2);
}

export function mul(amount: string, factor: number): string {
  return new Decimal(amount).mul(factor).toFixed(2);
}

export function add(a: string, b: string): string {
  return new Decimal(a).add(b).toFixed(2);
}

export function isNonNegative(amount: string): boolean {
  return new Decimal(amount).gte(0);
}
