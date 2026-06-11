from django.contrib import admin

from .models import Budget, Category, Expense


class CategoryInline(admin.TabularInline):
    model = Category
    extra = 0


@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = [
        "name",
        "user",
        "total_amount",
        "spent_amount",
        "currency",
        "period",
        "status",
        "allow_overspend",
        "deleted_at",
    ]
    list_filter = ["status", "period", "currency", "allow_overspend"]
    search_fields = ["name", "user__email"]
    readonly_fields = ["spent_amount", "created_at", "updated_at"]
    inlines = [CategoryInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "budget", "allocated_amount"]
    search_fields = ["name", "budget__name"]


@admin.register(Expense)
class ExpenseAdmin(admin.ModelAdmin):
    list_display = ["description", "budget", "category", "amount", "currency", "date", "status", "overspent"]
    list_filter = ["status", "overspent", "currency"]
    search_fields = ["description", "budget__name", "budget__user__email"]
    readonly_fields = ["created_at", "updated_at"]
