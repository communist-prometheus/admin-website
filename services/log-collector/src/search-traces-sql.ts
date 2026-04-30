/**
 * Aggregation SQL for `GET /v1/traces`. Picks one root span per
 * trace by earliest `started_at`, then surfaces name + status +
 * duration alongside the trace's full span count. The literal
 * `__WHERE__` token is replaced by the dynamic filter clause.
 */
export const SEARCH_TRACES_SQL = `
  WITH filtered AS (
    SELECT trace_id, span_id, name, status, started_at, finished_at
    FROM spans
    WHERE __WHERE__
  ),
  roots AS (
    SELECT
      trace_id,
      span_id      AS root_span_id,
      name         AS root_name,
      status       AS root_status,
      started_at,
      finished_at
    FROM filtered f
    WHERE started_at = (
      SELECT MIN(started_at) FROM filtered g
      WHERE g.trace_id = f.trace_id
    )
  )
  SELECT
    r.trace_id,
    r.root_span_id,
    r.root_name,
    r.root_status,
    r.started_at,
    (SELECT COUNT(*) FROM filtered f WHERE f.trace_id = r.trace_id) AS span_count,
    r.finished_at - r.started_at AS duration_ms
  FROM roots r
  ORDER BY r.started_at DESC
  LIMIT ?
`
