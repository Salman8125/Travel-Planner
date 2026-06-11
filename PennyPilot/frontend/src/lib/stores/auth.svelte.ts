import { env } from '$lib/config/env';
import type { AuthResult, User } from '$lib/api/models';

const REFRESH_KEY = 'pennypilot.refresh';

async function rawRefresh(refresh: string): Promise<string | null> {
  try {
    const res = await fetch(`${env.apiUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh })
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    return body?.data?.access ?? body?.access ?? null;
  } catch {
    return null;
  }
}

async function rawMe(access: string): Promise<User | null> {
  try {
    const res = await fetch(`${env.apiUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${access}` }
    });
    if (!res.ok) return null;
    const body = await res.json().catch(() => null);
    return (body?.data ?? body ?? null) as User | null;
  } catch {
    return null;
  }
}

class AuthStore {
  accessToken = $state<string | null>(null);
  refreshToken = $state<string | null>(null);
  user = $state<User | null>(null);
  bootstrapped = $state(false);
  private booting: Promise<void> | null = null;

  readonly isAuthenticated = $derived(!!this.accessToken && !!this.user);
  readonly isAdmin = $derived(this.user?.role === 'ADMIN');

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.refreshToken = localStorage.getItem(REFRESH_KEY);
    }
  }

  setSession(result: AuthResult): void {
    this.accessToken = result.access;
    this.refreshToken = result.refresh;
    this.user = result.user;
    if (typeof localStorage !== 'undefined') localStorage.setItem(REFRESH_KEY, result.refresh);
  }

  setAccess(access: string): void {
    this.accessToken = access;
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.user = null;
    if (typeof localStorage !== 'undefined') localStorage.removeItem(REFRESH_KEY);
  }

  async bootstrap(): Promise<void> {
    if (this.bootstrapped) return;
    if (this.booting) return this.booting;
    this.booting = (async () => {
      try {
        if (!this.refreshToken) return;
        const access = await rawRefresh(this.refreshToken);
        if (!access) {
          this.logout();
          return;
        }
        this.accessToken = access;
        const me = await rawMe(access);
        if (!me) {
          this.logout();
          return;
        }
        this.user = me;
      } catch {
        this.logout();
      } finally {
        this.bootstrapped = true;
        this.booting = null;
      }
    })();
    return this.booting;
  }
}

export const auth = new AuthStore();
