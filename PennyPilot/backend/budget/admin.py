from django.contrib import admin

from .models import Budget, Expense


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ("user", "total_budget", "spent", "updated_at")
    search_fields = ("user__username",)


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ("budget", "amount", "approved", "created_at")
    list_filter = ("approved",)
    search_fields = ("budget__user__username",)
