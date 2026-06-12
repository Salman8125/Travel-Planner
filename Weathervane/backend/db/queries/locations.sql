-- name: GetLocationByID :one
SELECT * FROM locations WHERE id = $1;

-- name: CountLocations :one
SELECT count(*) FROM locations
WHERE (sqlc.narg('q')::text IS NULL
       OR name ILIKE '%' || sqlc.narg('q') || '%'
       OR city ILIKE '%' || sqlc.narg('q') || '%')
  AND (sqlc.narg('country')::text IS NULL OR country = sqlc.narg('country'));

-- name: SearchLocations :many
SELECT * FROM locations
WHERE (sqlc.narg('q')::text IS NULL
       OR name ILIKE '%' || sqlc.narg('q') || '%'
       OR city ILIKE '%' || sqlc.narg('q') || '%')
  AND (sqlc.narg('country')::text IS NULL OR country = sqlc.narg('country'))
ORDER BY city ASC, name ASC
LIMIT sqlc.arg('limit') OFFSET sqlc.arg('offset');

-- name: FindLocationsByCity :many
SELECT * FROM locations
WHERE lower(city) = lower(sqlc.arg('city'))
  AND (sqlc.narg('country')::text IS NULL OR country = sqlc.narg('country'))
ORDER BY country ASC;

-- name: InsertLocation :one
INSERT INTO locations (name, city, country, latitude, longitude, timezone)
VALUES ($1, $2, $3, $4, $5, $6)
RETURNING *;

-- name: UpdateLocation :one
UPDATE locations SET
  name      = COALESCE(sqlc.narg('name'), name),
  city      = COALESCE(sqlc.narg('city'), city),
  country   = COALESCE(sqlc.narg('country'), country),
  latitude  = COALESCE(sqlc.narg('latitude'), latitude),
  longitude = COALESCE(sqlc.narg('longitude'), longitude),
  timezone  = COALESCE(sqlc.narg('timezone'), timezone),
  updated_at = now()
WHERE id = sqlc.arg('id')
RETURNING *;

-- name: DeleteLocation :execrows
DELETE FROM locations WHERE id = $1;
