import { v4 as uuidv4 } from 'uuid';
import { config } from '@/lib/config/env';
import { authStore } from '@/lib/stores/auth.store';
import type { PageMeta } from './models';
import { ApiError } from './error';
import { navigateTo } from './nav-bridge';

type ParamValue = string | number | boolean | undefined | null;
type Params = Record<string, ParamValue>;

function toQuery(params?: Params): string {
  if (!params) return '';
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') sp.set(key, String(value));
  }
  const query = sp.toString();
  return query ? `?${query}` : '';
}

interface RequestOptions {
  body?: unknown;
  params?: Params;
  headers?: Record<string, string>;
}

async function request(method: string, path: string, opts: RequestOptions = {}): Promise<Response> {
  const url = `${config.apiUrl}${path}${toQuery(opts.params)}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Request-Id': uuidv4(),
    ...opts.headers,
  };
  const token = authStore.token;
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let bodyInit: string | undefined;
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    bodyInit = JSON.stringify(opts.body);
  }

  let res: Response;
  try {
    res = await fetch(url, { method, headers, body: bodyInit });
  } catch {
    throw ApiError.network();
  }

  if (!res.ok) {
    const error = await ApiError.fromResponse(res);
    if (error.status === 401 && !path.includes('/api/auth/')) {
      const wasAuthenticated = authStore.isAuthenticated();
      authStore.clearSession();
      if (wasAuthenticated) {
        const returnTo = encodeURIComponent(window.location.pathname + window.location.search);
        navigateTo(`/login?returnTo=${returnTo}`);
      }
    }
    throw error;
  }
  return res;
}

async function unwrapData<T>(res: Response): Promise<T> {
  const json = (await res.json()) as { data: T };
  return json.data;
}

async function unwrapList<T>(res: Response): Promise<{ data: T[]; meta: PageMeta }> {
  return (await res.json()) as { data: T[]; meta: PageMeta };
}

export const api = {
  get: <T>(path: string, params?: Params): Promise<T> =>
    request('GET', path, { params }).then(unwrapData<T>),
  list: <T>(path: string, params?: Params): Promise<{ data: T[]; meta: PageMeta }> =>
    request('GET', path, { params }).then(unwrapList<T>),
  post: <T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> =>
    request('POST', path, { body, headers }).then(unwrapData<T>),
  patch: <T>(path: string, body?: unknown, headers?: Record<string, string>): Promise<T> =>
    request('PATCH', path, { body, headers }).then(unwrapData<T>),
};
