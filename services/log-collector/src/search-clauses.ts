/** A SQL fragment with its ordered bind values. */
export type Clause = {
  readonly sql: string
  readonly bind: ReadonlyArray<unknown>
}

/** Trivial clause that matches every row. */
export const noopClause: Clause = { sql: '1=1', bind: [] }

const escapeLike = (raw: string): string =>
  raw.replace(/[\\%_]/g, char => `\\${char}`)

/**
 * Equality clause; returns the no-op clause when the value is
 * `undefined` so callers can compose without conditionals.
 */
export const eqClause = (
  column: string,
  value: string | number | undefined
): Clause =>
  value === undefined ? noopClause : { sql: `${column} = ?`, bind: [value] }

/** Equality on a top-level key inside the JSON `attrs` column. */
export const jsonEqClause = (
  path: string,
  value: string | undefined
): Clause =>
  value === undefined
    ? noopClause
    : { sql: `json_extract(attrs, '$.${path}') = ?`, bind: [value] }

/** Closed numeric range over `column`; either bound may be omitted. */
export const rangeClause = (
  column: string,
  lo: number | undefined,
  hi: number | undefined
): Clause => ({
  sql:
    [
      lo === undefined ? undefined : `${column} >= ?`,
      hi === undefined ? undefined : `${column} <= ?`,
    ]
      .filter((s): s is string => s !== undefined)
      .join(' AND ') || '1=1',
  bind: [lo, hi].filter((v): v is number => v !== undefined),
})

/** Free-text LIKE filter on `name`, with backslash-escaped chars. */
export const likeClause = (raw: string | undefined): Clause =>
  raw === undefined
    ? noopClause
    : { sql: "name LIKE ? ESCAPE '\\\\'", bind: [`%${escapeLike(raw)}%`] }

/** Cursor clause: `started_at` strictly less than the given value. */
export const cursorClause = (cursor: number | undefined): Clause =>
  cursor === undefined
    ? noopClause
    : { sql: 'started_at < ?', bind: [cursor] }

/** AND-combine a list of clauses into one. */
export const combine = (clauses: ReadonlyArray<Clause>): Clause => ({
  sql: clauses.map(c => c.sql).join(' AND '),
  bind: clauses.flatMap(c => [...c.bind]),
})
