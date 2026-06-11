from decimal import Decimal

from django.db.models import Sum

from core import exceptions as ex

from .enums import ExpenseStatus
from .models import Budget, Expense


def list_budgets(*, user, is_admin: bool = False):
    qs = Budget.objects.alive().select_related("user")
    if not is_admin:
        qs = qs.filter(user=user)
    return qs


def get_budget(*, user, budget_id, is_admin: bool = False) -> Budget:
    qs = Budget.objects.alive()
    if not is_admin:
        qs = qs.filter(user=user)
    budget = qs.filter(pk=budget_id).first()
    if budget is None:
        raise ex.NotFound("Budget not found")
    return budget


def get_budget_status(*, user, budget_id, is_admin: bool = False) -> dict:
    budget = get_budget(user=user, budget_id=budget_id, is_admin=is_admin)
    per_category = []
    for category in budget.categories.all():
        spent = category.expenses.filter(status=ExpenseStatus.RECORDED).aggregate(s=Sum("amount"))["s"] or Decimal(
            "0.00"
        )
        per_category.append(
            {
                "category": category.name,
                "categoryId": str(category.id),
                "allocated": category.allocated_amount,
                "spent": spent,
                "remaining": category.allocated_amount - spent,
            }
        )
    return {
        "totalBudget": budget.total_amount,
        "spent": budget.spent_amount,
        "remaining": budget.remaining,
        "currency": budget.currency,
        "perCategory": per_category,
    }


def find_expense_by_idempotency_key(*, user, key: str) -> Expense | None:
    return (
        Expense.objects.select_related("budget", "category")
        .filter(idempotency_key=key, budget__user=user)
        .first()
    )


def list_expenses(*, user, budget_id, is_admin: bool = False):
    budget = get_budget(user=user, budget_id=budget_id, is_admin=is_admin)
    return budget.expenses.select_related("category").all()


def get_expense(*, user, expense_id, is_admin: bool = False) -> Expense:
    qs = Expense.objects.select_related("budget", "category")
    if not is_admin:
        qs = qs.filter(budget__user=user)
    expense = qs.filter(pk=expense_id, budget__deleted_at__isnull=True).first()
    if expense is None:
        raise ex.NotFound("Expense not found")
    return expense
