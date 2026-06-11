import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { toast } from 'svelte-sonner';
import { api } from '$lib/api/client';
import { ApiError } from '$lib/api/ApiError';
import { queryKeys } from '$lib/api/queryKeys';
import { dataOf } from '$lib/api/unwrap';
import type { Budget, BudgetCreateBody, BudgetUpdateBody, Envelope } from '$lib/api/models';
import { budgetsApi } from './api';

export function createBudgetMutation() {
  const qc = useQueryClient();
  return createMutation<Budget, unknown, BudgetCreateBody>(() => ({
    mutationFn: async (input) => {
      const { categories = [], ...body } = input;
      const budget = await budgetsApi.create(body).then(dataOf);
      for (const cat of categories) {
        if (!cat.name) continue;
        try {
          await api.post<Envelope<unknown>>(`/api/budgets/${budget.id}/categories`, {
            name: cat.name,
            allocated_amount: cat.allocated_amount || '0.00'
          });
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'could not be added';
          toast.warning(`Category "${cat.name}" ${message}`);
        }
      }
      return budget;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.budgets.all }),
    meta: { suppressGlobalError: true }
  }));
}

export function updateBudgetMutation(id: string) {
  const qc = useQueryClient();
  return createMutation<Budget, unknown, BudgetUpdateBody>(() => ({
    mutationFn: (body) => budgetsApi.update(id, body).then(dataOf),
    onSuccess: (budget) => {
      qc.setQueryData(queryKeys.budgets.detail(id), budget);
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
      qc.invalidateQueries({ queryKey: queryKeys.budgets.status(id) });
    },
    meta: { suppressGlobalError: true }
  }));
}

export function closeBudgetMutation(id: string) {
  const qc = useQueryClient();
  return createMutation<Budget, unknown, void>(() => ({
    mutationFn: () => budgetsApi.close(id).then(dataOf),
    onSuccess: (budget) => {
      qc.setQueryData(queryKeys.budgets.detail(id), budget);
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
      toast.success('Budget closed.');
    },
    meta: { suppressGlobalError: true }
  }));
}

export function deleteBudgetMutation() {
  const qc = useQueryClient();
  return createMutation<{ id: string; deleted: boolean }, unknown, string>(() => ({
    mutationFn: (id) => budgetsApi.remove(id).then(dataOf),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.budgets.all });
      toast.success('Budget deleted.');
    },
    meta: { suppressGlobalError: true }
  }));
}
