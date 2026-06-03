import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { D1Database } from '@cloudflare/workers-types'
import BetterSqlite3 from 'better-sqlite3'

const MIG_DIR = resolve('services/comms-worker/migrations')

type Stmt = ReturnType<BetterSqlite3.Database['prepare']>

const meta = (rowid: number | bigint, changes: number) => ({
  duration: 0,
  size_after: 0,
  rows_read: 0,
  rows_written: 0,
  last_row_id: Number(rowid),
  changed_db: changes > 0,
  changes,
})

const prepare = (db: BetterSqlite3.Database, sql: string) => {
  const buildBound = (stmt: Stmt, params: ReadonlyArray<unknown>) => ({
    first: async <T>() => (stmt.get(...params) ?? null) as T | null,
    all: async <T>() => ({
      results: stmt.all(...params) as T[],
      success: true,
      meta: meta(0, 0),
    }),
    run: async () => {
      const r = stmt.run(...params)
      return { success: true, meta: meta(r.lastInsertRowid, r.changes) }
    },
    raw: async () => stmt.raw().all(...params) as unknown[],
  })
  const stmt = db.prepare(sql)
  return {
    bind: (...params: unknown[]) => buildBound(stmt, params),
    ...buildBound(stmt, []),
  }
}

/**
 * Build an in-memory better-sqlite3 database masquerading as a
 * `D1Database` for repo unit tests. Applies the worker's real
 * migrations so CHECK constraints + partial-unique indexes behave
 * the same as in production D1.
 * @returns A D1-compatible test database.
 */
export const makeTestD1 = (): D1Database => {
  const db = new BetterSqlite3(':memory:')
  for (const file of ['0001_initial.sql', '0002_seed.sql']) {
    db.exec(readFileSync(resolve(MIG_DIR, file), 'utf8'))
  }
  return {
    prepare: (sql: string) => prepare(db, sql),
  } as unknown as D1Database
}
