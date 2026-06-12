package database

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/jackc/pgx/v5/pgxpool"
	"golang.org/x/crypto/bcrypt"

	"github.com/travelplanner/weathervane/internal/config"
	"github.com/travelplanner/weathervane/internal/platform/database/sqlc"
)

type seedLocation struct {
	name, city, country, timezone string
	lat, lon                      float64
}

var seedLocations = []seedLocation{
	{"Istanbul", "Istanbul", "TR", "Europe/Istanbul", 41.0082, 28.9784},
	{"Islamabad", "Islamabad", "PK", "Asia/Karachi", 33.6844, 73.0479},
	{"Lahore", "Lahore", "PK", "Asia/Karachi", 31.5204, 74.3587},
	{"Dubai", "Dubai", "AE", "Asia/Dubai", 25.2048, 55.2708},
	{"Doha", "Doha", "QA", "Asia/Qatar", 25.2854, 51.5310},
	{"London", "London", "GB", "Europe/London", 51.5074, -0.1278},
	{"New York", "New York", "US", "America/New_York", 40.7128, -74.0060},
	{"Tokyo", "Tokyo", "JP", "Asia/Tokyo", 35.6762, 139.6503},
	{"Paris", "Paris", "FR", "Europe/Paris", 48.8566, 2.3522},
	{"Sydney", "Sydney", "AU", "Australia/Sydney", -33.8688, 151.2093},
}

var seedConditions = []sqlc.Condition{
	sqlc.ConditionSUNNY, sqlc.ConditionPARTLYCLOUDY, sqlc.ConditionCLOUDY,
	sqlc.ConditionRAINY, sqlc.ConditionWINDY, sqlc.ConditionFOGGY, sqlc.ConditionSTORMY,
}

func Seed(ctx context.Context, pool *pgxpool.Pool, cfg config.Config, log *slog.Logger) error {
	tx, err := pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("seed begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, "SELECT pg_advisory_xact_lock($1)", int64(0x57454154)); err != nil {
		return fmt.Errorf("seed advisory lock: %w", err)
	}

	q := sqlc.New(tx)

	n, err := q.CountUsers(ctx)
	if err != nil {
		return fmt.Errorf("seed count users: %w", err)
	}
	if n > 0 {
		log.Info("seed skipped, data already present")
		return tx.Commit(ctx)
	}

	adminHash, err := bcrypt.GenerateFromPassword([]byte("admin12345"), cfg.Auth.BcryptCost)
	if err != nil {
		return err
	}
	userHash, err := bcrypt.GenerateFromPassword([]byte("user12345"), cfg.Auth.BcryptCost)
	if err != nil {
		return err
	}
	if _, err := q.InsertUser(ctx, sqlc.InsertUserParams{Email: "admin@weathervane.dev", PasswordHash: string(adminHash), Role: sqlc.UserRoleADMIN}); err != nil {
		return fmt.Errorf("seed admin: %w", err)
	}
	if _, err := q.InsertUser(ctx, sqlc.InsertUserParams{Email: "user@weathervane.dev", PasswordHash: string(userHash), Role: sqlc.UserRoleUSER}); err != nil {
		return fmt.Errorf("seed user: %w", err)
	}

	start := time.Now().UTC().Truncate(24 * time.Hour)
	for li, loc := range seedLocations {
		row, err := q.InsertLocation(ctx, sqlc.InsertLocationParams{
			Name: loc.name, City: loc.city, Country: loc.country,
			Latitude: loc.lat, Longitude: loc.lon, Timezone: loc.timezone,
		})
		if err != nil {
			return fmt.Errorf("seed location %s: %w", loc.city, err)
		}
		base := 12.0 + float64(li)
		for d := 0; d < 14; d++ {
			day := start.AddDate(0, 0, d)
			cond := seedConditions[(li+d)%len(seedConditions)]
			high := base + 8 + float64(d%5)
			low := base - 2 + float64(d%3)
			precip := int32((d * 7) % 100)
			hum := int32(40 + (d*5)%50)
			wind := 5 + float64((li+d)%20)
			if _, err := q.UpsertDailyForecast(ctx, sqlc.UpsertDailyForecastParams{
				LocationID:          row.ID,
				Date:                Date(day),
				HighC:               high,
				LowC:                low,
				Condition:           cond,
				PrecipitationChance: pgtype.Int4{Int32: precip, Valid: true},
				Humidity:            pgtype.Int4{Int32: hum, Valid: true},
				WindKph:             pgtype.Float8{Float64: wind, Valid: true},
			}); err != nil {
				return fmt.Errorf("seed forecast %s %s: %w", loc.city, day.Format("2006-01-02"), err)
			}
		}
		if _, err := q.UpsertCurrentWeather(ctx, sqlc.UpsertCurrentWeatherParams{
			LocationID: row.ID,
			TempC:      base + 5,
			Condition:  seedConditions[li%len(seedConditions)],
			Humidity:   pgtype.Int4{Int32: 55, Valid: true},
			WindKph:    pgtype.Float8{Float64: 10, Valid: true},
		}); err != nil {
			return fmt.Errorf("seed current %s: %w", loc.city, err)
		}
	}

	log.Info("seed complete", "locations", len(seedLocations))
	return tx.Commit(ctx)
}
