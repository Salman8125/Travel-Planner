#!/bin/sh
set -e

: "${PGPORT:=5432}"
if [ -z "$PGHOST" ] && [ -n "$DATABASE_URL" ]; then
  PGHOST=$(printf '%s' "$DATABASE_URL" | sed -E 's#.*@([^:/]+).*#\1#')
  PGPORT=$(printf '%s' "$DATABASE_URL" | sed -E 's#.*@[^:/]+:([0-9]+).*#\1#')
  PGUSER=$(printf '%s' "$DATABASE_URL" | sed -E 's#.*://([^:/@]+).*#\1#')
fi

echo "[skyscout] waiting for postgres at ${PGHOST}:${PGPORT}..."
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "${PGUSER:-postgres}" >/dev/null 2>&1; do
  sleep 1
done

echo "[skyscout] running migrations"
node dist/infra/db/migrate.js

if [ "$SEED_ON_START" = "true" ] || [ "$SEED_ON_START" = "1" ]; then
  echo "[skyscout] seeding"
  node dist/infra/db/seed.js
fi

echo "[skyscout] starting server"
exec node dist/main.js
