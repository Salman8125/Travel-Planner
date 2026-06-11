from datetime import date, timedelta
from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from apps.accounts.models import User
from apps.budgets import services
from apps.budgets.enums import Period


class Command(BaseCommand):
    help = "Seed a realistic demo dataset (idempotent — skips if any users exist)."

    def handle(self, *args, **options):
        if User.objects.exists():
            self.stdout.write("seed skipped (database already populated)")
            return

        with transaction.atomic():
            admin = User.objects.create_superuser(email="admin@pennypilot.dev", password="admin12345")
            user = User.objects.create_user(email="user@pennypilot.dev", password="user12345")

            today = date.today()
            month_start = today.replace(day=1)
            week_start = today - timedelta(days=today.weekday())

            self._budget(
                user,
                name="Monthly Groceries",
                total="800.00",
                currency="USD",
                period=Period.MONTHLY,
                start=month_start,
                categories=[("Food", "500.00"), ("Household", "200.00")],
                expenses=[
                    ("Supermarket run", "120.50", "Food", today),
                    ("Cleaning supplies", "45.00", "Household", today),
                    ("Farmers market", "60.25", "Food", today),
                ],
            )
            self._budget(
                user,
                name="Europe Trip",
                total="3000.00",
                currency="EUR",
                period=Period.ONE_TIME,
                start=today,
                end=today + timedelta(days=30),
                categories=[("Flights", "1200.00"), ("Hotels", "1000.00"), ("Food", "500.00")],
                expenses=[
                    ("Return flights", "980.00", "Flights", today),
                    ("Hotel deposit", "350.00", "Hotels", today),
                ],
            )
            self._budget(
                user,
                name="Weekly Coffee",
                total="50.00",
                currency="USD",
                period=Period.WEEKLY,
                start=week_start,
                allow_overspend=True,
                expenses=[
                    ("Latte", "5.50", None, today),
                    ("Espresso", "3.25", None, today),
                ],
            )
            self._budget(
                admin,
                name="Annual Savings Target",
                total="12000.00",
                currency="USD",
                period=Period.YEARLY,
                start=today.replace(month=1, day=1),
                expenses=[("Q1 contribution", "2500.00", None, today)],
            )

        self.stdout.write(self.style.SUCCESS("seed complete"))

    def _budget(self, user, *, name, total, currency, period, start, end=None, allow_overspend=False,
                categories=None, expenses=None):
        budget = services.create_budget(
            user=user,
            data={
                "name": name,
                "total_amount": Decimal(total),
                "currency": currency,
                "period": period,
                "start_date": start,
                "end_date": end,
                "allow_overspend": allow_overspend,
            },
        )
        category_by_name = {}
        for cname, calloc in categories or []:
            category_by_name[cname] = services.add_category(
                user=user, budget_id=budget.id, data={"name": cname, "allocated_amount": Decimal(calloc)}
            )
        for description, amount, category_name, edate in expenses or []:
            category_id = category_by_name[category_name].id if category_name else None
            services.record_expense(
                user=user,
                budget_id=budget.id,
                data={
                    "description": description,
                    "amount": Decimal(amount),
                    "currency": currency,
                    "date": edate,
                    "category_id": category_id,
                },
            )
        return budget
