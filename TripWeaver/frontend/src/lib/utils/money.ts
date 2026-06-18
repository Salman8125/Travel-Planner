export function formatMoney(value: number | null | undefined, currency = 'USD'): string {
  if (value == null || Number.isNaN(value)) return '—';
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}
