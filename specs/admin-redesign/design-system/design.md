# Design System — Design

How the locked language (`requirements.md`, R1–R8) is realized as a shared Lit 3
component library. Source of truth for values: `public-website/src/styles/theme.css`
+ `utilities.css`. Base package: `@communist-prometheus/cp-components`
(`C:\Projects\Prometheus\components`, v0.1.7).

## Discovery baseline (what exists today)

- **Site tokens** (`theme.css`): `--color-{background,surface,surface-elevated,
  text-primary,text-secondary,border,accent,accent-hover,on-accent}`,
  `--spacing-{xs..2xl}`, `--radius-{sm,md,lg}`, `--font-{sans,mono}`,
  `--shadow-{sm,md,lg}`, `--transition-{fast,base}`. Accent = warm-red
  `hsl(12 80% 45%)` light / `hsl(14 85% 60%)` dark; `--color-on-accent` = white
  light / `hsl(0 0% 7%)` dark. The site defines **only** base `:root` + a single
  `:root[data-theme="dark"]` override (no `prefers-color-scheme` block — it
  defaults to light and toggles explicitly).
- **cp-components**: `cp-button` (variants primary/secondary/ghost, sizes
  sm/md/lg, `cp-click` event, `part="button"`, Shadow DOM) and `cp-card`, both
  reading `--cp-*` tokens with **violet** fallbacks (`hsl(250 84% 54%)`).
  Tokens-as-TS under `src/tokens/*`. Tested with `@open-wc/testing` + `wtr`.
  Consumed by nobody yet.

Two gaps to close: (1) the **accent divergence** (cp violet vs site red);
(2) cp defines no `prefers-color-scheme` / atomic theme layer (R2).

## Architecture

### Layering (three files, one direction of dependency)

```
public-website/theme.css        ← source of truth (unchanged)
      │  values copied verbatim
      ▼
admin theme layer  src/styles/theme.css       (R1, R2)
   ├─ 4 atomic theme blocks (full token set each)
   ├─ admin semantic tokens  --ok --draft --info --accent-bg --cb
   └─ cp bridge:  --cp-color-accent: var(--color-accent);  … (R8)
      │  custom props inherit through Shadow DOM
      ▼
cp-components (Lit, Shadow DOM)  +  admin composite components
```

Custom properties inherit into shadow roots, so setting `--cp-color-accent:
var(--color-accent)` on the light-DOM `:root` re-themes every cp component
without touching the package. **This is the reconciliation** (R8): cp stays
generic; the admin's bridge points its `--cp-*` tokens at the site `--color-*`
tokens. cp's hardcoded fallbacks (`color: white`, violet) are only reached when
the bridge is absent — the admin always loads it.

### Component ownership (where each lives)

| Layer | Components | Rationale |
|---|---|---|
| **cp-components** (generic, reusable by site too) | `cp-button`*, `cp-card`*, `cp-input`, `cp-select`, `cp-checkbox`, `cp-radio`, `cp-textarea`, `cp-switch`, `cp-tabs`, `cp-table`, `cp-toast`, `cp-dialog`, `cp-drawer`, `cp-sheet`, `cp-progress`, `cp-skeleton`, `cp-pill`, `cp-status`, `cp-badge`, `cp-tooltip`, `cp-pagination` | design-system primitives; no admin domain knowledge |
| **admin-local** (`src/components/*`) | `app-shell` / side-nav, publish-progress, sync-status chip, save-bar, confirm-dialog wrapper, editor (Obsidian preview), 3-way-merge view | compose primitives + carry admin domain/git state |

`*` = already exists, extended (below). Everything in column 1 is delivered
**into the cp-components repo** so both apps consume it; admin composites stay in
admin. This settles the "adopt and extend cp-components" decision for primitives;
it does **not** by itself require the monorepo (open decision — see below).

### cp-button / cp-card extensions

- `cp-button`: add optional `arrow` boolean → renders the trailing `→` SVG
  (R4 primary-button treatment) after the slot; add `loading` boolean →
  disables + swaps a spinner into the leading slot; drop the hardcoded
  `color: white` in favor of `var(--cp-color-on-accent, …)`. Keep `cp-click`,
  `part`, variants. Backwards compatible (new props default off).
- `cp-card`: add `interactive` boolean (renders as `<a>`/role=button, focus
  ring, hover lift) and named slots `pill` / `title` / `summary` / `meta` /
  `actions` (kebab overflow), matching the reference index card. Non-interactive
  default unchanged.

## Token design

### Admin theme layer (R1, R2) — the 4 atomic blocks

The complete color set is redefined in **each** of:
1. base `:root` (light default) — copied verbatim from site + admin semantics
2. `:root[data-theme="light"]` (explicit light, wins over OS)
3. `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` (OS dark)
4. `:root[data-theme="dark"]` (explicit dark, wins over OS)

Blocks 2–4 carry the **full** token set, never a partial override — this is the
fix for the header/cards split-theme defect (R2). All backgrounds are solid
tokens; no `color-mix`+backdrop translucency.

> Admin extends the site here: the site has no `prefers-color-scheme` block, so
> the admin adds blocks 2 & 3 to honor OS preference *and* keep the toggle
> authoritative. Values are identical to the site's light/dark sets.

### Admin semantic tokens (R1, R4, R5) — added, AA in every block

| Token | Role | Light | Dark | Contrast target |
|---|---|---|---|---|
| `--ok` | success (deploy ok, ready) | darkened green | green | ≥4.5:1 on surface |
| `--draft` | draft/pending | darkened amber | amber | ≥4.5:1 on surface |
| `--info` | neutral info | blue | light blue | ≥4.5:1 on surface |
| `--accent-bg` | active nav / tinted accent surface | red-tint | red-tint | text on it ≥4.5:1 |
| `--cb` | control border (input/select outline) | `hsl(0 0% 62%)` | `hsl(0 0% 42%)` | ≥3:1 vs surface |

`--cb` was added during prototype review to satisfy the ≥3:1 non-text contrast
minimum for input outlines (WCAG 1.4.11); `--color-border` (hairline, decorative)
stays for card separators.

### Motion tokens (R3, NFR-3)

Reuse site `--transition-fast` (150ms) / `--transition-base` (250ms); add
`--transition-slow` (350ms) for sheets/drawers. All motion wrapped in
`@media (prefers-reduced-motion: no-preference)`; the theme toggle reuses the
site's `document.startViewTransition` circular-reveal (R3) and is skipped under
reduced-motion (instant swap).

## Component contracts

Each primitive is a Lit element with Shadow DOM, token-styled, exposing `part`s
for structural theming and a defined **state matrix**
(default/hover/focus-visible/active/disabled/loading/error where applicable).

| Component | Key props | Slots | Events | Parts | States |
|---|---|---|---|---|---|
| `cp-button` | `variant`, `size`, `arrow`, `loading`, `disabled`, `type` | default | `cp-click` | `button` | all |
| `cp-input` | `value`, `type`, `label`, `invalid`, `describedby`, `disabled` | — | `cp-input`, `cp-change` | `field`,`label`,`control` | default/focus/invalid/disabled |
| `cp-select` | `value`, `options`, `label`, `invalid` | — | `cp-change` | `control` | same |
| `cp-checkbox`/`cp-radio` | `checked`, `label`, `name`, `value` | — | `cp-change` | `control`,`label` | default/focus/checked/disabled |
| `cp-textarea` | `value`, `label`, `rows`, `invalid` | — | `cp-input` | `control` | same as input |
| `cp-switch` | `checked`, `label`, `disabled` | — | `cp-change` | `track`,`thumb` | default/focus/checked/disabled |
| `cp-tabs` | `tabs`, `active` | per-tab | `cp-tab-change` | `tab`,`list`,`panel` | default/hover/active(selected)/focus |
| `cp-table` | `columns`, `rows`, `caption` | cell | `cp-row-action` | `table`,`row`,`cell` | default/hover-row/empty |
| `cp-toast` | `variant`, `message`, `duration` | action | `cp-dismiss` | `toast` | info/ok/draft/error, entering/leaving |
| `cp-dialog` | `open`, `heading`, `tone` | body,footer | `cp-confirm`,`cp-cancel` | `dialog`,`backdrop` | open/closed; tone default/danger |
| `cp-drawer`/`cp-sheet` | `open`, `side` | default | `cp-close` | `panel`,`backdrop` | open/closed |
| `cp-progress` | `value`(0–1 or indeterminate), `stage`, `label` | — | — | `track`,`bar` | determinate/indeterminate/staged |
| `cp-skeleton` | `lines`, `variant` | — | — | `block` | shimmer (reduced-motion → static) |
| `cp-pill` | `tone`, `--tc-fg` | default | — | `pill` | filled; text = `--color-on-accent` default |
| `cp-status` | `state`, `label` | — | — | `dot`,`shape`,`label` | dot **+ shape + label** (not color-only, R4/NFR-5) |
| `cp-badge` | `count`, `tone` | — | — | `badge` | default/zero(hidden) |
| `cp-tooltip` | `text`, `placement` | trigger | — | `tip` | hidden/shown, focus + hover |
| `cp-pagination` | `page`, `pages` | — | `cp-page` | `list`,`item` | default/current/disabled |

Admin composites (`app-shell`, `publish-progress`, `sync-status`, editor,
merge-view) are specified in their own capability specs; here they are only
required to compose the primitives above (NFR-4) and reuse the tokens (R6, R5).

## Accessibility (R7, NFR-5)

- Every interactive element has a visible `:focus-visible` ring (a 2px
  `--color-accent` outline with offset, defined once as a shared token).
- Form controls: programmatic `label` association, `aria-invalid` +
  `aria-describedby` for errors; `cp-status`/`cp-pill` never encode meaning by
  color alone (dot **and** shape **and** text).
- Dialogs/drawers: focus trap, `Esc` to cancel, restore focus on close,
  `role="dialog"` + `aria-modal`, labelled by heading.
- Icons decorative (`aria-hidden`); the logo SVG labelled by its wrapper.
- Contrast validated in tests (below).

## Testing strategy (R-all, NFR-7)

- **cp-components**: `@open-wc/testing` + `wtr` per component — render, prop→DOM,
  event emission, `part` presence, disabled/loading behavior, and a
  contrast/tokens assertion (computed style resolves to the expected token).
- **Admin theme layer**: a unit test asserts the token set is present and equal
  across all 4 theme blocks (guards the split-theme regression), and that
  `data-theme` overrides `prefers-color-scheme` (R2).
- **Visual states**: the approved prototypes are the reference; a Playwright
  visual pass (light/dark @390px + desktop) covers the assembled screens later.
- **Traceability**: each component test file names the requirement(s) it
  satisfies in a header comment (R1…R8).

## Rejected alternatives

- **Fork cp token *values* to red** (instead of a bridge): rejected — it strands
  cp-components on the admin's palette and blocks the site from ever consuming it
  with its own theme. The bridge keeps cp palette-agnostic.
- **Utility-CSS / Tailwind**: rejected — the site is hand-rolled token CSS;
  matching it (R1) and theming through custom properties is simpler and pierces
  Shadow DOM for free.
- **Light-DOM (unstyled) components**: rejected — Shadow DOM + `part` gives
  encapsulated state matrices while custom properties still theme them; matches
  cp's existing approach.
- **Re-deriving primitives in admin only**: rejected — violates R8 (shared
  library) and duplicates work the site will want.

## Open decision (needs review before Tasks)

**Repo topology.** Primitives must ship in cp-components so both apps consume
them. Options: (A) unify `public-website` + `admin-website` + `components` into
one workspace (`apps/*` + `packages/cp-components`, `workspace:*` deps) —
cleanest for co-evolving tokens/components; (B) keep siblings and consume
cp-components as a versioned GitHub-registry dep (publish → bump → install per
change) — more release friction but zero restructuring. **Recommendation: (A).**
This affects tooling/CI beyond the design system, so it is flagged here rather
than decided unilaterally.

## Requirement → design map

| Req | Realized by |
|---|---|
| R1 tokens | Admin theme layer (verbatim site values) + semantic tokens table |
| R2 atomic theming | 4-block theme layer + cross-block equality test |
| R3 icons/motion | inline-SVG rule, motion tokens, startViewTransition reuse |
| R4 components | cp extensions + `cp-pill`/`cp-status`/button/card contracts |
| R5 progress/status | `cp-progress` (staged/indeterminate) + admin composites |
| R6 editor | typography tokens + composite (own spec) reusing primitives |
| R7 mobile/a11y | mobile-first tokens, focus token, a11y section |
| R8 shared library | bridge reconciliation + cp ownership split |
