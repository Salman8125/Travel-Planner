from datetime import date
from decimal import Decimal

import factory

from apps.accounts.tests.factories import UserFactory
from apps.budgets.models import Budget, Category


class BudgetFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Budget

    user = factory.SubFactory(UserFactory)
    name = factory.Sequence(lambda n: f"Budget {n}")
    total_amount = Decimal("1000.00")
    spent_amount = Decimal("0.00")
    currency = "USD"
    period = "MONTHLY"
    start_date = date(2026, 1, 1)


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    budget = factory.SubFactory(BudgetFactory)
    name = factory.Sequence(lambda n: f"Cat {n}")
    allocated_amount = Decimal("0.00")
