import { createMutation, useQueryClient, type QueryClient } from '@tanstack/svelte-query';
import { toast } from 'svelte-sonner';
import { queryKeys } from '$lib/api/queryKeys';
import { dataOf } from '$lib/api/unwrap';
import type { Expense, ExpenseCreateBody, ExpenseUpdateBody, PaginationMeta } from '$lib/api/models';
import { expensesApi } from './api';

interface ListCache {
  items: Expense[];
  meta: PaginationMeta;
}

function invalidateExpenseViews(qc: QueryClient, budgetId: string) {
  qc.invalidateQueries({ queryKey: ['budgets', 'detail', budgetId, 'expenses'] });
  qc.invalidateQueries({ queryKey: queryKeys.budgets.status(budgetId) });
  qc.invalidateQueries({ queryKey: queryKeys.budgets.detail(budgetId) });
}

export function recordExpenseMutation(budgetId: string) {
  const qc = useQueryClient();
  return createMutation<Expense, unknown, { body: ExpenseCreateBody; idempotencyKey?: string }>(() => ({
    mutationFn: ({ body, idempotencyKey }) =>
      expensesApi.record(budgetId, body, idempotencyKey).then(dataOf),
    onSuccess: () => invalidateExpenseViews(qc, budgetId),
    meta: { suppressGlobalError: true }
  }));
}

export function updateExpenseMutation(budgetId: string) {
  const qc = useQueryClient();
  return createMutation<Expense, unknown, { id: string; body: ExpenseUpdateBody }>(() => ({
    mutationFn: ({ id, body }) => expensesApi.update(id, body).then(dataOf),
    onSuccess: () => invalidateExpenseViews(qc, budgetId),
    meta: { suppressGlobalError: true }
  }));
}

export function voidExpenseMutation(budgetId: string) {
  const qc = useQueryClient();
  const listKey = ['budgets', 'detail', budgetId, 'expenses'];
  return createMutation<Expense, unknown, string, { snapshots: [readonly unknown[], unknown][] }>(
    () => ({
      mutationFn: (id) => expensesApi.void(id).then(dataOf),
      onMutate: async (id) => {
        await qc.cancelQueries({ queryKey: listKey });
        const snapshots = qc.getQueriesData({ queryKey: listKey });
        qc.setQueriesData({ queryKey: listKey }, (old: ListCache | undefined) => {
          if (!old?.items) return old;
          return {
            ...old,
            items: old.items.map((e) =>
              e.id === id ? { ...e, status: 'VOIDED' as const } : e
            )
          };
        });
        return { snapshots };
      },
      onError: (_err, _id, ctx) => {
        ctx?.snapshots.forEach(([key, data]) => qc.setQueryData(key, data));
        toast.error('Could not void the expense. Please try again.');
      },
      onSuccess: () => toast.success('Expense voided. Funds returned.'),
      onSettled: () => invalidateExpenseViews(qc, budgetId)
    })
  );
}
