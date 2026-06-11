import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './msw/server';
import { auth } from '$lib/stores/auth.svelte';
import { expenseDraft } from '$lib/stores/expenseDraft.svelte';

vi.mock('$env/static/public', () => ({ PUBLIC_API_URL: 'http://localhost:4003' }));
vi.mock('$app/navigation', () => ({
  goto: vi.fn(),
  invalidate: vi.fn(),
  invalidateAll: vi.fn(),
  beforeNavigate: vi.fn(),
  afterNavigate: vi.fn()
}));
vi.mock('$app/environment', () => ({ dev: false, browser: true, building: false }));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn()
  })
});

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

afterEach(() => {
  server.resetHandlers();
  auth.logout();
  expenseDraft.reset();
  localStorage.clear();
});

afterAll(() => server.close());
