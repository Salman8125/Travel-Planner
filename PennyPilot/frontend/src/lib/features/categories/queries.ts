import { createQuery } from '@tanstack/svelte-query';
import { queryKeys } from '$lib/api/queryKeys';
import { dataOf } from '$lib/api/unwrap';
import { categoriesApi } from './api';

export function categoriesQuery(getBudgetId: () => string) {
  return createQuery(() => ({
    queryKey: queryKeys.categories.byBudget(getBudgetId()),
    queryFn: () => categoriesApi.list(getBudgetId()).then(dataOf)
  }));
}
