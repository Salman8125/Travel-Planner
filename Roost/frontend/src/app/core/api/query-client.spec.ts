import { ApiError } from '@core/error/api-error';

import { createQueryClient } from './query-client';

function retryFn() {
  const fn = createQueryClient().getDefaultOptions().queries?.retry;
  return fn as (failureCount: number, error: unknown) => boolean;
}

describe('createQueryClient retry policy', () => {
  it('never retries a 4xx ApiError', () => {
    const retry = retryFn();
    const e = new ApiError({ status: 404, code: 'not_found', message: 'nope' });
    expect(retry(0, e)).toBe(false);
  });

  it('retries network errors up to twice', () => {
    const retry = retryFn();
    const e = new ApiError({ status: 0, code: 'network_error', message: 'down', isNetwork: true });
    expect(retry(0, e)).toBe(true);
    expect(retry(1, e)).toBe(true);
    expect(retry(2, e)).toBe(false);
  });

  it('retries 5xx errors', () => {
    const retry = retryFn();
    const e = new ApiError({ status: 503, code: 'server_error', message: 'busy' });
    expect(retry(0, e)).toBe(true);
  });

  it('disables retries for mutations', () => {
    expect(createQueryClient().getDefaultOptions().mutations?.retry).toBe(false);
  });
});
