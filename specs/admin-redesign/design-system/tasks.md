# Design System — Tasks

Ordered, TDD, green between tasks. Each task names the requirement(s) it
satisfies and the test(s) that verify it. Cross-refs: `requirements.md` (R1–R8),
`design.md` (§1–§10). "Green" = the workspace type-checks + the named test passes
+ each touched repo's existing gate stays green (see MEMORY: admin `validate`,
deploy gates).

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

## Phase 0 — Monorepo workspace (prerequisite; design.md §10)

**POC assembled in isolation at `C:\Projects\Prometheus-mono`** (reversible;
source repos untouched — admin only unshallowed). History preserved: 1629
commits, all three origins reachable. See that repo's `CUTOVER.md`.

- [x] **0.1** Root Bun workspace scaffold (`package.json` `workspaces:
  ["apps/*","packages/*","apps/*/packages/*"]`, `tsconfig.base.json`,
  `.gitignore`, root scripts). _Verified:_ `bun install` resolves the whole
  workspace (2348 pkgs). (R8)
- [x] **0.2** Subtree-merge `components@master` → `packages/cp-components`,
  `admin-website@feat/admin-redesign` → `apps/admin-website`,
  `public-website@master` → `apps/public-website`, **history preserved**.
  public-website's nested `wfr-*` packages folded under the root via
  `apps/*/packages/*`. _Verified:_ original commits of all three reachable;
  `cp-components` builds (`tsc`→`dist`). _Submodule reconciliation deferred to
  cutover (nested `.gitmodules` are inert)._ (R8)
- [x] **0.3** admin `package.json` depends on
  `@communist-prometheus/cp-components: workspace:*`. _Verified:_ admin resolves
  it **from source** (symlink) — exports `CpButton/CpCard/colors/…`, no publish
  cycle. _`lit` → peerDependency + shared range: fold into the cp packaging task
  (design.md §8)._ (R8)
- [ ] **0.4 — CUTOVER (blast radius; decide with user).** Target remote; move 13
  scattered workflows to root + path-filter (preserve every gate — admin
  `validate`/sonar, deploy-gate smoke, dup-publish, dev/master reindex); single
  root `.gitmodules`; drop per-app locks; re-point deploy configs; full
  build/test green per app. _Test:_ all pipelines green on a no-op PR per app.
  (NFR-7)

> Gate: Phase 0.4 fully green (all three apps build + existing suites pass) before
> any primitive work. **STOP before 0.4** — cutover is a separate reviewed step.

## Phase 1 — Tokens & theme layer (R1, R2; design.md §2–§4) ✅ DONE

Implemented in the monorepo (`packages/cp-components`), full suite green
(30 tests × chromium/firefox/webkit).

- [x] **1.1** `tokens/theme.ts` — single source of truth: full token set (exact
  HSL, design.md §3) + typography/motion scales (§4). Values shared by the
  generator. (R1)
- [x] **1.2** `theme/render.ts` `renderThemeCss()` generates the 4 atomic blocks
  from the TS source → emitted to `apps/admin-website/src/styles/theme.css`.
  _Test (`theme/render.test.ts`, 7):_ block1≡block2 (light), block3≡block4
  (dark), identical key set across all four, `data-theme` follows the OS-dark
  media block (cascade wins). (R2)
- [x] **1.3** Single-declaration cp bridge on `:root` (`bridgeDeclarations()`).
  _Guard (`scripts/check-bridge.ts`):_ every `--cp-*` read in cp sources has a
  bridge entry — 15 referenced, all mapped (fails on unmapped). (R8)
- [x] **1.4** Contrast guard (`scripts/check-contrast.ts`) — WCAG ratios from
  HSL. `--ok/-draft/-info/-danger` ≥4.5:1 on surface; `--cb` ≥3:1; gradient-H1
  endpoints (accent, text) ≥3:1, both themes. _Caught a real defect:_ light
  `--cb` was 2.41:1 → corrected `hsl(0 0% 64%)`→`hsl(0 0% 55%)` = 3.21:1.
  (R1, R7, NFR-5)

## Phase 2 — Icons (R3; design.md §6)

- [ ] **2.1** Icon registry `src/icons/*` (path-string per name) + `cp-icon`
  (24px `currentColor`, `aria-hidden`). _Test:_ renders named SVG; unknown name
  fails loudly. (R3)
- [ ] **2.2** Theme-toggle sun/moon via `document.startViewTransition`,
  reduced-motion → instant. _Test:_ toggles `data-theme`; no transition under
  `prefers-reduced-motion`. (R3, NFR-3)

## Phase 3 — Core primitives (R4; design.md §5). One task per component; each: render + prop→DOM + events + `part`s + full state matrix + a11y.

- [ ] **3.1** `cp-button` extend: `arrow`, `loading`, `pressed`(aria-pressed);
  replace hardcoded `color:white` → `var(--cp-color-on-accent)`. (R4)
- [ ] **3.2** `cp-card` extend: `interactive` + slots pill/title/summary/meta/
  actions; focus ring + hover lift. (R4)
- [ ] **3.3** `cp-pill` (solid category/topic) **and** `cp-tag` (tinted status) —
  split per design.md B1; `cp-status` (dot+shape+label). (R4, NFR-5)
- [ ] **3.4** `cp-badge`, `cp-chip` (removable/add), `cp-tooltip`. (R4)
- [ ] **3.5** `cp-tabs` (selected/disabled), `cp-pagination`. (R4)
- [ ] **3.6** `cp-menu` (kebab overflow), `cp-list-row` (bordered icon+content+
  actions). (R4; PO #2, designer S1)

## Phase 4 — Form controls, form-associated (R4, R7; design.md §8)

- [ ] **4.1** `cp-input`, `cp-textarea` — `formAssociated`, `ElementInternals`,
  `invalid`/`describedby`, `--cb` outline. _Test:_ submits inside native
  `<form>`; `aria-invalid` on error. (R4, R7)
- [ ] **4.2** `cp-select`, `cp-checkbox`, `cp-radio`, `cp-switch` — same
  form-associated contract. (R4, R7)
- [ ] **4.3** `cp-color-input` (swatch+hex), `cp-date-input` (native wrapped).
  (R4; PO #6, designer S1)

## Phase 5 — Progress, feedback & overlays (R5, NFR-2; design.md §5)

- [ ] **5.1** `cp-progress` (determinate/indeterminate) + `cp-steps` (per-step
  done/running/failed/pending). _Test:_ staged + indeterminate render. (R5,
  NFR-2)
- [ ] **5.2** `cp-upload` dropzone (idle/dragover/uploading+progress/done/
  failed+retry). (R5, NFR-2; PO #1)
- [ ] **5.3** `cp-toast` (tones + enter/leave), `cp-banner` (full-width status).
  (R4, R5)
- [ ] **5.4** `cp-dialog` (tone default/danger, **busy** suppresses dismiss),
  `cp-drawer`, `cp-sheet` — focus-trap, Esc, focus restore. (R4, R7; PO #5)
- [ ] **5.5** `cp-table` (selectable/selected, loading→skeleton rows, empty),
  `cp-skeleton`, `cp-empty-state`. (R4, R5; PO #3/#4, designer S1)

## Phase 6 — Packaging & registration (R8; design.md §8)

- [ ] **6.1** Per-component subpath exports (`./button`…) + barrel;
  `"sideEffects"` policy so `define()` isn't tree-shaken. _Test:_ importing one
  subpath registers only that element. (R8)
- [ ] **6.2** Define-if-absent guard on every `@customElement`. _Test:_ double
  import doesn't throw. (R8, design.md §5)

## Phase 7 — Assembly proof (NFR-4, NFR-7)

- [ ] **7.1** Rebuild the three approved prototypes' key screens from real
  primitives (no hand-rolled CSS). _Test:_ Playwright visual pass light/dark
  @390px + desktop matches the prototype reference; no horizontal overflow;
  header fits 360px. (NFR-1, NFR-4, R7)
- [ ] **7.2** Doc: per-folder README + component usage in `documentation/user`.
  (dev-cycle)

## Traceability

| Phase | Requirements | Key tests |
|---|---|---|
| 0 | R8, NFR-7 | workspace resolve, existing suites, gates |
| 1 | R1, R2, R7 | tokens / theme-blocks / bridge / contrast |
| 2 | R3, NFR-3 | cp-icon / toggle |
| 3 | R4, NFR-5 | per-component render/state |
| 4 | R4, R7 | form-associated submission/validity |
| 5 | R5, NFR-2 | progress/steps/upload/dialog-busy/table-loading |
| 6 | R8 | subpath registration / double-import |
| 7 | NFR-1/4/7, R7 | visual parity, responsive |

## Out of scope (later specs)
Per-screen behavior — app-shell, editor internals, git engine, content-list,
settings, comms, tickets, deploy-status, notifications, auth. This spec delivers
the language + primitives they compose.
