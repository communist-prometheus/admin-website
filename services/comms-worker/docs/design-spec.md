# Comms — Design Spec

Implementation contract for the frontend-developer. Every rule is
copy-paste-ready: no further design clarification needed.

## 1. Token table

The token system lives in `src/assets/styles/_variables.scss`. Map
every visible style in `src/views/CommsView/*.vue` to one of these.
Tokens marked **NEW** must be added to `_variables.scss` in BOTH the
default `:root` (dark) block AND the `:root[data-theme='light']`
block AND the system-light fallback `@media (prefers-color-scheme:
light) :root:not([data-theme])`.

### Existing tokens — use these

| Style | Token |
|---|---|
| body text | `--color-text-primary` |
| muted / lead text | `--color-text-secondary` |
| page background | `--color-background` |
| section / card surface | `--color-surface` |
| elevated surface (input bg) | `--color-surface-elevated` |
| primary action / accent | `--color-accent` |
| accent hover | `--color-accent-hover` |
| divider / 1 px border | `--color-border` |
| body font | `--font-sans` |
| tabular / code | `--font-mono` |
| small radius (badge, pill, input) | `--radius-sm` (0.5 rem) |
| section radius | `--radius-md` (0.75 rem) |
| card radius | `--radius-lg` (1 rem) |
| spacing scale | `--spacing-xs … --spacing-2xl` |
| content frame width | `--content-medium` (72 rem) for `/comms` |
| frame padding | `--content-frame-padding` |
| transitions | `--transition-fast` / `--transition-base` |
| shadows | `--shadow-sm` / `--shadow-md` / `--shadow-lg` |

### NEW tokens — add to `_variables.scss`

| Token | Dark | Light | Purpose |
|---|---|---|---|
| `--color-success` | `hsl(150, 55%, 55%)` | `hsl(150, 60%, 35%)` | status "sent" pill |
| `--color-danger` | `hsl(0, 65%, 60%)` | `hsl(0, 70%, 45%)` | status "failed" / "bounced" / "complained", form errors |
| `--color-warning` | `hsl(38, 90%, 60%)` | `hsl(38, 80%, 45%)` | status "skipped" / "delivery_delayed" |
| `--color-muted` | `hsl(0, 0%, 50%)` | `hsl(0, 0%, 60%)` | status "unsubscribed" pill |
| `--color-focus-ring` | `hsl(28, 85%, 65%)` | `hsl(28, 85%, 55%)` | 2 px outline on every interactive element on `:focus-visible` |
| `--color-surface-hover` | `hsl(0, 0%, 18%)` | `hsl(0, 0%, 96%)` | row hover state |
| `--color-danger-subtle` | `hsl(0, 65%, 60%, 0.08)` | `hsl(0, 70%, 45%, 0.08)` | failed row background tint |

Justification — admin and public surfaces both need a true 5-status
colour vocabulary; tying them to tokens keeps the public unsubscribe
HTML consistent with the admin.

## 2. Page chrome

`/comms` route already sits inside `<AppLayout>` via Vue Router; the
view renders inside `<main class="app-main">` automatically.

`CommsView.vue` must NOT render its own header — the `<h1>` it ships
today is the section title for the page, not a duplicate of
`AppHeader`. Keep it but treat it as a page-level `<h1>` (one per
route, matches existing pages).

## 3. Layout / container

```css
.comms {
  max-width: var(--content-medium);   /* 72 rem */
  margin: 0 auto;
  padding:
    var(--spacing-lg)              /* top */
    var(--content-frame-padding)   /* left + right */
    var(--spacing-2xl);            /* bottom — breathing room */
  display: grid;
  gap: var(--spacing-xl);
}
```

Vertical rhythm between sections: `var(--spacing-xl)` (3 rem).

## 4. Section template

Every top-level section (Schedule, Subscribers, Run history) follows
the same pattern:

```html
<section class="comms-section">
  <header class="comms-section-head">
    <h2 class="comms-section-title">Schedule</h2>
    <p class="comms-section-lead">Editor-controlled cron + tz.</p>
  </header>
  <div class="comms-section-body">
    <!-- form / list / table -->
  </div>
</section>
```

```css
.comms-section { display: grid; gap: var(--spacing-sm); }
.comms-section-head { display: grid; gap: var(--spacing-xs); }
.comms-section-title {
  margin: 0;
  font: 700 1.15rem/1.2 var(--font-sans);
  color: var(--color-text-primary);
}
.comms-section-lead {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
.comms-section-body {
  padding: var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}
```

No more `border-bottom` separators between sections (current pattern
in `ScheduleEditor`/`AddSubscriberForm`/`RunHistory`). The surface
card replaces the divider line.

## 5. Form elements

Single base ruleset to be applied across `ScheduleEditor`,
`TimezoneSelect`, `AddSubscriberForm`:

```css
.field {
  display: grid;
  gap: var(--spacing-xs);
}
.field-label {
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}
.field-input,
.field-select {
  appearance: none;
  width: 100%;
  padding: 0.55rem 0.85rem;        /* 44 px touch hit area at 16 px root */
  background: var(--color-surface-elevated);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font: 400 0.95rem/1.4 var(--font-sans);
  transition: border-color var(--transition-fast);
}
.field-input:hover,
.field-select:hover { border-color: var(--color-text-secondary); }
.field-input:focus-visible,
.field-select:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
  border-color: var(--color-focus-ring);
}
.field-input[aria-invalid='true'] { border-color: var(--color-danger); }
.field-error {
  font-size: 0.8125rem;
  color: var(--color-danger);
}
```

**Buttons** — three variants:

```css
.btn { 
  display: inline-flex; align-items: center; gap: var(--spacing-xs);
  padding: 0.55rem 1rem;
  border-radius: var(--radius-sm);
  font: 600 0.95rem/1 var(--font-sans);
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.btn:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
.btn:disabled { opacity: 50%; cursor: not-allowed; }
.btn-primary {
  background: var(--color-accent); color: var(--color-background);
  border: 1px solid var(--color-accent);
}
.btn-primary:hover:not(:disabled) {
  background: var(--color-accent-hover); border-color: var(--color-accent-hover);
}
.btn-ghost {
  background: transparent; color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
}
.btn-ghost:hover:not(:disabled) {
  color: var(--color-text-primary); border-color: var(--color-text-primary);
}
.btn-danger {
  background: transparent; color: var(--color-danger);
  border: 1px solid transparent;
}
.btn-danger:hover:not(:disabled) {
  background: var(--color-danger-subtle);
  border-color: var(--color-danger);
}
```

## 6. Row patterns

Both `SubscriberRow` and `RunHistoryRow` switch from `<li>` grid to a
real **`<table>`** semantic structure. Pure visual change is minimal;
screen-reader users get the row/column model they expect.

Subscribers table columns: Email · Languages · Status · Actions (✕).

Run history columns: Tick (UTC) · Email · Status · Articles ·
Error (only visible when row expanded).

```css
.comms-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}
.comms-table th,
.comms-table td {
  padding: var(--spacing-sm) var(--spacing-xs);
  border-top: 1px solid var(--color-border);
  font-size: 0.875rem;
  color: var(--color-text-primary);
  vertical-align: middle;
}
.comms-table th {
  text-align: left;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  border-top: none;
  border-bottom: 1px solid var(--color-border);
}
.comms-table tr:hover { background: var(--color-surface-hover); }
.comms-table tr.is-failed { background: var(--color-danger-subtle); }
.comms-table tr.is-failed:hover { background: var(--color-danger-subtle); }
```

### Status pill mapping

| Status | Token |
|---|---|
| `active` | `--color-accent` |
| `sent` | `--color-success` |
| `unsubscribed` | `--color-muted` |
| `bounced`, `complained`, `failed` | `--color-danger` |
| `skipped` | `--color-warning` |

```css
.status {
  display: inline-flex; align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid currentColor;
  text-transform: uppercase;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.status-active { color: var(--color-accent); }
.status-sent { color: var(--color-success); }
.status-unsubscribed { color: var(--color-muted); }
.status-bounced,
.status-complained,
.status-failed { color: var(--color-danger); }
.status-skipped { color: var(--color-warning); }
```

Plus a **screen-reader-only suffix** explaining the status in words
— see a11y-audit.md §3.

## 7. Lang toggle pills

Today: 0.6875 rem font, 0.1 rem padding — that's 14×24 px tap target.
AAA requires 44×44 px OR 24×24 px with 8 px spacing.

```css
.pill {
  min-width: 2.5rem;
  min-height: 2rem;            /* 32 px — within "small target" rule */
  padding: 0.35rem 0.55rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
  font: 700 0.8125rem/1 var(--font-sans);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast);
}
.pill:focus-visible {
  outline: 2px solid var(--color-focus-ring);
  outline-offset: 2px;
}
.pill-on {
  background: var(--color-accent);
  color: var(--color-background);
  border-color: var(--color-accent);
}
.pill:disabled { opacity: 50%; cursor: not-allowed; }
```

Gap between pills: `var(--spacing-xs)` (0.5 rem) — ensures 8 px
spacing for the small-target waiver.

## 8. Public unsubscribe page

`services/comms-worker/src/unsubscribe/confirmation.ts` is served
from `lists.comprom.org/unsubscribe`. It is OUTSIDE the admin SPA so
it must not depend on admin tokens.

The visual treatment **must mirror the public website** at
`comprom.org`. Read whatever public-website artefacts exist in the
repo (`public-website*` directory or sibling repo) to align fonts +
palette. If none, default to:

| Property | Value |
|---|---|
| Background | `#0e0e0e` (always dark; public site is dark-first) |
| Surface | `#1a1a1a` (centered card) |
| Text primary | `hsl(0, 0%, 95%)` |
| Text secondary | `hsl(0, 0%, 65%)` |
| Accent | `#ee6f57` (same as admin dark accent) |
| Font stack | `'Inter', system-ui, -apple-system, sans-serif` |
| Heading weight | 800 |
| Body weight | 400 |
| Card max-width | `min(36rem, 100% - 2rem)` |
| Card padding | `2.5rem 2rem` |
| Card radius | `1rem` |
| CTA button | accent-bordered, accent text, transparent background; hover fills accent |

The page MUST respect the visitor's `prefers-color-scheme: light` via
a media query — visitors land here from email, on whatever device
they have. Set a `--color-bg` + `--color-surface` token pair in a
`<style>` block, define light overrides via the media query.

Both pages keep `<html lang="…">` set by `Accept-Language` (already
implemented).

## 9. Don'ts

- ❌ No inline `style="…"` attributes.
- ❌ No hex literals in SFC `<style>` blocks. `#ee6f57` etc. live in
  `_variables.scss` only.
- ❌ No `rgba(192, 57, 43, 0.08)` literals — use
  `var(--color-danger-subtle)` instead.
- ❌ No `var(--color-text)` — the token is `--color-text-primary`.
- ❌ No `var(--color-danger, #c0392b)` fallback chains — once
  `--color-danger` is in the token system, the fallback is dead code.
- ❌ No `opacity: 0.5` — use `opacity: 50%` (existing stylelint rule).
- ❌ No `transition: all` — name the properties explicitly.
- ❌ No `<div>` where a `<section>` / `<header>` / `<table>` / `<th>`
  / `<td>` is semantically correct.
