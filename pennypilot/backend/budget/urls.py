from django.urls import path

from . import views

urlpatterns = [
    path("health", views.health),
    path("set_budget", views.set_budget),
    path("check_expense", views.check_expense),
    path("get_remaining_budget", views.get_remaining_budget),
]
