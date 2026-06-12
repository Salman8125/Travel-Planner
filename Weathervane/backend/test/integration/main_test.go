//go:build integration

package integration

import (
	"context"
	"net/http/httptest"
	"os"
	"testing"
	"time"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"

	weathervane "github.com/travelplanner/weathervane"
	"github.com/travelplanner/weathervane/internal/auth"
	"github.com/travelplanner/weathervane/internal/config"
	"github.com/travelplanner/weathervane/internal/forecast"
	"github.com/travelplanner/weathervane/internal/location"
	"github.com/travelplanner/weathervane/internal/platform/database"
	"github.com/travelplanner/weathervane/internal/platform/database/sqlc"
	applog "github.com/travelplanner/weathervane/internal/platform/logger"
	"github.com/travelplanner/weathervane/internal/transport/http/handler"
	"github.com/travelplanner/weathervane/internal/transport/http/router"
)

var server *httptest.Server

func TestMain(m *testing.M) {
	ctx := context.Background()

	pgC, err := postgres.Run(ctx, "postgres:16-alpine",
		postgres.WithDatabase("weather"),
		postgres.WithUsername("weather"),
		postgres.WithPassword("weather"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(90*time.Second),
		),
	)
	if err != nil {
		panic(err)
	}
	defer func() { _ = pgC.Terminate(ctx) }()

	dsn, err := pgC.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		panic(err)
	}

	logger := applog.New("error")
	if err := database.Migrate(dsn, logger); err != nil {
		panic(err)
	}
	pool, err := database.NewPool(ctx, dsn, logger)
	if err != nil {
		panic(err)
	}
	defer pool.Close()

	cfg := config.Config{
		Server:    config.ServerConfig{RequestTimeout: 10 * time.Second},
		Auth:      config.AuthConfig{JWTSecret: "test-secret", JWTTTL: time.Hour, BcryptCost: 4},
		Cache:     config.CacheConfig{TTL: time.Minute},
		RateLimit: config.RateLimitConfig{GlobalPerMin: 1000000, AuthPerMin: 1000000},
	}
	if err := database.Seed(ctx, pool, cfg, logger); err != nil {
		panic(err)
	}

	q := sqlc.New(pool)
	tokens := auth.NewTokenManager(cfg.Auth.JWTSecret, cfg.Auth.JWTTTL)
	authSvc := auth.NewService(auth.NewUserRepo(q), tokens, cfg.Auth.BcryptCost)
	locSvc := location.NewService(location.NewRepo(q))
	fcRepo := forecast.NewRepo(q)
	provider := forecast.NewCacheProvider(fcRepo, cfg.Cache.TTL)
	fcSvc := forecast.NewService(provider, fcRepo, locSvc)

	r := router.New(router.Deps{
		Ops:            handler.NewOpsHandler(pool, weathervane.OpenAPISpec),
		Auth:           handler.NewAuthHandler(authSvc),
		Location:       handler.NewLocationHandler(locSvc),
		Forecast:       handler.NewForecastHandler(fcSvc),
		Tokens:         tokens,
		Logger:         logger,
		RateGlobal:     cfg.RateLimit.GlobalPerMin,
		RateAuth:       cfg.RateLimit.AuthPerMin,
		RequestTimeout: cfg.Server.RequestTimeout,
	})

	server = httptest.NewServer(r)
	code := m.Run()
	server.Close()
	os.Exit(code)
}
