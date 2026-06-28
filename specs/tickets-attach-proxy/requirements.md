# Requirements — Ticket attachment write via service token (no per-user repo access)

## Overview

Ticket attachments are written directly to the **private** `tickets` repo
with the **uploading user's** GitHub OAuth token
(`put-content.ts` / `put-blob.ts` → `api.github.com/.../contents`). Any
editor who is not a write-collaborator on that private repo gets
`404 Upload failed` — so attaching a file requires per-user GitHub repo
grants, which is exactly the access-control sprawl we want to avoid.

This spec routes attachment writes through a **same-origin worker
endpoint** that performs the write with a **service token** (a worker
secret with write on the `tickets` repo). Editors no longer need any
direct access to the private repo; the only authorization the endpoint
requires is that the caller is an authenticated org member — verified by
the endpoint itself, never trusted from the client.

## User stories & acceptance criteria

### US-1 — Any org member can attach without repo access
- 1.1 WHEN an authenticated org member uploads a ticket attachment, THE
  SYSTEM SHALL store it in the `tickets` repo using the service token, with
  **no** requirement that the user has direct write access to that repo.
- 1.2 WHEN the write succeeds, THE SYSTEM SHALL return the attachment's
  github.com blob URL (unchanged from today).

### US-2 — The endpoint is not a confused deputy / open relay
- 2.1 THE endpoint SHALL re-derive the caller's authorization itself from
  GitHub using the **caller's own token** (active org membership), reading
  state the caller cannot set — never a request field, never UI gating.
- 2.2 IF the caller is not an active org member, THEN THE SYSTEM SHALL
  return 403 AND SHALL NOT touch the service token / upstream write.
- 2.3 THE endpoint SHALL pin the upstream write to the `tickets` repo's
  `contents/attachments/<id>/<file>` path only (host + path allowlist);
  any other path SHALL be rejected (403) before any upstream call.
- 2.4 THE endpoint SHALL reject a disallowed `Origin` (allowlist, never
  reflected).

### US-3 — Graceful when unconfigured
- 3.1 IF the service token secret is absent, THEN THE SYSTEM SHALL return a
  clear 503 ("attachment service not configured") and attachment upload
  SHALL stay best-effort (never blocks ticket creation).

## Test strategy

- Unit (gate): foreign Origin → 403, upstream never called; non-member
  token → 403, upstream never called; non-`attachments/` path → 403;
  missing service token → 503.
- Unit (happy): active member + valid path → service-token PUT issued,
  returns the blob URL.

## Out of scope / notes

- Files > the Contents-API ceiling (current client `put-blob` path) are
  proxied via the same endpoint using the Contents API; very large
  attachments that exceed it fail gracefully (best-effort) — a Git-Data-API
  proxy path is a later refinement if needed.
- The service token (`TICKETS_TOKEN` worker secret) is provisioned by the
  owner (`wrangler secret put`); the code reads it.
