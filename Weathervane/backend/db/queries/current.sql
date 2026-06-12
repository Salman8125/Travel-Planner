-- name: GetCurrentWeather :one
SELECT * FROM current_weather WHERE location_id = $1;

-- name: UpsertCurrentWeather :one
INSERT INTO current_weather (location_id, temp_c, condition, humidity, wind_kph, observed_at)
VALUES ($1, $2, $3, $4, $5, now())
ON CONFLICT (location_id) DO UPDATE SET
  temp_c      = EXCLUDED.temp_c,
  condition   = EXCLUDED.condition,
  humidity    = EXCLUDED.humidity,
  wind_kph    = EXCLUDED.wind_kph,
  observed_at = now()
RETURNING *;
