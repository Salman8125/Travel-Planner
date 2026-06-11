import type { AuthResult, Budget, BudgetStatus, Category, Expense, User } from '$lib/api/models';

export const userFixture: User = {
  id: 'u-1',
  email: 'user@pennypilot.dev',
  role: 'USER'
};

export const adminFixture: User = {
  id: 'u-admin',
  email: 'admin@pennypilot.dev',
  role: 'ADMIN'
};

export const authFixture: AuthResult = {
  access: 'access-token-1',
  refresh: 'refresh-token-1',
  user: userFixture
};

export const budgetFixture: Budget = {
  id: 'b-1',
  name: 'Groceries',
  total_amount: '500.00',
  spent_amount: '120.00',
  remaining: '380.00',
  currency: 'USD',
  period: 'MONTHLY',
  start_date: '2026-01-01',
  end_date: null,
  status: 'ACTIVE',
  allow_overspend: false,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};

export const budgetStatusFixture: BudgetStatus = {
  totalBudget: '500.00',
  spent: '120.00',
  remaining: '380.00',
  currency: 'USD',
  perCategory: [
    { category: 'Food', categoryId: 'c-1', allocated: '300.00', spent: '120.00', remaining: '180.00' }
  ]
};

export const categoryFixture: Category = {
  id: 'c-1',
  budget: 'b-1',
  name: 'Food',
  allocated_amount: '300.00',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};

export const expenseFixture: Expense = {
  id: 'e-1',
  budget: 'b-1',
  category: 'c-1',
  category_name: 'Food',
  description: 'Weekly shop',
  amount: '120.00',
  currency: 'USD',
  date: '2026-01-15',
  status: 'RECORDED',
  overspent: false,
  created_at: '2026-01-15T00:00:00Z',
  updated_at: '2026-01-15T00:00:00Z'
};
