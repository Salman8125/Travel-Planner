from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.accounts.api.v1.urls")),
    path("", include("apps.budgets.api.v1.urls")),
]
