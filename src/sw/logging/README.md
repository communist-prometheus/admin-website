# sw/logging

Structured logging, performance metrics, and tracing for the Service Worker.

## Key Exports

- `log` / `initLogChannel` / `getLogEntries` / `clearLogEntries` -- structured log with BroadcastChannel streaming and ring buffer storage
- `recordOp` / `recordCacheHit` / `recordCacheMiss` / `getMetrics` -- per-operation timing and cache hit/miss counters
- `startSpan` / `endSpan` / `failSpan` / `spanDuration` -- lightweight trace spans for timing operations
- `createRingBuffer` -- fixed-capacity circular buffer (in `ring-buffer/`)
