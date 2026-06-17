import {
  MutationCache,
  QueryCache,
  QueryClient,
} from '@tanstack/angular-query-experimental';

import { ApiError } from '@core/error/api-error';

import { notifyError } from './notifier';

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof ApiError) {
    if (error.isNetwork) return failureCount < 2;
    if (error.status >= 400 && error.status < 500) return false;
  }
  return failureCount < 2;
}

function messageOf(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong. Please try again.';
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
        if (query.meta?.['suppressGlobalError']) return;
        if (query.state.data === undefined) return;
        notifyError(messageOf(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _vars, _ctx, mutation) => {
        if (mutation.meta?.['suppressGlobalError']) return;
        notifyError(messageOf(error));
      },
    }),
  });
}
