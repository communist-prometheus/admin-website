# App Shell — Tasks

Ordered, TDD, green between tasks. Each names the requirement(s) and test(s).
Cross-refs: `requirements.md` (R1–R8), `design.md` (§1–§8), the design-system
primitives. Built in the monorepo `apps/admin-website`.

Legend: `[ ]` todo · `[~]` in progress · `[x]` done.

> **Status (2026-08-01):** Phases 0–3 built and **browser-verified** in a runnable
> Vite+Lit preview (`apps/admin-website/redesign.html` → `src/redesign/*`),
> alongside the current app. Verified: desktop rail + card grid, light/dark (no
> split, logo swaps), mobile drawer + zero horizontal overflow @390, route change
> moves focus to the heading. **Automated tests (unit/E2E) still to be written**
> per each phase below — that's the remaining work before these check off fully.

## Phase 0 — App scaffold ✅ (preview)

- [x] **0.1** Single HTML entry (`redesign.html`) sets the theme inline (no FOUC)
  and hydrates one `app-shell` Lit island. _(Vite, not Astro — see design.md §1.)_
  (R1)
- [x] **0.2** Generated `theme.css` + cp bridge wired; cp-components consumed via
  `workspace:*`. Verified: cp-button resolves warm-red and flips with
  `data-theme`. (design-sys)

## Phase 1 — Navigation model & gating (R2, R3)

- [ ] **1.1** `NavItem[]` data + `canSee(item, auth)` pure predicate.
  _Test:_ gating matrix (role × owner × item) — visible/hidden exactly. (R3)
- [ ] **1.2** Render grouped nav (Content/Community/Distribution/Admin) from the
  filtered items; empty groups collapse; owner-only shows a `cp-tag`. _Test:_
  nav for a given `AuthState` shows only permitted items; groups collapse. (R2,R3)
- [ ] **1.3** `aria-current="page"` on the active item; keyboard + landmark
  roles. _Test:_ current marking, tab order, `nav` landmark. (R2, R7)

## Phase 2 — Router & content region (R4)

- [ ] **2.1** History-API router: route id ↔ lazy screen module; push/replace +
  `popstate`. _Test:_ navigate updates URL, back/forward restore the right
  screen. (R4)
- [ ] **2.2** Loading + focus: show `cp-progress`/`cp-skeleton` while a module
  loads; move focus to the new screen `<h1>` + `aria-live` announce. _Test:_
  loading affordance shown; focus lands on heading. (R4, NFR-2, R7)
- [ ] **2.3** Sub-nav host (`cp-tabs`, `aria-current`) for Settings/Comms
  layouts. _Test:_ sub-nav switches panels, marks current. (R4)

## Phase 3 — Header & chrome (R1, R8)

- [ ] **3.1** Header: logo home link (decorative SVG), theme toggle
  (`startViewTransition`, reduced-motion), account affordance (login/sign-out via
  `cp-menu`). _Test:_ header fits 360px; toggle flips `data-theme`; account
  states. (R1, R7)
- [ ] **3.2** Toast host + notifications indicator placement (behavior →
  `../notifications/`). _Test:_ toast host mounts; no overlap with content/status.
  (R8)

## Phase 4 — Sync/deploy status (R5)

- [ ] **4.1** Subscribe to the git-engine state channel; map engine state →
  `cp-status`/`cp-banner` generic tone + label + action. _Test (mapping unit):_
  each engine state → the right tone/label; failure exposes retry/details.
  _(engine contract stubbed until `../git-engine/`.)_ (R5)

## Phase 5 — Responsive & a11y (R6, R7)

- [ ] **5.1** <768px drawer nav / ≥768px rail; content + sub-nav scroll within
  their own containers. _Test:_ no horizontal overflow at 360/768/1200; no
  overlap. (R6)
- [ ] **5.2** Skip-to-content link; focus management on route change; reduced-
  motion for route/theme transitions. _Test:_ skip link first focusable; reduced-
  motion path. (R7)

## Phase 6 — E2E (migrated into the redesign suite, NFR-7)

- [ ] **6.1** Navigate every visible screen, back/forward, mobile drawer, theme
  toggle; gating hides screens for a lesser role. _Test (Playwright):_ green,
  no flakiness (per `playwright-testing`).

## Traceability

| Phase | Requirements | Key tests |
|---|---|---|
| 0 | R1, design-sys | shell renders themed, island upgrades, bridge |
| 1 | R2, R3, R7 | canSee matrix, grouped nav, aria-current |
| 2 | R4, NFR-2 | router history, loading+focus, sub-nav |
| 3 | R1, R8 | header 360px, toggle, account, toast host |
| 4 | R5 | engine-state → status/banner mapping |
| 5 | R6, R7 | no overflow, skip link, reduced-motion |
| 6 | NFR-7 | E2E nav/gating/mobile/theme |

## Dependencies (blocking specific tasks, not the whole spec)
`../auth/` for `AuthState`/`Role` (Phase 1, 3.1); `../git-engine/` for the state
channel (Phase 4); `../notifications/` for drawer behavior (Phase 3.2). Those
tasks use a typed stub until the owning spec lands.
