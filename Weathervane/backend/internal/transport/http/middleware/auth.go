package middleware

import (
	"net/http"
	"strings"

	"github.com/travelplanner/weathervane/internal/auth"
	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/transport/http/httpctx"
	"github.com/travelplanner/weathervane/internal/transport/http/httperr"
)

func RequireAuth(tm *auth.TokenManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			header := r.Header.Get("Authorization")
			if !strings.HasPrefix(header, "Bearer ") {
				httperr.Write(w, r, domain.ErrUnauthorized)
				return
			}
			claims, err := tm.Parse(strings.TrimPrefix(header, "Bearer "))
			if err != nil {
				httperr.Write(w, r, domain.ErrUnauthorized)
				return
			}
			ctx := httpctx.WithUser(r.Context(), httpctx.User{
				ID:    claims.Subject,
				Email: claims.Email,
				Role:  string(claims.Role),
			})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		u, ok := httpctx.UserFrom(r.Context())
		if !ok {
			httperr.Write(w, r, domain.ErrUnauthorized)
			return
		}
		if u.Role != string(domain.RoleAdmin) {
			httperr.Write(w, r, domain.ErrForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
