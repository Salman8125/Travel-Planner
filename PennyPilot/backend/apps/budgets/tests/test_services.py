from datetime import date
from decimal import Decimal

import pytest
from django.db.models import Sum

from apps.budgets import selectors, services
from apps.budgets.enums import BudgetStatus, ExpenseStatus
from apps.budgets.tests.factories import BudgetFactory, CategoryFactory
from core import exceptions as ex

pytestmark = pytest.mark.django_db

D = Decimal
EXPENSE_DATE = date(2026, 2, 1)


def expense_data(amount, currency="USD", category_id=None, edate=EXPENSE_DATE, description="x"):
    return {
        "amount": D(amount),
        "currency": currency,
        "category_id": category_id,
        "date": edate,
        "description": description,
    }


def recorded_sum(budget):
    return budget.expenses.filter(status=ExpenseStatus.RECORDED).aggregate(s=Sum("amount"))["s"] or D("0.00")


def test_record_expense_decrements_and_reconciles():
    budget = BudgetFactory(total_amount=D("100.00"))
    expense, replayed = services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("30.00"))
    assert replayed is False
    budget.refresh_from_db()
    assert budget.spent_amount == D("30.00")
    assert budget.remaining == D("70.00")
    assert recorded_sum(budget) == budget.spent_amount


def test_overspend_strict_rejected():
    budget = BudgetFactory(total_amount=D("100.00"), allow_overspend=False)
    with pytest.raises(ex.Conflict) as exc:
        services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("150.00"))
    assert exc.value.code == "insufficient_funds"
    budget.refresh_from_db()
    assert budget.spent_amount == D("0.00")


def test_overspend_allowed_flags_overspent():
    budget = BudgetFactory(total_amount=D("100.00"), allow_overspend=True)
    expense, _ = services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("150.00"))
    assert expense.overspent is True
    budget.refresh_from_db()
    assert budget.spent_amount == D("150.00")


def test_currency_mismatch_rejected():
    budget = BudgetFactory(currency="USD")
    with pytest.raises(ex.ValidationError):
        services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("10.00", currency="EUR"))


def test_closed_budget_rejected():
    budget = BudgetFactory(status=BudgetStatus.CLOSED)
    with pytest.raises(ex.Conflict) as exc:
        services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("10.00"))
    assert exc.value.code == "budget_closed"


def test_foreign_category_rejected():
    budget = BudgetFactory()
    foreign = CategoryFactory()
    with pytest.raises(ex.ValidationError):
        services.record_expense(
            user=budget.user, budget_id=budget.id, data=expense_data("10.00", category_id=foreign.id)
        )


def test_category_allocation_enforced():
    budget = BudgetFactory(total_amount=D("1000.00"))
    category = CategoryFactory(budget=budget, allocated_amount=D("50.00"))
    services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("40.00", category_id=category.id))
    with pytest.raises(ex.Conflict) as exc:
        services.record_expense(
            user=budget.user, budget_id=budget.id, data=expense_data("20.00", category_id=category.id)
        )
    assert exc.value.code == "category_allocation_exceeded"


def test_date_out_of_period_rejected():
    budget = BudgetFactory(start_date=date(2026, 1, 1), end_date=date(2026, 1, 31))
    with pytest.raises(ex.ValidationError):
        services.record_expense(
            user=budget.user, budget_id=budget.id, data=expense_data("10.00", edate=date(2026, 2, 15))
        )


def test_void_refunds_and_idempotent():
    budget = BudgetFactory(total_amount=D("100.00"))
    expense, _ = services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("40.00"))
    voided = services.void_expense(user=budget.user, expense_id=expense.id)
    assert voided.status == ExpenseStatus.VOIDED
    budget.refresh_from_db()
    assert budget.spent_amount == D("0.00")

    again = services.void_expense(user=budget.user, expense_id=expense.id)
    assert again.status == ExpenseStatus.VOIDED
    budget.refresh_from_db()
    assert budget.spent_amount == D("0.00")


def test_edit_revalidates_and_adjusts():
    budget = BudgetFactory(total_amount=D("100.00"))
    expense, _ = services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("40.00"))
    services.edit_expense(user=budget.user, expense_id=expense.id, data={"amount": D("70.00")})
    budget.refresh_from_db()
    assert budget.spent_amount == D("70.00")
    with pytest.raises(ex.Conflict):
        services.edit_expense(user=budget.user, expense_id=expense.id, data={"amount": D("250.00")})


def test_delete_budget_blocks_with_expenses_else_soft_deletes():
    budget = BudgetFactory(total_amount=D("100.00"))
    services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("10.00"))
    with pytest.raises(ex.Conflict) as exc:
        services.delete_budget(user=budget.user, budget_id=budget.id)
    assert exc.value.code == "budget_has_expenses"

    empty = BudgetFactory(user=budget.user)
    services.delete_budget(user=budget.user, budget_id=empty.id)
    empty.refresh_from_db()
    assert empty.deleted_at is not None


def test_preview_does_not_commit():
    budget = BudgetFactory(total_amount=D("100.00"))
    ok = services.preview_expense(user=budget.user, budget_id=budget.id, data={"amount": D("40.00"), "currency": "USD"})
    assert ok["approved"] is True
    assert ok["remaining"] == D("60.00")
    over = services.preview_expense(
        user=budget.user, budget_id=budget.id, data={"amount": D("200.00"), "currency": "USD"}
    )
    assert over["approved"] is False
    assert over["reason"] == "insufficient_funds"
    budget.refresh_from_db()
    assert budget.spent_amount == D("0.00")


def test_get_status_per_category():
    budget = BudgetFactory(total_amount=D("1000.00"))
    food = CategoryFactory(budget=budget, name="Food", allocated_amount=D("500.00"))
    services.record_expense(user=budget.user, budget_id=budget.id, data=expense_data("120.00", category_id=food.id))
    status = selectors.get_budget_status(user=budget.user, budget_id=budget.id)
    assert status["spent"] == D("120.00")
    assert status["remaining"] == D("880.00")
    food_status = next(c for c in status["perCategory"] if c["category"] == "Food")
    assert food_status["spent"] == D("120.00")
    assert food_status["remaining"] == D("380.00")
