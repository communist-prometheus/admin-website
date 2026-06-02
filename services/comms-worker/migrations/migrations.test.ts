import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const dir = resolve('services/comms-worker/migrations')
const read = (file: string): string =>
  readFileSync(resolve(dir, file), 'utf8')

const initial = read('0001_initial.sql')
const seed = read('0002_seed.sql')

describe('migration 0001_initial.sql', () => {
  it('creates the subscribers table with required columns', () => {
    expect(initial).toMatch(/CREATE TABLE subscribers/)
    for (const col of [
      'id              INTEGER PRIMARY KEY AUTOINCREMENT',
      'email           TEXT NOT NULL',
      'langs           TEXT NOT NULL',
      'last_sent_at    TEXT',
      'unsubscribed_at TEXT',
    ]) {
      expect(initial).toContain(col)
    }
  })

  it('declares the status CHECK with all four allowed values', () => {
    expect(initial).toMatch(
      /CHECK\s*\(status\s+IN\s*\('active','unsubscribed','bounced','complained'\)\)/
    )
  })

  it('creates the partial-unique index on active emails', () => {
    expect(initial).toMatch(
      /CREATE UNIQUE INDEX subscribers_email_active_uq[\s\S]*WHERE status = 'active'/
    )
  })

  it('creates settings table keyed by `key`', () => {
    expect(initial).toMatch(
      /CREATE TABLE settings\s*\(\s*key\s+TEXT PRIMARY KEY/
    )
  })

  it('creates send_log with ON DELETE SET NULL on subscriber_id', () => {
    expect(initial).toMatch(
      /subscriber_id\s+INTEGER\s+REFERENCES subscribers\(id\)\s+ON DELETE SET NULL/
    )
  })

  it('creates the send_log tick + subscriber indexes', () => {
    expect(initial).toContain(
      'CREATE INDEX send_log_tick_idx ON send_log(tick_at DESC)'
    )
    expect(initial).toContain(
      'CREATE INDEX send_log_subscriber_idx ON send_log(subscriber_id)'
    )
  })
})

describe('migration 0002_seed.sql', () => {
  it('seeds the default schedule row', () => {
    expect(seed).toMatch(/INSERT INTO settings.*VALUES/s)
    expect(seed).toContain("'schedule'")
    expect(seed).toContain('"cron":"0 12 * * 6"')
    expect(seed).toContain('"timezone":"Europe/Moscow"')
  })
})
