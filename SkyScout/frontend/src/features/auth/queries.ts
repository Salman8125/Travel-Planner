import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryKeys } from "@/lib/queryKeys";
import { useAuthStore } from "@/store/authStore";

import * as authApi from "./api";

export function useAuthBootstrap(): void {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const setBootstrapped = useAuthStore((s) => s.setBootstrapped);
  const clearSession = useAuthStore((s) => s.clearSession);

  const query = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    enabled: !!token && !user,
    retry: false,
    staleTime: 5 * 60_000,
    meta: { suppressGlobalError: true },
  });

  useEffect(() => {
    if (!token) {
      setBootstrapped(true);
      return;
    }
    if (user) {
      setBootstrapped(true);
      return;
    }
    if (query.isSuccess && query.data) {
      setUser(query.data);
      setBootstrapped(true);
    } else if (query.isError) {
      clearSession();
      setBootstrapped(true);
    }
  }, [token, user, query.isSuccess, query.isError, query.data, setUser, setBootstrapped, clearSession]);
}
