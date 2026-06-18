import { useMutation } from '@tanstack/solid-query';
import { authStore } from '@/lib/stores/auth.store';
import type { LoginRequest, RegisterRequest } from '@/lib/api/models';
import { authApi } from './api';

export function useLogin() {
  return useMutation(() => ({
    mutationFn: (body: LoginRequest) => authApi.login(body),
    onSuccess: (res) => authStore.setSession(res.token, res.user),
    meta: { suppressGlobalError: true },
  }));
}

export function useRegister() {
  return useMutation(() => ({
    mutationFn: (body: RegisterRequest) => authApi.register(body),
    onSuccess: (res) => authStore.setSession(res.token, res.user),
    meta: { suppressGlobalError: true },
  }));
}
