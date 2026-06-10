#!/bin/sh
set -e

echo "[pennypilot] applying migrations..."
until python manage.py migrate --noinput; do
  echo "[pennypilot] database not ready yet, retrying in 2s..."
  sleep 2
done

echo "[pennypilot] collecting static files..."
python manage.py collectstatic --noinput

echo "[pennypilot] ensuring superuser..."
python manage.py createsuperuser --noinput 2>/dev/null \
  && echo "[pennypilot] superuser created" \
  || echo "[pennypilot] superuser already exists or env not set"

echo "[pennypilot] starting gunicorn on 0.0.0.0:4003..."
exec gunicorn pennypilot.wsgi:application --bind 0.0.0.0:4003 --workers 3
