ALTER TABLE rato_snack_live_events ADD COLUMN duration_seconds INTEGER NOT NULL DEFAULT 600;
ALTER TABLE rato_snack_live_events ADD COLUMN started_at TEXT;
ALTER TABLE rato_snack_live_events ADD COLUMN ends_at TEXT;
