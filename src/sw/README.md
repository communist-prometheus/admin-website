# sw

Service Worker BFF. Clones a GitHub content repo into IndexedDB via isomorphic-git, then serves REST-style `/api/github/*` endpoints from the local filesystem. No backend server needed.

## Submodules

- `core/` -- lifecycle, fetch interception, message dispatch
- `protocol/` -- shared communication types and BroadcastChannel constants
- `state/` -- global mutable worker state
- `logging/` -- structured logging, metrics, tracing
- `errors/` -- typed Effect error classes (TaggedError)
- `git/` -- isomorphic-git operations (clone, pull, push, file I/O)
- `handlers/` -- HTTP request handlers for content, file, and asset CRUD
- `mock/` -- hardcoded mock data for E2E tests
