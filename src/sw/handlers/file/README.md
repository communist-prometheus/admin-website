# sw/handlers/file

Raw file CRUD handlers for `/api/github/file` and `/api/github/tree` endpoints.

## Key Exports

- `routeFileRequest` -- route dispatcher for file and tree endpoints
- `handleFileRead` -- read a file by path (GET)
- `handleFileCreate` -- create a new file (POST)
- `handleFileUpdate` -- update an existing file (PUT)
- `handleFileStage` -- stage a file change for the next commit (PUT)
- `rename/` -- file rename operations
