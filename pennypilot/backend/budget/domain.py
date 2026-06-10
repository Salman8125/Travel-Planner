from decimal import Decimal
from typing import NamedTuple


class ExpenseOutcome(NamedTuple):
    approved: bool
    spent: Decimal
    remaining: Decimal


def evaluate_expense(total_budget: Decimal, spent: Decimal, amount: Decimal) -> ExpenseOutcome:
    remaining_before = total_budget - spent
    approved = amount <= remaining_before
    new_spent = spent + amount if approved else spent
    return ExpenseOutcome(approved=approved, spent=new_spent, remaining=total_budget - new_spent)


def budget_status(total_budget: Decimal, spent: Decimal) -> dict:
    return {
        "totalBudget": float(total_budget),
        "spent": float(spent),
        "remaining": float(total_budget - spent),
    }
