package forecast

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/travelplanner/weathervane/internal/domain"
)

func TestCacheProvider_hitMissInvalidate(t *testing.T) {
	prov := &mockProvider{daily: []domain.DailyForecast{{Date: "2026-01-01"}}}
	c := NewCacheProvider(prov, time.Minute)
	start, _ := time.Parse("2006-01-02", "2026-01-01")
	end, _ := time.Parse("2006-01-02", "2026-01-05")

	_, err := c.DailyRange(context.Background(), "loc-1", start, end)
	require.NoError(t, err)
	assert.Equal(t, 1, prov.calls, "first call is a miss")

	_, err = c.DailyRange(context.Background(), "loc-1", start, end)
	require.NoError(t, err)
	assert.Equal(t, 1, prov.calls, "second call is a cache hit")

	inv, ok := c.(Invalidator)
	require.True(t, ok)
	inv.Invalidate("loc-1")

	_, err = c.DailyRange(context.Background(), "loc-1", start, end)
	require.NoError(t, err)
	assert.Equal(t, 2, prov.calls, "after invalidate, call hits the provider again")
}
