-- 0003_message_lang.sql
-- Per-subscriber message (email chrome) language, distinct from the
-- content `langs[]`. Defaults to English for every existing and new
-- row; the editor can change it per subscriber in the admin UI.

ALTER TABLE subscribers ADD COLUMN message_lang TEXT NOT NULL DEFAULT 'en';
