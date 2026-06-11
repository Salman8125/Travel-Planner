import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from decimal import Decimal

import pytest
from django.db import connections
from django.db.models import Sum

from apps.accounts.tests.factories import UserFactory
from apps.budgets import services
from apps.budgets.enums import ExpenseStatus
from apps.budgets.models import Expense
from apps.budgets.tests.factories import BudgetFactory
from core import exceptions as ex

D = Decimal


def _expense(amount, description):
    return {
        "amount": D(amount),
        "currency": "USD",
        "category_id": None,
        "date": date(2026, 2, 1),
        "description": description,
    }


@pytest.mark.django_db(transaction=True)
def test_concurrent_last_funds_one_winner():
    user = UserFactory()
    budget = BudgetFactory(user=user, total_amount=D("100.00"), spent_amount=D("0.00"), allow_overspend=False)
    n = 10
    barrier = threading.Barrier(n)
    results = []
    lock = threading.Lock()

    def attempt(i):
        barrier.wait()
        try:
            services.record_expense(user=user, budget_id=budget.id, data=_expense("100.00", f"r{i}"))
            with lock:
                results.append("ok")
        except ex.Conflict as exc:
            with lock:
                results.append(exc.code)
        finally:
            connections.close_all()

    with ThreadPoolExecutor(max_workers=n) as pool:
        list(pool.map(attempt, range(n)))

    assert results.count("ok") == 1
    assert results.count("insufficient_funds") == n - 1
    budget.refresh_from_db()
    assert budget.spent_amount == D("100.00")
    recorded = budget.expenses.filter(status=ExpenseStatus.RECORDED).aggregate(s=Sum("amount"))["s"] or D("0.00")
    assert recorded == budget.spent_amount


@pytest.mark.django_db(transaction=True)
def test_concurrent_same_idempotency_key_creates_one_row():
    user = UserFactory()
    budget = BudgetFactory(user=user, total_amount=D("1000.00"))
    n = 5
    barrier = threading.Barrier(n)
    lock = threading.Lock()
    seen = []

    def attempt(i):
        barrier.wait()
        try:
            expense, _ = services.record_expense(
                user=user, budget_id=budget.id, data=_expense("10.00", "x"), idempotency_key="same-key"
            )
            with lock:
                seen.append(expense.id)
        except ex.Conflict:
            pass
        finally:
            connections.close_all()

    with ThreadPoolExecutor(max_workers=n) as pool:
        list(pool.map(attempt, range(n)))

    assert Expense.objects.filter(budget=budget).count() == 1
    budget.refresh_from_db()
    assert budget.spent_amount == D("10.00")
