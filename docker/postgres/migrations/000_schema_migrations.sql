-- Tracks applied SQL migrations (optional runner / manual logging)
CREATE TABLE IF NOT EXISTS schema_migrations (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) UNIQUE NOT NULL,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
