# Design System — Requirements

Locked visual language for the admin redesign. **Reference prototype:**
`specs/admin-redesign/prototypes/document-direction.html` (approved 2026-08-01,
verified in-browser across light/dark + mobile, reviewed by designer/QA/PO).

## Direction

"Документ" — the admin is an editable extension of the public site
(comprom.org). Minimal chrome; content is the hero; the editor renders the
article in the site's own typography with an Obsidian-style live preview
(the focused block reveals its raw markdown; everything else stays rendered).

## Overview

The system is built **on the public-site design tokens** (source of truth:
`public-website/src/styles/theme.css` + `utilities.css`) and extends them only
where the admin needs components the site lacks.

## Requirements

### R1 — Tokens (adopt the site's, extended)
- WHERE a value exists on the public site, THE SYSTEM SHALL use it verbatim:
  clean neutral greys, warm-red accent `hsl(12 80% 45%)` / dark `hsl(14 85% 60%)`,
  rem spacing scale (`--spacing-xs…2xl`), radii `--radius-sm/md/lg`, system
  fonts, line-height 1.6.
- THE SYSTEM SHALL add only admin semantic tokens: `--ok`/`--draft`/`--info`/
  `--danger` (each with a paired tinted `*-bg`), `--accent-bg`, `--color-hairline`,
  and `--cb` (control-border), each defined in **every** theme. The foreground
  variants SHALL meet WCAG AA (≥4.5:1) against their background; `--cb` SHALL meet
  the ≥3:1 non-text minimum (WCAG 1.4.11) against the control's surface. Exact
  values are locked in `design.md` §3.

### R2 — Theming is atomic (no split)
- THE SYSTEM SHALL define the complete color-token set in each of: base `:root`,
  `:root[data-theme="light"]`, `@media(prefers-color-scheme:dark) :root:not([data-theme="light"])`,
  and `:root[data-theme="dark"]` — never partially.
- WHEN the viewer stamps `data-theme`, it SHALL win over the OS preference.
- Backgrounds SHALL be solid tokens (no `color-mix`+backdrop translucency that
  can reveal a mismatched layer). _(fixed defect: header/cards split-theme)_

### R3 — Iconography
- THE SYSTEM SHALL use inline SVG icons (24px, `currentColor`), never Unicode
  glyphs. The theme toggle SHALL be a sun/moon SVG driven by
  `document.startViewTransition` (reduced-motion aware).

### R4 — Components (site-accurate)
- **Buttons**: primary = solid accent + `→` arrow; secondary = outlined
  (surface + border). Disabled/loading states defined.
- **Category/topic pills**: filled rounded-rectangle (`--radius-sm`), uppercase,
  weight ~600; text = `--tc-fg` defaulting to `--color-on-accent` (readable on
  the accent in both themes). _(fixed defect: white-on-light pill in dark)_
- **Filters & language tabs**: rounded rectangles; the active one is a **solid
  accent fill** (like the site's `CategoryFilter`), not a tinted pill.
- **Cards**: subtle (surface, hairline border, `--radius-md`, small shadow,
  hover lift); pill + bold title + secondary summary + meta; keyboard-operable
  (`<a>`/button, visible focus); per-card overflow (kebab) actions.
- Plus: status (colored dot + label + shape, not color-only), toast, drawer,
  slide-over sheet, switch, progress bar, skeleton — all token-driven with
  hover/focus/active/disabled states.

### R5 — Progress & status (the headline pain)
- WHILE any async op runs (clone/commit/push/deploy/upload), THE SYSTEM SHALL
  show determinate or staged progress — never a silent wait.
- THE SYSTEM SHALL carry a **persistent sync/deploy status** in the app chrome
  and represent the real git state machine (queued/pushing/retrying/failed/
  deploying/deploy-failed), not just success.
- Publish SHALL show staged progress (commit → push → deploy), not a single
  instant toast.

### R6 — Editor (Obsidian live-preview)
- THE SYSTEM SHALL render the article in the site's article typography (incl.
  the gradient H1 treatment); WHEN a block is focused it SHALL reveal that
  block's raw markdown markers only, leaving other blocks rendered.
- Frontmatter (Тема=topic, Рубрика=category, date, published, media) lives in a
  slide-over "Свойства"; an incompleteness badge SHALL show when required
  fields are unset.

### R7 — Mobile-first & a11y
- Base styles target ~360–390px; `@media(min-width:768px)` enhances. No
  horizontal overflow, no overlapping panels, header fits at 360px.
- Keyboard operable, visible focus, ARIA, reduced-motion honored; the logo SVG
  is decorative (`aria-hidden`), labeled by its wrapper.

### R8 — Shared library
- THE SYSTEM SHALL be delivered as Lit web components extending
  `@communist-prometheus/cp-components` (tokens reconciled to the site accent),
  consumable by both admin and public-website.

## Out of scope (this spec)
Per-screen behavior (content list, editor internals, git engine, settings, etc.)
— those are separate specs. This spec locks the **language and primitives**.
