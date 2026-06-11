from dataclasses import dataclass
from decimal import Decimal


@dataclass(frozen=True)
class ExpenseEvaluation:
    approved: bool
    spent: Decimal
    remaining: Decimal
    would_overspend: bool


def evaluate(
    total_amount: Decimal,
    spent_amount: Decimal,
    amount: Decimal,
    allow_overspend: bool,
) -> ExpenseEvaluation:
    new_spent = spent_amount + amount
    would_overspend = new_spent > total_amount
    approved = (not would_overspend) or allow_overspend
    projected = new_spent if approved else spent_amount
    return ExpenseEvaluation(
        approved=approved,
        spent=projected,
        remaining=total_amount - projected,
        would_overspend=would_overspend,
    )
