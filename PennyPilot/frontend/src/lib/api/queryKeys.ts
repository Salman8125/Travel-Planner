export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const
  },
  budgets: {
    all: ['budgets'] as const,
    list: (params: unknown) => ['budgets', 'list', params] as const,
    detail: (id: string) => ['budgets', 'detail', id] as const,
    status: (id: string) => ['budgets', 'detail', id, 'status'] as const
  },
  categories: {
    byBudget: (budgetId: string) => ['budgets', 'detail', budgetId, 'categories'] as const
  },
  expenses: {
    list: (budgetId: string, params: unknown) =>
      ['budgets', 'detail', budgetId, 'expenses', params] as const,
    detail: (id: string) => ['expenses', 'detail', id] as const
  },
  check: (budgetId: string, body: unknown) => ['budgets', 'detail', budgetId, 'check', body] as const
} as const;
