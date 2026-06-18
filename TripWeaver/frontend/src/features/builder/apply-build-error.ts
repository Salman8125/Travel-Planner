import { setError, type FormStore } from '@modular-forms/solid';
import { isApiError } from '@/lib/api/error';
import { notifyError } from '@/lib/notifier';
import type { BuildForm } from './schemas';

const SECTION_OF_TOP: Record<string, number> = {
  flight: 0,
  hotel: 1,
  weather: 2,
  budget: 3,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export function applyBuildError(
  form: FormStore<BuildForm>,
  error: unknown,
  goToStep: (index: number) => void,
): void {
  if (!isApiError(error)) {
    notifyError('Something went wrong. Please try again.');
    return;
  }

  const details = error.details;
  if (details && Object.keys(details).length > 0) {
    let firstSection: number | null = null;

    for (const [key, message] of Object.entries(details)) {
      if (key === 'currency') {
        setError(form, 'flight.currency' as any, message);
        setError(form, 'hotel.currency' as any, message);
        setError(form, 'budget.currency' as any, message);
        firstSection ??= 0;
      } else if (key === 'weather') {
        setError(form, 'weather' as any, message);
        firstSection ??= 2;
      } else if (key === 'budget') {
        setError(form, 'budget.totalBudget' as any, message);
        notifyError(message);
        firstSection ??= 3;
      } else if (key.includes('.')) {
        setError(form, key as any, message);
        firstSection ??= SECTION_OF_TOP[key.split('.')[0] ?? ''] ?? null;
      } else {
        notifyError(message);
      }
    }

    if (firstSection !== null) goToStep(firstSection);
    return;
  }

  notifyError(error.message);
}
/* eslint-enable @typescript-eslint/no-explicit-any */
