# sw/git

Git operations via isomorphic-git over IndexedDB-backed LightningFS.

## Submodules

- `sync/` -- repo sync orchestration (clone-or-pull)
- `io/` -- file read/write/delete/list on the working tree
- `remote/` -- commit and push to remote
- `repo/` -- existence checks, mock init, config persistence

## Key Files

- `fs.ts` -- LightningFS instance and `REPO_DIR`
- `load-git.ts` -- lazy-loads isomorphic-git and Buffer polyfill
- `blob-sha.ts` / `is-mock.ts` -- blob SHA and mock detection
