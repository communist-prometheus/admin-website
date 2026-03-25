# validation

Schema-based validation infrastructure using Effect.Schema. All data crossing trust boundaries (API responses, localStorage, postMessage) is decoded and validated here instead of using `as` casts.

## Key Exports

- `decodeOrUndefined` / `decodeOrDefault` -- decode unknown data through a Schema
- `parseJsonAs` -- parse JSON string and decode through Schema
- `decodeResponse` / `decodeResponseEffect` -- decode fetch Response bodies
- `extractString` -- safely extract a string from Vue route query values
- `normalizeHeaders` -- normalize HeadersInit to a flat record
- `serializeBody` -- serialize BodyInit to string for SW transport
