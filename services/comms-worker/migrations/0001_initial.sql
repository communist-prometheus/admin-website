-- 0001_initial.sql
-- Per specs/comms-newsletter/design.md §2.1.

CREATE TABLE subscribers (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  email           TEXT NOT NULL,
  langs           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','unsubscribed','bounced','complained')),
  created_at      TEXT NOT NULL,
  last_sent_at    TEXT,
  unsubscribed_at TEXT
);

CREATE UNIQUE INDEX subscribers_email_active_uq
  ON subscribers(email) WHERE status = 'active';

CREATE INDEX subscribers_status_idx ON subscribers(status);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE send_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  subscriber_id INTEGER REFERENCES subscribers(id) ON DELETE SET NULL,
  tick_at       TEXT NOT NULL,
  article_count INTEGER NOT NULL,
  status        TEXT NOT NULL
                CHECK (status IN ('sent','failed','bounced','complained','skipped')),
  resend_id     TEXT,
  error         TEXT
);

CREATE INDEX send_log_tick_idx ON send_log(tick_at DESC);
CREATE INDEX send_log_subscriber_idx ON send_log(subscriber_id);
