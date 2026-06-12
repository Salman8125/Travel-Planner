import { MutationCache, QueryCache, QueryClient } from "@tanstack/vue-query";
import { toast } from "vue-sonner";

import { ApiError } from "@/lib/api/ApiError";

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.isNetwork) return failureCount < 2;
    if (error.status >= 400 && error.status < 500) return false;
  }
  return failureCount < 2;
}

function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : "Something went wrong. Please try again.";
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        refetchOnWindowFocus: false,
        retry: shouldRetry,
      },
      mutations: { retry: false },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.suppressGlobalError) return;
        if (query.state.data === undefined) return;
        toast.error(messageOf(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.suppressGlobalError) return;
        toast.error(messageOf(error));
      },
    }),
  });
}
