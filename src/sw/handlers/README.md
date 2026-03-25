# sw/handlers

HTTP request handlers for the SW's REST-style API. Routes incoming `/api/github/*` requests to the appropriate handler using Effect's `Option` and `pipe`.

## Submodules

- `content/` -- content CRUD (list, get, update, rename, delete)
- `file/` -- raw file CRUD and tree listing
- `asset/` -- binary asset CRUD (read, write, delete, list)
- `shared/` -- shared handler utilities (JSON response, MIME detection, frontmatter parsing, slug parsing)
- `repo/` -- repository-level operations (tree listing, commit)

## Key Files

- `route.ts` -- top-level router combining all sub-routers via `firstMatch`
