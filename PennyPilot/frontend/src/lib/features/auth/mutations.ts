import { createMutation } from '@tanstack/svelte-query';
import { auth } from '$lib/stores/auth.svelte';
import type { AuthResult } from '$lib/api/models';
import { authApi } from './api';

interface Credentials {
  email: string;
  password: string;
}

export function loginMutation() {
  return createMutation<AuthResult, unknown, Credentials>(() => ({
    mutationFn: ({ email, password }) => authApi.login(email, password),
    onSuccess: (result) => auth.setSession(result),
    meta: { suppressGlobalError: true }
  }));
}

export function registerMutation() {
  return createMutation<AuthResult, unknown, Credentials>(() => ({
    mutationFn: ({ email, password }) => authApi.register(email, password),
    onSuccess: (result) => auth.setSession(result),
    meta: { suppressGlobalError: true }
  }));
}
