import { ApplicationRef } from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { requestIdInterceptor } from '@core/interceptors/request-id.interceptor';

import { AuthStore } from './auth.store';

const TOKEN_KEY = 'roost.auth.token';

function makeStore(): AuthStore {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      provideHttpClient(
        withInterceptors([requestIdInterceptor, authInterceptor, errorInterceptor]),
      ),
    ],
  });
  return TestBed.inject(AuthStore);
}

describe('AuthStore.ensureSession (MSW)', () => {
  beforeEach(() => localStorage.clear());

  it('skips the network and bootstraps when there is no token', async () => {
    const store = makeStore();
    await store.ensureSession();
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.bootstrapped()).toBe(true);
  });

  it('loads the user from /api/auth/me when a persisted token exists', async () => {
    localStorage.setItem(TOKEN_KEY, 'test-token-123');
    const store = makeStore();
    await store.ensureSession();
    expect(store.user()?.email).toBe('user@roost.dev');
    expect(store.isAuthenticated()).toBe(true);
  });

  it('persists the token to localStorage on setSession and removes it on clear', () => {
    const store = makeStore();
    const appRef = TestBed.inject(ApplicationRef);

    store.setSession('tok-xyz', { id: 'u1', email: 'a@b.c', role: 'USER' });
    appRef.tick();
    expect(localStorage.getItem(TOKEN_KEY)).toBe('tok-xyz');

    store.clearSession();
    appRef.tick();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
  });
});
