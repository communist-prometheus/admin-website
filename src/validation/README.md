# validation

Schema-based validation infrastructure using Effect.Schema. All data crossing trust boundaries (API responses, localStorage, postMessage) is decoded and validated here instead of using `as` casts.

## Key Exports

- `decodeOrUndefined` / `decodeOrDefault` -- decode unknown data through a Schema
- `parseJsonAs` -- parse JSON string and decode through Schema
- `decodeResponse` / `decodeResponseEffect` -- decode fetch Response bodies
- `extractString` -- safely extract a string from Vue route query values
- `normalizeHeaders` -- normalize HeadersInit to a flat record
- `serializeBody` -- serialize BodyInit to string for SW transport

## Content gate

`content-gate.ts` (rules in `content-gate-rules.ts`) is the one set of checks every write of a `<type>/<slug>/index.<lang>.md` must pass before it reaches git, whatever transport carries it:

1. the frontmatter is valid YAML with a mapping root,
2. the filename `<lang>` is in the supported set (when the caller has one — the Service Worker passes `workerState.supportedLangs`),
3. `frontmatter.lang` equals the filename `<lang>`,
4. the per-type schema (`schemas/frontmatter-*.ts`) accepts the record.

It is pure, so both the Service Worker's stage handler (`sw/handlers/file/validate-stage-rules.ts`) and the redesign's Contents-API publish (`redesign/engine/content.ts` → `publishFileViaApi`, loaded lazily) run the same rules. It exists because the public site's Astro build fails on exactly these — an unquoted `:` in a description, a bare `articles:` (an empty YAML value where the magazine schema wants a list) — and one such commit blocks every deploy until someone fixes it by hand.
