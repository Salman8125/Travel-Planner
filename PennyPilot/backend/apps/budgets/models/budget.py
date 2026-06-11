from decimal import Decimal

from django.conf import settings
from django.db import models

from core.models import BaseModel, SoftDeleteModel

from ..enums import BudgetStatus, Period


class Budget(BaseModel, SoftDeleteModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="budgets")
    name = models.CharField(max_length=120)
    total_amount = models.DecimalField(max_digits=14, decimal_places=2)
    spent_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))
    currency = models.CharField(max_length=3)
    period = models.CharField(max_length=10, choices=Period.choices, default=Period.MONTHLY)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=8, choices=BudgetStatus.choices, default=BudgetStatus.ACTIVE)
    allow_overspend = models.BooleanField(default=False)

    class Meta:
        db_table = "budgets_budget"
        ordering = ["-created_at"]
        constraints = [
            models.CheckConstraint(check=models.Q(total_amount__gt=0), name="budget_total_amount_positive"),
            models.CheckConstraint(check=models.Q(spent_amount__gte=0), name="budget_spent_amount_nonneg"),
            models.CheckConstraint(
                check=models.Q(end_date__isnull=True) | models.Q(end_date__gt=models.F("start_date")),
                name="budget_end_after_start",
            ),
        ]
        indexes = [models.Index(fields=["user", "status"])]

    def __str__(self):
        return f"{self.name} ({self.currency})"

    @property
    def remaining(self) -> Decimal:
        return self.total_amount - self.spent_amount
