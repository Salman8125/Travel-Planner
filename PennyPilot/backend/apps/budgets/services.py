from decimal import Decimal

from django.db import IntegrityError, transaction
from django.db.models import Sum

from core import exceptions as ex

from . import domain, selectors
from .enums import BudgetStatus, ExpenseStatus
from .models import Budget, Category, Expense


def create_budget(*, user, data: dict) -> Budget:
    return Budget.objects.create(user=user, **data)


def update_budget(*, user, budget_id, data: dict) -> Budget:
    with transaction.atomic():
        budget = Budget.objects.select_for_update().filter(
            pk=budget_id, user=user, deleted_at__isnull=True
        ).first()
        if budget is None:
            raise ex.NotFound("Budget not found")
        if budget.status == BudgetStatus.CLOSED:
            raise ex.Conflict("Budget is closed", code="budget_closed")
        for field in ("name", "total_amount", "allow_overspend", "period", "start_date", "end_date"):
            if field in data:
                setattr(budget, field, data[field])
        if budget.total_amount < budget.spent_amount and not budget.allow_overspend:
            raise ex.Conflict("Total cannot be below the amount already spent", code="insufficient_funds")
        budget.save()
        return budget


def close_budget(*, user, budget_id) -> Budget:
    with transaction.atomic():
        budget = Budget.objects.select_for_update().filter(
            pk=budget_id, user=user, deleted_at__isnull=True
        ).first()
        if budget is None:
            raise ex.NotFound("Budget not found")
        budget.status = BudgetStatus.CLOSED
        budget.save(update_fields=["status", "updated_at"])
        return budget


def delete_budget(*, user, budget_id) -> Budget:
    with transaction.atomic():
        budget = Budget.objects.select_for_update().filter(
            pk=budget_id, user=user, deleted_at__isnull=True
        ).first()
        if budget is None:
            raise ex.NotFound("Budget not found")
        if budget.expenses.exists():
            raise ex.Conflict("Budget has expenses and cannot be deleted", code="budget_has_expenses")
        budget.soft_delete()
        return budget


def preview_expense(*, user, budget_id, data: dict, is_admin: bool = False) -> dict:
    budget = selectors.get_budget(user=user, budget_id=budget_id, is_admin=is_admin)
    base = {"spent": budget.spent_amount, "remaining": budget.remaining, "wouldOverspend": False}
    if budget.status == BudgetStatus.CLOSED:
        return {"approved": False, **base, "reason": "budget_closed"}
    currency = data.get("currency") or budget.currency
    if currency != budget.currency:
        return {"approved": False, **base, "reason": "currency_mismatch"}
    result = domain.evaluate(budget.total_amount, budget.spent_amount, data["amount"], budget.allow_overspend)
    return {
        "approved": result.approved,
        "spent": result.spent,
        "remaining": result.remaining,
        "wouldOverspend": result.would_overspend,
        "reason": None if result.approved else "insufficient_funds",
    }


def _ensure_allocation_within_total(budget, additional_allocation, exclude_category_id=None):
    qs = budget.categories.all()
    if exclude_category_id:
        qs = qs.exclude(pk=exclude_category_id)
    allocated = qs.aggregate(s=Sum("allocated_amount"))["s"] or Decimal("0.00")
    if allocated + additional_allocation > budget.total_amount:
        raise ex.Conflict("Category allocations exceed the budget total", code="category_allocation_exceeded")


def add_category(*, user, budget_id, data: dict) -> Category:
    with transaction.atomic():
        budget = Budget.objects.select_for_update().filter(
            pk=budget_id, user=user, deleted_at__isnull=True
        ).first()
        if budget is None:
            raise ex.NotFound("Budget not found")
        _ensure_allocation_within_total(budget, data.get("allocated_amount", Decimal("0.00")))
        try:
            return Category.objects.create(budget=budget, **data)
        except IntegrityError:
            raise ex.Conflict("Category name already exists for this budget", code="category_name_taken")


def update_category(*, user, category_id, data: dict) -> Category:
    with transaction.atomic():
        category = Category.objects.select_for_update().select_related("budget").filter(
            pk=category_id, budget__user=user, budget__deleted_at__isnull=True
        ).first()
        if category is None:
            raise ex.NotFound("Category not found")
        new_allocation = data.get("allocated_amount", category.allocated_amount)
        _ensure_allocation_within_total(category.budget, new_allocation, exclude_category_id=category.id)
        if "name" in data:
            category.name = data["name"]
        category.allocated_amount = new_allocation
        try:
            category.save()
        except IntegrityError:
            raise ex.Conflict("Category name already exists for this budget", code="category_name_taken")
        return category


def delete_category(*, user, category_id) -> None:
    category = Category.objects.select_related("budget").filter(
        pk=category_id, budget__user=user, budget__deleted_at__isnull=True
    ).first()
    if category is None:
        raise ex.NotFound("Category not found")
    category.delete()


def _resolve_category(budget, category_id):
    if not category_id:
        return None
    category = budget.categories.filter(pk=category_id).first()
    if category is None:
        raise ex.ValidationError(
            "Category does not belong to this budget",
            details={"category": ["invalid category for this budget"]},
        )
    return category


def _ensure_date_in_period(budget, date):
    if date < budget.start_date:
        raise ex.ValidationError(
            "Expense date is before the budget start",
            details={"date": ["must be on or after the budget start date"]},
        )
    if budget.end_date and date > budget.end_date:
        raise ex.ValidationError(
            "Expense date is outside the budget period",
            details={"date": ["must fall within the budget period"]},
        )


def _ensure_category_allocation(category, additional_amount, exclude_expense_id=None):
    if category.allocated_amount <= 0:
        return
    qs = category.expenses.filter(status=ExpenseStatus.RECORDED)
    if exclude_expense_id:
        qs = qs.exclude(pk=exclude_expense_id)
    spent = qs.aggregate(s=Sum("amount"))["s"] or Decimal("0.00")
    if spent + additional_amount > category.allocated_amount:
        raise ex.Conflict("Category allocation exceeded", code="category_allocation_exceeded")


def record_expense(*, user, budget_id, data: dict, idempotency_key: str | None = None):
    if idempotency_key:
        existing = selectors.find_expense_by_idempotency_key(user=user, key=idempotency_key)
        if existing:
            return existing, True
    try:
        with transaction.atomic():
            budget = Budget.objects.select_for_update().filter(
                pk=budget_id, user=user, deleted_at__isnull=True
            ).first()
            if budget is None:
                raise ex.NotFound("Budget not found")
            if budget.status == BudgetStatus.CLOSED:
                raise ex.Conflict("Budget is closed", code="budget_closed")

            amount = data["amount"]
            currency = data.get("currency") or budget.currency
            if currency != budget.currency:
                raise ex.ValidationError(
                    "Expense currency must match the budget currency",
                    details={"currency": ["must equal the budget currency"]},
                )
            category = _resolve_category(budget, data.get("category_id"))
            _ensure_date_in_period(budget, data["date"])

            new_spent = budget.spent_amount + amount
            overspent = new_spent > budget.total_amount
            if overspent and not budget.allow_overspend:
                raise ex.Conflict("Insufficient budget", code="insufficient_funds")
            if category is not None:
                _ensure_category_allocation(category, amount)

            expense = Expense.objects.create(
                budget=budget,
                category=category,
                description=data.get("description", ""),
                amount=amount,
                currency=budget.currency,
                date=data["date"],
                status=ExpenseStatus.RECORDED,
                overspent=overspent,
                idempotency_key=idempotency_key,
            )
            budget.spent_amount = new_spent
            budget.save(update_fields=["spent_amount", "updated_at"])
            return expense, False
    except IntegrityError:
        if idempotency_key:
            existing = selectors.find_expense_by_idempotency_key(user=user, key=idempotency_key)
            if existing:
                return existing, True
            raise ex.Conflict("Idempotency key conflict", code="idempotency_conflict")
        raise


def edit_expense(*, user, expense_id, data: dict) -> Expense:
    with transaction.atomic():
        expense = Expense.objects.select_for_update().select_related("budget").filter(
            pk=expense_id, budget__user=user, budget__deleted_at__isnull=True
        ).first()
        if expense is None:
            raise ex.NotFound("Expense not found")
        budget = Budget.objects.select_for_update().get(pk=expense.budget_id)
        if budget.status == BudgetStatus.CLOSED:
            raise ex.Conflict("Budget is closed", code="budget_closed")
        if expense.status == ExpenseStatus.VOIDED:
            raise ex.Conflict("Cannot edit a voided expense", code="expense_voided")

        old_amount = expense.amount
        new_amount = data.get("amount", old_amount)
        new_date = data.get("date", expense.date)
        category = expense.category
        if "category_id" in data:
            category = _resolve_category(budget, data.get("category_id"))

        _ensure_date_in_period(budget, new_date)
        projected = budget.spent_amount - old_amount + new_amount
        overspent = projected > budget.total_amount
        if overspent and not budget.allow_overspend:
            raise ex.Conflict("Insufficient budget", code="insufficient_funds")
        if category is not None:
            _ensure_category_allocation(category, new_amount, exclude_expense_id=expense.id)

        expense.amount = new_amount
        expense.date = new_date
        if "description" in data:
            expense.description = data["description"]
        expense.category = category
        expense.overspent = overspent
        expense.save(update_fields=["amount", "date", "description", "category", "overspent", "updated_at"])
        budget.spent_amount = projected
        budget.save(update_fields=["spent_amount", "updated_at"])
        return expense


def void_expense(*, user, expense_id) -> Expense:
    with transaction.atomic():
        expense = Expense.objects.select_for_update().select_related("budget").filter(
            pk=expense_id, budget__user=user
        ).first()
        if expense is None:
            raise ex.NotFound("Expense not found")
        if expense.status == ExpenseStatus.VOIDED:
            return expense
        budget = Budget.objects.select_for_update().get(pk=expense.budget_id)
        expense.status = ExpenseStatus.VOIDED
        expense.save(update_fields=["status", "updated_at"])
        budget.spent_amount = budget.spent_amount - expense.amount
        budget.save(update_fields=["spent_amount", "updated_at"])
        return expense
