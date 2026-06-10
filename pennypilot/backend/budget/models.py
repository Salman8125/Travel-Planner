from decimal import Decimal

from django.conf import settings
from django.db import models
from django.db.models import Sum


class Budget(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="budget"
    )
    total_budget = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def spent(self) -> Decimal:
        total = self.expenses.filter(approved=True).aggregate(s=Sum("amount"))["s"]
        return total or Decimal("0")

    def __str__(self) -> str:
        return f"{self.user} — budget {self.total_budget}"


class Expense(models.Model):
    budget = models.ForeignKey(Budget, on_delete=models.CASCADE, related_name="expenses")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        state = "approved" if self.approved else "rejected"
        return f"{self.amount} ({state})"
