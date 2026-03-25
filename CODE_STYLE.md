# Code Style

## Effect.js Patterns

The Service Worker and validation layers use [Effect](https://effect.website/) for typed, composable error handling and control flow.

### Effect.gen for sequential flows

Generator syntax for multi-step operations with typed error propagation:

```ts
// src/sw/git/sync/sync-repo.ts
export const checkRepoAndSync = (config: SWGitConfig): Promise<void> =>
  Effect.runPromise(
    Effect.gen(function* () {
      const exists = yield* repoExists(config)
      if (!exists)
        return yield* isMock(config) ? initMock : freshClone(config)
      if (isMock(config)) return markReady()
      const pulled = yield* Effect.promise(() => tryPull(config))
      return pulled ? markReady() : yield* freshClone(config)
    })
  )
```

### Match for exhaustive dispatch

Pattern matching replaces switch statements:

```ts
// src/sw/core/messaging/message-handler.ts
export const handleMessage = (msg: SWRequest, reply: Reply): void =>
  Match.value(msg).pipe(
    Match.when({ type: 'SW_INIT' }, m => handleInit(m.config, reply)),
    Match.when({ type: 'SW_FETCH' }, m => handleFetchMessage(m, reply)),
    Match.when({ type: 'SW_STATUS' }, () => reply(buildStatus())),
    Match.when({ type: 'SW_METRICS' }, () => reply(getMetrics())),
    Match.when({ type: 'SW_LOG_SUBSCRIBE' }, () =>
      reply({ entries: getLogEntries() })
    ),
    Match.when({ type: 'SW_INVALIDATE' }, () => handleInvalidate(reply)),
    Match.orElse(() => log('warn', 'lifecycle', 'Unknown message type'))
  )
```

### Effect.tryPromise for error boundaries

Wraps external async operations in typed error channels:

```ts
// src/sw/handlers/shared/first-match.ts
const tryRoute = (
  handler: RouteHandler,
  url: URL,
  request: Request
): Effect.Effect<Option.Option<Response>, unknown> =>
  pipe(
    Effect.tryPromise(() => handler(url, request)),
    Effect.map(Option.fromNullable)
  )
```

### Schema for runtime validation

Replaces `as` casts with declarative schemas (see `TYPE_SAFETY.md`).

### Data.TaggedError for typed errors

```ts
// src/sw/errors/index.ts
export class GitError extends Data.TaggedError('GitError')<{
  readonly operation: string
  readonly cause: unknown
}> {}
```

---

## FP Principles

### Zero if, zero imperative loops

- Branching uses ternary expressions, `Match`, `Option`, or early returns
- Iteration uses `Array.from`, `map`, `filter`, `reduce`
- Loops in handlers use `for...of` only when transforming to a mutable accumulator (e.g., frontmatter parsing)

### Declarative everything

- Components are declarative templates over reactive state
- Business logic lives in composables and helpers, not in components
- Effect pipelines (`pipe`, `Effect.map`, `Effect.flatMap`) replace imperative sequences

### Arrow functions over regular functions

Every exported function is an arrow function. Generator functions (`Effect.gen`) are the sole exception.

### Closures over classes

State is captured in closures rather than class instances:

```ts
// src/sw/logging/ring-buffer/ring-buffer.ts
export const createRingBuffer = <T>(capacity: number): RingBuffer<T> => {
  const buf: T[] = Array.from({ length: capacity })
  let head = 0
  let count = 0

  return {
    push: (item: T) => { /* ... */ },
    entries: () => { /* ... */ },
    size: () => count,
    clear: () => { head = 0; count = 0 },
  }
}
```

---

## File Size Limits

Enforced by oxlint (`sonarjs/max-lines` and `sonarjs/max-lines-per-function`):

| Metric | Limit |
|--------|-------|
| Non-blank lines per file | 50 |
| Lines per function | 25 |

When a file exceeds the limit, decompose into sibling files in the same directory. Barrel exports (`index.ts`) re-export the public API.

---

## Type Safety Approach

- **Validate at boundaries**: all external data (API responses, localStorage, postMessage) passes through `Effect.Schema` decoders before entering the application
- **Compute internally**: once data is validated, downstream code operates on typed values with no additional casts
- **Zero `as` casts**: see `TYPE_SAFETY.md` for the full policy

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `commit-and-push.ts` |
| Vue components | PascalCase | `ContentViewHeader.vue` |
| Types/interfaces | PascalCase | `SWGitConfig` |
| Functions | camelCase | `checkRepoAndSync` |
| Constants | UPPER_SNAKE | `SW_LOG_CHANNEL` |
| Schemas | PascalCase + `Schema` | `ContentItemSchema` |
| Composables | `use` prefix | `useContent` |
| Store factories | `create` prefix | `createLoadAll` |
