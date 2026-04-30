-- Span ingest table. One row per OTLP span; trace tree is reconstructed
-- by grouping on trace_id at query time.
CREATE TABLE IF NOT EXISTS spans (
  trace_id        TEXT    NOT NULL,
  span_id         TEXT    NOT NULL PRIMARY KEY,
  parent_span_id  TEXT,
  name            TEXT    NOT NULL,
  started_at      INTEGER NOT NULL,
  finished_at     INTEGER NOT NULL,
  status          TEXT    NOT NULL,
  attrs           TEXT    NOT NULL DEFAULT '{}',
  user            TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_spans_trace_id   ON spans (trace_id);
CREATE INDEX IF NOT EXISTS idx_spans_started_at ON spans (started_at DESC);
CREATE INDEX IF NOT EXISTS idx_spans_user       ON spans (user);

-- Log records correlated to a span via trace_id + span_id when set.
CREATE TABLE IF NOT EXISTS logs (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  trace_id  TEXT,
  span_id   TEXT,
  level     TEXT    NOT NULL,
  message   TEXT    NOT NULL,
  at        INTEGER NOT NULL,
  attrs     TEXT    NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_logs_trace_id ON logs (trace_id);
CREATE INDEX IF NOT EXISTS idx_logs_at       ON logs (at DESC);
