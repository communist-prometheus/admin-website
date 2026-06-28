# Architecture: Service Worker Git BFF

## Overview

Replace the Fastify-based GitHub API proxy with a **Service Worker**
running `isomorphic-git`. The SW acts as a Browser-For-Frontend (BFF):
it clones the repository into IndexedDB, serves reads from the local
copy, and pushes writes directly to GitHub.

```
┌──────────────┐   fetch('/api/github/*')   ┌─────────────────┐
│  Vue 3 App   │ ────────────────────────── │  Service Worker  │
│  (thin UI)   │   postMessage (control)    │  (isomorphic-git)│
└──────────────┘ ◄────────────────────────  │  + LightningFS   │
       │                                    └────────┬─────────┘
       │ /api/auth/*                                 │ git smart HTTP
       ▼                                             ▼
┌──────────────┐                           ┌──────────────────┐
│ Fastify      │                           │ CORS Proxy       │
│ (OAuth only) │                           │ (Cloudflare Wkr) │
└──────────────┘                           └────────┬─────────┘
                                                    │
                                                    ▼
                                           ┌──────────────────┐
                                           │ github.com       │
                                           └──────────────────┘
```

## Key Decisions

### SW intercepts existing fetch URLs

The client composable `useGitHubApi` already calls
`fetch('/api/github/...')`. The SW intercepts these URLs via
`FetchEvent` and returns synthetic `Response` objects.
**Zero changes needed in existing composables.**

### Token stays in memory only

After OAuth, the token goes from server session to popup
`postMessage` to Pinia store to SW `postMessage`. Never persisted
in localStorage or IndexedDB. Lost on tab close; re-acquired from
`/api/auth/user` on next load.

### CORS proxy is mandatory

`isomorphic-git` uses git smart HTTP protocol. Browsers block direct
requests to `github.com` due to CORS. A lightweight proxy (Cloudflare
Worker) adds CORS headers and passes requests through. Self-hosted
to avoid sending tokens through third-party infrastructure.

### Shallow clone, incremental fetch

Initial clone: `depth: 1, singleBranch: true, noTags: true`.
Subsequent syncs: `git.fetch` + fast-forward merge. Full re-clone
only via explicit user action or SW invalidation.

### Push-rejection recovery

A push that loses the fast-forward race is classified by
`push-queue/classify-error.ts` and recovered automatically:

- **non-fast-forward** → auto-merge the remote (`attempt-merge.ts`)
  and re-push. isomorphic-git's literal wording is
  `not a simple fast-forward` — the classifier must match that exact
  phrase, not just `not a fast-forward`.
- **unrelated histories** → if the remote was force-pushed (e.g. an
  identity rewrite), `git.pull` aborts with `MergeNotSupportedError`
  because there is no common ancestor. `merge-unrelated.ts` recovers
  with an explicit `fetch` + `merge({ allowUnrelatedHistories: true })`:
  identical blobs merge cleanly, so only a genuine same-path content
  divergence surfaces as a conflict. `git.pull` cannot do this — it
  never forwards the flag to `merge`.

## Service Worker Communication Protocol

### Fetch Interception (Data)

| URL Pattern | Method | SW Handler |
|---|---|---|
| `/api/github/tree` | GET | Read local FS directory listing |
| `/api/github/file` | GET | Read file from working tree |
| `/api/github/file` | PUT | Write + add + commit + push |
| `/api/github/file` | POST | Create + add + commit + push |
| `/api/github/file` | DELETE | Unlink + remove + commit + push |
| `/api/github/upload` | POST | Write binary + commit + push |
| `/api/github/commit` | POST | Multi-file write + single commit + push |
| `/api/github/raw/*` | GET | Read binary from working tree |
| `/api/github/content` | GET | Walk tree, parse frontmatter, return all |
| `/api/github/content/:t/:s/:l` | GET | Read + parse single content item |

### postMessage (Control)

| Type | Direction | Purpose |
|---|---|---|
| `SW_INIT` | Client -> SW | Pass token + repo config |
| `SW_STATUS` | Client -> SW | Query readiness, clone state |
| `SW_CLONE` | Client -> SW | Trigger initial clone |
| `SW_PULL` | Client -> SW | Fetch + merge latest |
| `SW_INVALIDATE` | Client -> SW | Wipe IndexedDB + re-clone |
| `SW_METRICS` | Client -> SW | Get operation stats |
| `SW_LOG_SUBSCRIBE` | Client -> SW | Start log streaming |

### BroadcastChannel (Observability)

| Channel | Purpose |
|---|---|
| `sw-logs` | Real-time structured log entries |
| `sw-progress` | Clone/push progress events |
| `sw-state` | State change notifications |

## Observability

### Structured Logging

```typescript
interface LogEntry {
  readonly ts: number
  readonly level: 'debug' | 'info' | 'warn' | 'error'
  readonly cat: 'git' | 'fs' | 'auth' | 'cache' | 'lifecycle'
  readonly msg: string
  readonly data?: Record<string, unknown>
  readonly spanId?: string
}
```

Ring buffer of 1000 entries in SW memory. Streamed to UI via
`BroadcastChannel('sw-logs')`.

### Tracing

Every git operation wrapped in a span:

```typescript
interface Span {
  readonly id: string
  readonly op: string
  readonly start: number
  end?: number
  readonly children: readonly Span[]
  status: 'running' | 'ok' | 'error'
}
```

`isomorphic-git`'s `onProgress` callback feeds into span children
for clone/fetch/push phases.

### Metrics

```typescript
interface Metrics {
  readonly ops: Record<string, {
    count: number; totalMs: number
  }>
  readonly cache: { hits: number; misses: number }
  readonly fs: { files: number; bytes: number }
  readonly lastClone?: number
  readonly lastFetch?: number
  readonly lastPush?: number
  readonly uptime: number
}
```

Collected in-memory. Exposed via `SW_METRICS` message.

## SW Lifecycle Management

### Registration

```typescript
// entry-client.ts
if ('serviceWorker' in navigator) {
  const reg = await navigator.serviceWorker.register(
    '/sw.js', { type: 'module' }
  )
}
```

### Update Flow

1. Browser checks for new SW on navigation (default)
2. `updatefound` event fires when new version detected
3. UI shows non-intrusive banner: "Update available"
4. User clicks -> `skipWaiting()` + `clients.claim()` + reload

### Invalidation Levels

| Level | Action | When |
|---|---|---|
| Soft | `git.fetch` + fast-forward | Routine sync |
| Hard | Delete IndexedDB + re-clone | Corrupt state |
| Full | Unregister SW + clear all storage | Nuclear option |

### Debug Panel (`<SWDebugPanel>`)

Toggleable overlay showing:
- SW version, state, uptime
- Log viewer (virtual-scrolled, filterable)
- Metrics charts (operation durations, cache rates)
- Active spans tree
- Action buttons: force update, clear cache, re-clone, pull
- Git status: branch, HEAD, dirty files

## Security

| Concern | Mitigation |
|---|---|
| Token in client memory | Already exposed via `__INITIAL_STATE__` and `User.accessToken`. No regression. |
| Token through CORS proxy | Self-hosted proxy; sees token but is our infrastructure. |
| XSS token theft | Same risk as current arch. CSP headers mitigate. |
| IndexedDB code access | File content (not token) in IDB. Same-origin policy applies. |
| SW code injection | Served from same origin. `Content-Type` enforced. |

## File System

LightningFS backed by IndexedDB:
- Database: `prometheus-git-fs`
- Working tree: `/repo`
- Shallow clone keeps storage manageable
- Estimated size: <100MB for typical content repo
- Safari private browsing: limited quota; detect and warn

## Error Handling

Map errors to existing JSON contract:

```typescript
// { error: string } with HTTP status code
catch (e) {
  if (e instanceof git.Errors.HttpError)
    return jsonResponse({ error: e.message }, e.statusCode)
  if (e instanceof git.Errors.PushRejectedError)
    return jsonResponse({ error: 'Conflict' }, 409)
  return jsonResponse({ error: 'Internal error' }, 500)
}
```

Conflict resolution: on 409, UI prompts user to pull + retry.
