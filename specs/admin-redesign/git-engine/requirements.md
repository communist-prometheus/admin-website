# Git Engine — Requirements

The client-side content engine: a Service Worker running isomorphic-git that
clones the content repo, stages edits, commits, and pushes to GitHub, with a
retrying push queue, error classification, conflict/merge recovery, and a live
state contract the UI observes. This spec makes the **new Lit app** drive the
**existing, framework-agnostic SW engine** rather than re-derive it.

## Overview

The current admin already has a mature engine under `src/sw/*` (210 modules:
`git/` clone/pull/commit/push, `push-queue/` enqueue/drain/classify-error/
broadcast, `conflicts/` markers/resolve, `connectivity/`, `core/messaging/`,
`errors/`, and a `protocol/` contract). It is **pure TS with no Vue** — the Vue
admin only touches it through `composables/useSWBridge` + `useGitHubApi`. Under
the rewrite the engine and its protocol are **preserved and reused**; only the
UI-side client is rebuilt.

## Requirements

### R1 — Preserve engine behavior (NFR-8)
- THE SYSTEM SHALL preserve the behaviors just stabilized: the 8h user-to-server
  token refresh lifecycle (single-flight `renewOnce`, dead-session handling),
  the push-queue retry + error classification, NFF/merge recovery, and honest
  re-login on `GitHubAuthError`. The `src/sw/*` engine + `src/api/*` proxy +
  `src/composables/useAuth/*` are the behavioral reference and SHALL be lifted,
  not re-derived, where framework-agnostic.

### R2 — App ↔ SW contract (stable, observed)
- THE SYSTEM SHALL keep the existing SW contract as the boundary: init/fetch via
  `postMessage` (`protocol/request-types`, `response-types`) and live events via
  BroadcastChannel (`SW_LOG_CHANNEL`, `SW_PROGRESS_CHANNEL`, `SW_STATE_CHANNEL`,
  `SW_PUSH_STATE_CHANNEL`; `PushState = { status: 'idle'|'syncing'|'error';
  pending: number }`, plus push-conflict/-error/-summary/-control channels).
- WHERE the new UI needs data it SHALL go through this contract, never reach into
  SW internals — so the engine stays swappable/testable behind it.

### R3 — Reactive client store (replaces the Vue composables)
- THE SYSTEM SHALL provide a framework-light client (house FP style: pure fns +
  a small reactive store, no Vue) that: registers/updates the SW, subscribes to
  every channel, and exposes a **reactive git state** — `status`, `pending`
  count, current branch, last error (classified), conflict set, and connectivity
  — that Lit screens/app-shell bind to.
- WHEN a channel emits, the store SHALL update and notify subscribers; the
  app-shell sync-status affordance (app-shell R5) SHALL reflect it live.

### R4 — Content operations
- THE SYSTEM SHALL expose, over the contract: clone/pull the content repo, read
  a file/tree, stage a change, commit (with the publish-flag frontmatter), and
  enqueue a push. Each is async and SHALL surface determinate/indeterminate
  progress (NFR-2) via the progress channel — never a silent wait.
- The editor's "Опубликовать" (content-editor) SHALL drive commit → enqueue-push
  and reflect the staged pipeline (commit → push → deploy) from real channel
  events, not a mock.

### R5 — Push queue, retry, error classification
- WHILE pushes are in flight THE SYSTEM SHALL show queued/pushing/retrying/failed
  from `SW_PUSH_STATE_CHANNEL` + push-error events, and SHALL classify errors
  (auth vs conflict vs network vs branch-protection) so the UI can offer the
  right recovery (re-login / merge / retry / open-PR) — no generic "failed".
- IF a push is rejected non-fast-forward THEN THE SYSTEM SHALL enter merge
  recovery (R6), never silently drop the local commit.

### R6 — Conflicts & visual merge
- WHEN a merge produces conflicts THE SYSTEM SHALL surface the conflict set
  (`conflicts/parse-markers`) to the UI and accept an explicit, per-hunk
  resolution (the deploys/merge screen), then finalize (`conflicts/finalize`) and
  re-enqueue — never auto-discarding local work.

### R7 — Auth integration
- THE SYSTEM SHALL obtain a fresh token via the preserved `useAuth` core
  (`ensureFreshToken`/`renewSession`, single-flight) before SW git operations,
  and on `GitHubAuthError` SHALL drive an honest re-login (not a silent retry
  loop). RBAC/role gating stays owned by `../auth/`.

### R8 — Testability & parity
- THE SYSTEM SHALL keep the engine unit-testable in isolation (the existing SW
  tests carry over) and add integration tests that the client store maps each
  channel event to the right reactive state. Feature parity with the current
  engine SHALL be proven by the migrated/rewritten tests (NFR-7).
- WHERE mock-auth/mock-git modes exist (`is-mock`, `MOCK_OAUTH`) they SHALL be
  preserved for E2E.

## Out of scope (this spec)
The GitHub-App OAuth PKCE popup + 8h refresh internals (owned by `../auth/`) and
the deploy-status polling of Actions (owned by `../deploy-status/`). This spec
owns the **SW content engine + its client contract**; those plug into R7/R4.

## Acceptance → tests
canonical-clone-and-read, stage-commit-enqueue-progress, push-state-channel→store,
error-classification→recovery-affordance, non-ff→merge-recovery, conflict-set→
resolve→finalize, auth-refresh-before-op + 401→honest-relogin, engine-unit-parity.
