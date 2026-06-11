import { http, HttpResponse } from 'msw';
import {
  authFixture,
  budgetFixture,
  budgetStatusFixture,
  categoryFixture,
  expenseFixture,
  userFixture
} from './fixtures';

const API = 'http://localhost:4003';

function paginated<T>(items: T[]) {
  return { data: items, meta: { page: 1, pageSize: 20, total: items.length, totalPages: 1 } };
}

export const handlers = [
  http.post(`${API}/api/auth/login`, () => HttpResponse.json({ data: authFixture })),
  http.post(`${API}/api/auth/register`, () => HttpResponse.json({ data: authFixture }, { status: 201 })),
  http.post(`${API}/api/auth/refresh`, () => HttpResponse.json({ data: { access: 'access-token-2' } })),
  http.get(`${API}/api/auth/me`, () => HttpResponse.json({ data: userFixture })),

  http.get(`${API}/api/budgets`, () => HttpResponse.json(paginated([budgetFixture]))),
  http.get(`${API}/api/budgets/:id`, () => HttpResponse.json({ data: budgetFixture })),
  http.get(`${API}/api/budgets/:id/status`, () => HttpResponse.json({ data: budgetStatusFixture })),
  http.get(`${API}/api/budgets/:id/categories`, () => HttpResponse.json({ data: [categoryFixture] })),
  http.get(`${API}/api/budgets/:id/expenses`, () => HttpResponse.json(paginated([expenseFixture]))),

  http.post(`${API}/api/budgets/:id/check`, async ({ request }) => {
    const body = (await request.json()) as { amount: string };
    const amount = Number(body.amount);
    const remaining = 500 - 120 - amount;
    return HttpResponse.json({
      data: {
        approved: remaining >= 0,
        spent: (120 + amount).toFixed(2),
        remaining: remaining.toFixed(2),
        wouldOverspend: remaining < 0,
        reason: remaining < 0 ? 'insufficient_funds' : null
      }
    });
  }),

  http.post(`${API}/api/budgets/:id/expenses`, () =>
    HttpResponse.json({ data: expenseFixture }, { status: 201 })
  ),
  http.post(`${API}/api/expenses/:id/void`, () =>
    HttpResponse.json({ data: { ...expenseFixture, status: 'VOIDED' } })
  )
];
