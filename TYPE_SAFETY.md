# Type Safety

## Zero `as` Cast Policy

This codebase contains zero `as` type assertions. Every value flowing through the system is either:

1. **Schema-validated** at the boundary (API responses, localStorage, postMessage)
2. **Inferred** by TypeScript from expressions and control flow
3. **Narrowed** at runtime via `typeof`, `instanceof`, or `in` checks

Type casting hides bugs. If TypeScript cannot infer a type, the architecture needs adjustment -- not a cast.

---

## Effect.Schema for JSON Validation

Every JSON boundary has a corresponding `Schema` definition in `src/validation/schemas/`. Types are derived from schemas via `typeof Schema.Type`, ensuring the runtime validator and compile-time type never diverge.

### Defining a schema

```ts
// src/validation/schemas/user.ts
import { Schema } from 'effect'

export const CachedProfileSchema = Schema.Struct({
  username: Schema.String,
  name: Schema.String,
  avatar: Schema.String,
})

export type CachedProfile = typeof CachedProfileSchema.Type
```

### Decoding unknown data

```ts
// src/validation/decode.ts
import { Either, Schema } from 'effect'

export const decodeOrUndefined =
  <A, I>(schema: Schema.Schema<A, I>) =>
  (input: unknown): A | undefined => {
    const result = Schema.decodeUnknownEither(schema)(input)
    return Either.isRight(result) ? result.right : undefined
  }
```

### Decoding a fetch Response

```ts
// src/validation/decode-response.ts
export const decodeResponse =
  <A, I>(schema: Schema.Schema<A, I>) =>
  async (response: Response): Promise<A> => {
    const json: unknown = await response.json()
    return Schema.decodeUnknownSync(schema)(json)
  }
```

### Before/After

Before (unsafe):

```ts
const data = await response.json() as ContentListResponse  // hidden bug
```

After (validated):

```ts
const decode = decodeResponse(ContentListResponseSchema)
const data = await decode(response)  // throws on shape mismatch
```

---

## Runtime Type Narrowing

For values that cannot be schema-validated (DOM events, Error subclasses), narrowing uses standard JavaScript checks.

### typeof for primitives

```ts
// src/validation/extract-string.ts
export const extractString = (
  value: string | null | undefined | (string | null)[]
): string | undefined => {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    const first = value[0]
    return typeof first === 'string' ? first : undefined
  }
  return undefined
}
```

### instanceof for errors

```ts
// src/sw/handlers/route.ts
const toMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err)
```

### `in` checks for frontmatter

```ts
// Frontmatter is Record<string, unknown>.
// Downstream code narrows fields:
if ('title' in frontmatter && typeof frontmatter.title === 'string') {
  // frontmatter.title is string
}
```

---

## Minimal Interface Pattern

Instead of depending on full DOM types (which couples code to specific browser APIs), handlers define the minimal shape they need. This improves testability and decouples from platform specifics.

### DropLike

```ts
// src/components/MarkdownEditor/handle-drop.ts
interface DropLike {
  readonly dataTransfer?: {
    readonly files: ArrayLike<File>
  } | null
}

export const extractDropFile = (event: DropLike): File | undefined =>
  event.dataTransfer?.files[0] ?? undefined
```

### PasteLike

```ts
// src/components/MarkdownEditor/handle-paste.ts
interface PasteLike {
  readonly clipboardData?: {
    readonly items: ArrayLike<ClipboardItemLike>
  } | null
}

export const extractMediaFile = (event: PasteLike): File | undefined => {
  // ...
}
```

### Before/After

Before (tightly coupled):

```ts
const handle = (event: DragEvent): File | undefined =>
  event.dataTransfer?.files[0] ?? undefined
```

After (minimal interface):

```ts
interface DropLike {
  readonly dataTransfer?: { readonly files: ArrayLike<File> } | null
}

const handle = (event: DropLike): File | undefined =>
  event.dataTransfer?.files[0] ?? undefined
```

The function now accepts any object matching the shape, making it testable without constructing real DOM events.

---

## Summary

| Technique | Used For |
|-----------|----------|
| Effect.Schema | JSON from APIs, localStorage, postMessage |
| `typeof` / `instanceof` | Primitives, Error subclasses |
| `in` + `typeof` | Open record narrowing (frontmatter) |
| Minimal interfaces | DOM event handlers, external API shapes |
| `as` casts | Never |
