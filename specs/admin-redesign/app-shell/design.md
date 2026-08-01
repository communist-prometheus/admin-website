# App Shell — Design

Realizes `requirements.md` (R1–R8) as the client shell that hosts every admin
screen, on the design-system primitives (`../design-system/`). Reference:
`../prototypes/document-direction.html`.

## 1. Rendering & routing model

**Decision: a client-side SPA shell** — Astro serves a single shell page that
hydrates one `app-shell` Lit island; that island owns navigation and swaps screen
modules in the content region. It is **not** an Astro multi-page/view-transitions
app.

Why (R4 + NFR-8): the admin carries persistent in-page state that must survive
navigation — the push-queue/progress UI, live toasts, the auth session, and the
BroadcastChannel/`postMessage` subscriptions to the Service-Worker git engine. An
MPA (even with view-transitions) re-runs page scripts per navigation and tears
that state down; a SPA shell keeps the chrome and its live subscriptions mounted
while only the screen changes. The SW git engine itself persists regardless, but
the **UI** observing it must not remount.

- **Router:** a tiny hash/History-API router in the shell maps a route to a lazily
  `import()`-ed screen module (code-split per capability). History push/replace +
  `popstate` give correct back/forward (R4). Rejected: pulling in a framework
  router — the route set is small and static.
- **Loading:** while a screen module or its data loads, the content region shows
  `cp-progress` (indeterminate) or `cp-skeleton` (never blank) — NFR-2.
- **Focus:** on route change the shell moves focus to the new screen's `<h1>`
  (R4/R7) and announces via an `aria-live` region.
- **Astro role:** static shell HTML (header markup, token'd theme layer, fonts)
  so first paint is fully themed and FOUC-free before the island upgrades
  (design-system §7); `app-shell` hydrates `client:load`.

## 2. Shell composition

```
app-shell (Lit island, owns route + gating + sync subscription)
├─ header            → logo (home link), cp-tabs? no — top group nav, sync chip, theme toggle, account
├─ nav               → grouped primary nav (rail ≥768px, drawer <768px)
├─ main #screen      → lazy screen module; optional sub-nav (cp-tabs, aria-current)
├─ sync-status       → cp-status/cp-banner bound to the git/deploy state machine
└─ toast host + notifications indicator (design-system; details → ../notifications/)
```

Composition uses design-system primitives only (NFR-4): `cp-button`, `cp-icon`,
`cp-tabs` (sub-nav), `cp-status`/`cp-banner` (sync), `cp-toast`, `cp-tooltip`,
`cp-drawer` (mobile nav), `cp-menu` (account/overflow). The shell adds no ad-hoc
CSS beyond layout using the spacing tokens.

## 3. Navigation data & gating contract

Navigation is **data-driven** so gating is declarative and testable:

```ts
interface NavItem {
  readonly id: string;            // route id
  readonly label: string;
  readonly icon: IconName;
  readonly group: 'content' | 'community' | 'distribution' | 'admin';
  readonly role?: Role;           // minimum role; absent = any signed-in
  readonly ownerOnly?: boolean;   // e.g. newsletter dispatch
}
```

- The shell renders only items the current `AuthState` satisfies (R3) — a filter
  over `NavItem[]`, **not** CSS hiding. Groups with no visible items collapse.
- Owner-only items render with a “только владелец” tag (`cp-tag`) when shown.
- The gating predicate is a pure function `canSee(item, auth): boolean` (unit
  tested against role/owner matrices). The `AuthState`/`Role` contract is owned by
  `../auth/`; the shell consumes it read-only.
- Groups map to the inventory: **Content** (articles, magazine, topics),
  **Community** (members, tickets), **Distribution** (newsletter, deploy status),
  **Admin** (settings, feature flags). Exact per-item roles are fixed in `../auth/`.

## 4. Sync / deploy status wiring (R5)

- The shell subscribes (once, for its lifetime) to the git engine's state via
  `BroadcastChannel`/`postMessage` (the engine contract is owned by
  `../git-engine/`).
- It maps the raw engine state machine → a generic `cp-status` state +
  human label: `idle→neutral`, `queued/pushing/retrying/deploying→info` (with a
  progress affordance), `ok→success`, `failed/deploy-failed→danger` (with a
  retry/details action via `cp-banner`).
- This mapping is the admin composite translating domain → the library's generic
  tones (design-system §1). Updates are live; failures always expose an
  actionable path (R5).

## 5. Responsive layout (R6)

- **<768px:** header + a nav toggle opening a `cp-drawer`; content full-width;
  sub-nav scrolls horizontally within its own container (no page overflow).
- **≥768px:** a persistent left nav rail + content; header slimmer.
- Layout via CSS grid/flex + spacing tokens only; no fixed pixel paddings; no
  overlap at any width; header fits 360px (R1/R6, verified in tests).

## 6. Accessibility & motion (R7)

- Landmarks: `header[role=banner]`, `nav`, `main`; a skip-to-content link as the
  first focusable element.
- Focus management on route change (§1); focus trap only inside overlays
  (dialog/drawer, from the primitives).
- Route/theme transitions honor `prefers-reduced-motion`; the theme toggle reuses
  the site's `startViewTransition` circular reveal (design-system R3).

## 7. Testing (NFR-7)

- **Unit:** `canSee` gating matrix (role × owner × item); route→module mapping;
  engine-state → status mapping.
- **Component:** shell renders the right nav for a given `AuthState`; route change
  updates history + moves focus; sync-status reflects pushed engine states;
  header fits 360px; no horizontal overflow at 360/768/1200.
- **E2E (later):** navigate every visible screen, back/forward, mobile drawer,
  theme toggle — migrated into the redesign suite.

## 8. Requirement → design map

| Req | Realized by |
|---|---|
| R1 header | §2 header composition, logo + toggle, 360px |
| R2 nav | §3 grouped data-driven nav + aria-current |
| R3 gating | §3 `canSee` filter (hide not disable), owner tag |
| R4 routing | §1 SPA router, history, loading, focus |
| R5 sync status | §4 engine subscription → cp-status/cp-banner |
| R6 responsive | §5 rail/drawer, tokens, no overflow |
| R7 a11y/motion | §6 landmarks, skip link, focus, reduced-motion |
| R8 notifications | §2 toast host + indicator (behavior → ../notifications/) |

## Open items (folded into later specs, not blockers here)
Exact per-item roles + `AuthState`/`Role` shape → `../auth/`; the git-engine
state machine + channel contract → `../git-engine/`; notifications drawer
behavior → `../notifications/`.
