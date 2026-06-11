import { createQuery } from '@tanstack/svelte-query';
import { queryKeys } from '$lib/api/queryKeys';
import { dataOf, listOf } from '$lib/api/unwrap';
import { budgetsApi, type BudgetListParams } from './api';

export function budgetsQuery(getParams: () => BudgetListParams) {
  return createQuery(() => ({
    queryKey: queryKeys.budgets.list(getParams()),
    queryFn: () => budgetsApi.list(getParams()).then(listOf),
    placeholderData: (prev) => prev
  }));
}

export function budgetQuery(getId: () => string) {
  return createQuery(() => ({
    queryKey: queryKeys.budgets.detail(getId()),
    queryFn: () => budgetsApi.get(getId()).then(dataOf)
  }));
}

export function budgetStatusQuery(getId: () => string) {
  return createQuery(() => ({
    queryKey: queryKeys.budgets.status(getId()),
    queryFn: () => budgetsApi.status(getId()).then(dataOf)
  }));
}
