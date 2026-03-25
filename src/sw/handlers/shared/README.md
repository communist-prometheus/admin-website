# sw/handlers/shared

Shared utilities used across all request handlers.

## Key Exports

- `jsonResponse` / `errorResponse` -- create JSON `Response` objects with proper headers
- `firstMatch` -- try route handlers in order, return first `Some(Response)` via Effect/Option
- `parseFrontmatter` / `serializeFrontmatter` -- parse and serialize YAML frontmatter in markdown
- `parseSlug` -- extract content type, slug, and language from URL paths
- `detectMime` -- detect MIME type from file extension
- `parseBody` -- parse request body as JSON
