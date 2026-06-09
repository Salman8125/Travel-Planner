"""Budget domain layer — pure business logic with in-memory state. No FastAPI/HTTP imports.

STATEFUL: the BudgetEngine holds the budget in memory. A later A2A phase wraps these methods
directly. The HTTP layer creates exactly ONE engine instance and runs a single worker so the
state stays consistent (state resets on process restart — acceptable for the demo).
"""
from .models import BudgetStatus, ExpenseResult


class BudgetEngine:
    def __init__(self) -> None:
        self._total: float = 0.0
        self._spent: float = 0.0

    def set_budget(self, total_budget: float) -> BudgetStatus:
        """Set (or reset) the total budget; resets spent to 0."""
        self._total = float(total_budget)
        self._spent = 0.0
        return self.status()

    def check_expense(self, amount: float) -> ExpenseResult:
        """Approve iff amount <= remaining. If approved, add to spent; else leave unchanged."""
        amount = float(amount)
        approved = amount <= self.remaining
        if approved:
            self._spent += amount
        return ExpenseResult(approved=approved, remaining=self.remaining, spent=self._spent)

    def status(self) -> BudgetStatus:
        return BudgetStatus(totalBudget=self._total, spent=self._spent, remaining=self.remaining)

    @property
    def remaining(self) -> float:
        return self._total - self._spent
