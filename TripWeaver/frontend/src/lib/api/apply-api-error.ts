import { setError, type FieldValues, type FormStore, type ResponseData } from '@modular-forms/solid';
import { ApiError } from './error';
import { notifyError } from '@/lib/notifier';

export function applyApiError<T extends FieldValues, R extends ResponseData>(
  form: FormStore<T, R>,
  error: unknown,
): boolean {
  if (error instanceof ApiError) {
    const flat = error.flatten;
    if (flat) {
      let hasFieldErrors = false;
      for (const [field, message] of Object.entries(flat.fieldErrors)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setError(form, field as any, message);
        hasFieldErrors = true;
      }
      if (flat.formErrors.length) notifyError(flat.formErrors.join(' '));
      if (hasFieldErrors || flat.formErrors.length) return hasFieldErrors;
    }
    notifyError(error.message);
    return false;
  }
  notifyError('Something went wrong. Please try again.');
  return false;
}
