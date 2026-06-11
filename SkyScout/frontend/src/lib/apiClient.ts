import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { useAuthStore } from "@/store/authStore";
import type { PaginationMeta } from "@/types/app";

import { ApiError } from "./ApiError";

export const http = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 20_000,
});

http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const apiError = ApiError.fromAxios(error);
    const url = error.config?.url ?? "";
    if (apiError.status === 401 && !url.includes("/api/auth/")) {
      useAuthStore.getState().clearSession();
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
