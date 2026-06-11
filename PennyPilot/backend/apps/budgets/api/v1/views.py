from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import OpenApiResponse, extend_schema, extend_schema_view
from rest_framework import generics, status
from rest_framework.filters import OrderingFilter
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.budgets import selectors, services
from apps.budgets.models import Budget, Expense

from .filters import BudgetFilter, ExpenseFilter
from .serializers import (
    BudgetCreateSerializer,
    BudgetSerializer,
    BudgetStatusSerializer,
    BudgetUpdateSerializer,
    CategoryCreateSerializer,
    CategorySerializer,
    CategoryUpdateSerializer,
    CheckResultSerializer,
    CheckSerializer,
    ExpenseCreateSerializer,
    ExpenseSerializer,
    ExpenseUpdateSerializer,
)


def _is_admin(request) -> bool:
    return getattr(request.user, "is_admin", False)


@extend_schema_view(post=extend_schema(request=BudgetCreateSerializer, responses=BudgetSerializer))
class BudgetListCreateView(generics.ListCreateAPIView):
    serializer_class = BudgetSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = BudgetFilter
    ordering_fields = ["created_at", "total_amount", "start_date"]
    ordering = ["-created_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Budget.objects.none()
        return selectors.list_budgets(user=self.request.user, is_admin=_is_admin(self.request))

    def create(self, request, *args, **kwargs):
        serializer = BudgetCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        budget = services.create_budget(user=request.user, data=serializer.validated_data)
        return Response(BudgetSerializer(budget).data, status=status.HTTP_201_CREATED)


class BudgetDetailView(APIView):
    @extend_schema(responses=BudgetSerializer)
    def get(self, request, budget_id):
        budget = selectors.get_budget(user=request.user, budget_id=budget_id, is_admin=_is_admin(request))
        return Response(BudgetSerializer(budget).data)

    @extend_schema(request=BudgetUpdateSerializer, responses=BudgetSerializer)
    def patch(self, request, budget_id):
        serializer = BudgetUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        budget = services.update_budget(user=request.user, budget_id=budget_id, data=serializer.validated_data)
        return Response(BudgetSerializer(budget).data)

    @extend_schema(responses={200: OpenApiResponse(description="Budget soft-deleted")})
    def delete(self, request, budget_id):
        budget = services.delete_budget(user=request.user, budget_id=budget_id)
        return Response({"id": str(budget.id), "deleted": True})


class BudgetStatusView(APIView):
    @extend_schema(responses=BudgetStatusSerializer)
    def get(self, request, budget_id):
        data = selectors.get_budget_status(user=request.user, budget_id=budget_id, is_admin=_is_admin(request))
        return Response(BudgetStatusSerializer(data).data)


class BudgetCheckView(APIView):
    @extend_schema(request=CheckSerializer, responses=CheckResultSerializer)
    def post(self, request, budget_id):
        serializer = CheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = services.preview_expense(
            user=request.user, budget_id=budget_id, data=serializer.validated_data, is_admin=_is_admin(request)
        )
        return Response(CheckResultSerializer(result).data)


class BudgetCloseView(APIView):
    @extend_schema(request=None, responses=BudgetSerializer)
    def post(self, request, budget_id):
        budget = services.close_budget(user=request.user, budget_id=budget_id)
        return Response(BudgetSerializer(budget).data)


class CategoryListCreateView(APIView):
    @extend_schema(responses=CategorySerializer(many=True))
    def get(self, request, budget_id):
        budget = selectors.get_budget(user=request.user, budget_id=budget_id, is_admin=_is_admin(request))
        return Response(CategorySerializer(budget.categories.all(), many=True).data)

    @extend_schema(request=CategoryCreateSerializer, responses=CategorySerializer)
    def post(self, request, budget_id):
        serializer = CategoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        category = services.add_category(user=request.user, budget_id=budget_id, data=serializer.validated_data)
        return Response(CategorySerializer(category).data, status=status.HTTP_201_CREATED)


class CategoryDetailView(APIView):
    @extend_schema(request=CategoryUpdateSerializer, responses=CategorySerializer)
    def patch(self, request, category_id):
        serializer = CategoryUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        category = services.update_category(
            user=request.user, category_id=category_id, data=serializer.validated_data
        )
        return Response(CategorySerializer(category).data)

    @extend_schema(responses={204: None})
    def delete(self, request, category_id):
        services.delete_category(user=request.user, category_id=category_id)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(post=extend_schema(request=ExpenseCreateSerializer, responses=ExpenseSerializer))
class ExpenseListCreateView(generics.ListCreateAPIView):
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = ExpenseFilter
    ordering_fields = ["date", "amount", "created_at"]
    ordering = ["-date", "-created_at"]

    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False):
            return Expense.objects.none()
        return selectors.list_expenses(
            user=self.request.user, budget_id=self.kwargs["budget_id"], is_admin=_is_admin(self.request)
        )

    def create(self, request, *args, **kwargs):
        serializer = ExpenseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        idempotency_key = request.headers.get("Idempotency-Key")
        expense, replayed = services.record_expense(
            user=request.user,
            budget_id=self.kwargs["budget_id"],
            data=serializer.validated_data,
            idempotency_key=idempotency_key,
        )
        code = status.HTTP_200_OK if replayed else status.HTTP_201_CREATED
        return Response(ExpenseSerializer(expense).data, status=code)


class ExpenseDetailView(APIView):
    @extend_schema(responses=ExpenseSerializer)
    def get(self, request, expense_id):
        expense = selectors.get_expense(user=request.user, expense_id=expense_id, is_admin=_is_admin(request))
        return Response(ExpenseSerializer(expense).data)

    @extend_schema(request=ExpenseUpdateSerializer, responses=ExpenseSerializer)
    def patch(self, request, expense_id):
        serializer = ExpenseUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        expense = services.edit_expense(user=request.user, expense_id=expense_id, data=serializer.validated_data)
        return Response(ExpenseSerializer(expense).data)


class ExpenseVoidView(APIView):
    @extend_schema(request=None, responses=ExpenseSerializer)
    def post(self, request, expense_id):
        expense = services.void_expense(user=request.user, expense_id=expense_id)
        return Response(ExpenseSerializer(expense).data)
