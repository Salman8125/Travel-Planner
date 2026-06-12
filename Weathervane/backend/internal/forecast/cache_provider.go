package forecast

import (
	"context"
	"time"

	"github.com/travelplanner/weathervane/internal/domain"
	"github.com/travelplanner/weathervane/internal/platform/cache"
)

type cacheProvider struct {
	next  Provider
	ttl   time.Duration
	daily *cache.TTL[[]domain.DailyForecast]
	cur   *cache.TTL[domain.CurrentWeather]
}

func NewCacheProvider(next Provider, ttl time.Duration) Provider {
	cleanup := ttl
	if cleanup < time.Minute {
		cleanup = time.Minute
	}
	return &cacheProvider{
		next:  next,
		ttl:   ttl,
		daily: cache.NewTTL[[]domain.DailyForecast](cleanup),
		cur:   cache.NewTTL[domain.CurrentWeather](cleanup),
	}
}

func dailyKey(locationID string, start, end time.Time) string {
	return locationID + "|" + start.Format("2006-01-02") + "|" + end.Format("2006-01-02")
}

func (c *cacheProvider) DailyRange(ctx context.Context, locationID string, start, end time.Time) ([]domain.DailyForecast, error) {
	key := dailyKey(locationID, start, end)
	if v, ok := c.daily.Get(key); ok {
		return v, nil
	}
	v, err := c.next.DailyRange(ctx, locationID, start, end)
	if err != nil {
		return nil, err
	}
	c.daily.Set(key, v, c.ttl)
	return v, nil
}

func (c *cacheProvider) Current(ctx context.Context, locationID string) (domain.CurrentWeather, error) {
	if v, ok := c.cur.Get(locationID); ok {
		return v, nil
	}
	v, err := c.next.Current(ctx, locationID)
	if err != nil {
		return domain.CurrentWeather{}, err
	}
	c.cur.Set(locationID, v, c.ttl)
	return v, nil
}

func (c *cacheProvider) Invalidate(locationID string) {
	c.daily.DeletePrefix(locationID + "|")
	c.cur.Delete(locationID)
}
