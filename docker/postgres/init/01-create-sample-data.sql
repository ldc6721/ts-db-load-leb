CREATE TABLE IF NOT EXISTS sample_data (
    id TEXT PRIMARY KEY,
    worker_id TEXT NOT NULL,
    group_id TEXT NOT NULL,
    sequence INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sample_data_group_id
ON sample_data (group_id);

CREATE INDEX IF NOT EXISTS idx_sample_data_group_worker
ON sample_data (group_id, worker_id);
