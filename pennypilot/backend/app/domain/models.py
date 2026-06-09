"""Domain data shapes (Pydantic). Pure data — no FastAPI/HTTP imports."""
from pydantic import BaseModel


class BudgetStatus(BaseModel):
    totalBudget: float
    spent: float
    remaining: float


class ExpenseResult(BaseModel):
    approved: bool
    remaining: float
    spent: float
