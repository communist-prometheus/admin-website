# Newsletter — Editor User Guide

This guide walks the **editor** through every day-to-day task in the
newsletter admin surface at `admin.comprom.org/comms`.

> **Audience:** anyone added to the `communist-prometheus/admins`
> GitHub team. Audience members do NOT need to be developers — every
> action below is point-and-click in the admin UI.

> **Audience:** аудитория — редакторы из команды
> `communist-prometheus/admins`. Технических знаний не требуется.

---

## 1. Access requirements

Before the first login an existing org owner must have promoted
your GitHub login to **Owner** in `communist-prometheus` (Settings
→ Members → role: Owner). Owners are the only role that the auth
worker accepts; regular members get a 403 from `lists.comprom.org`
even after PKCE.

Once you are an owner, opening `admin.comprom.org/comms` triggers
the standard PKCE GitHub OAuth flow. After the token lands in
localStorage the SPA also mints a `comprom_session` cookie scoped
to `.comprom.org` via `auth.comprom.org/auth/session`; that cookie
is then shared with `lists.comprom.org` automatically. See
[`docs/architecture/sso.md`](../../../docs/architecture/sso.md) for
the full flow.

---

## 2. The `/comms` surface at a glance

`/comms` is composed of three live sections, top-to-bottom:

| Section            | What it shows                                       |
|--------------------|-----------------------------------------------------|
| **Schedule editor**| Current crontab + IANA timezone + next-run preview  |
| **Subscribers**    | Add form + table of every subscriber row            |
| **Run history**    | Last 20 dispatch attempts, newest first             |

All three load on first visit; no buttons need to be clicked.

---

## 3. Adding a subscriber (R1.2)

1. Scroll to the **Add subscriber** row above the table.
2. Type the recipient email into the leftmost input.
3. Click each language tag the subscriber wants in their digest
   (`en` `ru` `it` `es` `uk` `pl` `bl`). Selected pills turn accent-
   coloured.
4. Press **Add subscriber**.

**What you should see:**

- The new row appears at the bottom of the table within ~250 ms.
- The form clears, ready for the next entry.
- Status badge of the new row reads **ACTIVE**.

**Validation rules:**

- Email must match `<local>@<domain>.<tld>` shape (R1.4).
- At least one language must be selected (R1.5).
- Re-adding an already-active email returns the inline error
  *"subscriber already exists"* (R1.5).
- An email previously **unsubscribed** can be re-added as a fresh row
  (R4.4) — the old row stays in the table for auditing.

---

## 4. Editing a subscriber's languages (R1.3)

Each subscriber row carries the same language pills used in the add
form. Click any pill to toggle that language on or off. Changes
persist on the next click — no Save button.

> **Note:** turning off every language is not allowed; the worker
> rejects an empty `langs[]` array with a 422.

---

## 5. Removing a subscriber (R1.6)

The trash button at the right end of every row hard-deletes that
subscriber after a single click. There is no undo.

**Use `Remove` when:**

- The address was added by mistake.
- The owner asked to be deleted (data deletion request — different
  from unsubscribe).

**Use `Unsubscribe` (status flip) when:**

- A bounce arrives via the Resend webhook.
- The recipient clicks the in-email unsubscribe link themselves.

The history of removed rows is gone forever, so prefer
**unsubscribe** unless the goal really is hard deletion.

---

## 6. Setting the dispatch schedule (R2.1–R2.4)

The schedule editor sits at the very top of `/comms`.

1. Type any standard 5-field crontab into the **Crontab** input.
   Examples:
   - `0 12 * * 6` — every Saturday at 12:00 (the seed default).
   - `0 9 * * 1` — every Monday at 09:00.
   - `*/30 * * * *` — every 30 minutes (testing only).
2. Pick an IANA timezone from the **Timezone** dropdown.
3. The **preview line** updates live:
   > *"every Saturday at 12:00 (Europe/Moscow)"*
4. Press **Save schedule**.

**What you should see:**

- The button shows **Saving…** briefly.
- The **Next run** timestamp updates to the new computed value
  (server-side, via `cron-parser`).
- An invalid crontab surfaces the parser's error message inline
  without losing your draft.

**Tip:** the worker tolerates a 5-minute window after each scheduled
fire time (R2.5), so a slightly-late heartbeat still dispatches that
tick.

---

## 7. Manual dispatch (dev / e2e only)

In production the dispatch fires automatically on the saved schedule;
the editor does not need to do anything.

In **local dev** and the **e2e** environment the worker exposes
`POST /api/dispatch?force=1` for manual triggers. It is gated by the
`BYPASS_SCHEDULE=1` env var — in prod it returns 404 unconditionally.

For local testing (after `wrangler dev`):

```bash
curl -X POST "http://127.0.0.1:8787/api/dispatch?force=1" \
     -H "Cookie: comprom_session=<local-stub-jwt>"
```

The response is `202 {sent, failed, skipped, durationMs}`.

---

## 8. Viewing the run history (R5.1–R5.3)

The **Run history** section lists the 20 most-recent dispatch
attempts, newest tick first.

Each row shows:

| Column     | Meaning                                                 |
|------------|---------------------------------------------------------|
| Tick       | UTC moment the dispatch attempt happened                |
| Email      | Recipient (or `—` if the row was deleted)               |
| Status     | `sent` / `failed` / `bounced` / `complained` / `skipped`|
| Articles   | Articles in the digest that went out                    |

Failed rows are highlighted in danger colour. **Click a failed row**
to reveal the captured error message (R5.3) — usually the verbatim
status code returned by Resend.

---

## 9. What recipients see (R4.1–R4.5)

Every digest carries two unsubscribe surfaces:

- **`List-Unsubscribe` header** + **`List-Unsubscribe-Post:
  List-Unsubscribe=One-Click`** — modern mail clients (Gmail, Apple
  Mail) render a one-click unsubscribe button next to the From line.
- **Footer link** in HTML + plain-text body — for older clients.

Both target `https://lists.comprom.org/unsubscribe?t=<token>` where
`<token>` is a per-subscriber HMAC (R4.5). The link survives forever
unless the worker's `UNSUBSCRIBE_SECRET` is rotated.

**Confirmation page** (R4.2):

- A `GET` from a browser renders an HTML page in the visitor's
  preferred language (best-match against `Accept-Language`) with the
  message "You have been unsubscribed" plus a *Re-subscribe by email*
  CTA pointing at `public@comprom.org`.
- A `POST` from a mail provider (RFC 8058 one-click) returns 200 with
  an empty body. The subscriber's status flips to `unsubscribed` in
  both cases.

The flow is idempotent — second clicks return 200 without state
churn.

---

## 10. Resend webhook (automated bounce / complaint handling)

When Resend reports `email.bounced`, `email.delivery_delayed`, or
`email.complained`, the corresponding subscriber's status auto-flips
to `bounced` or `complained` (R3.10–R3.11). Such subscribers are
skipped by every subsequent dispatch (R4.6, R4.7).

The editor does not interact with this surface; it shows up only as a
status badge change on the subscriber row + a new line in the run
history.

---

## 11. Troubleshooting

| Symptom                             | What to check                                                      |
|-------------------------------------|--------------------------------------------------------------------|
| **401 on every action**             | GitHub team membership; re-login via the OAuth flow                |
| **Add returns 422 / 409**           | Email shape; duplicate active row; empty langs array               |
| **Schedule preview blank**          | Crontab not 5 fields; unknown IANA tz                              |
| **Next run still old after save**   | Hard-refresh — the store caches until next mount                   |
| **Subscriber missing after add**    | Look at run history — likely a bounce flipped the row              |
| **No emails arriving**              | Run history shows `failed`? Click row, read error; check Resend UI |

---

## 12. References

- Spec: [`specs/comms-newsletter/`](../../../specs/comms-newsletter/)
- API surface: [`README.md`](../README.md)
- Local-dev env: [`.dev.vars.example`](../.dev.vars.example)
