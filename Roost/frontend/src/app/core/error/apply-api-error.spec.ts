import { FormControl, FormGroup } from '@angular/forms';

import { setErrorNotifier } from '../api/notifier';
import { ApiError } from './api-error';
import { applyApiError } from './apply-api-error';

describe('applyApiError', () => {
  let notified: string[];

  beforeEach(() => {
    notified = [];
    setErrorNotifier((m) => notified.push(m));
  });

  function form() {
    return new FormGroup({
      city: new FormControl(''),
      guests: new FormControl(0),
    });
  }

  it('maps field details onto matching controls with a `server` error', () => {
    const f = form();
    const error = new ApiError({
      status: 400,
      code: 'validation_error',
      message: 'Invalid',
      details: { city: 'must not be blank' },
    });

    const hadFieldErrors = applyApiError(error, f);

    expect(hadFieldErrors).toBe(true);
    expect(f.get('city')?.getError('server')).toBe('must not be blank');
    expect(f.get('city')?.touched).toBe(true);
  });

  it('routes form-level errors to the notifier, not a control', () => {
    const f = form();
    const error = new ApiError({
      status: 400,
      code: 'validation_error',
      message: 'Invalid',
      details: { _: 'Dates overlap an existing booking' },
    });

    const hadFieldErrors = applyApiError(error, f);

    expect(hadFieldErrors).toBe(false);
    expect(notified).toContain('Dates overlap an existing booking');
  });

  it('notifies the bare message for non-field API errors', () => {
    const f = form();
    applyApiError(
      new ApiError({ status: 500, code: 'server_error', message: 'Server exploded' }),
      f,
    );
    expect(notified).toContain('Server exploded');
  });

  it('notifies a generic message for unknown errors', () => {
    const f = form();
    applyApiError(new Error('boom'), f);
    expect(notified).toContain('Something went wrong. Please try again.');
  });
});
