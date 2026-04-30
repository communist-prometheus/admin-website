import {
  type Clause,
  combine,
  cursorClause,
  eqClause,
  jsonEqClause,
  likeClause,
  rangeClause,
} from './search-clauses'
import type { SearchQuery } from './search-query'

/**
 * Build the WHERE-clause + parameter bind list for a search query.
 * Optional fields collapse to `1=1` so the resulting SQL is always
 * valid even when every filter is absent.
 * @param query Parsed search parameters.
 * @returns SQL fragment + ordered bind values.
 */
export const buildWhere = (query: SearchQuery): Clause =>
  combine([
    likeClause(query.q),
    rangeClause('started_at', query.from, query.to),
    eqClause('status', query.status),
    jsonEqClause('service', query.service),
    jsonEqClause('org', query.org),
    jsonEqClause('repo', query.repo),
    cursorClause(query.cursor),
  ])
