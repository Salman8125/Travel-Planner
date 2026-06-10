# PennyPilot (budget) contract

Product: **PennyPilot** — budget tracking. Backend stack: **Python + Django + Django REST
Framework**, backed by **PostgreSQL**. Published port: **4003**.

> Language-neutral contract. Budgets are **persisted per user** in Postgres (no longer in-memory)
> and survive restarts. Endpoints are protected with **DRF Token authentication**. The pure
> budget rules live in a framework-agnostic domain layer (`budget/domain.py`) so the later A2A
> phase can wrap them. NO shared code package; does NOT call any other backend.

## Authentication

Token-based. Register or log in to obtain a token, then send it on every budget call:

```
Authorization: Token <token>
```

### POST /register
Create a user and return a token.
```json
// request
{ "username": "alice", "password": "s3cretpw123" }
// response 201
{ "token": "c7c1d66c09283afa06b1b22c116912ed", "username": "alice" }
```
Errors: `400` if username/password missing or username already taken.

### POST /login
Authenticate and return the user's token.
```json
// request
{ "username": "alice", "password": "s3cretpw123" }
// response 200
{ "token": "c7c1d66c09283afa06b1b22c116912ed", "username": "alice" }
```
Errors: `401` on invalid credentials.

All budget endpoints below return `401` if the `Authorization: Token <token>` header is missing
or invalid. Each user has their own budget + expense history.

## Data shapes

### BudgetStatus
| field       | type   | notes                       |
|-------------|--------|-----------------------------|
| totalBudget | number | total budget set (USD)      |
| spent       | number | cumulative approved spend   |
| remaining   | number | `totalBudget - spent`       |

### ExpenseResult (response of check_expense)
| field     | type    | notes                                   |
|-----------|---------|-----------------------------------------|
| approved  | boolean | true iff `amount <= remaining`          |
| remaining | number  | remaining AFTER applying (if approved)  |
| spent     | number  | cumulative spend AFTER applying         |

## Endpoints (all require the auth token)

### POST /set_budget
Set (or reset) the current user's total budget. Clears their expenses, so `spent` resets to 0.
```json
// request                          // response: BudgetStatus
{ "totalBudget": 5000 }             { "totalBudget": 5000.0, "spent": 0.0, "remaining": 5000.0 }
```

### POST /check_expense
Attempt to record an expense for the current user. Approved iff `amount <= remaining`; if
approved, `spent` increases. The attempt is stored (approved or rejected) for history.
```json
// request                          // response: ExpenseResult
{ "amount": 1200 }                  { "approved": true, "remaining": 3800.0, "spent": 1200.0 }
```

### POST /get_remaining_budget
Return the current user's budget status.
```json
// request: {}                      // response: BudgetStatus
                                    { "totalBudget": 5000.0, "spent": 1200.0, "remaining": 3800.0 }
```

## Admin

Django admin is enabled at **`/admin`** (default superuser `admin` / `admin`, set via env) for
inspecting users, budgets, and expenses.

## CORS
Permissive (dev only): any origin, allows the `Authorization` + `Content-Type` headers. Token
auth means no cookies, so allow-all-origins is safe here.
