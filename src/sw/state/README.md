# sw/state

Global mutable state for the Service Worker. Stored in module scope and persists for the SW lifetime.

## Key Exports

- `workerState` -- mutable state object holding `config`, `state`, `lastSync`, `commitSha`
- `buildStatus` -- build a `SWStatusResponse` snapshot from current worker state
