# Comms — A11y Audit (WCAG 2.1 AAA target)

The admin SPA and the public unsubscribe surface both target AAA.
Findings below are split by severity. Frontend-dev implements every
**blocker** and **major**; minors land if cheap.

## Severity counts

- **Blockers:** 8
- **Majors:** 7
- **Minors:** 5
- **Nits:** 3

## 1. Blockers

| # | Where | WCAG | Fix |
|---|---|---|---|
| B1 | `AddSubscriberForm.vue:36` (email input) | 3.3.2 / 4.1.2 | `<input>` has only `placeholder=` — add `aria-label="Subscriber email"` AND a visible `<label>` via a wrapping `.field` block. |
| B2 | `AddSubscriberForm.vue:52` (form-level error) | 3.3.1 | The error `<p data-testid="add-subscriber-error">` is not associated with the input. Add `aria-invalid="true"` to the input when error set + `aria-describedby="add-subscriber-error-id"`; give the `<p>` that id. |
| B3 | `ScheduleEditor.vue` (cron / tz / save) | 1.3.1 | `aria-label="Crontab expression"` already present on input but no visible label. Add label block. Apply error association on the schedule error. |
| B4 | `SubscriberStatusBadge.vue` and `RunHistoryRow.vue` (status pills) | 1.4.1 | Status is communicated by colour alone (red, green, orange). Add a visually-hidden `.sr-only` suffix `"status: bounced"` and an aria-label to the badge. Pair every colour with an icon glyph (✓ ✕ ⚠) so colour-blind users have a second channel. |
| B5 | `RunHistoryRow.vue:24` (`@click="onToggle"` on `<li>`) | 2.1.1 / 4.1.2 | Failed rows are clickable to reveal error but have NO keyboard handler and no `role="button"`. Change the clickable container to a `<button>` for failed rows (or add `tabindex="0"` + `role="button"` + `@keydown.enter.space.prevent="onToggle"`). |
| B6 | `RunHistoryRow.vue` (expanded error) | 4.1.2 | When the error reveal opens, no screen-reader announcement. Add `aria-expanded="…"` to the trigger + `aria-controls="row-error-{id}"` and the error element with that id. |
| B7 | `LangTogglePills.vue:25` (pill size) | 2.5.5 (AAA) | Current touch target 14×24 px. Min 32×32 with 8 px spacing (small-target waiver) or full 44×44. See design-spec.md §7. |
| B8 | Every interactive control | 2.4.7 | No `:focus-visible` styles. Browsers' default outline is removed by `button { background:transparent; … }` in places. Add the global `:focus-visible` ring from design-spec.md §5. |

## 2. Majors

| # | Where | WCAG | Fix |
|---|---|---|---|
| M1 | `CommsView.vue:38` | 1.3.1 | The `<h1>Newsletter</h1>` is followed by `<p class="lead">` then `<ScheduleEditor>`. Wrap the lead in `<header>` and tie each section to its own `<section>` + `<h2>` per design-spec.md §4. Right now `RunHistory` is the only `<h2>`; Schedule and Subscribers are anonymous. |
| M2 | `SubscribersTable.vue` + `RunHistoryList.vue` | 1.3.1 | Both are `<ol>` of grid rows. Run history is tabular data — convert to `<table>` with `<thead>`. Subscribers has fixed columns (email, langs, status, action) — use `<table>` there too. |
| M3 | `ScheduleEditor.vue` (Save button disabled state) | 4.1.2 | When draft == saved, the button is `disabled` but no `aria-describedby` explains why. Add a sr-only "Schedule is already saved" message and reference it. |
| M4 | `AddSubscriberForm.vue` (saving state) | 4.1.3 | Button text flips to "Adding…" but no `aria-live="polite"` region announces the result. Add a sr-only `<output role="status" aria-live="polite">` in the form that updates on success / fail. |
| M5 | Locale of admin UI | 3.1.1 | Confirm `AppLayout` wraps `<router-view>` in `<main>`. If missing, add `<main>` landmark. |
| M6 | `RunHistoryRow.vue` (`cursor: pointer` on failed only) | 1.3.3 / 2.5.5 | Cursor is the only affordance saying "expandable". Add an explicit ▸ → ▾ chevron column. |
| M7 | Public unsubscribe page (`confirmation.ts`) | 2.4.4 | The mailto CTA has no `?subject=` — recipient's mail client opens empty. Add `?subject=Subscribe%20to%20newsletter`. |

## 3. Minors

| # | Where | WCAG | Fix |
|---|---|---|---|
| N1 | `LangTogglePills.vue:29` (aria-pressed) | 4.1.2 | Already correct. No fix. |
| N2 | `TimezoneSelect.vue:22` (combobox) | 3.3.2 | Has `aria-label="Timezone"` but no visible label. Add visible `<label>` per design-spec.md §5. |
| N3 | `RunHistory.vue:23` (empty state text) | 1.3.1 | Wrap in `role="status"` so async load is announced. |
| N4 | `RunHistoryRow.vue:55` (`background: rgb(192 57 43 / 8%)`) | 1.4.3 | Tinted failed row needs contrast check against its text. With `--color-danger-subtle` at 8 % alpha the contrast remains within range; verify when implementing. |
| N5 | `SubscriberStatusBadge.vue` (font-weight 700) | none | Consistent with lang pills — no fix. |

## 4. Nits

- `ScheduleEditor.vue:21`: `defineEmits` uses tuple — fine.
- `RunHistoryList.vue:8`: empty `defineProps` — fine.
- `CommsView.vue:37`: testid OK.

## 5. New tokens (mirrored in design-spec.md §1)

- `--color-focus-ring` — used by every `:focus-visible` rule
- `--color-success` / `--color-warning` / `--color-muted` — status
  pill colours
- `--color-danger` — promote the existing fallback chain to a real
  token
- `--color-danger-subtle` — tinted background for failed rows
- `--color-surface-hover` — row hover state

## 6. Tests to add

| File | What it asserts |
|---|---|
| `e2e/comms/a11y.spec.ts` (NEW) | `axe-core` scan of `/comms` with 0 violations; tab order matches reading order; focus visible on every interactive control |
| `e2e/comms/keyboard.spec.ts` (NEW) | Enter / Space on failed-row trigger expands the error; second Enter collapses; Tab moves to next row; aria-expanded toggles |
| `e2e/comms/contrast.spec.ts` (NEW) | Lighthouse desktop + mobile against `/comms`, Best Practices ≥ 95, Accessibility = 100 |
| `e2e/unsubscribe/page.spec.ts` (NEW) | Visit `/unsubscribe?t=…` in both `prefers-color-scheme` modes; assert contrast and `<html lang>` |

## 7. Public unsubscribe page — checklist

- [ ] `<html lang="…">` matches `Accept-Language` pick (done)
- [ ] `<meta name="viewport">` present (done)
- [ ] Single `<h1>` per page (done)
- [ ] Mailto CTA carries `subject=` and `body=` for context
- [ ] Light-theme override via `@media (prefers-color-scheme: light)`
- [ ] Card surface contrast ≥ 7:1 against text (AAA)
- [ ] No interactive control smaller than 32×32 px
- [ ] Respect `prefers-reduced-motion: reduce` (skip transitions)
- [ ] Page renders without JavaScript (SSR HTML — already does)
- [ ] No tracking pixels or external requests

## 8. Top 10 priority order

1. **B8** — global `:focus-visible` ring (unblocks every other a11y win)
2. **B5** — keyboard handler on failed-row trigger
3. **B4** — sr-only suffix + icon glyph on status pills
4. **M2** — convert lists to `<table>` (subscribers + runs)
5. **B1 / B3** — visible labels on every form input
6. **B6** — aria-expanded + aria-controls on row expansion
7. **B7** — bump lang pill touch target to 32×32 with 8 px gap
8. **B2** — error association via aria-describedby + aria-invalid
9. **M4** — sr-only `<output>` for async save status
10. Public-page checklist items
