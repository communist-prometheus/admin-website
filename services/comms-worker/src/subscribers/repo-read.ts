import type { D1Database } from '@cloudflare/workers-types'
import { rowToSubscriber } from './serialize'
import type { Subscriber } from './types'

type Row = Parameters<typeof rowToSubscriber>[0]

const SQL_ACTIVE =
  "SELECT * FROM subscribers WHERE status = 'active' ORDER BY id"
const SQL_ALL = 'SELECT * FROM subscribers ORDER BY id'
const SQL_BY_ID = 'SELECT * FROM subscribers WHERE id = ?'

/** List all subscribers with `status='active'` ordered by id. */
export const listActive = async (
  db: D1Database
): Promise<ReadonlyArray<Subscriber>> => {
  const { results } = await db.prepare(SQL_ACTIVE).all<Row>()
  return results.map(rowToSubscriber)
}

/** List every subscriber row regardless of status. */
export const listAll = async (
  db: D1Database
): Promise<ReadonlyArray<Subscriber>> => {
  const { results } = await db.prepare(SQL_ALL).all<Row>()
  return results.map(rowToSubscriber)
}

/** Find one subscriber by id. */
export const findById = async (
  db: D1Database,
  id: number
): Promise<Subscriber | undefined> => {
  const row = await db.prepare(SQL_BY_ID).bind(id).first<Row>()
  return row === null ? undefined : rowToSubscriber(row)
}
