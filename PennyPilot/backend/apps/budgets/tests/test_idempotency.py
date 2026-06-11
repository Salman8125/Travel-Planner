from datetime import date
from decimal import Decimal

import pytest

from apps.budgets import services
from apps.budgets.models import Expense
from apps.budgets.tests.factories import BudgetFactory

pytestmark = pytest.mark.django_db

D = Decimal


def test_idempotent_replay_returns_same_expense_once():
    budget = BudgetFactory(total_amount=D("100.00"))
    data = {"amount": D("30.00"), "currency": "USD", "category_id": None, "date": date(2026, 2, 1), "description": "x"}

    first, replayed_first = services.record_expense(
        user=budget.user, budget_id=budget.id, data=data, idempotency_key="k1"
    )
    second, replayed_second = services.record_expense(
        user=budget.user, budget_id=budget.id, data=data, idempotency_key="k1"
    )

    assert replayed_first is False
    assert replayed_second is True
    assert first.id == second.id
    assert Expense.objects.filter(budget=budget).count() == 1
    budget.refresh_from_db()
    assert budget.spent_amount == D("30.00")
