import { api } from '$lib/api/client';
import type { Category, CategoryCreateBody, CategoryUpdateBody, Envelope } from '$lib/api/models';

export const categoriesApi = {
  list: (budgetId: string) =>
    api.get<Envelope<Category[]>>(`/api/budgets/${budgetId}/categories`),

  create: (budgetId: string, body: CategoryCreateBody) =>
    api.post<Envelope<Category>>(`/api/budgets/${budgetId}/categories`, body),

  update: (id: string, body: CategoryUpdateBody) =>
    api.patch<Envelope<Category>>(`/api/categories/${id}`, body),

  remove: (id: string) => api.del<void>(`/api/categories/${id}`)
};
