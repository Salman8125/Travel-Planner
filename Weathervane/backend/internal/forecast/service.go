package forecast

import (
	"context"
	"time"

	"github.com/travelplanner/weathervane/internal/domain"
)

type LocationResolver interface {
	Get(ctx context.Context, id string) (domain.Location, error)
	Resolve(ctx context.Context, city string, country *string) (domain.Location, error)
}

type Service struct {
	provider Provider
	repo     Repo
	loc      LocationResolver
}

func NewService(provider Provider, repo Repo, loc LocationResolver) *Service {
	return &Service{provider: provider, repo: repo, loc: loc}
}

type RangeQuery struct {
	LocationID string
	City       string
	Country    *string
	Start      string
	End        string
}

func (s *Service) GetRange(ctx context.Context, q RangeQuery) ([]domain.DailyForecast, error) {
	locID, err := s.resolveLocation(ctx, q.LocationID, q.City, q.Country)
	if err != nil {
		return nil, err
	}
	start, end, err := parseRange(q.Start, q.End)
	if err != nil {
		return nil, err
	}
	return s.provider.DailyRange(ctx, locID, start, end)
}

func (s *Service) GetCurrent(ctx context.Context, locationID, city string, country *string) (domain.CurrentWeather, error) {
	locID, err := s.resolveLocation(ctx, locationID, city, country)
	if err != nil {
		return domain.CurrentWeather{}, err
	}
	return s.provider.Current(ctx, locID)
}

func (s *Service) UpsertForecast(ctx context.Context, locationID string, f domain.DailyForecast) (domain.DailyForecast, error) {
	if _, err := s.loc.Get(ctx, locationID); err != nil {
		return domain.DailyForecast{}, err
	}
	if err := validateDaily(f); err != nil {
		return domain.DailyForecast{}, err
	}
	out, err := s.repo.UpsertDaily(ctx, locationID, f)
	if err != nil {
		return domain.DailyForecast{}, err
	}
	s.invalidate(locationID)
	return out, nil
}

func (s *Service) UpsertCurrent(ctx context.Context, locationID string, c domain.CurrentWeather) (domain.CurrentWeather, error) {
	if _, err := s.loc.Get(ctx, locationID); err != nil {
		return domain.CurrentWeather{}, err
	}
	if err := validateCurrent(c); err != nil {
		return domain.CurrentWeather{}, err
	}
	out, err := s.repo.UpsertCurrent(ctx, locationID, c)
	if err != nil {
		return domain.CurrentWeather{}, err
	}
	s.invalidate(locationID)
	return out, nil
}

func (s *Service) resolveLocation(ctx context.Context, id, city string, country *string) (string, error) {
	if id != "" {
		loc, err := s.loc.Get(ctx, id)
		if err != nil {
			return "", err
		}
		return loc.ID, nil
	}
	if city != "" {
		loc, err := s.loc.Resolve(ctx, city, country)
		if err != nil {
			return "", err
		}
		return loc.ID, nil
	}
	return "", domain.NewValidationError("locationId or city is required", map[string]string{"locationId": "provide locationId or city"})
}

func (s *Service) invalidate(locationID string) {
	if inv, ok := s.provider.(Invalidator); ok {
		inv.Invalidate(locationID)
	}
}

func parseRange(startStr, endStr string) (time.Time, time.Time, error) {
	now := time.Now().UTC().Truncate(24 * time.Hour)
	var start, end time.Time
	var err error

	if startStr == "" {
		start = now
	} else if start, err = time.Parse("2006-01-02", startStr); err != nil {
		return time.Time{}, time.Time{}, domain.NewValidationError("invalid startDate", map[string]string{"startDate": "must be YYYY-MM-DD"})
	}

	if endStr == "" {
		end = start.AddDate(0, 0, 6)
	} else if end, err = time.Parse("2006-01-02", endStr); err != nil {
		return time.Time{}, time.Time{}, domain.NewValidationError("invalid endDate", map[string]string{"endDate": "must be YYYY-MM-DD"})
	}

	if end.Before(start) {
		return time.Time{}, time.Time{}, domain.NewValidationError("startDate must be on or before endDate", map[string]string{"endDate": "must be on or after startDate"})
	}
	if end.Sub(start) > time.Duration(domain.MaxForecastSpanDays-1)*24*time.Hour {
		return time.Time{}, time.Time{}, domain.NewValidationError("date range too large", map[string]string{"endDate": "range cannot exceed 16 days"})
	}
	return start, end, nil
}

func validateDaily(f domain.DailyForecast) error {
	details := map[string]string{}
	if _, err := time.Parse("2006-01-02", f.Date); err != nil {
		details["date"] = "must be YYYY-MM-DD"
	}
	if !f.Condition.Valid() {
		details["condition"] = "invalid condition"
	}
	if f.High < f.Low {
		details["high"] = "must be greater than or equal to low"
	}
	if f.PrecipitationChance != nil && (*f.PrecipitationChance < 0 || *f.PrecipitationChance > 100) {
		details["precipitationChance"] = "must be between 0 and 100"
	}
	if f.Humidity != nil && (*f.Humidity < 0 || *f.Humidity > 100) {
		details["humidity"] = "must be between 0 and 100"
	}
	if len(details) > 0 {
		return domain.NewValidationError("invalid forecast", details)
	}
	return nil
}

func validateCurrent(c domain.CurrentWeather) error {
	details := map[string]string{}
	if !c.Condition.Valid() {
		details["condition"] = "invalid condition"
	}
	if c.Humidity != nil && (*c.Humidity < 0 || *c.Humidity > 100) {
		details["humidity"] = "must be between 0 and 100"
	}
	if len(details) > 0 {
		return domain.NewValidationError("invalid current weather", details)
	}
	return nil
}
