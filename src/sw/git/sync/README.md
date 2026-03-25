# sw/git/sync

Repository sync orchestration. Determines whether to clone fresh or pull existing, with fallback to wipe-and-reclone on pull failure (handles remote force pushes).

## Key Exports

- `checkRepoAndSync` -- main entry: pull if repo exists, clone if not, init mock if in mock mode
- `markReady` -- transition worker state to `ready` after successful sync
- `wipeRepo` -- delete the local repo from IndexedDB for a clean reclone
- `clone/` -- clone options builder and clone execution
- `pull/` -- pull with conflict recovery
