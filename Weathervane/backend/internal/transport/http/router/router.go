package router

import (
	"log/slog"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/prometheus/client_golang/prometheus/promhttp"

	"github.com/travelplanner/weathervane/internal/auth"
	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/transport/http/handler"
	"github.com/travelplanner/weathervane/internal/transport/http/httperr"
	mw "github.com/travelplanner/weathervane/internal/transport/http/middleware"
)

type Deps struct {
	Ops            *handler.OpsHandler
	Auth           *handler.AuthHandler
	Location       *handler.LocationHandler
	Forecast       *handler.ForecastHandler
	Tokens         *auth.TokenManager
	Logger         *slog.Logger
	RateGlobal     int
	RateAuth       int
	TrustProxy     bool
	CORSOrigins    []string
	RequestTimeout time.Duration
}

func New(d Deps) http.Handler {
	r := chi.NewRouter()
	r.Use(mw.RequestID(d.Logger))
	r.Use(mw.Recoverer)
	r.Use(mw.Logger)
	r.Use(mw.Metrics)
	r.Use(mw.SecurityHeaders)
	r.Use(mw.CORS(d.CORSOrigins))
	r.Use(mw.BodyLimit(1 << 20))
	r.Use(chimw.Timeout(d.RequestTimeout))

	// Ops + metrics are not rate-limited.
	d.Ops.Mount(r)
	r.Handle("/metrics", promhttp.Handler())

	r.Route("/api", func(r chi.Router) {
		r.Use(mw.RateLimit(d.RateGlobal, d.TrustProxy))

		r.Group(func(r chi.Router) {
			r.Use(mw.RateLimit(d.RateAuth, d.TrustProxy))
			d.Auth.MountPublic(r)
		})
		r.Group(func(r chi.Router) {
			r.Use(mw.RequireAuth(d.Tokens))
			d.Auth.MountAuthed(r)
		})

		d.Location.MountPublic(r)
		d.Forecast.MountPublic(r)

		r.Group(func(r chi.Router) {
			r.Use(mw.RequireAuth(d.Tokens), mw.RequireAdmin)
			d.Location.MountAdmin(r)
			d.Forecast.MountAdmin(r)
		})
	})

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		httperr.Write(w, r, domain.ErrNotFound)
	})
	r.MethodNotAllowed(func(w http.ResponseWriter, r *http.Request) {
		httperr.WriteCode(w, r, http.StatusMethodNotAllowed, "method_not_allowed", "Method not allowed")
	})

	return r
}
