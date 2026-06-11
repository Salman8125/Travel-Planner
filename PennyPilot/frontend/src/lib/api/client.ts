import { env } from '$lib/config/env';
import { auth } from '$lib/stores/auth.svelte';
import { ApiError } from './ApiError';

type QueryValue = string | number | boolean | undefined | null;

export interface RequestOptions {
  method?: string;
  body?: unknown;
  query?: Record<string, QueryValue>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  suppressAuth?: boolean;
  _retried?: boolean;
}

let refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refresh = auth.refreshToken;
      if (!refresh) return null;
      try {
        const res = await fetch(`${env.apiUrl}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh })
        });
        if (!res.ok) return null;
        const body = await res.json().catch(() => null);
        const access = body?.data?.access ?? body?.access ?? null;
        if (access) auth.setAccess(access);
        return access;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const url = new URL(`${env.apiUrl}${path}`);
  if (opts.query) {
    for (const [key, value] of Object.entries(opts.query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const headers: Record<string, string> = { ...(opts.headers ?? {}) };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (!opts.suppressAuth && auth.accessToken) {
    headers['Authorization'] = `Bearer ${auth.accessToken}`;
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: opts.method ?? 'GET',
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal
    });
  } catch (cause) {
    throw ApiError.network(cause);
  }

  const isAuthCall = path.startsWith('/api/auth/');
  if (res.status === 401 && !isAuthCall && !opts.suppressAuth && !opts._retried) {
    const newAccess = await refreshAccessToken();
    if (newAccess) return request<T>(path, { ...opts, _retried: true });
    auth.logout();
    throw await ApiError.fromResponse(res);
  }

  if (!res.ok) throw await ApiError.fromResponse(res);
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export const api = {
  get: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: RequestOptions) =>
    request<T>(path, { ...opts, method: 'PATCH', body }),
  del: <T>(path: string, opts?: RequestOptions) => request<T>(path, { ...opts, method: 'DELETE' })
};
