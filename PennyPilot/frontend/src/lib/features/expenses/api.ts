import { api } from '$lib/api/client';
import type {
  CheckBody,
  CheckResult,
  Envelope,
  Expense,
  ExpenseCreateBody,
  ExpenseUpdateBody,
  PaginatedEnvelope
} from '$lib/api/models';

export interface ExpenseListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  ordering?: string;
}

export const expensesApi = {
  list: (budgetId: string, params: ExpenseListParams) =>
    api.get<PaginatedEnvelope<Expense>>(`/api/budgets/${budgetId}/expenses`, { query: { ...params } }),

  get: (id: string) => api.get<Envelope<Expense>>(`/api/expenses/${id}`),

  record: (budgetId: string, body: ExpenseCreateBody, idempotencyKey?: string) =>
    api.post<Envelope<Expense>>(`/api/budgets/${budgetId}/expenses`, body, {
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined
    }),

  update: (id: string, body: ExpenseUpdateBody) =>
    api.patch<Envelope<Expense>>(`/api/expenses/${id}`, body),

  void: (id: string) => api.post<Envelope<Expense>>(`/api/expenses/${id}/void`, {}),

  check: (budgetId: string, body: CheckBody, signal?: AbortSignal) =>
    api.post<Envelope<CheckResult>>(`/api/budgets/${budgetId}/check`, body, { signal })
};
