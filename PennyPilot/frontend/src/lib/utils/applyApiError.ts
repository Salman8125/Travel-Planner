import { toast } from 'svelte-sonner';
import { ApiError } from '$lib/api/ApiError';

interface SuperFormLike {
  data: Record<string, unknown>;
  errors: Record<string, unknown>;
  valid: boolean;
}

export function applyApiError(error: unknown, form?: unknown): void {
  if (!(error instanceof ApiError)) {
    toast.error('Something went wrong. Please try again.');
    return;
  }

  const target = form as SuperFormLike | undefined;
  const { formErrors, fieldErrors } = error.flatten;
  let mapped = 0;
  const leftovers: string[] = [...formErrors];

  for (const [field, messages] of Object.entries(fieldErrors)) {
    if (target && field in target.data) {
      target.errors[field] = messages;
      mapped += 1;
    } else {
      leftovers.push(...messages);
    }
  }

  if (target && mapped > 0) target.valid = false;

  if (leftovers.length) {
    toast.error(leftovers.join(' '));
  } else if (mapped === 0) {
    toast.error(error.message);
  }
}
