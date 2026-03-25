# validation/schemas

Effect.Schema definitions for every data boundary in the application. Each schema validates the shape of external data (API responses, localStorage, postMessage payloads) and derives TypeScript types via `typeof Schema.Type`.

## Schemas

- `CachedProfileSchema` / `GitHubUserApiSchema` -- user profile validation
- `ContentItemSchema` / `ContentListResponseSchema` -- content list API
- `AssetItemSchema` / `AssetContentSchema` -- asset API responses
- `OAuthMessageSchema` -- OAuth popup postMessage payloads
- `SWGitConfigSchema` -- SW git configuration from IndexedDB
- `ErrorResponseSchema` -- API error bodies
- `SuccessResponseSchema` / `CommitResponseSchema` / `FileDataSchema` -- CRUD responses
- `GitHubTreeResponseSchema` / `GitHubFileContentSchema` -- GitHub API shapes
- `LanguageEntrySchema` / `LanguageArraySchema` -- settings language entries
