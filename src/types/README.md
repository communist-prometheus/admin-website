# types

TypeScript type definitions for the application domain model. Types are kept minimal and composed from smaller pieces.

## Key Types

- `ContentItem` -- content item with path, slug, language, and frontmatter
- `ContentType` -- union of content type strings (`blog | positions | pages | common`)
- `Frontmatter` -- readonly record of unknown values; narrowed downstream via `in` + `typeof`
- `BlogFrontmatter` / `PageFrontmatter` / `PositionFrontmatter` / `CommonFrontmatter` -- typed frontmatter shapes
- `Language` -- language code string type
- `User` -- authenticated user with username, name, avatar, and access token
- `LANGUAGES` -- compile-time fallback language list
- `isContentType` -- type guard for `ContentType`
