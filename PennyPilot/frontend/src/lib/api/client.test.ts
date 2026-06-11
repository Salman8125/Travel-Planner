import { describe, expect, it, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../test/msw/server';
import { auth } from '$lib/stores/auth.svelte';
import { api } from './client';

const API = 'http://localhost:4003';

function session(access: string) {
  auth.setSession({ access, refresh: 'r-1', user: { id: 'u', email: 'e@x.com', role: 'USER' } });
}

describe('api client refresh-and-retry-once', () => {
  beforeEach(() => auth.logout());

  it('refreshes the access token once on 401 then retries the request', async () => {
    session('stale');
    let protectedCalls = 0;
    let refreshCalls = 0;
    server.use(
      http.get(`${API}/api/budgets`, ({ request }) => {
        protectedCalls += 1;
        if (request.headers.get('authorization') === 'Bearer stale') {
          return HttpResponse.json({ error: { code: 'unauthorized', message: 'no' } }, { status: 401 });
        }
        return HttpResponse.json({ data: [], meta: { page: 1, pageSize: 20, total: 0, totalPages: 1 } });
      }),
      http.post(`${API}/api/auth/refresh`, () => {
        refreshCalls += 1;
        return HttpResponse.json({ data: { access: 'fresh' } });
      })
    );

    await api.get('/api/budgets');

    expect(refreshCalls).toBe(1);
    expect(protectedCalls).toBe(2);
    expect(auth.accessToken).toBe('fresh');
  });

  it('logs out when the refresh fails', async () => {
    session('stale');
    server.use(
      http.get(`${API}/api/budgets`, () =>
        HttpResponse.json({ error: { code: 'unauthorized', message: 'no' } }, { status: 401 })
      ),
      http.post(`${API}/api/auth/refresh`, () => new HttpResponse(null, { status: 401 }))
    );

    await expect(api.get('/api/budgets')).rejects.toMatchObject({ status: 401 });
    expect(auth.accessToken).toBeNull();
    expect(auth.refreshToken).toBeNull();
  });

  it('does not attempt refresh for auth endpoints', async () => {
    let refreshCalls = 0;
    server.use(
      http.post(`${API}/api/auth/login`, () =>
        HttpResponse.json({ error: { code: 'unauthorized', message: 'bad creds' } }, { status: 401 })
      ),
      http.post(`${API}/api/auth/refresh`, () => {
        refreshCalls += 1;
        return HttpResponse.json({ data: { access: 'x' } });
      })
    );

    await expect(
      api.post('/api/auth/login', { email: 'a@b.com', password: 'x' }, { suppressAuth: true })
    ).rejects.toMatchObject({ code: 'unauthorized' });
    expect(refreshCalls).toBe(0);
  });
});
