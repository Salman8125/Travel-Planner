import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { useAuthStore } from "@/store/authStore";
import type { AuthResult } from "@/types/app";

import * as authApi from "./api";
import type { LoginInput, RegisterInput } from "./schemas";

export function useLogin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation<AuthResult, unknown, LoginInput>({
    mutationFn: authApi.login,
    meta: { suppressGlobalError: true },
    onSuccess: (res) => setSession(res.token, res.user),
  });
}

export function useRegister() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation<AuthResult, unknown, RegisterInput>({
    mutationFn: authApi.register,
    meta: { suppressGlobalError: true },
    onSuccess: (res) => setSession(res.token, res.user),
  });
}

export function useLogout(): () => void {
  const clearSession = useAuthStore((s) => s.clearSession);
  const queryClient = useQueryClient();
  return useCallback(() => {
    clearSession();
    queryClient.clear();
  }, [clearSession, queryClient]);
}
