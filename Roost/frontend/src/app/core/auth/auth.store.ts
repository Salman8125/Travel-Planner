import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { HttpApi } from '@core/api/http';
import type { UserDto } from '@core/api/models';

const TOKEN_KEY = 'roost.auth.token';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(HttpApi);

  readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly user = signal<UserDto | null>(null);
  readonly bootstrapped = signal(false);

  readonly isAuthenticated = computed(() => !!this.token());
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  private bootstrapPromise: Promise<void> | null = null;

  constructor() {
    effect(() => {
      const token = this.token();
      if (token) localStorage.setItem(TOKEN_KEY, token);
      else localStorage.removeItem(TOKEN_KEY);
    });
  }

  setSession(token: string, user: UserDto): void {
    this.token.set(token);
    this.user.set(user);
  }

  setUser(user: UserDto | null): void {
    this.user.set(user);
  }

  clearSession(): void {
    this.token.set(null);
    this.user.set(null);
  }

  ensureSession(): Promise<void> {
    if (this.bootstrapped()) return Promise.resolve();
    if (!this.bootstrapPromise) {
      this.bootstrapPromise = (async () => {
        if (!this.token()) {
          this.bootstrapped.set(true);
          return;
        }
        try {
          this.user.set(await this.api.getOne<UserDto>('/api/auth/me'));
        } catch {
          this.clearSession();
        } finally {
          this.bootstrapped.set(true);
        }
      })();
    }
    return this.bootstrapPromise;
  }
}
