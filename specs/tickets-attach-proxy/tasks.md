# Tasks — Ticket attachment service-token proxy

- [ ] **T1** — `src/api/tickets-attach.ts`: handler with the gate chain
  (Origin, bearer, config, path-pin, org-member, write). No-`if` ternary
  style. (US-1, US-2, US-3)
- [ ] **T2** — `app.ts`: add `TICKETS_TOKEN?: string` to `Env`; route
  `.post('/tickets/attach', ticketsAttach)`.
- [ ] **T3** — `src/api/tickets-attach.test.ts`: gate tests — foreign
  Origin → 403 & no fetch; non-member → 403 & no write; bad path → 403; no
  token → 503; happy path → service-token PUT + blob URL.
- [ ] **T4** — Client: `proxy-attach.ts` (POST the endpoint); rewire
  `upload-attachment.ts`; delete `put-content.ts` / `put-blob.ts`. Keep the
  best-effort pipeline (US-3.1).
- [ ] **T5** — Validate + build + unit/E2E green; ship dev→master. Owner
  provisions `TICKETS_TOKEN` (`wrangler secret put`).
