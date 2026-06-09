"""HTTP layer — thin FastAPI app. One POST endpoint per skill: parse body -> domain -> JSON.

Permissive CORS (dev only) so browser frontends on localhost can call cross-origin.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.domain.budget import BudgetEngine
from app.domain.models import BudgetStatus, ExpenseResult

app = FastAPI(title="pennypilot-backend")

# Dev-only CORS: allow any origin; handles the OPTIONS preflight.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["Content-Type"],
)

# Single shared in-memory engine (run a single worker — see Dockerfile).
engine = BudgetEngine()


class SetBudgetRequest(BaseModel):
    totalBudget: float


class CheckExpenseRequest(BaseModel):
    amount: float


@app.post("/set_budget", response_model=BudgetStatus)
def set_budget(req: SetBudgetRequest) -> BudgetStatus:
    return engine.set_budget(req.totalBudget)


@app.post("/check_expense", response_model=ExpenseResult)
def check_expense(req: CheckExpenseRequest) -> ExpenseResult:
    return engine.check_expense(req.amount)


@app.post("/get_remaining_budget", response_model=BudgetStatus)
def get_remaining_budget() -> BudgetStatus:
    return engine.status()


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}
