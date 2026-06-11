from django.db import models

from core.models import BaseModel

from ..enums import ExpenseStatus


class Expense(BaseModel):
    budget = models.ForeignKey("budgets.Budget", on_delete=models.CASCADE, related_name="expenses")
    category = models.ForeignKey(
        "budgets.Category", on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses"
    )
    description = models.CharField(max_length=255, blank=True, default="")
    amount = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=3)
    date = models.DateField()
    status = models.CharField(max_length=8, choices=ExpenseStatus.choices, default=ExpenseStatus.RECORDED)
    overspent = models.BooleanField(default=False)
    idempotency_key = models.CharField(max_length=255, null=True, blank=True)

    class Meta:
        db_table = "budgets_expense"
        ordering = ["-date", "-created_at"]
        constraints = [
            models.CheckConstraint(check=models.Q(amount__gt=0), name="expense_amount_positive"),
            models.UniqueConstraint(
                fields=["idempotency_key"],
                name="uq_expense_idempotency_key",
                condition=models.Q(idempotency_key__isnull=False),
            ),
        ]
        indexes = [models.Index(fields=["budget", "date"])]

    def __str__(self):
        return f"{self.description or 'expense'} {self.amount} {self.currency}"
