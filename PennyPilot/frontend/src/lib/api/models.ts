import type { components } from './types';

type Schemas = components['schemas'];

export type Role = 'USER' | 'ADMIN';
export type Period = Schemas['PeriodEnum'];
export type BudgetState = Schemas['BudgetStatusEnum'];
export type ExpenseState = Schemas['ExpenseStatusEnum'];

export type Money = string | number;

export type User = Omit<Schemas['User'], 'role'> & { role: Role };
export type Budget = Schemas['Budget'];
export type Category = Schemas['Category'];
export type Expense = Schemas['Expense'];
export type BudgetStatus = Schemas['BudgetStatus'];
export type PerCategoryStatus = Schemas['PerCategoryStatus'];
export type CheckResult = Schemas['CheckResult'];

export interface AuthResult {
  access: string;
  refresh: string;
  user: User;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Envelope<T> {
  data: T;
}

export interface PaginatedEnvelope<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface BudgetCreateBody {
  name: string;
  total_amount: string;
  currency: string;
  period: Period;
  start_date: string;
  end_date?: string | null;
  allow_overspend: boolean;
  categories?: { name: string; allocated_amount: string }[];
}

export type BudgetUpdateBody = Schemas['PatchedBudgetUpdateRequest'];

export interface CategoryCreateBody {
  name: string;
  allocated_amount: string;
}

export type CategoryUpdateBody = Schemas['PatchedCategoryUpdateRequest'];

export interface ExpenseCreateBody {
  amount: string;
  date: string;
  description?: string;
  currency?: string;
  category_id?: string | null;
}

export type ExpenseUpdateBody = Schemas['PatchedExpenseUpdateRequest'];

export interface CheckBody {
  amount: string;
  currency?: string;
  category_id?: string | null;
}

export const PERIODS: Period[] = ['ONE_TIME', 'WEEKLY', 'MONTHLY', 'YEARLY'];

export const PERIOD_LABELS: Record<Period, string> = {
  ONE_TIME: 'One-time',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  YEARLY: 'Yearly'
};

export const BUDGET_STATES: BudgetState[] = ['ACTIVE', 'CLOSED'];
export const EXPENSE_STATES: ExpenseState[] = ['RECORDED', 'VOIDED'];

export const CURRENCIES = ['USD', 'EUR', 'GBP', 'PKR', 'AED', 'JPY', 'CAD', 'AUD', 'INR'] as const;
