import pytest
from django.core.cache import cache
from rest_framework.test import APIClient
from rest_framework.throttling import ScopedRateThrottle

pytestmark = pytest.mark.django_db

PW = "river-otter-92"


def auth_client(email="a@b.com"):
    client = APIClient()
    client.post("/api/auth/register", {"email": email, "password": PW}, format="json")
    tokens = client.post("/api/auth/login", {"email": email, "password": PW}, format="json").json()["data"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return client


def make_budget(client, **overrides):
    payload = {
        "name": "Groceries",
        "total_amount": "500.00",
        "currency": "USD",
        "period": "MONTHLY",
        "start_date": "2026-01-01",
    }
    payload.update(overrides)
    return client.post("/api/budgets", payload, format="json")


def test_budget_create_and_list_envelope():
    client = auth_client()
    resp = make_budget(client)
    assert resp.status_code == 201
    budget = resp.json()["data"]
    assert budget["total_amount"] == "500.00"
    assert budget["spent_amount"] == "0.00"

    listing = client.get("/api/budgets")
    assert listing.status_code == 200
    body = listing.json()
    assert set(body["meta"].keys()) == {"page", "pageSize", "total", "totalPages"}
    assert len(body["data"]) == 1


def test_record_expense_and_status():
    client = auth_client()
    budget_id = make_budget(client).json()["data"]["id"]
    resp = client.post(
        f"/api/budgets/{budget_id}/expenses",
        {"amount": "120.00", "date": "2026-01-15", "description": "shopping"},
        format="json",
    )
    assert resp.status_code == 201
    status = client.get(f"/api/budgets/{budget_id}/status").json()["data"]
    assert status["spent"] == "120.00"
    assert status["remaining"] == "380.00"


def test_check_preview_does_not_commit():
    client = auth_client()
    budget_id = make_budget(client).json()["data"]["id"]
    preview = client.post(f"/api/budgets/{budget_id}/check", {"amount": "600.00"}, format="json").json()["data"]
    assert preview["approved"] is False
    status = client.get(f"/api/budgets/{budget_id}/status").json()["data"]
    assert status["spent"] == "0.00"


def test_insufficient_funds_returns_409():
    client = auth_client()
    budget_id = make_budget(client, total_amount="100.00").json()["data"]["id"]
    resp = client.post(f"/api/budgets/{budget_id}/expenses", {"amount": "200.00", "date": "2026-01-15"}, format="json")
    assert resp.status_code == 409
    assert resp.json()["error"]["code"] == "insufficient_funds"


def test_idempotency_replay_http():
    client = auth_client()
    budget_id = make_budget(client).json()["data"]["id"]
    headers = {"HTTP_IDEMPOTENCY_KEY": "abc-123"}
    first = client.post(
        f"/api/budgets/{budget_id}/expenses", {"amount": "50.00", "date": "2026-01-15"}, format="json", **headers
    )
    second = client.post(
        f"/api/budgets/{budget_id}/expenses", {"amount": "50.00", "date": "2026-01-15"}, format="json", **headers
    )
    assert first.status_code == 201
    assert second.status_code == 200
    assert first.json()["data"]["id"] == second.json()["data"]["id"]


def test_void_refunds_http():
    client = auth_client()
    budget_id = make_budget(client).json()["data"]["id"]
    expense_id = client.post(
        f"/api/budgets/{budget_id}/expenses", {"amount": "50.00", "date": "2026-01-15"}, format="json"
    ).json()["data"]["id"]
    resp = client.post(f"/api/expenses/{expense_id}/void", {}, format="json")
    assert resp.status_code == 200
    assert resp.json()["data"]["status"] == "VOIDED"
    status = client.get(f"/api/budgets/{budget_id}/status").json()["data"]
    assert status["spent"] == "0.00"


def test_closed_budget_rejects_expense():
    client = auth_client()
    budget_id = make_budget(client).json()["data"]["id"]
    client.post(f"/api/budgets/{budget_id}/close", {}, format="json")
    resp = client.post(f"/api/budgets/{budget_id}/expenses", {"amount": "10.00", "date": "2026-01-15"}, format="json")
    assert resp.status_code == 409
    assert resp.json()["error"]["code"] == "budget_closed"


def test_currency_mismatch_returns_400():
    client = auth_client()
    budget_id = make_budget(client, currency="USD").json()["data"]["id"]
    resp = client.post(
        f"/api/budgets/{budget_id}/expenses", {"amount": "10.00", "currency": "EUR", "date": "2026-01-15"}, format="json"
    )
    assert resp.status_code == 400
    assert resp.json()["error"]["code"] == "validation_error"


def test_unauthenticated_401_envelope():
    resp = APIClient().get("/api/budgets")
    assert resp.status_code == 401
    error = resp.json()["error"]
    assert error["code"] == "unauthorized"
    assert "requestId" in error
    assert resp.headers.get("X-Request-Id")


def test_validation_400_envelope_has_details():
    client = auth_client()
    resp = make_budget(client, total_amount="-5")
    assert resp.status_code == 400
    error = resp.json()["error"]
    assert error["code"] == "validation_error"
    assert "total_amount" in error["details"]


def test_cross_user_access_returns_404():
    owner = auth_client("owner@b.com")
    budget_id = make_budget(owner).json()["data"]["id"]
    other = auth_client("other@b.com")
    assert other.get(f"/api/budgets/{budget_id}").status_code == 404


def test_delete_budget_with_expenses_blocked():
    client = auth_client()
    budget_id = make_budget(client).json()["data"]["id"]
    client.post(f"/api/budgets/{budget_id}/expenses", {"amount": "10.00", "date": "2026-01-15"}, format="json")
    resp = client.delete(f"/api/budgets/{budget_id}")
    assert resp.status_code == 409
    assert resp.json()["error"]["code"] == "budget_has_expenses"


class _OnePerMinuteAuthThrottle(ScopedRateThrottle):
    THROTTLE_RATES = {"auth": "1/min"}


def test_auth_endpoint_is_throttled(monkeypatch):
    from apps.accounts.api.v1.views import RegisterView

    cache.clear()
    monkeypatch.setattr(RegisterView, "throttle_classes", [_OnePerMinuteAuthThrottle])
    client = APIClient()
    first = client.post("/api/auth/register", {"email": "t1@b.com", "password": PW}, format="json")
    second = client.post("/api/auth/register", {"email": "t2@b.com", "password": PW}, format="json")
    assert first.status_code == 201
    assert second.status_code == 429
    assert second.json()["error"]["code"] == "throttled"

