package forecast

import (
	"context"
	"time"

	"github.com/travelplanner/weathervane/internal/domain"
)

type Provider interface {
	DailyRange(ctx context.Context, locationID string, start, end time.Time) ([]domain.DailyForecast, error)
	Current(ctx context.Context, locationID string) (domain.CurrentWeather, error)
}

type Invalidator interface {
	Invalidate(locationID string)
}
