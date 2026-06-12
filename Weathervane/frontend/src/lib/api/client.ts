import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/lib/config/env";
import { useAuthStore } from "@/stores/auth";

import { ApiError } from "./ApiError";
import type { PaginationMeta } from "./models";

export const http = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore().token;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const apiError = ApiError.fromAxios(error);
    const url = error.config?.url ?? "";
    if (apiError.status === 401 && !url.includes("/api/auth/")) {
      const auth = useAuthStore();
      const wasAuthed = auth.isAuthenticated;
      auth.clearSession();
      if (wasAuthed) {
        void import("@/app/router").then(({ router }) => {
          const current = router.currentRoute.value;
          if (!current.meta.public) {
            router.replace({ name: "login", query: { returnTo: current.fullPath } });
          }
        });
      }
    }
    return Promise.reject(apiError);
  },
);

export async function unwrap<T>(promise: Promise<AxiosResponse<{ data: T }>>): Promise<T> {
  const res = await promise;
  return res.data.data;
}

export async function unwrapList<T>(
  promise: Promise<AxiosResponse<{ data: T[]; meta: PaginationMeta }>>,
): Promise<{ data: T[]; meta: PaginationMeta }> {
  const res = await promise;
  return { data: res.data.data, meta: res.data.meta };
}
