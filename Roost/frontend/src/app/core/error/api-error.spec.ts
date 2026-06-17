import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';

import { ApiError, isApiError } from './api-error';

describe('ApiError.fromHttp', () => {
  it('maps a network failure (status 0) to a network ApiError', () => {
    const err = ApiError.fromHttp(new HttpErrorResponse({ status: 0 }));
    expect(err.status).toBe(0);
    expect(err.isNetwork).toBe(true);
    expect(err.code).toBe('network_error');
    expect(isApiError(err)).toBe(true);
  });

  it('reads code/message/details/requestId from the error envelope', () => {
    const err = ApiError.fromHttp(
      new HttpErrorResponse({
        status: 400,
        error: {
          error: {
            code: 'validation_error',
            message: 'Invalid input',
            details: { city: 'must not be blank' },
            requestId: 'req-99',
          },
        },
      }),
    );
    expect(err.status).toBe(400);
    expect(err.code).toBe('validation_error');
    expect(err.message).toBe('Invalid input');
    expect(err.requestId).toBe('req-99');
  });

  it('falls back to the X-Request-Id header when the envelope omits it', () => {
    const err = ApiError.fromHttp(
      new HttpErrorResponse({
        status: 500,
        headers: new HttpHeaders({ 'X-Request-Id': 'hdr-7' }),
        error: { error: { code: 'server_error', message: 'Boom' } },
      }),
    );
    expect(err.requestId).toBe('hdr-7');
  });

  it('provides sensible defaults when the body is not an envelope', () => {
    const err = ApiError.fromHttp(new HttpErrorResponse({ status: 503, error: 'plain text' }));
    expect(err.code).toBe('error');
    expect(err.message).toContain('503');
  });
});

describe('ApiError.flatten', () => {
  it('splits form-level keys from field keys', () => {
    const err = new ApiError({
      status: 400,
      code: 'validation_error',
      message: 'Invalid',
      details: { _: 'Whole form is wrong', city: 'required', guests: 'too many' },
    });
    const flat = err.flatten;
    expect(flat).toBeDefined();
    expect(flat!.formErrors).toEqual(['Whole form is wrong']);
    expect(flat!.fieldErrors).toEqual({ city: ['required'], guests: ['too many'] });
  });

  it('returns undefined when there are no details', () => {
    const err = new ApiError({ status: 500, code: 'server_error', message: 'Boom' });
    expect(err.flatten).toBeUndefined();
  });
});
