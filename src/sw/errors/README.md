# sw/errors

Typed Effect error classes using `Data.TaggedError`. Each error carries structured context and participates in Effect's typed error channel for exhaustive error handling.

## Error Classes

- `GitError` -- git clone/pull/push operation failed
- `IOError` -- file system read/write/delete failed
- `NotFoundError` -- resource not found (file, path, config)
- `ConfigMissingError` -- SW config not yet initialized
- `ValidationError` -- request validation failed
- `ParseError` -- JSON/frontmatter parsing failed
