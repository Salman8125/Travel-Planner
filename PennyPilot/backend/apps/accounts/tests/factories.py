import factory

from apps.accounts.models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@example.com")
    role = User.Role.USER

    @classmethod
    def _create(cls, model_class, *args, **kwargs):
        password = kwargs.pop("password", "factory-pass-123")
        role = kwargs.pop("role", User.Role.USER)
        if role == User.Role.ADMIN:
            return model_class.objects.create_superuser(password=password, **kwargs)
        return model_class.objects.create_user(password=password, role=role, **kwargs)
