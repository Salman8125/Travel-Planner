# PennyPilot (budget) contract

Product: **PennyPilot** — budget tracking. Backend stack: **Python + FastAPI**. Published port: **4003**.

> Language-neutral contract. **STATEFUL**: the budget is held in memory in the backend
> process (no database). State resets on container restart. Run a single worker so the
> in-memory state stays consistent. NO shared code package; does NOT call any other backend.

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

## Endpoints

### POST /set_budget
Set (or reset) the total budget. Resets `spent` to 0.

Request body:
```json
{ "totalBudget": 5000 }
```

Response: `BudgetStatus`
```json
{ "totalBudget": 5000.0, "spent": 0.0, "remaining": 5000.0 }
```

### POST /check_expense
Attempt to record an expense. Approved iff `amount <= remaining`; if approved, `spent`
increases by `amount`. If rejected, state is unchanged.

Request body:
```json
{ "amount": 1200 }
```

Response: `ExpenseResult`
```json
{ "approved": true, "remaining": 3800.0, "spent": 1200.0 }
```

### POST /get_remaining_budget
Return the current budget status.

Request body: `{}` (empty)

Response: `BudgetStatus`

## CORS
Permissive (dev only): allow any origin, methods `POST, OPTIONS`, header `Content-Type`.
