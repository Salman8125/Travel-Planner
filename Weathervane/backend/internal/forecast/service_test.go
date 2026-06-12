package forecast

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/travelplanner/weathervane/internal/domain"
)

type mockProvider struct {
	daily []domain.DailyForecast
	cur   domain.CurrentWeather
	err   error
	calls int
}

func (m *mockProvider) DailyRange(ctx context.Context, id string, s, e time.Time) ([]domain.DailyForecast, error) {
	m.calls++
	return m.daily, m.err
}

func (m *mockProvider) Current(ctx context.Context, id string) (domain.CurrentWeather, error) {
	m.calls++
	return m.cur, m.err
}

type mockResolver struct {
	loc domain.Location
	err error
}

func (m *mockResolver) Get(ctx context.Context, id string) (domain.Location, error) {
	return m.loc, m.err
}

func (m *mockResolver) Resolve(ctx context.Context, city string, country *string) (domain.Location, error) {
	return m.loc, m.err
}

func TestParseRange(t *testing.T) {
	cases := []struct {
		name, start, end string
		wantErr          bool
	}{
		{"defaults to 7 days", "", "", false},
		{"valid week", "2026-01-01", "2026-01-07", false},
		{"max 16 days ok", "2026-01-01", "2026-01-16", false},
		{"end before start", "2026-01-07", "2026-01-01", true},
		{"span too large", "2026-01-01", "2026-02-01", true},
		{"malformed start", "not-a-date", "2026-01-07", true},
		{"malformed end", "2026-01-01", "xyz", true},
	}
	for _, c := range cases {
		t.Run(c.name, func(t *testing.T) {
			_, _, err := parseRange(c.start, c.end)
			if c.wantErr {
				assert.Error(t, err)
			} else {
				assert.NoError(t, err)
			}
		})
	}
}

func TestGetRange_resolvesByIDAndReturns(t *testing.T) {
	prov := &mockProvider{daily: []domain.DailyForecast{{Date: "2026-01-01", High: 10, Low: 5, Condition: domain.ConditionSunny}}}
	svc := NewService(prov, nil, &mockResolver{loc: domain.Location{ID: "loc-1"}})
	out, err := svc.GetRange(context.Background(), RangeQuery{LocationID: "loc-1", Start: "2026-01-01", End: "2026-01-05"})
	require.NoError(t, err)
	assert.Len(t, out, 1)
}

func TestGetRange_emptyResultIsNotAnError(t *testing.T) {
	svc := NewService(&mockProvider{daily: []domain.DailyForecast{}}, nil, &mockResolver{loc: domain.Location{ID: "loc-1"}})
	out, err := svc.GetRange(context.Background(), RangeQuery{LocationID: "loc-1"})
	require.NoError(t, err)
	assert.Empty(t, out)
}

func TestGetRange_requiresLocationIDOrCity(t *testing.T) {
	svc := NewService(&mockProvider{}, nil, &mockResolver{})
	_, err := svc.GetRange(context.Background(), RangeQuery{})
	var ve *domain.ValidationError
	assert.ErrorAs(t, err, &ve)
}

func TestValidateDaily(t *testing.T) {
	err := validateDaily(domain.DailyForecast{Date: "2026-01-01", High: 5, Low: 10, Condition: "BOGUS"})
	var ve *domain.ValidationError
	require.ErrorAs(t, err, &ve)
	assert.Contains(t, ve.Details, "condition")
	assert.Contains(t, ve.Details, "high")
}
