# Design — Ticket attachment service-token proxy

Satisfies `requirements.md`. Mirrors the existing `cors-proxy` gates
(Origin allowlist, target pinning) and the security-hardening
confused-deputy shape `return requireOrgMember() ?? doWrite()`.

## Endpoint
`POST /api/tickets/attach` on the admin Hono worker (`src/api/app.ts`).
- **Env**: `TICKETS_TOKEN?: string` — worker secret, GitHub token with
  contents:write on `communist-prometheus/tickets`. Optional → graceful 503.
- **Body**: `{ path, content (base64), message }`.
- **Auth**: caller sends their GitHub OAuth token in `Authorization:
  Bearer`. The endpoint uses it ONLY to verify authorization; the write
  uses `TICKETS_TOKEN`.

## Handler flow (`src/api/tickets-attach.ts`, no-`if` ternary style)
1. `Origin` present and not allowed (`isAllowedOrigin`) → 403. (US-2.4)
2. No bearer token → 403. (US-2.1)
3. No `TICKETS_TOKEN` → 503. (US-3.1)
4. Body `path` not matching `^attachments/[\w-]+/[\w.\- ]+$` → 403, no
   upstream call. (US-2.3)
5. `requireOrgMember(callerToken)` — `GET /user/memberships/orgs/
   communist-prometheus` with the CALLER token; `state === 'active'` →
   pass, else 403 (upstream write never reached). (US-2.1/2.2)
6. `doWrite` — `PUT api.github.com/repos/communist-prometheus/tickets/
   contents/<path>` with `TICKETS_TOKEN` (branch master); 2xx → `{ url }`
   (github.com blob URL), else map status → error. (US-1)

Gate composition: `originGate ?? tokenGate ?? configGate ?? pathGate ??
(await requireOrgMember()) ?? doWrite()` — each returns `Response |
undefined`.

## Client change
`upload-attachment.ts`: replace the `put-content` / `put-blob` split with a
single `proxyAttach({ token, path, content, message })` → `fetch('/api/
tickets/attach', { method:'POST', headers:{ Authorization: Bearer token },
body })`. `buildAttachmentUrl(path)` is unchanged (same file path → same
blob URL). Delete the now-unused `put-content.ts` / `put-blob.ts`.

## Rejected
- Routing large files through a server-side Git-Data-API path (blob→tree→
  commit→ref): 5 calls + ref-race; Contents API single-PUT to a unique path
  is atomic and covers ticket attachments. Deferred.
- Gating on the SSO owner JWT: heavier; the caller-token org-membership
  check is sufficient and self-contained.
