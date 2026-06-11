#!/bin/sh
set -e

: "${PGPORT:=5432}"
if [ -z "$PGHOST" ] && [ -n "$DATABASE_URL" ]; then
  PGHOST=$(printf '%s' "$DATABASE_URL" | sed -E 's#.*@([^:/]+).*#\1#')
  PGPORT=$(printf '%s' "$DATABASE_URL" | sed -E 's#.*@[^:/]+:([0-9]+).*#\1#')
  PGUSER=$(printf '%s' "$DATABASE_URL" | sed -E 's#.*://([^:/@]+).*#\1#')
fi
: "${PGHOST:=${POSTGRES_HOST:-localhost}}"
: "${PGUSER:=${POSTGRES_USER:-postgres}}"

echo "[pennypilot] waiting for postgres at ${PGHOST}:${PGPORT}..."
until pg_isready -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" >/dev/null 2>&1; do
  sleep 1
done

echo "[pennypilot] running migrations"
python manage.py migrate --noinput

if [ "$SEED_ON_START" = "true" ] || [ "$SEED_ON_START" = "1" ]; then
  echo "[pennypilot] seeding"
  python manage.py seed
fi

echo "[pennypilot] starting gunicorn on 0.0.0.0:8000"
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 3 --access-logfile - --error-logfile -
