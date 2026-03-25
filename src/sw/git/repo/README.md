# sw/git/repo

Repository management utilities for the IndexedDB-backed git repo.

## Key Exports

- `checkRepoExists` -- check if a git repo already exists by resolving HEAD
- `initMockRepo` -- initialize a minimal mock repo for E2E tests
- `persistConfig` -- save/load SW git config to IndexedDB for restart recovery
