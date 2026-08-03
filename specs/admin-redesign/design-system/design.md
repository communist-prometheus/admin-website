# Design System — Design

How the locked language (`requirements.md`, R1–R8) is realized as a shared Lit 3
component library. Value source of truth: the approved reference prototype
`prototypes/document-direction.html`, reconciled with
`public-website/src/styles/theme.css`. Base package:
`@communist-prometheus/cp-components` (`C:\Projects\Prometheus\components`, v0.1.7).

> **Review status:** revised after architect/designer/PO review (2026-08-01).
> All foldable findings integrated below; the single decision left to the user is
> **repo topology** (§10). `requirements.md` R1 amended to add `--danger*`/`--cb`.

## Discovery baseline (what exists today)

- **Site tokens** (`theme.css`): `--color-{background,surface,surface-elevated,
  text-primary,text-secondary,border,accent,accent-hover,on-accent}`,
  `--spacing-{xs..2xl}`, `--radius-{sm,md,lg}`, `--font-{sans,mono}`,
  `--shadow-{sm,md,lg}`, `--transition-{fast,base}`. Warm-red accent. The site
  defines **only** base `:root` + a single `:root[data-theme="dark"]` (no
  `prefers-color-scheme` block — it defaults to light and toggles explicitly).
- **cp-components**: `cp-button` (variants primary/secondary/ghost; sizes;
  `cp-click`; `part="button"`; Shadow DOM; **hardcoded `color:white` + violet
  fallbacks**) and `cp-card` (reads 8 `--cp-*` tokens). Tokens-as-TS under
  `src/tokens/*`. `tsc`-only build, single barrel `index.ts`, `lit` as a normal
  dependency, no subpath exports, no `sideEffects`. Consumed by nobody yet.

Gaps to close: accent divergence (violet vs red), no atomic theme layer, no
`prefers-color-scheme`, packaging not ready for 20+ components, no SSR story.

## 1. Architecture

### Layering (one direction of dependency)

```
public-website/theme.css        ← value reference (unchanged)
      │  values copied + refined (deltas noted in §3)
      ▼
admin theme layer  src/styles/theme.css              (R1, R2)
   ├─ 4 atomic theme blocks (full token set each)
   ├─ admin semantic tokens  --ok/-bg --draft/-bg --info/-bg --danger/-bg
   │                          --accent-bg --cb --color-hairline
   └─ cp bridge (single declaration on :root, §2)      (R8)
      │  custom properties inherit through Shadow DOM
      ▼
cp-components (Lit, Shadow DOM)  +  admin composite components
```

Admin depends on cp-components only — no cycle. The token bridge re-themes every
cp component via inherited custom properties, resolved at each `var()` use-site,
so it auto-flips with the theme.

### Component ownership

| Layer | Components | Rationale |
|---|---|---|
| **cp-components** (generic, palette-agnostic, zero admin domain) | `cp-icon`, `cp-button`*, `cp-card`*, `cp-input`, `cp-select`, `cp-checkbox`, `cp-radio`, `cp-textarea`, `cp-switch`, `cp-color-input`, `cp-date-input`, `cp-tabs`, `cp-table`, `cp-list-row`, `cp-menu`, `cp-toast`, `cp-dialog`, `cp-drawer`, `cp-sheet`, `cp-progress`, `cp-steps`, `cp-skeleton`, `cp-empty-state`, `cp-pill`, `cp-tag`, `cp-badge`, `cp-chip`, `cp-tooltip`, `cp-pagination`, `cp-upload`, `cp-banner` | design-system primitives |
| **admin-local** (`src/components/*`) | `app-shell`/side-nav, `sync-status` chip, `publish-progress`, `save-bar`, `confirm-dialog`, editor (Obsidian preview), `merge-view` (3-way), `danger-zone` | compose primitives + carry git/content domain |

`*` already exists, extended (§5). Column-1 components carry **generic tones/
states only** (`success|warning|info|danger`, `queued|running|done|failed`); the
admin's git state machine (`pushing/retrying/deploying/deploy-failed`, `draft`)
is mapped onto those generic tones inside the admin composites — the library
stays domain-free (architect #8, designer B1).

## 2. Token bridge (R8) — full map, single declaration

Declared **once** on the base `:root` (never repeated per theme block — `var()`
re-resolves per use, so one mapping flips with every theme; architect #12):

```css
:root{
  --cp-color-accent:        var(--color-accent);
  --cp-color-accent-hover:  var(--color-accent-hover);
  --cp-color-on-accent:     var(--color-on-accent);
  --cp-color-text-primary:  var(--color-text-primary);
  --cp-color-text-secondary:var(--color-text-secondary);
  --cp-color-background:    var(--color-background);
  --cp-color-surface:       var(--color-surface);
  --cp-color-surface-elevated: var(--color-surface-elevated);
  --cp-color-border:        var(--color-border);
  --cp-spacing-xs:var(--spacing-xs); --cp-spacing-sm:var(--spacing-sm);
  --cp-spacing-md:var(--spacing-md); --cp-spacing-lg:var(--spacing-lg);
  --cp-spacing-xl:var(--spacing-xl);
  --cp-radius-sm:var(--radius-sm); --cp-radius-md:var(--radius-md);
  --cp-radius-lg:var(--radius-lg);
  --cp-shadow-sm:var(--shadow-sm); --cp-shadow-md:var(--shadow-md);
  --cp-shadow-lg:var(--shadow-lg);
  --cp-transition-fast:var(--transition-fast);
  --cp-transition-base:var(--transition-base);
}
```

**Completeness is enforced, not trusted** (architect #1, designer S3): a unit
test greps every `--cp-*` custom property *read* in cp-components' compiled CSS
and asserts each has a bridge entry — fails on any unmapped token. cp's own
violet/`white` fallbacks then become unreachable (safety net only). cp-button's
hardcoded `color:white` is replaced by `var(--cp-color-on-accent)` in the §5
extension.

## 3. Theme layer (R1, R2)

### The 4 atomic blocks

Full token set redefined in **each** of: (1) base `:root` (light default),
(2) `:root[data-theme="light"]`, (3) `@media (prefers-color-scheme:dark)
:root:not([data-theme="light"])`, (4) `:root[data-theme="dark"]`. Blocks 2–4
carry the complete set, never partial — the split-theme fix (R2). All
backgrounds are solid tokens.

**Generation, not hand-duplication** (architect #9): the four blocks are emitted
from the single tokens-as-TS source (`src/tokens/`), so light/dark values live in
one place and the 4× duplication is structural, not a drift surface. The guard
test asserts the invariant: block1 ≡ block2 (light), block3 ≡ block4 (dark), and
an **identical key set** across all four (not "all equal" — blocks differ by
light/dark by design; the earlier phrasing was wrong).

### Authoritative token values (designer B2/B3 — exact HSL, drift killed)

Reconciled to `document-direction.html`; `--danger*`/`--cb`/`*-bg` lifted from
the status/settings prototypes with **one** value chosen per token.

| Token | Light | Dark |
|---|---|---|
| `--color-background` | `hsl(0 0% 100%)` | `hsl(0 0% 10%)` |
| `--color-surface` | `hsl(0 0% 98%)` | `hsl(0 0% 15%)` |
| `--color-surface-elevated` | `hsl(0 0% 100%)` | `hsl(0 0% 17%)` |
| `--color-text-primary` | `hsl(0 0% 13%)` | `hsl(0 0% 96%)` |
| `--color-text-secondary` | `hsl(0 0% 40%)` | `hsl(0 0% 66%)` |
| `--color-border` | `hsl(0 0% 88%)` | `hsl(0 0% 28%)` |
| `--color-hairline` | `hsl(0 0% 93%)` | `hsl(0 0% 22%)` |
| `--color-accent` | `hsl(12 80% 45%)` | `hsl(14 85% 62%)` |
| `--color-accent-hover` | `hsl(12 80% 38%)` | `hsl(14 85% 70%)` |
| `--color-on-accent` | `#fff` | `hsl(0 0% 7%)` |
| `--cb` (control border) | `hsl(0 0% 55%)` | `hsl(0 0% 46%)` |
| `--ok` / `--ok-bg` | `hsl(145 60% 30%)` / `hsl(145 55% 34%/.12)` | `hsl(145 55% 60%)` / `…/.16` |
| `--draft` / `--draft-bg` | `hsl(35 90% 33%)` / `hsl(35 90% 45%/.14)` | `hsl(40 85% 66%)` / `…/.16` |
| `--info` / `--info-bg` | `hsl(212 80% 43%)` / `hsl(212 80% 48%/.12)` | `hsl(212 85% 70%)` / `…/.16` |
| `--danger` / `--danger-bg` | `hsl(0 72% 45%)` / `hsl(0 72% 50%/.12)` | `hsl(0 80% 68%)` / `…/.16` |
| `--accent-bg` | `hsl(12 80% 45%/.08)` | `hsl(14 85% 62%/.16)` |

**Deltas from `theme.css` (deliberate admin refinements, not drift):**
`--color-border` 88 vs site 90; `--color-surface` dark 15 vs 13;
`--color-accent-hover` dark 70% vs site 68%; `--color-hairline` is admin-new.
The admin owns these; the prototypes are the approved visual. `--cb` supersedes
`--color-border` **everywhere a control outline appears** (input/select/ghost
button) — the two earlier prototypes still using `--color-border` there are
retro-fixed to `--cb` at build (designer S2). _Impl note: the prototype's light
`--cb` (`hsl(0 0% 64%)`) actually measured 2.41:1 on surface — the automated
contrast guard caught it; corrected to `hsl(0 0% 55%)` = 3.21:1._

### `--tc-fg` on solid pills

Foreground on a filled category/topic pill defaults to `--color-on-accent` (safe
on the accent in both themes); overridable per-instance when a custom `--tc`
background needs a different foreground (the white-on-light-pill fix, R4).

## 4. Typography tokens (R6 — designer B4)

Added as a first-class token group (was missing). Values from
`document-direction.html`:

| Token | Value | Use |
|---|---|---|
| `--fs-h1-hero` | `clamp(2rem, 6.5vw, 2.7rem)`, lh 1.12, wt 700 | article H1 (gradient-clip) |
| `--fs-h1-section` | `clamp(1.9rem, 7vw, 2.6rem)` | screen titles |
| `--fs-lede` | `1.22rem`, color `--color-text-secondary` | article lede |
| `--fs-live` | `1.14rem` (`1.16rem` ≥768px) | editor live-preview body |
| headings h1–h3 | lh 1.15, wt 700, `text-wrap:balance` | global |
| token markers | `--font-mono`, wt 600, `--color-accent` | Obsidian raw-markdown reveal |

The editor composite's *behavior* is deferred to `content-editor`, but its
**type scale is locked here** so primitives and composite share it.

## 5. Component contracts

Lit + Shadow DOM, token-styled, `part`s for structural theming, explicit state
matrix each. New vs the first draft: `cp-icon`, `cp-menu`, `cp-upload`,
`cp-list-row`, `cp-steps`, `cp-empty-state`, `cp-tag`, `cp-chip`,
`cp-color-input`, `cp-date-input`, `cp-banner` (all present in the prototypes;
PO #1/#2/#6, designer S1).

| Component | Key props | Events | States |
|---|---|---|---|
| `cp-icon` | `name`, `size=24` | — | renders inline `currentColor` SVG from the registry (§6) |
| `cp-button` | `variant`, `size`, `arrow`, `loading`, `pressed`, `disabled`, `type` | `cp-click` | default/hover/focus/active/**pressed**(aria-pressed)/disabled/loading |
| `cp-card` | `interactive` + slots pill/title/summary/meta/actions | `cp-click` | default/hover-lift/focus(interactive) |
| `cp-input`/`cp-textarea` | `value`,`label`,`type`,`invalid`,`describedby`,`disabled` | `cp-input`,`cp-change` | default/focus/invalid/disabled |
| `cp-select` | `value`,`options`,`label`,`invalid` | `cp-change` | same |
| `cp-checkbox`/`cp-radio`/`cp-switch` | `checked`,`label`,`name`,`value`,`disabled` | `cp-change` | default/focus/checked/disabled |
| `cp-color-input` | `value`(hex),`label` | `cp-change` | swatch + hex field (settings topics) |
| `cp-date-input` | `value`,`label`,`min`,`max` | `cp-change` | native `type=date/datetime-local` wrapped (PO #6) |
| `cp-tabs` | `tabs`,`active` | `cp-tab-change` | default/hover/selected/focus/**disabled** (gated nav, PO #12) |
| `cp-table` | `columns`,`rows`,`caption`,`selectable`,`selected` | `cp-row-action`,`cp-select-change` | default/hover-row/**selected**/**loading**(skeleton rows)/empty (PO #3/#4) |
| `cp-list-row` | `icon`,`title`,`meta` + actions slot | `cp-row-action` | the dominant bordered icon-circle+content+actions row (queue/deploys/conflicts/links) — distinct from tabular `cp-table` (designer S1) |
| `cp-menu` | `open`,`items`,`anchor` | `cp-select`,`cp-close` | closed/open; item hover/focus/disabled (kebab overflow, PO #2) |
| `cp-toast` | `tone`,`message`,`duration` | `cp-dismiss` | success/warning/info/danger; entering/leaving |
| `cp-dialog` | `open`,`heading`,`tone`,`busy` | `cp-confirm`,`cp-cancel` | open/closed; tone default/danger; **busy**(suppresses Esc/backdrop while action in flight, PO #5) |
| `cp-drawer`/`cp-sheet` | `open`,`side` | `cp-close` | open/closed; focus-trap |
| `cp-progress` | `value`(0–1\|indeterminate),`label` | — | determinate/indeterminate (nav top-bar = indeterminate, PO #9) |
| `cp-steps` | `steps:[{label,state}]` | — | per-step done/running/failed/pending — segmented staged indicator, separate from `cp-progress` bar (designer S1) |
| `cp-skeleton` | `lines`,`variant` | — | shimmer (static under reduced-motion) |
| `cp-empty-state` | `icon`,`title`,`hint` + action | — | whole-screen "not yet designed" + inline "queue empty" (designer S1) |
| `cp-pill` | `--tc`,`--tc-fg` | — | **solid-fill** uppercase category/topic (R4) |
| `cp-tag` | `tone` | — | **tinted** status badge (`--ok-bg`+`--ok` …), no uppercase — the second pill language, split out (designer B1) |
| `cp-badge` | `count`,`tone` | — | default/zero(hidden) |
| `cp-chip` | `label`,`removable`,`add` | `cp-remove`,`cp-add` | list chip with remove/add (magazine articles, designer S1) |
| `cp-status` | `state`,`label` | — | dot **+ shape + label** (never color-only, NFR-5) |
| `cp-tooltip` | `text`,`placement` | — | hidden/shown (hover + focus) |
| `cp-upload` | `accept`,`multiple`,`state` | `cp-files`,`cp-retry` | **dropzone** idle/dragover/uploading(progress)/done/failed (PO #1, NFR-2) |
| `cp-banner` | `tone`,`title` + action | `cp-action` | full-width overall-status surface (icon-circle+title/desc+action); distinct from the header `sync-status` chip (designer S1) |
| `cp-pagination` | `page`,`pages` | `cp-page` | default/current/disabled |

## 6. Icons (R3 — architect #10, designer N1, PO #11)

A `cp-icon` primitive renders 24px `currentColor` inline SVG from a **single
shared registry** (`src/icons/*.ts`, one exported path string per name:
kebab/close/chevron/sun/moon/check/x/dash/warning/arrow/trash/plus…). One source
kills drift across composites. The theme toggle is sun/moon via
`document.startViewTransition` (reduced-motion → instant). Data glyphs currently
shown as text (`en ✕`, `it —`) are replaced by `cp-icon` check/x/dash.

## 7. SSR / hydration for Astro islands (architect #3)

Primitives are **client-hydrated islands** (`client:visible`/`client:load`), not
DSD-server-rendered, in v1: Astro renders the static token'd shell (header, page
chrome, article HTML) as plain markup — so first paint is fully themed and
FOUC-free via the `:root` tokens regardless of element upgrade — and only the
interactive primitives hydrate. Each custom element ships a `:not(:defined)`
fallback (min-height/skeleton) so pre-upgrade layout doesn't shift. DSD via
`@lit-labs/ssr` is a **later optimization**, out of scope for v1 (recorded so
Tasks don't assume it). Lit `static styles` ship in the component module.

## 8. Packaging & registration (architect #4/#5/#6)

- **Per-component subpath exports** (`./button`, `./input`, …) plus the barrel;
  `"sideEffects": ["**/*.ts"]` (every `@customElement` is a required
  registration side-effect) so admin imports only what it uses without
  tree-shaking away `define()` calls.
- **Define-if-absent guard** wraps each registration (`customElements.get(tag) ??
  customElements.define(tag, cls)`) to survive HMR / double-bundling / two
  versions coexisting.
- **`lit` becomes a `peerDependency`** (shared range) so admin and cp resolve a
  single Lit instance (no duplicate reactive-controller state / define clashes).
- **Form-associated controls**: `cp-input/select/checkbox/radio/textarea/switch`
  set `static formAssociated = true` and use `ElementInternals` for value
  submission + native validity + `aria-invalid`, so they work inside a native
  `<form>` (architect #7) — core for a form-heavy admin.

## 9. Accessibility (R7, NFR-5)

- Shared `:focus-visible` token: 2px `--color-accent` outline + offset, defined
  once.
- Form controls: programmatic label association, `aria-invalid` +
  `aria-describedby`, form-associated (§8).
- `cp-status`/`cp-tag` never encode meaning by color alone (dot **and** shape
  **and** text).
- Dialogs/drawers: focus-trap, `Esc` (unless `busy`), focus restore,
  `role=dialog`+`aria-modal`, labelled by heading.
- **Gradient H1** (R6, designer B5): the `background-clip:text` gradient runs
  `linear-gradient(135deg, --color-accent, --color-text-primary)` — both
  endpoints individually meet AA-large (≥3:1) on the page background in both
  themes; a test asserts each endpoint token's contrast rather than the
  un-sampleable blended pixel. Rationale documented as the large-text path.
- Icons decorative (`aria-hidden`); logo labelled by its wrapper.

## 10. Testing strategy (NFR-7)

- **cp-components**: `@open-wc/testing` + `wtr` per component — render, prop→DOM,
  event emission, `part` presence, disabled/loading/busy behavior, form-value
  submission, and a computed-style assertion resolving each token.
- **Bridge completeness** (§2) + **theme-block invariant** (§3) as guard tests.
- **Contrast**: assert each semantic token + gradient endpoint vs its background.
- **Visual**: the approved prototypes are the reference; a Playwright pass
  (light/dark @390px + desktop) covers assembled screens in later specs.
- **Traceability**: each test file headers the requirement(s) it satisfies.

## Rejected alternatives

- **Fork cp token *values* to red**: strands cp on the admin palette, blocks site
  reuse. The bridge keeps cp palette-agnostic.
- **Utility-CSS / Tailwind**: site is hand-rolled token CSS; custom properties
  match it (R1) and pierce Shadow DOM for free.
- **Light-DOM components**: lose encapsulated state matrices; cp already uses
  Shadow DOM + `part`.
- **DSD server-rendering in v1**: added complexity before it's needed; tokens
  already give FOUC-free first paint (§7).
- **Admin domain tones in the library**: violates the domain-free rule; mapped in
  composites instead (§1).

## Requirement → design map

| Req | Realized by |
|---|---|
| R1 tokens | §3 theme layer (exact HSL) + semantic tokens incl. `--danger*`/`--cb` |
| R2 atomic theming | §3 4-block generation + invariant test |
| R3 icons/motion | §6 `cp-icon` registry + motion tokens + startViewTransition |
| R4 components | §5 contracts; `cp-pill`(solid)/`cp-tag`(tinted) split |
| R5 progress/status | §5 `cp-progress`/`cp-steps`/`cp-upload`/`cp-banner` + admin composites; nav = indeterminate top-bar |
| R6 editor | §4 typography tokens + §9 gradient-H1 a11y (behavior → `content-editor`) |
| R7 mobile/a11y | §9 + mobile-first tokens + focus token |
| R8 shared library | §2 bridge + §1 ownership split + §8 packaging |

## §10-decision — repo topology (RESOLVED: monorepo, user 2026-08-01)

**Decision: (A) unify into one Bun workspace.** `apps/public-website` +
`apps/admin-website` + `packages/cp-components`, linked by `workspace:*`
(`e2e-toolkit` stays the shared submodule). Chosen for the tight TDD inner loop —
a primitive and its admin consumer are co-edited with no publish→bump→install
cycle; the bridge/token/component tests run against live source.

Consequences folded into `tasks.md`:
- **Phase 0 = workspace migration** (a prerequisite, done once before any
  component work): create the root workspace, move the three repos under
  `apps/*`+`packages/*` preserving history, rewire each app's `package.json` to
  `workspace:*`, and **preserve every existing CI/deploy gate** (each app keeps
  its own pipeline; the deploy-gated flows from the MEMORY notes must stay
  green). This has blast radius beyond the design system — it is sequenced first
  and verified (all three apps build + their existing suites pass) before
  primitives start.
- Release of cp-components to the GitHub registry stays available for external
  consumers but is no longer on the admin's critical path.
