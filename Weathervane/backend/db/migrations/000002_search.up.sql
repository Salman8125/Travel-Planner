CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_locations_city_trgm ON locations USING gin (city gin_trgm_ops);
CREATE INDEX idx_locations_name_trgm ON locations USING gin (name gin_trgm_ops);
