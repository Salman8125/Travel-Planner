import { formatMoney } from "@/lib/money";
import type { Money as MoneyValue } from "@/types/app";

interface MoneyProps {
  value: MoneyValue;
  currency?: string;
  className?: string;
}

export function Money({ value, currency = "USD", className }: MoneyProps) {
  return <span className={className}>{formatMoney(value, currency)}</span>;
}
