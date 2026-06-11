from django.db import connection
from django.http import JsonResponse


def health(_request):
    return JsonResponse({"status": "ok"})


def ready(_request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
    except Exception:
        return JsonResponse({"status": "unavailable", "db": "down"}, status=503)
    return JsonResponse({"status": "ready", "db": "up"})
