package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "time/tzdata"

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
	"github.com/travelplanner/weathervane/internal/transport/http/server"
)

func main() {
	if err := run(); err != nil {
		slog.Error("fatal", "error", err.Error())
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	logger := applog.New(cfg.LogLevel)
	slog.SetDefault(logger)

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := database.NewPool(ctx, cfg.DB.URL, logger)
	if err != nil {
		return err
	}
	defer pool.Close()

	if err := database.Migrate(cfg.DB.URL, logger); err != nil {
		return err
	}
	if cfg.SeedOnStart {
		if err := database.Seed(ctx, pool, cfg, logger); err != nil {
			return err
		}
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
		TrustProxy:     cfg.RateLimit.TrustProxy,
		CORSOrigins:    cfg.CORS.Origins,
		RequestTimeout: cfg.Server.RequestTimeout,
	})

	srv := server.New(cfg.Server.Addr, r)

	errc := make(chan error, 1)
	go func() {
		logger.Info("server listening", "addr", cfg.Server.Addr)
		errc <- srv.ListenAndServe()
	}()

	select {
	case err := <-errc:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	case <-ctx.Done():
		logger.Info("shutdown signal received")
		shCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		defer cancel()
		if err := srv.Shutdown(shCtx); err != nil {
			return err
		}
		logger.Info("server stopped cleanly")
		return nil
	}
}
