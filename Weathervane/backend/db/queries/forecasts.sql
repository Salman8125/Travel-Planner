-- name: DailyRange :many
SELECT * FROM daily_forecasts
WHERE location_id = $1 AND date BETWEEN $2 AND $3
ORDER BY date ASC;

-- name: UpsertDailyForecast :one
INSERT INTO daily_forecasts (
  location_id, date, high_c, low_c, condition, precipitation_chance, humidity, wind_kph
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
ON CONFLICT (location_id, date) DO UPDATE SET
  high_c               = EXCLUDED.high_c,
  low_c                = EXCLUDED.low_c,
  condition            = EXCLUDED.condition,
  precipitation_chance = EXCLUDED.precipitation_chance,
  humidity             = EXCLUDED.humidity,
  wind_kph             = EXCLUDED.wind_kph,
  updated_at           = now()
RETURNING *;
