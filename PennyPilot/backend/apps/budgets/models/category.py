from decimal import Decimal

from django.db import models

from core.models import BaseModel


class Category(BaseModel):
    budget = models.ForeignKey("budgets.Budget", on_delete=models.CASCADE, related_name="categories")
    name = models.CharField(max_length=80)
    allocated_amount = models.DecimalField(max_digits=14, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        db_table = "budgets_category"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["budget", "name"], name="uq_category_budget_name"),
            models.CheckConstraint(check=models.Q(allocated_amount__gte=0), name="category_allocated_nonneg"),
        ]

    def __str__(self):
        return self.name
