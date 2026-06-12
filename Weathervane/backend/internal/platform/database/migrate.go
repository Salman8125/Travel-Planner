package database

import (
	"errors"
	"fmt"
	"log/slog"
	"strings"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/pgx/v5"
	"github.com/golang-migrate/migrate/v4/source/iofs"

	weathervane "github.com/travelplanner/weathervane"
)

func Migrate(databaseURL string, log *slog.Logger) error {
	src, err := iofs.New(weathervane.MigrationsFS, "db/migrations")
	if err != nil {
		return fmt.Errorf("migrate source: %w", err)
	}

	m, err := migrate.NewWithSourceInstance("iofs", src, toPgxURL(databaseURL))
	if err != nil {
		return fmt.Errorf("migrate init: %w", err)
	}
	defer func() { _, _ = m.Close() }()

	if err := m.Up(); err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return fmt.Errorf("migrate up: %w", err)
	}

	log.Info("migrations applied")
	return nil
}

func toPgxURL(u string) string {
	switch {
	case strings.HasPrefix(u, "postgresql://"):
		return "pgx5://" + strings.TrimPrefix(u, "postgresql://")
	case strings.HasPrefix(u, "postgres://"):
		return "pgx5://" + strings.TrimPrefix(u, "postgres://")
	default:
		return u
	}
}
