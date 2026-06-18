import { createEffect, createRoot } from 'solid-js';
import { createStore } from 'solid-js/store';
import { api } from '@/lib/api/client';
import type { UserDto } from '@/lib/api/models';

const TOKEN_KEY = 'tripweaver.auth.token';

interface AuthState {
  token: string | null;
  user: UserDto | null;
  bootstrapped: boolean;
}

const [state, setState] = createStore<AuthState>({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  bootstrapped: false,
});

createRoot(() => {
  createEffect(() => {
    if (state.token) localStorage.setItem(TOKEN_KEY, state.token);
    else localStorage.removeItem(TOKEN_KEY);
  });
});

let bootstrapPromise: Promise<void> | null = null;

export const authStore = {
  get token(): string | null {
    return state.token;
  },
  get user(): UserDto | null {
    return state.user;
  },
  get bootstrapped(): boolean {
    return state.bootstrapped;
  },
  isAuthenticated: (): boolean => !!state.token,
  isAdmin: (): boolean => state.user?.role === 'ADMIN',
  setSession(token: string, user: UserDto): void {
    setState({ token, user });
  },
  setUser(user: UserDto | null): void {
    setState('user', user);
  },
  clearSession(): void {
    setState({ token: null, user: null });
  },
  ensureSession(): Promise<void> {
    if (state.bootstrapped) return Promise.resolve();
    if (!bootstrapPromise) {
      bootstrapPromise = (async () => {
        if (!state.token) {
          setState('bootstrapped', true);
          return;
        }
        try {
          const user = await api.get<UserDto>('/api/auth/me');
          setState('user', user);
        } catch {
          authStore.clearSession();
        } finally {
          setState('bootstrapped', true);
        }
      })();
    }
    return bootstrapPromise;
  },
};
