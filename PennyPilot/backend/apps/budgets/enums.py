from django.db import models


class Period(models.TextChoices):
    ONE_TIME = "ONE_TIME", "One time"
    WEEKLY = "WEEKLY", "Weekly"
    MONTHLY = "MONTHLY", "Monthly"
    YEARLY = "YEARLY", "Yearly"


class BudgetStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    CLOSED = "CLOSED", "Closed"


class ExpenseStatus(models.TextChoices):
    RECORDED = "RECORDED", "Recorded"
    VOIDED = "VOIDED", "Voided"
