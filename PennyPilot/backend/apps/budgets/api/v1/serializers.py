from decimal import Decimal

from drf_spectacular.utils import extend_schema_field
from rest_framework import serializers

from apps.budgets.enums import Period
from apps.budgets.models import Budget, Category, Expense

MONEY = {"max_digits": 14, "decimal_places": 2}
POSITIVE_MONEY = {**MONEY, "min_value": Decimal("0.01")}


class CurrencyField(serializers.CharField):
    def __init__(self, **kwargs):
        kwargs.setdefault("min_length", 3)
        kwargs.setdefault("max_length", 3)
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        return super().to_internal_value(data).upper()


class BudgetSerializer(serializers.ModelSerializer):
    remaining = serializers.DecimalField(read_only=True, **MONEY)

    class Meta:
        model = Budget
        fields = [
            "id",
            "name",
            "total_amount",
            "spent_amount",
            "remaining",
            "currency",
            "period",
            "start_date",
            "end_date",
            "status",
            "allow_overspend",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "spent_amount", "status", "created_at", "updated_at"]


class BudgetCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120)
    total_amount = serializers.DecimalField(**POSITIVE_MONEY)
    currency = CurrencyField()
    period = serializers.ChoiceField(choices=Period.choices, default=Period.MONTHLY)
    start_date = serializers.DateField()
    end_date = serializers.DateField(required=False, allow_null=True)
    allow_overspend = serializers.BooleanField(default=False)

    def validate(self, attrs):
        end_date = attrs.get("end_date")
        if end_date and end_date <= attrs["start_date"]:
            raise serializers.ValidationError({"end_date": "must be after the start date"})
        return attrs


class BudgetUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=120, required=False)
    total_amount = serializers.DecimalField(required=False, **POSITIVE_MONEY)
    allow_overspend = serializers.BooleanField(required=False)
    period = serializers.ChoiceField(choices=Period.choices, required=False)
    start_date = serializers.DateField(required=False)
    end_date = serializers.DateField(required=False, allow_null=True)


class CategorySerializer(serializers.ModelSerializer):
    budget = serializers.UUIDField(source="budget_id", read_only=True)

    class Meta:
        model = Category
        fields = ["id", "budget", "name", "allocated_amount", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class CategoryCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=80)
    allocated_amount = serializers.DecimalField(default=Decimal("0.00"), min_value=Decimal("0.00"), **MONEY)


class CategoryUpdateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=80, required=False)
    allocated_amount = serializers.DecimalField(required=False, min_value=Decimal("0.00"), **MONEY)


class ExpenseSerializer(serializers.ModelSerializer):
    budget = serializers.UUIDField(source="budget_id", read_only=True)
    category = serializers.UUIDField(source="category_id", read_only=True, allow_null=True)
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Expense
        fields = [
            "id",
            "budget",
            "category",
            "category_name",
            "description",
            "amount",
            "currency",
            "date",
            "status",
            "overspent",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields

    @extend_schema_field(serializers.CharField(allow_null=True))
    def get_category_name(self, obj):
        return obj.category.name if obj.category_id else None


class ExpenseCreateSerializer(serializers.Serializer):
    description = serializers.CharField(max_length=255, required=False, allow_blank=True, default="")
    amount = serializers.DecimalField(**POSITIVE_MONEY)
    currency = CurrencyField(required=False)
    date = serializers.DateField()
    category_id = serializers.UUIDField(required=False, allow_null=True)


class ExpenseUpdateSerializer(serializers.Serializer):
    description = serializers.CharField(max_length=255, required=False, allow_blank=True)
    amount = serializers.DecimalField(required=False, **POSITIVE_MONEY)
    date = serializers.DateField(required=False)
    category_id = serializers.UUIDField(required=False, allow_null=True)


class CheckSerializer(serializers.Serializer):
    amount = serializers.DecimalField(**POSITIVE_MONEY)
    currency = CurrencyField(required=False)
    category_id = serializers.UUIDField(required=False, allow_null=True)


class PerCategoryStatusSerializer(serializers.Serializer):
    category = serializers.CharField()
    categoryId = serializers.CharField()
    allocated = serializers.DecimalField(**MONEY)
    spent = serializers.DecimalField(**MONEY)
    remaining = serializers.DecimalField(**MONEY)


class BudgetStatusSerializer(serializers.Serializer):
    totalBudget = serializers.DecimalField(**MONEY)
    spent = serializers.DecimalField(**MONEY)
    remaining = serializers.DecimalField(**MONEY)
    currency = serializers.CharField()
    perCategory = PerCategoryStatusSerializer(many=True)


class CheckResultSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
    spent = serializers.DecimalField(**MONEY)
    remaining = serializers.DecimalField(**MONEY)
    wouldOverspend = serializers.BooleanField()
    reason = serializers.CharField(allow_null=True)
