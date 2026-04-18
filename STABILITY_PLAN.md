# Stability Plan: admin-website

## Root Cause Analysis

### CRITICAL BUG: Push goes to wrong branch

**Verified on prod (2026-04-18):** Save appears successful (`success: true, sha: d7af149`), but commit pushes to `master` instead of `develop` in content repo. Sync-content workflow only listens to `develop` → deploy never triggers → pending card hangs forever.

**Root cause chain:**
1. SW stores git config (including branch) in IndexedDB (`persist-config.ts`)
2. `handleInvalidate` only resets in-memory state, not IndexedDB
3. Old config with `branch: master` persists across deploys
4. `push-to-remote.ts` line 18 uses `config.branch` from stale IndexedDB config
5. Push succeeds to `master` → no sync-content trigger → no deploy → pending stuck

**Additionally:** `handleCommit` returns HTTP 200 with `success: true` even when push goes to wrong branch (since git push technically succeeds). Client has no way to know the deploy pipeline won't fire.

All user-reported symptoms trace to **5 critical gaps**:

| Symptom | Root Cause | Files |
|---------|-----------|-------|
| Old data stuck in IndexedDB | No `indexedDB.deleteDatabase()` anywhere. `handleInvalidate` only resets in-memory state. `wipeRepo` deletes files but not the database. | `handle-invalidate.ts`, `wipe-repo.ts` |
| SW stuck on old version | Registration handle discarded. No `updatefound` listener. No `registration.update()` on tab focus. Browser checks every 24h max. | `register-sw.ts`, `entry-client.ts` |
| Pending deploy card stays forever | No TTL. 90s wait window too short for GH Actions queue. No dismiss button. | `pending-deploy.ts`, `create-loop.ts` |
| Push to wrong branch | Stale IndexedDB config has `master`, prod expects `develop`. Push succeeds but sync-content never triggers. | `persist-config.ts`, `push-to-remote.ts:18`, `handle-invalidate.ts` |
| Prod differs from dev | CORS proxy diverges (public proxy in dev, self-hosted in prod). SW not hot-reloaded in dev. Branch default differs (develop vs master). | `config/github.ts`, `scripts/copy-sw-dev.ts` |

## Current vs Desired Architecture

### Service Worker Lifecycle

| Aspect | Current | Desired |
|--------|---------|---------|
| skipWaiting + claim | Correct (lifecycle.ts) | No change |
| Update detection | Handle discarded, no listeners | `updatefound` + `controllerchange` → reload |
| Proactive update check | None (24h browser heuristic) | `registration.update()` on tab refocus |
| `swReady` | One-shot promise, can't reset | Resettable signal (ref/deferred) |
| `markSWReady` on retry exhaustion | Called even on failure (init-sw.ts:28) | Don't resolve on failure |
| autoRecover deduplication | None — concurrent fetches all trigger recovery | Pending guard like handleInit |

### IndexedDB / Data Persistence

| Aspect | Current | Desired |
|--------|---------|---------|
| Full DB delete | Not possible (no `deleteDatabase` call exists) | `SW_RESET` message type + UI button |
| `handleInvalidate` | In-memory only | Also wipe IndexedDB |
| Version stamp in DB | None | Store `SW_VERSION`, auto-wipe on mismatch |
| `wipeRepo` error handling | Silent catch, marks "nothing to wipe" | Log per-file errors, re-throw on failure |
| Config versioning | No version tag in persisted config | Add version, validate on load |

### Pending Deploy

| Aspect | Current | Desired |
|--------|---------|---------|
| Message matching | `includes()` — correct | No change |
| TTL | None (lives in sessionStorage forever) | 5-minute auto-expiry |
| Wait window | 90 seconds | 180 seconds |
| Manual dismiss | Not possible | Dismiss button on card |

### SWDebugPanel

| Aspect | Current | Desired |
|--------|---------|---------|
| Actions | Refresh + Close only | + Reset Data, Force Update, Unregister SW |

### Dev/Prod Parity

| Aspect | Current | Desired |
|--------|---------|---------|
| CORS proxy | `cors.isomorphic-git.org` (dev) vs `/api/cors` (prod) | Same proxy in both |
| SW hot-reload | Must manually rebuild + copy | Auto-rebuild on change |
| Branch | `develop` default in code, `master` in prod env | Single source of truth |

## TODO List

### P0 — Critical (fixes stale data + stuck SW)

- [ ] **SW update detection** (`register-sw.ts`)
  - Save registration handle
  - Add `updatefound` listener
  - Add `controllerchange` → `location.reload()`
  - Add `registration.update()` on `visibilitychange`

- [ ] **IndexedDB full wipe** (`handle-invalidate.ts`, new `SW_RESET` message)
  - Add `SW_RESET` message type that calls `indexedDB.deleteDatabase('sw-git')`
  - Modify `handleInvalidate` to also call `wipeRepo()`
  - Client-side: on `SW_RESET`, call `registration.unregister()` + reload

- [ ] **Version-stamped IndexedDB** (`lifecycle.ts`)
  - On SW activate: write `SW_VERSION` to IndexedDB key
  - On subsequent activate: compare versions, wipe DB if different

- [ ] **Deduplicate autoRecover** (`auto-recover.ts`)
  - Add pending promise guard (like `handle-init.ts` line 24)
  - Prevent parallel clone attempts from concurrent fetch events

### P1 — Important

- [ ] **Pending deploy TTL** (`App.vue`)
  - In `mergedEntries` computed: if `Date.now() - Date.parse(pending.createdAt) > 300_000`, auto-clear

- [ ] **Increase wait window** (`create-loop.ts`)
  - Change `WAIT_WINDOW_MS` from `90_000` to `180_000`

- [ ] **Pending dismiss button** (`DeployItem.vue`)
  - Add close button on pending card that calls `clearPendingDeploy()`

- [ ] **Resettable swReady** (`sw-ready.ts`)
  - Replace one-shot promise with resettable deferred
  - Don't resolve on exhausted retries (`init-sw.ts:28`)

- [ ] **Classify errors in recoverAndRetry** (`recover-and-retry.ts`)
  - Only full re-clone for git/FS errors
  - Simple retry for application errors

### P2 — Hygiene

- [ ] **SWDebugPanel actions** (`SWActions.vue`)
  - Reset Data button (sends `SW_RESET` + `deleteDatabase` + reload)
  - Force Update button (`registration.update()`)
  - Unregister SW button (`registration.unregister()` + reload)

- [ ] **Dev/prod CORS parity** (`config/github.ts`)
  - Run local CORS proxy in dev mode via Vite plugin

- [ ] **SW_VERSION from git hash** (`sw-version-replace.ts`)
  - Use `__COMMIT_HASH__` instead of `Date.now().toString(36)`

- [ ] **Remove dead code**
  - `vite/sw-plugin.ts`, `vite/sw-entry.ts`, `functions/[[route]].ts`

- [ ] **wipeRepo error isolation** (`wipe-repo.ts`)
  - Log per-file errors, re-throw on partial failure

### P3 — Prod testing

- [ ] **Document prod access via cookie token** in README
- [ ] **Prod smoke test script** via Chrome DevTools MCP
