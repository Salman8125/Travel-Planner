from core import exceptions as ex

from .models import User


def register_user(*, email: str, password: str) -> User:
    email = email.strip().lower()
    if User.objects.filter(email=email).exists():
        raise ex.Conflict("Email already registered", code="email_taken")
    return User.objects.create_user(email=email, password=password)
