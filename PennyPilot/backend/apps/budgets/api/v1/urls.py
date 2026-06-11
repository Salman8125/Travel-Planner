from django.urls import path

from . import views

urlpatterns = [
    path("budgets", views.BudgetListCreateView.as_view(), name="budget-list"),
    path("budgets/<uuid:budget_id>", views.BudgetDetailView.as_view(), name="budget-detail"),
    path("budgets/<uuid:budget_id>/status", views.BudgetStatusView.as_view(), name="budget-status"),
    path("budgets/<uuid:budget_id>/check", views.BudgetCheckView.as_view(), name="budget-check"),
    path("budgets/<uuid:budget_id>/close", views.BudgetCloseView.as_view(), name="budget-close"),
    path("budgets/<uuid:budget_id>/categories", views.CategoryListCreateView.as_view(), name="category-list"),
    path("categories/<uuid:category_id>", views.CategoryDetailView.as_view(), name="category-detail"),
    path("budgets/<uuid:budget_id>/expenses", views.ExpenseListCreateView.as_view(), name="expense-list"),
    path("expenses/<uuid:expense_id>", views.ExpenseDetailView.as_view(), name="expense-detail"),
    path("expenses/<uuid:expense_id>/void", views.ExpenseVoidView.as_view(), name="expense-void"),
]
