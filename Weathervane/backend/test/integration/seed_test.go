//go:build integration

package integration

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"

	"github.com/travelplanner/weathervane/internal/config"
	"github.com/travelplanner/weathervane/internal/platform/database"
	"github.com/travelplanner/weathervane/internal/platform/database/sqlc"
	applog "github.com/travelplanner/weathervane/internal/platform/logger"
)

func TestSeed_concurrentIsRaceSafe(t *testing.T) {
	ctx := context.Background()
	pgC, err := postgres.Run(ctx, "postgres:16-alpine",
		postgres.WithDatabase("weather"),
		postgres.WithUsername("weather"),
		postgres.WithPassword("weather"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).WithStartupTimeout(90*time.Second),
		),
	)
	require.NoError(t, err)
	defer func() { _ = pgC.Terminate(ctx) }()

	dsn, err := pgC.ConnectionString(ctx, "sslmode=disable")
	require.NoError(t, err)

	log := applog.New("error")
	require.NoError(t, database.Migrate(dsn, log))
	pool, err := database.NewPool(ctx, dsn, log)
	require.NoError(t, err)
	defer pool.Close()

	cfg := config.Config{Auth: config.AuthConfig{BcryptCost: 4}}

	const n = 6
	var wg sync.WaitGroup
	errs := make([]error, n)
	for i := 0; i < n; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			errs[i] = database.Seed(ctx, pool, cfg, log)
		}(i)
	}
	wg.Wait()

	for i, e := range errs {
		require.NoError(t, e, "seeder %d", i)
	}

	count, err := sqlc.New(pool).CountUsers(ctx)
	require.NoError(t, err)
	require.Equal(t, int64(2), count, "advisory lock should prevent duplicate seeding")
}
