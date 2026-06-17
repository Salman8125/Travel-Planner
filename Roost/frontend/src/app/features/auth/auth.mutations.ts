import { inject } from '@angular/core';
import { injectMutation, injectQueryClient } from '@tanstack/angular-query-experimental';

import type { AuthResponse, LoginRequest, RegisterRequest } from '@core/api/models';
import { queryKeys } from '@core/api/query-keys';
import { AuthStore } from '@core/auth/auth.store';

import { AuthApi } from './auth.api';

export function injectLogin() {
  const api = inject(AuthApi);
  const auth = inject(AuthStore);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (body: LoginRequest) => api.login(body),
    onSuccess: (result: AuthResponse) => {
      auth.setSession(result.token, result.user);
      queryClient.setQueryData(queryKeys.auth.me(), result.user);
    },
    meta: { suppressGlobalError: true },
  }));
}

export function injectRegister() {
  const api = inject(AuthApi);
  const auth = inject(AuthStore);
  const queryClient = injectQueryClient();
  return injectMutation(() => ({
    mutationFn: (body: RegisterRequest) => api.register(body),
    onSuccess: (result: AuthResponse) => {
      auth.setSession(result.token, result.user);
      queryClient.setQueryData(queryKeys.auth.me(), result.user);
    },
    meta: { suppressGlobalError: true },
  }));
}
