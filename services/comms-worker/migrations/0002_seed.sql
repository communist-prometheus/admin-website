-- 0002_seed.sql
-- Default schedule from requirements.md R2.3.

INSERT INTO settings (key, value) VALUES
  ('schedule', '{"cron":"0 12 * * 6","timezone":"Europe/Moscow"}');
