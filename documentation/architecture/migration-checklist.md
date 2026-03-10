# Migration Checklist: Server GitHub API -> Service Worker Git BFF

## Phase 0: Foundation

**Goal**: Add dependencies, build config. No behavioral change.

- [ ] Install `isomorphic-git` and `@nicolo-ribaudo/lightning-fs`
- [ ] Add `VITE_GITHUB_OWNER`, `VITE_GITHUB_REPO`, `VITE_GITHUB_BRANCH`,
      `VITE_GITHUB_CONTENT_PATH`, `VITE_CORS_PROXY` to `.env` / `.env.example`
- [ ] Create `src/config/github.ts` reading from `import.meta.env`
- [ ] Create `src/sw/` directory structure
- [ ] Configure Vite to build SW as separate entry (`src/sw/main.ts` -> `dist/client/sw.js`)
- [ ] Update CSP headers to allow `worker-src 'self'`
- [ ] Add JSDoc enforcement for all new public APIs
- [ ] Verify: all existing tests pass, build succeeds

## Phase 1: SW Shell + Passthrough

**Goal**: Register SW, intercept `/api/github/*`, forward to server. Proves plumbing works.

- [ ] Create `src/sw/main.ts` — SW entry with fetch listener
- [ ] Implement passthrough: intercept -> `fetch(event.request)` -> return response
- [ ] Add logging infrastructure (`src/sw/logging/`)
  - [ ] `log-entry.ts` — LogEntry type
  - [ ] `ring-buffer.ts` — in-memory ring buffer (1000 entries)
  - [ ] `logger.ts` — log function with BroadcastChannel streaming
- [ ] Register SW in `entry-client.ts` (skip in SSR)
- [ ] Create `<SWDebugPanel>` component (minimal: status + log viewer)
- [ ] Add SW lifecycle management (updatefound, skipWaiting)
- [ ] Update `src/server/setup/security.ts` CSP for worker-src
- [ ] Verify: all E2E tests pass (SW is transparent)

## Phase 2: Token + Config to Client

**Goal**: Make token and repo config available to SW.

- [ ] Verify `User.accessToken` is already available client-side
      (via `__INITIAL_STATE__` and popup postMessage)
- [ ] Create `src/sw/protocol.ts` — message type definitions
- [ ] Implement `SW_INIT` handler in SW (receive token + config)
- [ ] Create `src/composables/useSWBridge/` composable
  - [ ] `init.ts` — sends SW_INIT after auth
  - [ ] `status.ts` — queries SW_STATUS
  - [ ] `control.ts` — clone, pull, invalidate commands
- [ ] On auth success, client sends config to SW via postMessage
- [ ] On page reload, re-send token from `/api/auth/user` response
- [ ] Verify: token reaches SW, logged in SW debug panel

## Phase 3: Git Clone + Read Operations

**Goal**: SW clones repo, serves all read endpoints locally. Writes still go to server.

- [ ] Implement `src/sw/git/clone.ts` — shallow clone with progress
- [ ] Implement `src/sw/git/pull.ts` — fetch + fast-forward
- [ ] Implement `src/sw/fs/` — LightningFS initialization
- [ ] Implement SW fetch handlers for reads:
  - [ ] `GET /api/github/tree` — `git.listFiles` / `fs.readdir`
  - [ ] `GET /api/github/file` — `fs.readFile` + encode
  - [ ] `GET /api/github/raw/*` — `fs.readFile` binary + MIME
  - [ ] `GET /api/github/content` — walk tree, parse frontmatter
  - [ ] `GET /api/github/content/:type/:slug/:lang` — single item
- [ ] Add tracing spans for clone operation
- [ ] Add `onProgress` integration for clone/fetch progress
- [ ] Show clone progress in UI (loading overlay with progress bar)
- [ ] Feature flag: `VITE_SW_GIT_READS=true` to enable
- [ ] Staleness check: auto-fetch if >5 min since last sync
- [ ] If clone not ready, queue reads until clone completes
- [ ] Write operations still pass through to server (fallback)
- [ ] Add metrics collection
- [ ] Verify: content list loads from local clone
- [ ] Verify: file editing works (reads from SW, writes to server)

## Phase 4: Write Operations in SW

**Goal**: All git ops in SW. Server no longer called for GitHub.

- [ ] Implement SW write handlers:
  - [ ] `PUT /api/github/file` — writeFile + add + commit + push
  - [ ] `POST /api/github/file` — create + add + commit + push
  - [ ] `DELETE /api/github/file` — unlink + remove + commit + push
  - [ ] `POST /api/github/upload` — write binary + commit + push
  - [ ] `POST /api/github/commit` — multi-file batch + single push
- [ ] Implement push error handling:
  - [ ] Non-fast-forward: auto-fetch + retry
  - [ ] Auth failure: emit re-auth event
  - [ ] Network failure: show notification
- [ ] Implement conflict detection and user notification
- [ ] Update local refs after successful push
- [ ] Add tracing for push operations
- [ ] Remove feature flag — SW is the default path
- [ ] Verify: save flow works end-to-end through SW
- [ ] Verify: batch commit (article + asset deletions) works
- [ ] Verify: all E2E tests pass

## Phase 5: Server Cleanup

**Goal**: Remove all GitHub proxy code from server.

- [ ] Remove `src/server/api/github/` (handlers, routes)
- [ ] Remove `src/server/services/github/` (service, operations, mock)
- [ ] Remove `src/server/github/` (client, content-service, mock, routes, config)
- [ ] Remove `@octokit/rest` from dependencies
- [ ] Remove `effect` and `@effect/schema` if no longer used elsewhere
- [ ] Keep `src/server/auth/` (OAuth code exchange needs client_secret)
- [ ] Keep `src/server/oauth/` (GitHub OAuth flow)
- [ ] Update `src/server/setup/routes/` — remove GitHub route registration
- [ ] Create SW mock service for E2E tests
  - [ ] In-memory FS with test content
  - [ ] Replace server mock endpoints (`/api/test/reset`, etc.)
- [ ] Update all E2E tests for SW-based mocking
- [ ] Verify: full E2E suite passes
- [ ] Verify: build succeeds, no unused imports

## Phase 6: Debug Panel + Observability Polish

**Goal**: Full-featured SW management UI.

- [ ] `<SWDebugPanel>` enhancements:
  - [ ] Virtual-scrolled log viewer with level/category filters
  - [ ] Metrics dashboard (op counts, durations, cache rates)
  - [ ] Active spans tree view
  - [ ] Git status display (branch, HEAD, dirty files)
  - [ ] Action buttons: force update, clear cache, re-clone, pull
  - [ ] SW version and uptime display
- [ ] Keyboard shortcut to toggle panel
- [ ] Persist panel preferences in localStorage
- [ ] Add `SW_GIT_STATUS`, `SW_GIT_LOG`, `SW_FS_LIST` message handlers
- [ ] Verify: panel works in all browsers

## Phase 7: CORS Proxy Deployment

**Goal**: Self-hosted CORS proxy for production.

- [ ] Create Cloudflare Worker proxy (`infrastructure/cors-proxy/`)
- [ ] Proxy adds CORS headers, passes auth through
- [ ] Configure `VITE_CORS_PROXY` in production env
- [ ] Test clone + push through production proxy
- [ ] Monitor proxy latency and error rates
- [ ] Document proxy deployment process

## Cross-Cutting Concerns

### Throughout all phases:
- [ ] JSDoc on every public function, type, interface
- [ ] Update README in each affected directory
- [ ] Keep sonar limits: max-lines 50, max-lines-per-function 25
- [ ] Biome formatting: single quotes, 78-char lines, organize imports
- [ ] No `any`, no `as`, no `null`, use `readonly`
- [ ] All tests pass on chromium, firefox, webkit
- [ ] No flaky tests, no skipped tests
