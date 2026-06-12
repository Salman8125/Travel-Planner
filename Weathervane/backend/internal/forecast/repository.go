package forecast

import (
	"context"
	"time"

	"github.com/google/uuid"

	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/platform/database"
	"github.com/travelplanner/weathervane/internal/platform/database/sqlc"
)

type Repo interface {
	DailyRange(ctx context.Context, locationID string, start, end time.Time) ([]domain.DailyForecast, error)
	UpsertDaily(ctx context.Context, locationID string, f domain.DailyForecast) (domain.DailyForecast, error)
	Current(ctx context.Context, locationID string) (domain.CurrentWeather, error)
	UpsertCurrent(ctx context.Context, locationID string, c domain.CurrentWeather) (domain.CurrentWeather, error)
}

type pgRepo struct{ q sqlc.Querier }

func NewRepo(q sqlc.Querier) Repo { return &pgRepo{q: q} }

func (r *pgRepo) DailyRange(ctx context.Context, locationID string, start, end time.Time) ([]domain.DailyForecast, error) {
	uid, err := uuid.Parse(locationID)
	if err != nil {
		return nil, domain.ErrNotFound
	}
	rows, err := r.q.DailyRange(ctx, sqlc.DailyRangeParams{
		LocationID: uid,
		Date:       database.Date(start),
		Date_2:     database.Date(end),
	})
	if err != nil {
		return nil, database.MapPgError(err)
	}
	out := make([]domain.DailyForecast, 0, len(rows))
	for _, row := range rows {
		out = append(out, toDomainDaily(row))
	}
	return out, nil
}

func (r *pgRepo) UpsertDaily(ctx context.Context, locationID string, f domain.DailyForecast) (domain.DailyForecast, error) {
	uid, err := uuid.Parse(locationID)
	if err != nil {
		return domain.DailyForecast{}, domain.ErrNotFound
	}
	day, err := time.Parse("2006-01-02", f.Date)
	if err != nil {
		return domain.DailyForecast{}, domain.NewValidationError("invalid date", map[string]string{"date": "must be YYYY-MM-DD"})
	}
	row, err := r.q.UpsertDailyForecast(ctx, sqlc.UpsertDailyForecastParams{
		LocationID:          uid,
		Date:                database.Date(day),
		HighC:               f.High,
		LowC:                f.Low,
		Condition:           sqlc.Condition(f.Condition),
		PrecipitationChance: database.Int4FromPtr(f.PrecipitationChance),
		Humidity:            database.Int4FromPtr(f.Humidity),
		WindKph:             database.Float8FromPtr(f.WindKph),
	})
	if err != nil {
		return domain.DailyForecast{}, database.MapPgError(err)
	}
	return toDomainDaily(row), nil
}

func (r *pgRepo) Current(ctx context.Context, locationID string) (domain.CurrentWeather, error) {
	uid, err := uuid.Parse(locationID)
	if err != nil {
		return domain.CurrentWeather{}, domain.ErrNotFound
	}
	row, err := r.q.GetCurrentWeather(ctx, uid)
	if err != nil {
		return domain.CurrentWeather{}, database.MapPgError(err)
	}
	return toDomainCurrent(row), nil
}

func (r *pgRepo) UpsertCurrent(ctx context.Context, locationID string, c domain.CurrentWeather) (domain.CurrentWeather, error) {
	uid, err := uuid.Parse(locationID)
	if err != nil {
		return domain.CurrentWeather{}, domain.ErrNotFound
	}
	row, err := r.q.UpsertCurrentWeather(ctx, sqlc.UpsertCurrentWeatherParams{
		LocationID: uid,
		TempC:      c.TempC,
		Condition:  sqlc.Condition(c.Condition),
		Humidity:   database.Int4FromPtr(c.Humidity),
		WindKph:    database.Float8FromPtr(c.WindKph),
	})
	if err != nil {
		return domain.CurrentWeather{}, database.MapPgError(err)
	}
	return toDomainCurrent(row), nil
}

func toDomainDaily(d sqlc.DailyForecast) domain.DailyForecast {
	return domain.DailyForecast{
		Date:                database.DateString(d.Date),
		High:                d.HighC,
		Low:                 d.LowC,
		Condition:           domain.Condition(d.Condition),
		PrecipitationChance: database.Int4ToPtr(d.PrecipitationChance),
		Humidity:            database.Int4ToPtr(d.Humidity),
		WindKph:             database.Float8ToPtr(d.WindKph),
	}
}

func toDomainCurrent(c sqlc.CurrentWeather) domain.CurrentWeather {
	return domain.CurrentWeather{
		LocationID: c.LocationID.String(),
		TempC:      c.TempC,
		Condition:  domain.Condition(c.Condition),
		Humidity:   database.Int4ToPtr(c.Humidity),
		WindKph:    database.Float8ToPtr(c.WindKph),
		ObservedAt: database.Time(c.ObservedAt),
	}
}
