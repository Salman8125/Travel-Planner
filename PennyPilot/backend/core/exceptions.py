import logging

from django.db import IntegrityError
from rest_framework import exceptions as drf_exc
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_default_handler

logger = logging.getLogger("pennypilot")


class DomainError(Exception):
    status_code = 500
    code = "internal_error"
    message = "Internal server error"

    def __init__(self, message=None, details=None, code=None):
        self.message = message or self.message
        self.details = details
        if code:
            self.code = code
        super().__init__(self.message)


class ValidationError(DomainError):
    status_code = 400
    code = "validation_error"
    message = "Validation failed"


class NotFound(DomainError):
    status_code = 404
    code = "not_found"
    message = "Not found"


class PermissionDenied(DomainError):
    status_code = 403
    code = "forbidden"
    message = "Forbidden"


class Conflict(DomainError):
    status_code = 409
    code = "conflict"
    message = "Conflict"


def _request_id(context):
    request = (context or {}).get("request")
    return getattr(request, "request_id", None)


def _envelope(code, message, status, request_id, details=None):
    error = {"code": code, "message": message, "requestId": request_id}
    if details is not None:
        error["details"] = details
    return Response({"error": error}, status=status)


_API_EXCEPTION_CODES = {
    400: "validation_error",
    401: "unauthorized",
    403: "forbidden",
    404: "not_found",
    405: "method_not_allowed",
    406: "not_acceptable",
    415: "unsupported_media_type",
    429: "throttled",
}


def pennypilot_exception_handler(exc, context):
    request_id = _request_id(context)

    if isinstance(exc, DomainError):
        return _envelope(exc.code, exc.message, exc.status_code, request_id, exc.details)

    if isinstance(exc, drf_exc.ValidationError):
        return _envelope("validation_error", "Validation failed", 400, request_id, details=exc.detail)

    if isinstance(exc, IntegrityError):
        return _envelope("conflict", "Resource conflict", 409, request_id)

    if isinstance(exc, drf_exc.APIException):
        status = exc.status_code
        code = _API_EXCEPTION_CODES.get(status, getattr(exc, "default_code", "error"))
        detail = exc.detail
        message = detail if isinstance(detail, str) else exc.__class__.__name__
        return _envelope(code, str(message), status, request_id)

    drf_response = drf_default_handler(exc, context)
    if drf_response is not None:
        status = drf_response.status_code
        code = _API_EXCEPTION_CODES.get(status, "error")
        return _envelope(code, "Request failed", status, request_id, details=drf_response.data)

    logger.exception("unhandled exception", extra={"request_id": request_id})
    return _envelope("internal_error", "Internal server error", 500, request_id)
