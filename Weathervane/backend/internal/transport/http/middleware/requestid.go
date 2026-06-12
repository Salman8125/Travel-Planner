package middleware

import (
	"log/slog"
	"net/http"

	"github.com/google/uuid"

	applog "github.com/travelplanner/weathervane/internal/platform/logger"
	"github.com/travelplanner/weathervane/internal/transport/http/httpctx"
)

func RequestID(base *slog.Logger) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			id := r.Header.Get("X-Request-Id")
			if id == "" {
				id = uuid.NewString()
			}
			w.Header().Set("X-Request-Id", id)
			ctx := httpctx.WithRequestID(r.Context(), id)
			ctx = applog.WithContext(ctx, base.With("requestId", id))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
