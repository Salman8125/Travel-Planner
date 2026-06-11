# PennyPilot (budget) contract

Product: **PennyPilot** — budget & expense management. Backend stack: **Python + Django + Django REST
Framework + PostgreSQL**. Published port: **4003** (gunicorn serves `:8000` in-container).

> Production-grade REST API (this replaces the old mock `POST /set_budget` surface). Base path `/api`.
> Success responses use `{ data, meta? }`; errors use `{ error: { code, message, details?, requestId } }`.
> Money is a 2-decimal **string** with an ISO `currency`. Authenticated routes use a **JWT bearer** token
> (access + refresh). Interactive docs live at **`/docs`** (raw spec at **`/schema`**) and are the source
> of truth for exact shapes. All business logic lives in a transport-agnostic **service/selector layer**
> (A2A-ready). This backend does NOT call any other backend.

## Auth (JWT bearer)
- `POST /api/auth/register` `{ email, password }` → 201 `{ access, refresh, user }`
- `POST /api/auth/login` `{ email, password }` → 200 `{ access, refresh, user }`
- `POST /api/auth/refresh` `{ refresh }` → 200 `{ access }`
- `GET  /api/auth/me` (bearer) → 200 `{ id, email, role }`

Send `Authorization: Bearer <access>` on authenticated routes. Login returns a generic `401` for both a
wrong password and an unknown email (no email-existence leak). Auth endpoints are throttled harder (10/min).

## Budgets (owner-scoped; admin sees all)
- `POST /api/budgets` — create `{ name, total_amount, currency, period, start_date, end_date?, allow_overspend? }`.
- `GET  /api/budgets` — list own (paginated; filter `status|currency|period`; `ordering`).
- `GET  /api/budgets/:id` — detail (404 if not owner / soft-deleted).
- `PATCH /api/budgets/:id` — update name / total_amount / allow_overspend / period / dates.
- `POST /api/budgets/:id/close` — set `CLOSED` (no further expenses).
- `DELETE /api/budgets/:id` — **409 `budget_has_expenses`** if expenses exist, else soft-delete.
- `GET  /api/budgets/:id/status` — computed BudgetStatus.
- `POST /api/budgets/:id/check` — preview `{ amount, currency?, category_id? }` → `{ approved, spent,
  remaining, wouldOverspend, reason? }` **without committing**.

## Categories (optional allocation buckets)
- `GET/POST /api/budgets/:id/categories` · `PATCH/DELETE /api/categories/:id`. Unique `(budget, name)`;
  the sum of a budget's allocations must stay ≤ the budget total.

## Expenses (the transactional path)
- `POST /api/budgets/:id/expenses` — record `{ amount, currency?, date, description?, category_id? }`;
  supports an `Idempotency-Key` header (replay returns the original expense, **200**). The critical path:
  row-locked budget (`SELECT … FOR UPDATE`) → remaining check → write Expense → bump `spent_amount`, all
  atomically. Over budget → **409 `insufficient_funds`** (unless `allow_overspend`); the budget never goes
  negative. 201 (or 200 on replay).
- `GET  /api/budgets/:id/expenses` — list (paginated; filter `status|category|date_from|date_to`).
- `GET  /api/expenses/:id` — detail.
- `PATCH /api/expenses/:id` — edit amount / description / date / category — re-validated under lock.
- `POST /api/expenses/:id/void` — reverse; returns the amount to remaining; double-void is idempotent (200).

## Business rules
Strict overspend by default (`allow_overspend` permits it and flags `overspent`). Expense currency MUST
equal the budget currency (else 400). A category must belong to the budget; per-category allocations are
enforced. Expense date must fall within the budget period when `end_date` is set. Closed budgets reject
new/edited expenses (409). Two concurrent expenses for the last funds → exactly one 201, the other 409,
balance never negative.

## Data shapes (full schemas at `/schema`)
- **Budget** `{ id, name, total_amount, spent_amount, remaining, currency, period (ONE_TIME|WEEKLY|MONTHLY|
  YEARLY), start_date, end_date?, status (ACTIVE|CLOSED), allow_overspend, created_at, updated_at }`
- **Category** `{ id, budget, name, allocated_amount }`
- **Expense** `{ id, budget, category?, category_name?, description, amount, currency, date,
  status (RECORDED|VOIDED), overspent, created_at, updated_at }`
- **BudgetStatus** `{ totalBudget, spent, remaining, currency, perCategory: [{ category, categoryId,
  allocated, spent, remaining }] }`

## Ops
- `GET /health` (liveness) · `GET /ready` (DB ping; 503 if down) · `GET /docs` (Swagger UI) · `GET /schema`
- Django admin at **`/admin`** (seeded `admin@pennypilot.dev` / `admin12345`).

## Notes
- Seeded dev accounts: `admin@pennypilot.dev` / `admin12345` (ADMIN), `user@pennypilot.dev` / `user12345` (USER).
- The Svelte frontend is **pending rebuild** against this REST API; the old mock `/set_budget` shape is retired.
