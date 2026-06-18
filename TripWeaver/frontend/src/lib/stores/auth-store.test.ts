import { describe, expect, it } from 'vitest';
import { authStore } from './auth.store';

describe('auth store', () => {
  it('loads the current user from /api/auth/me on ensureSession', async () => {
    authStore.setSession('test-token', { id: 'temp', email: 'temp@x.io', role: 'USER' });
    await authStore.ensureSession();
    expect(authStore.user?.email).toBe('user@tripweaver.dev');
    expect(authStore.isAuthenticated()).toBe(true);
  });

  it('reports admin role', () => {
    authStore.setSession('t', { id: 'a', email: 'a@x.io', role: 'ADMIN' });
    expect(authStore.isAdmin()).toBe(true);
    authStore.clearSession();
    expect(authStore.isAdmin()).toBe(false);
  });
});
