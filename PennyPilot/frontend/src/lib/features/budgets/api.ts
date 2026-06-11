import { api } from '$lib/api/client';
import type {
  Budget,
  BudgetCreateBody,
  BudgetStatus,
  BudgetUpdateBody,
  CheckBody,
  CheckResult,
  Envelope,
  PaginatedEnvelope
} from '$lib/api/models';

export interface BudgetListParams {
  page?: number;
  pageSize?: number;
  status?: string;
  currency?: string;
  period?: string;
  ordering?: string;
}

export const budgetsApi = {
  list: (params: BudgetListParams) =>
    api.get<PaginatedEnvelope<Budget>>('/api/budgets', { query: { ...params } }),

  get: (id: string) => api.get<Envelope<Budget>>(`/api/budgets/${id}`),

  status: (id: string) => api.get<Envelope<BudgetStatus>>(`/api/budgets/${id}/status`),

  create: (body: Omit<BudgetCreateBody, 'categories'>) =>
    api.post<Envelope<Budget>>('/api/budgets', body),

  update: (id: string, body: BudgetUpdateBody) =>
    api.patch<Envelope<Budget>>(`/api/budgets/${id}`, body),

  close: (id: string) => api.post<Envelope<Budget>>(`/api/budgets/${id}/close`, {}),

  remove: (id: string) =>
    api.del<Envelope<{ id: string; deleted: boolean }>>(`/api/budgets/${id}`),

  check: (id: string, body: CheckBody, signal?: AbortSignal) =>
    api.post<Envelope<CheckResult>>(`/api/budgets/${id}/check`, body, { signal })
};
