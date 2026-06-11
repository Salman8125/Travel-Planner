import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { toast } from 'svelte-sonner';
import { queryKeys } from '$lib/api/queryKeys';
import { dataOf } from '$lib/api/unwrap';
import type { Category, CategoryCreateBody, CategoryUpdateBody } from '$lib/api/models';
import { categoriesApi } from './api';

function invalidateBudget(qc: ReturnType<typeof useQueryClient>, budgetId: string) {
  qc.invalidateQueries({ queryKey: queryKeys.categories.byBudget(budgetId) });
  qc.invalidateQueries({ queryKey: queryKeys.budgets.status(budgetId) });
}

export function createCategoryMutation(budgetId: string) {
  const qc = useQueryClient();
  return createMutation<Category, unknown, CategoryCreateBody>(() => ({
    mutationFn: (body) => categoriesApi.create(budgetId, body).then(dataOf),
    onSuccess: () => {
      invalidateBudget(qc, budgetId);
      toast.success('Category added.');
    },
    meta: { suppressGlobalError: true }
  }));
}

export function updateCategoryMutation(budgetId: string) {
  const qc = useQueryClient();
  return createMutation<Category, unknown, { id: string; body: CategoryUpdateBody }>(() => ({
    mutationFn: ({ id, body }) => categoriesApi.update(id, body).then(dataOf),
    onSuccess: () => {
      invalidateBudget(qc, budgetId);
      toast.success('Category updated.');
    },
    meta: { suppressGlobalError: true }
  }));
}

export function deleteCategoryMutation(budgetId: string) {
  const qc = useQueryClient();
  return createMutation<void, unknown, string>(() => ({
    mutationFn: (id) => categoriesApi.remove(id),
    onSuccess: () => {
      invalidateBudget(qc, budgetId);
      toast.success('Category removed.');
    }
  }));
}
