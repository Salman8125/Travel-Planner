import { beforeEach, describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { errorEnvelope } from '@/test/msw/handlers';
import { authStore } from '@/lib/stores/auth.store';
import { setNavigate } from './nav-bridge';
import { api } from './client';
import type { UserDto } from './models';

const base = 'http://localhost:4005';

beforeEach(() => {
  authStore.clearSession();
  setNavigate(() => {});
});

describe('api client', () => {
  it('unwraps the data envelope', async () => {
    const user = await api.get<UserDto>('/api/auth/me');
    expect(user.email).toBe('user@tripweaver.dev');
  });

  it('unwraps the list envelope', async () => {
    const res = await api.list('/api/itineraries');
    expect(res.data).toHaveLength(1);
    expect(res.meta.total).toBe(1);
  });

  it('attaches the Bearer token when authenticated', async () => {
    let authHeader: string | null = null;
    server.use(
      http.get(`${base}/api/auth/me`, ({ request }) => {
        authHeader = request.headers.get('Authorization');
        return HttpResponse.json({ data: { id: 'x', email: 'x', role: 'USER' } });
      }),
    );
    authStore.setSession('tok-1', { id: 'x', email: 'x', role: 'USER' });
    await api.get('/api/auth/me');
    expect(authHeader).toBe('Bearer tok-1');
  });

  it('throws an ApiError on a 4xx', async () => {
    server.use(
      http.get(`${base}/api/itineraries/:ref`, () =>
        HttpResponse.json(errorEnvelope('not_found', 'Itinerary not found'), { status: 404 }),
      ),
    );
    await expect(api.get('/api/itineraries/NOPE')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      code: 'not_found',
    });
  });

  it('clears the session on a 401', async () => {
    authStore.setSession('tok', { id: 'x', email: 'x', role: 'USER' });
    server.use(
      http.get(`${base}/api/itineraries`, () =>
        HttpResponse.json(errorEnvelope('unauthorized', 'nope'), { status: 401 }),
      ),
    );
    await expect(api.list('/api/itineraries')).rejects.toBeTruthy();
    expect(authStore.isAuthenticated()).toBe(false);
  });
});
