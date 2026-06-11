import { createQuery } from '@tanstack/svelte-query';
import { queryKeys } from '$lib/api/queryKeys';
import { dataOf, listOf } from '$lib/api/unwrap';
import type { CheckBody } from '$lib/api/models';
import { expensesApi, type ExpenseListParams } from './api';

export function expensesQuery(getBudgetId: () => string, getParams: () => ExpenseListParams) {
  return createQuery(() => ({
    queryKey: queryKeys.expenses.list(getBudgetId(), getParams()),
    queryFn: () => expensesApi.list(getBudgetId(), getParams()).then(listOf),
    placeholderData: (prev) => prev
  }));
}

export function expenseQuery(getId: () => string) {
  return createQuery(() => ({
    queryKey: queryKeys.expenses.detail(getId()),
    queryFn: () => expensesApi.get(getId()).then(dataOf)
  }));
}

export function checkPreviewQuery(getBudgetId: () => string, getBody: () => CheckBody | null) {
  return createQuery(() => ({
    queryKey: queryKeys.check(getBudgetId(), getBody()),
    queryFn: ({ signal }) =>
      expensesApi.check(getBudgetId(), getBody() as CheckBody, signal).then(dataOf),
    enabled: getBody() !== null,
    placeholderData: (prev) => prev,
    staleTime: 0,
    meta: { suppressGlobalError: true }
  }));
}
