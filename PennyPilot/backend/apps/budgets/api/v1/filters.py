import django_filters

from apps.budgets.models import Budget, Expense


class BudgetFilter(django_filters.FilterSet):
    class Meta:
        model = Budget
        fields = ["status", "currency", "period"]


class ExpenseFilter(django_filters.FilterSet):
    date_from = django_filters.DateFilter(field_name="date", lookup_expr="gte")
    date_to = django_filters.DateFilter(field_name="date", lookup_expr="lte")

    class Meta:
        model = Expense
        fields = ["status", "category", "date_from", "date_to"]
