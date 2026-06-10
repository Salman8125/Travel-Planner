from decimal import Decimal, InvalidOperation

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from . import domain
from .models import Budget, Expense


def _parse_decimal(value):
    if value is None:
        raise ValueError("missing value")
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError("value must be a number")


def _budget_for(user) -> Budget:
    budget, _ = Budget.objects.get_or_create(user=user)
    return budget


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def set_budget(request):
    try:
        total = _parse_decimal(request.data.get("totalBudget"))
    except ValueError:
        return Response({"detail": "totalBudget must be a number"}, status=400)
    budget = _budget_for(request.user)
    budget.total_budget = total
    budget.save()
    budget.expenses.all().delete()
    return Response(domain.budget_status(budget.total_budget, Decimal("0")))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def check_expense(request):
    try:
        amount = _parse_decimal(request.data.get("amount"))
    except ValueError:
        return Response({"detail": "amount must be a number"}, status=400)
    budget = _budget_for(request.user)
    outcome = domain.evaluate_expense(budget.total_budget, budget.spent, amount)
    Expense.objects.create(budget=budget, amount=amount, approved=outcome.approved)
    return Response(
        {
            "approved": outcome.approved,
            "remaining": float(outcome.remaining),
            "spent": float(outcome.spent),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def get_remaining_budget(request):
    budget = _budget_for(request.user)
    return Response(domain.budget_status(budget.total_budget, budget.spent))
