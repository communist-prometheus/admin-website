# Tasks — Reliable content push from any clone state

Ordered, each references requirement(s) + the test that verifies it. Keep
the tree green between tasks.

- [ ] **T1 — Surface per-ref push rejection** (US-2.1/2.2)
  `push-to-remote.ts`: throw when `result.refs[ref].ok === false` /
  `result.ok === false`. Test: `push-to-remote.spec` unit — stubbed
  `git.push` returning `{ok:true,error:undefined,refs:{r:{ok:false,error:'…'}}}`
  throws.

- [ ] **T2 — Diff a commit's changed files** (US-1.1/1.3)
  `changed-files-of-commit.ts`: `git.walk(TREE(sha) vs TREE(sha^))` →
  `[{path, content}|{path, deleted}]`, blobs via `git.readBlob`. Test:
  node integration — commit edits A, adds B, deletes C → exactly those.

- [ ] **T3 — Reset-onto-remote + replay** (US-1.1/1.2/1.3/1.4)
  `run-reset-replay.ts` per design. Test (R-1, node integration): depth:1
  clone tip L; build an UNRELATED remote root R (writeCommit parent:[]) with
  a different tree; local commit C on L editing a shared file + adding one;
  run reset-replay; assert new commit C' has **parent === R**, its tree =
  R's tree with the user's edits applied, and L is **not** in C''s ancestry.

- [ ] **T4 — Route diverged/unrelated → reset-replay** (US-1, US-4.1)
  `merge-classify.ts`: add `isDiverged` (missing-object/shallow). Thread
  `entry` through `tryMergeAfterNff`/`attemptMerge`/`classifyMergeError`;
  on `isUnrelatedHistories || isDiverged` call `runResetReplay`, return
  `{kind:'rebased', sha}`. Delete `merge-unrelated.ts` + `run-unrelated-merge.ts`.
  Test: `merge-classify.spec` predicates; `attempt-merge` unit routes
  MergeNotSupportedError → rebased (mocked git).

- [ ] **T5 — handle-nff consumes `rebased`, updates queue sha, caps retries**
  (US-3.2-adjacent, US-4.2/4.3, US-5)
  `handle-nff`/`handle-failure`: treat `rebased` like clean + `updateEntrySha`;
  consult `shouldRetry`/attempt-cap on the non-fast-forward branch; log raw
  error + reason. `update-attempt.ts`: fix `scheduleAfterMerge` to use the
  bumped attempt. Test: retry-policy caps diverged; handle-failure logs.

- [ ] **T6 — Don't drain during cloning** (US-3.2)
  `drain.ts`: early-return while `workerState.state === 'cloning'`. Test:
  unit — drain is a no-op when state is cloning.

- [ ] **T7 — freshClone preserves unpushed work** (US-3.1, US-5)
  `sync-helpers.ts`/`sync-repo.ts`: before `wipeRepo`, snapshot pending
  entries' changed files; after fresh clone, replay+commit+re-enqueue;
  drop+log orphans whose objects are gone. Test: integration — pending
  entry survives a freshClone (replayed), orphan is dropped.

- [ ] **T8 — sw.js no-store** (sibling)
  `worker.ts`: stamp `Cache-Control: no-store` on `/sw.js`. Test:
  `worker.spec` / realmode header assert.

- [ ] **T9 — Attachment 404 graceful** (sibling)
  `put-content.ts`/`attachment-pipeline.ts`: map 404/403 → "no write access
  to tickets repo"; attach is best-effort, never aborts ticket creation.
  Test: `attachment-pipeline.spec` — a 404 yields a friendly message and the
  ticket still submits.

- [ ] **T10 — Full validate + build + realmode green; ship dev→master**
  `bun run validate`, client+SW build, full mock E2E, realmode. Verify the
  R-1 scenario. Promote develop→master; CF purge done by owner.
