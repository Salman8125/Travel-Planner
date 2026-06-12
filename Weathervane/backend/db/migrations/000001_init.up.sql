CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
CREATE TYPE condition AS ENUM (
  'SUNNY', 'CLOUDY', 'PARTLY_CLOUDY', 'RAINY', 'SNOWY', 'WINDY', 'FOGGY', 'STORMY'
);

CREATE TABLE users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role          user_role NOT NULL DEFAULT 'USER',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE locations (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  city       text NOT NULL,
  country    text NOT NULL,
  latitude   double precision NOT NULL,
  longitude  double precision NOT NULL,
  timezone   text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_locations_city_country UNIQUE (city, country),
  CONSTRAINT chk_latitude  CHECK (latitude >= -90 AND latitude <= 90),
  CONSTRAINT chk_longitude CHECK (longitude >= -180 AND longitude <= 180)
);
CREATE INDEX idx_locations_city ON locations (city);

CREATE TABLE daily_forecasts (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id          uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  date                 date NOT NULL,
  high_c               double precision NOT NULL,
  low_c                double precision NOT NULL,
  condition            condition NOT NULL,
  precipitation_chance int,
  humidity             int,
  wind_kph             double precision,
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_daily_location_date UNIQUE (location_id, date),
  CONSTRAINT chk_precip    CHECK (precipitation_chance IS NULL OR (precipitation_chance >= 0 AND precipitation_chance <= 100)),
  CONSTRAINT chk_humidity  CHECK (humidity IS NULL OR (humidity >= 0 AND humidity <= 100)),
  CONSTRAINT chk_high_low  CHECK (high_c >= low_c)
);
CREATE INDEX idx_daily_location_date ON daily_forecasts (location_id, date);

CREATE TABLE current_weather (
  location_id uuid PRIMARY KEY REFERENCES locations(id) ON DELETE CASCADE,
  temp_c      double precision NOT NULL,
  condition   condition NOT NULL,
  humidity    int,
  wind_kph    double precision,
  observed_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chk_current_humidity CHECK (humidity IS NULL OR (humidity >= 0 AND humidity <= 100))
);
