import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db

PW = "river-otter-92"


def test_register_returns_tokens_and_user():
    resp = APIClient().post("/api/auth/register", {"email": "a@b.com", "password": PW}, format="json")
    assert resp.status_code == 201
    data = resp.json()["data"]
    assert data["access"] and data["refresh"]
    assert data["user"]["email"] == "a@b.com"
    assert data["user"]["role"] == "USER"


def test_login_and_me():
    client = APIClient()
    client.post("/api/auth/register", {"email": "a@b.com", "password": PW}, format="json")
    resp = client.post("/api/auth/login", {"email": "a@b.com", "password": PW}, format="json")
    assert resp.status_code == 200
    access = resp.json()["data"]["access"]
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["data"]["email"] == "a@b.com"


def test_refresh_issues_new_access():
    client = APIClient()
    client.post("/api/auth/register", {"email": "a@b.com", "password": PW}, format="json")
    tokens = client.post("/api/auth/login", {"email": "a@b.com", "password": PW}, format="json").json()["data"]
    resp = client.post("/api/auth/refresh", {"refresh": tokens["refresh"]}, format="json")
    assert resp.status_code == 200
    assert resp.json()["data"]["access"]


def test_login_bad_credentials_no_email_leak():
    client = APIClient()
    client.post("/api/auth/register", {"email": "a@b.com", "password": PW}, format="json")
    wrong = client.post("/api/auth/login", {"email": "a@b.com", "password": "wrong-pass-99"}, format="json")
    unknown = client.post("/api/auth/login", {"email": "nope@b.com", "password": "wrong-pass-99"}, format="json")
    assert wrong.status_code == 401
    assert unknown.status_code == 401
    assert wrong.json()["error"]["message"] == unknown.json()["error"]["message"]


def test_duplicate_email_conflict():
    client = APIClient()
    client.post("/api/auth/register", {"email": "a@b.com", "password": PW}, format="json")
    dup = client.post("/api/auth/register", {"email": "a@b.com", "password": PW}, format="json")
    assert dup.status_code == 409
    assert dup.json()["error"]["code"] == "email_taken"


def test_me_requires_auth():
    resp = APIClient().get("/api/auth/me")
    assert resp.status_code == 401
    assert resp.json()["error"]["code"] == "unauthorized"
