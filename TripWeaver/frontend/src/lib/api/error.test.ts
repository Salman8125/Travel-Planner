import { describe, expect, it } from 'vitest';
import { ApiError, isApiError } from './error';

describe('ApiError', () => {
  it('builds a network error', () => {
    const err = ApiError.network();
    expect(err.status).toBe(0);
    expect(err.isNetwork).toBe(true);
    expect(isApiError(err)).toBe(true);
  });

  it('parses the error envelope and falls back to the X-Request-Id header', async () => {
    const res = new Response(
      JSON.stringify({ error: { code: 'conflict', message: 'Currencies must match', details: { currency: 'mismatch' } } }),
      { status: 409, headers: { 'Content-Type': 'application/json', 'X-Request-Id': 'hdr-1' } },
    );
    const err = await ApiError.fromResponse(res);
    expect(err.status).toBe(409);
    expect(err.code).toBe('conflict');
    expect(err.details).toEqual({ currency: 'mismatch' });
    expect(err.requestId).toBe('hdr-1');
  });

  it('provides defaults when the body is not an envelope', async () => {
    const res = new Response('boom', { status: 500 });
    const err = await ApiError.fromResponse(res);
    expect(err.code).toBe('error');
    expect(err.message).toContain('500');
  });

  it('flattens dotted field keys and form-level keys', () => {
    const err = new ApiError({
      status: 400,
      code: 'validation_error',
      message: 'Invalid',
      details: { 'hotel.checkIn': 'too late', _: 'whole form bad' },
    });
    const flat = err.flatten;
    expect(flat?.fieldErrors).toEqual({ 'hotel.checkIn': 'too late' });
    expect(flat?.formErrors).toEqual(['whole form bad']);
  });
});
