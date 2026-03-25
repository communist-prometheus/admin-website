# sw/handlers/content

Content CRUD handlers for `/api/github/content/*`. Manages multilingual markdown items with frontmatter.

## Key Exports

- `routeContentRequest` -- route dispatcher for content endpoints
- `handleContentUpdate` -- create or update a content item (POST)
- `handleContentRename` -- rename a slug across all languages (POST)
- `dispatchContent` -- dispatch GET/DELETE by type, slug, and lang
- `matchContent` -- match URL pathname to content type/slug/lang
- `list.ts` / `get.ts` / `delete.ts` -- individual CRUD operations
- `resolve-path.ts` -- resolve content type + slug + lang to filesystem path
- `build-item.ts` -- build a `ContentItem` from a markdown file
