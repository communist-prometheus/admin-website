# sw/core

Service Worker lifecycle management and fetch interception. Registers install/activate/fetch event listeners and handles auto-recovery from browser-triggered SW restarts.

## Key Exports

- `registerLifecycle` -- install (skipWaiting) and activate (clients.claim) listeners
- `registerFetchListener` -- intercept `/api/sw/init` and `/api/github/*` requests
- `autoRecover` -- re-initialize from persisted config after SW restart

## Submodules

- `messaging/` -- client postMessage dispatch
