package httperr

import (
	"context"
	"encoding/json"
	"errors"
	"log/slog"
	"net/http"

	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/transport/http/httpctx"
)

type errorBody struct {
	Code      string            `json:"code"`
	Message   string            `json:"message"`
	Details   map[string]string `json:"details,omitempty"`
	RequestID string            `json:"requestId"`
}

func write(w http.ResponseWriter, status int, code, message, requestID string, details map[string]string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(map[string]errorBody{
		"error": {Code: code, Message: message, Details: details, RequestID: requestID},
	}); err != nil {
		slog.Error("failed to encode error response", "error", err, "requestId", requestID)
	}
}

func Write(w http.ResponseWriter, r *http.Request, err error) {
	rid := httpctx.RequestID(r.Context())
	var ve *domain.ValidationError
	switch {
	case errors.As(err, &ve):
		write(w, http.StatusBadRequest, "validation_error", ve.Msg, rid, ve.Details)
	case errors.Is(err, domain.ErrNotFound):
		write(w, http.StatusNotFound, "not_found", "Resource not found", rid, nil)
	case errors.Is(err, domain.ErrAmbiguous):
		write(w, http.StatusConflict, "conflict", "Multiple locations match; specify country to disambiguate", rid, nil)
	case errors.Is(err, domain.ErrConflict):
		write(w, http.StatusConflict, "conflict", "Resource conflicts with existing data", rid, nil)
	case errors.Is(err, domain.ErrUnauthorized):
		write(w, http.StatusUnauthorized, "unauthorized", "Authentication required or invalid credentials", rid, nil)
	case errors.Is(err, domain.ErrForbidden):
		write(w, http.StatusForbidden, "forbidden", "You do not have permission to perform this action", rid, nil)
	case errors.Is(err, context.DeadlineExceeded):
		slog.Warn("request timed out", "requestId", rid)
		write(w, http.StatusServiceUnavailable, "timeout", "Request timed out", rid, nil)
	case errors.Is(err, context.Canceled):
		write(w, http.StatusServiceUnavailable, "timeout", "Request cancelled", rid, nil)
	default:
		slog.Error("unhandled error", "error", err.Error(), "requestId", rid)
		write(w, http.StatusInternalServerError, "internal_error", "An internal error occurred", rid, nil)
	}
}

func WriteCode(w http.ResponseWriter, r *http.Request, status int, code, message string) {
	write(w, status, code, message, httpctx.RequestID(r.Context()), nil)
}
