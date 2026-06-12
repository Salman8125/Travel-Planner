import { useMutation, useQueryClient } from "@tanstack/vue-query";

import type { AuthResult, Credentials } from "@/lib/api/models";
import { queryKeys } from "@/lib/api/query-keys";
import { useAuthStore } from "@/stores/auth";

import { login, register } from "./api";

function useAuthMutation(mutationFn: (body: Credentials) => Promise<AuthResult>) {
  const auth = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (result) => {
      auth.setSession(result.token, result.user);
      queryClient.setQueryData(queryKeys.auth.me, result.user);
    },
    meta: { suppressGlobalError: true },
  });
}

export function useLogin() {
  return useAuthMutation(login);
}

export function useRegister() {
  return useAuthMutation(register);
}
