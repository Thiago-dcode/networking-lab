-- Runs once, on first start of an empty postgres_data volume.
CREATE TABLE IF NOT EXISTS network_lab (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
