# Design — Reliable content push from any clone state

Satisfies `requirements.md` (US-1…US-5). Trade-offs and rejected options at
the end.

## Recovery strategy: reset-onto-remote + replay (replaces merge-unrelated)

The push queue already classifies a rejection and calls
`tryMergeAfterNff(entry)` → `attemptMerge(config)`. We keep the **fast-
forward / common-ancestor** path (`git.pull`, with its clean-merge and
conflict outcomes and the existing conflict UI) and replace the
**no-common-ancestor** path with a reset-and-replay that produces a
**pushable** commit on any clone, including `depth: 1`.

### Decision table (in `attempt-merge` after `git.pull` throws)
| git.pull outcome | meaning | action |
|---|---|---|
| resolves | FF or clean 3-way (base present) | `{kind:'clean'}` → re-push (unchanged) |
| `MergeConflictError` | base present, real conflict | `{kind:'conflict'}` → conflict UI (unchanged) |
| `MergeNotSupportedError` | **no merge base** (unrelated, or base below the shallow boundary) | **reset-replay** (US-1) |
| missing-object / shallow / "not a simple fast-forward" surfacing here | diverged | **reset-replay** (US-1, US-4.1) |

`attemptMerge` / `tryMergeAfterNff` gain the `entry` argument (reset-replay
needs the queued commit to replay).

### `run-reset-replay.ts` (new) — US-1.1–1.4, US-3.1 reuse
```
runResetReplay(config, entry):
  changes = changedFilesOfCommit(entry.sha)      # diff C vs its parent L (both local)
  git.fetch(branch, singleBranch)                 # updates refs/remotes/origin/<branch> = R
  R = git.resolveRef('refs/remotes/origin/<branch>')
  git.writeRef('refs/heads/<branch>' = R, force)  # re-baseline local branch onto R
  git.checkout(<branch>, force)                    # materialise R's tree into the workdir
  for ch in changes:                               # replay ONLY the user's touched paths
    ch.deleted ? (unlink + git.remove) : (writeFile + git.add)
  C' = git.commit(message=entry.message, author)   # single parent = R  ⇒ pushable, shallow-safe
  return C'                                         # caller updates the queue entry sha → C'
```
- `changedFilesOfCommit(sha)` (new, `changed-files-of-commit.ts`): `git.walk`
  over `TREE({ref: sha})` vs `TREE({ref: sha^})`, emitting
  `{path, oid|deleted}`; content read via `git.readBlob`. Both trees are
  local (C is the user's commit, L is the depth:1 tip), so this works on a
  shallow clone. Satisfies 1.3.
- Per-path "editor wins" falls out for free: the workdir starts at R, then
  the user's touched files are overwritten/removed (1.4). Untouched remote
  files keep R's content.

### `attempt-merge` outcome wiring
`classifyMergeError(config, entry, error)`:
- `isMergeConflict` → conflict (unchanged)
- `isUnrelatedHistories(error)` **or** `isDiverged(error)` → run reset-replay;
  on success return `{kind:'rebased', sha: C'}`; on failure `{kind:'fail'}`.
- else `{kind:'fail', error}`

New `MergeOutcome` variant `{kind:'rebased', sha}`. `handle-nff` treats
`rebased` like `clean` for re-draining, **and updates the queue entry's sha
to `C'`** (`updateEntrySha`) so the subsequent push/dequeue targets the new
commit (push is HEAD-based, dequeue is id-based — keep them consistent).

## US-2 — no silent loss in `push-to-remote.ts`
```
result = git.push(opts)
refFail = Object.values(result.refs ?? {}).find(s => !s.ok)
if result.error || result.ok === false || refFail:
  throw new Error(`Push rejected: ${result.error ?? refFail?.error ?? 'ref update rejected'}`)
```
`pushOnce` already keeps the entry on throw (it only dequeues on success),
so 2.2 holds once 2.1 throws.

## US-3 — re-clone does not lose unpushed work
- `sync-repo` / `freshClone`: BEFORE `wipeRepo`, snapshot pending queue
  entries' changed files (`changedFilesOfCommit`) from the still-present
  objects; AFTER the fresh clone, replay+commit+re-enqueue them (reuse
  `runResetReplay`-style replay against the freshly-cloned tip). If snapshot
  fails (objects already gone), drop the orphaned entry and log (US-5)
  rather than loop forever. (3.1)
- `drain`: early-return when `workerState.state === 'cloning'`. (3.2)

## US-4 — classification + bounded retries
- `classify-error.ts`: add `diverged` reason matched by
  `/missing necessary objects/i`, `/shallow update not allowed/i`,
  `/object .* not found/i`, plus the existing fast-forward patterns map to
  the diverged-recovery route. `non-fast-forward` stays its own reason.
- `retry-policy.ts`: `diverged` and `non-fast-forward` are retriable **only
  up to MAX_ATTEMPTS**; after that → terminal. `handle-failure`'s
  non-fast-forward branch consults `shouldRetry`/attempt-cap (it currently
  bypasses it). (4.2–4.3)

## US-5 — observability
`handle-failure` (and the reset-replay failure path) log the raw
`error.message` + classified reason via the SW logger before
classification discards it.

## Out-of-spec sibling fixes (small, independent — done alongside)
- `/sw.js` served with `Cache-Control: no-store` in `worker.ts` so CF edge
  / browsers never pin an old SW. (Was: no header → stale SW.)
- Ticket attachment `put-content.ts` / `attachment-pipeline.ts`: a 404/403
  surfaces as an actionable "no write access to the tickets repo" message
  and does **not** abort ticket creation (attach is best-effort).

## Rejected alternatives
- **Merge unrelated histories** (current `merge-unrelated.ts`): produces a
  commit whose pack crosses the shallow boundary → remote connectivity
  rejection. Deleted.
- **Unshallow / full clone**: cost; and the old ancestors were GC'd by the
  rewrite, so unshallow can't fetch them anyway.
- **`force: true` push**: clobbers concurrent editors and still fails
  connectivity. No.
```
