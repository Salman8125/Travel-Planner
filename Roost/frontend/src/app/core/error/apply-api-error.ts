import { FormGroup } from '@angular/forms';

import { notifyError } from '../api/notifier';
import { ApiError } from './api-error';

export function applyApiError(error: unknown, form: FormGroup): boolean {
  if (error instanceof ApiError) {
    const flat = error.flatten;
    if (flat) {
      let hasFieldErrors = false;
      for (const [field, messages] of Object.entries(flat.fieldErrors)) {
        const control = form.get(field);
        if (control && messages.length) {
          control.setErrors({ ...(control.errors ?? {}), server: messages[0] });
          control.markAsTouched();
          hasFieldErrors = true;
        }
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
