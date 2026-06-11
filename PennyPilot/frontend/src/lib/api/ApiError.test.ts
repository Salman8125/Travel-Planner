import { describe, expect, it } from 'vitest';
import { ApiError } from './ApiError';

describe('ApiError', () => {
  it('parses the error envelope and falls back to the X-Request-Id header', async () => {
    const res = new Response(
      JSON.stringify({ error: { code: 'validation_error', message: 'Invalid', details: { name: ['Required'] } } }),
      { status: 400, headers: { 'x-request-id': 'req-123' } }
    );
    const err = await ApiError.fromResponse(res);
    expect(err.code).toBe('validation_error');
    expect(err.status).toBe(400);
    expect(err.requestId).toBe('req-123');
    expect(err.flatten.fieldErrors.name).toEqual(['Required']);
  });

  it('routes non_field_errors to formErrors', async () => {
    const res = new Response(
      JSON.stringify({ error: { code: 'validation_error', message: 'x', details: { non_field_errors: ['bad'] } } }),
      { status: 400 }
    );
    const err = await ApiError.fromResponse(res);
    expect(err.flatten.formErrors).toEqual(['bad']);
    expect(err.flatten.fieldErrors).toEqual({});
  });

  it('builds a network error', () => {
    const err = ApiError.network();
    expect(err.isNetwork).toBe(true);
    expect(err.status).toBe(0);
  });
});
