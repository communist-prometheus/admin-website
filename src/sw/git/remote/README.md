# sw/git/remote

Remote push operations. Commits staged changes via isomorphic-git and pushes to the remote GitHub repository through a CORS proxy.

## Key Exports

- `commitAndPush` -- commit all staged changes and push; returns the new commit SHA (or `'mock'` in mock mode)
- `realCommit` -- perform a real git add + commit + push via isomorphic-git
- `pushToRemote` -- push the current branch to origin
