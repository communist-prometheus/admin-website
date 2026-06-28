# Requirements — Reliable content push from any clone state

## Overview

Content saves in the admin push to the GitHub content repo through a
Service-Worker git BFF (isomorphic-git on `@isomorphic-git/lightning-fs`,
**shallow `depth: 1`** clone, `singleBranch`). After the 2026-06-13
identity-rewrite **force-push**, many users' browser clones hold history
that shares **no common ancestor** with the current remote.

Three defects (confirmed by code audit + live prod diagnostics) mean these
users cannot publish, and the failures are either **silent** or shown as a
generic *"Unexpected error"*:

1. The non-fast-forward recovery **merges** the unrelated remote. On a
   `depth: 1` clone the resulting merge commit references the local tip's
   absent parent, so GitHub `receive-pack` rejects it on connectivity
   (*missing necessary objects*). Merging is the wrong tool for a shallow
   clone. (`run-unrelated-merge.ts`, `clone-options.ts:21`)
2. `pushToRemote` checks only the unpack-stage `result.error` and ignores
   the per-ref status `result.refs[ref].ok`. A rejected ref is read as
   **success**: the queue entry is dequeued, the UI reports *synced*, and
   the edit is **silently lost**. (`push-to-remote.ts:40-41`,
   `push-once.ts:24-25`)
3. `freshClone` (runs on every `SW_INIT` / `auto-recover`) wipes the repo
   object store **including unpushed commits**, while the push queue lives
   in a **separate** IndexedDB and survives — orphaning the entry, losing
   the edit, or throwing *"Could not read object"* → `unknown` when a drain
   races the wipe. (`sync-repo.ts:21-22`, `wipe-repo.ts`, `idb.ts:3`)

This spec makes a save **reliably reach the remote, or fail loudly with an
actionable reason — never silently lost — from any clone state**
(fresh, behind, diverged, or shallow-unrelated). Out of scope (tracked as
separate small fixes): `Cache-Control: no-store` on `/sw.js`, and the
ticket-attachment 404 graceful handling.

## User stories & acceptance criteria

### US-1 — A diverged/unrelated-history clone can still publish
As an editor whose clone shares no ancestor with the remote, I want my save
to reach the remote so the article publishes.

- 1.1 WHEN a push is rejected as non-fast-forward AND the local branch
  shares no common ancestor with the fetched remote tip, THE SYSTEM SHALL
  re-baseline the local branch onto the remote tip and **replay the queued
  commit's file changes** as a single new commit whose **only parent is the
  remote tip**.
- 1.2 WHEN the re-baselined commit is pushed, THE SYSTEM SHALL produce a
  fast-forward the remote accepts — no missing-object / connectivity
  rejection.
- 1.3 WHERE the clone is shallow (`depth: 1`), 1.1–1.2 SHALL still hold (the
  pushed pack SHALL reference no commit older than the remote tip).
- 1.4 WHEN the replay touches a path the remote also changed, THE SYSTEM
  SHALL keep the editor's version for the paths in the queued commit (the
  user's edit wins for files they edited); other remote files SHALL remain
  at the remote version.

### US-2 — A failed push is never silently dropped
As an editor, I want a failed push to surface, never to vanish as a false
"synced".

- 2.1 WHEN `git.push` returns any `result.refs[ref].ok === false` (or
  `result.ok === false`), THE SYSTEM SHALL treat the push as **failed**:
  throw, do **not** dequeue the entry, do **not** report synced.
- 2.2 WHILE a push has not succeeded, THE SYSTEM SHALL retain its queue
  entry until it either succeeds or is terminally classified.

### US-3 — An unpushed edit survives a re-clone
As an editor, I want my queued edit to survive a Service-Worker re-sync.

- 3.1 WHILE a queued push is pending, IF the SW performs a `freshClone`,
  THEN THE SYSTEM SHALL preserve the unpushed change (replay it onto the
  fresh clone) — it SHALL NOT discard an unpushed commit.
- 3.2 WHILE the repo state is `cloning`, THE SYSTEM SHALL NOT drain the push
  queue.

### US-4 — Correct classification, bounded retries, no false hope
As an editor, I want a correct reason and no infinite retry.

- 4.1 WHEN a push fails with a missing-object / connectivity / shallow /
  not-a-fast-forward signal, THE SYSTEM SHALL classify it as a recoverable
  **diverged** reason that triggers the US-1 re-baseline recovery.
- 4.2 IF the non-fast-forward / diverged recovery reaches the maximum
  attempts without success, THEN THE SYSTEM SHALL stop retrying and surface
  a **terminal, actionable** error.
- 4.3 THE SYSTEM SHALL NOT retry indefinitely on the non-fast-forward path.

### US-5 — The real reason is observable
As an operator, I want the true failure captured, not hidden behind
`unknown`.

- 5.1 WHEN a push fails, THE SYSTEM SHALL log the raw error message at the
  failure site (SW logger), including the classified reason.

## Test strategy (acceptance ⇄ tests)

- **R-1 (the test the previous fix lacked):** an integration/realmode test
  that reproduces the **exact** failing condition — a `depth: 1` shallow
  clone whose remote is then force-pushed to an **unrelated** root — makes a
  local edit, drains, and asserts the edit **reaches the remote tip** and
  the remote tip's parent chain does **not** contain the old local tip.
  Covers 1.1–1.3.
- Unit: `pushToRemote` throws when `git.push` returns
  `{refs:{[ref]:{ok:false}}}` (2.1); classify maps missing-object/shallow to
  `diverged` (4.1); retry policy caps the diverged path (4.2–4.3).
- Unit/integration: a pending queue entry survives a `freshClone` and is
  replayed (3.1); drain is a no-op while `state === 'cloning'` (3.2).
- Each criterion above maps to at least one named test in `tasks.md`.

## Non-goals

- Changing the clone from shallow to full (rejected: bandwidth/time cost;
  the reset+replay strategy makes shallow workable).
- Force-pushing from the client (rejected: clobbers concurrent editors and
  does not satisfy connectivity anyway).
- Conflict-resolution UI changes (the reset+replay "editor's edit wins per
  touched path" removes the spurious self-conflict; richer multi-editor
  merge is a separate concern).
