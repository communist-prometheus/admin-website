# App Shell — Requirements

The chrome that hosts every admin screen: header, navigation, content region,
persistent sync/deploy status, routing, and the responsive/role-gated behavior
around them. Built on the design-system primitives (`../design-system/`), in the
locked "Документ" language. **Reference prototypes:**
`../prototypes/document-direction.html` (header, sub-nav, content, sync pill) and
`../prototypes/settings-comms-magazine.html` (sub-navigation layouts).

## Overview

The shell is deliberately minimal — content is the hero. A slim header carries
the real site wordmark and the theme toggle; primary navigation groups the admin
capabilities; the content region renders the active screen; a persistent status
surface always shows the git/deploy state (the headline pain: no silent waits).
It is mobile-first and role-aware: what a user cannot do, they do not see.

## Requirements

### R1 — Header
- THE SYSTEM SHALL render a slim sticky header with the real `logo-light/dark`
  wordmark (decorative SVG, labelled by its home link) and the sun/moon theme
  toggle (design-system R3).
- THE header SHALL fit without overflow at 360px width.
- WHERE the current user is known, THE header SHALL expose an account affordance
  (avatar/login name + sign-out), and WHILE signed out SHALL show a sign-in
  action instead.

### R2 — Primary navigation
- THE SYSTEM SHALL present the capabilities grouped as **Content**, **Community**,
  **Distribution**, and **Admin** (exact items from the feature inventory).
- WHEN a nav item is selected THE SYSTEM SHALL mark it current
  (`aria-current="page"`) and render its screen in the content region.
- THE navigation SHALL be keyboard operable with visible focus and correct
  landmark roles.

### R3 — Role & ownership gating
- IF the user lacks the role for a capability THEN THE SYSTEM SHALL NOT render its
  nav entry or route (not merely disable it), EXCEPT where a disabled-with-reason
  affordance is explicitly specified.
- WHERE a capability is owner-only (e.g. newsletter dispatch) THE SYSTEM SHALL
  gate it on ownership and label it (“только владелец”).
- Gating SHALL be driven by the auth/RBAC state (`../auth/`), never by hiding in
  CSS alone.

### R4 — Content region & routing
- THE SYSTEM SHALL route between screens without a full reload, updating the URL
  and browser history (back/forward correct), and SHALL restore focus to the new
  screen's heading on navigation.
- WHILE a route's data or module loads THE SYSTEM SHALL show determinate or
  indeterminate progress (design-system R5), never a blank frozen region.
- THE content region SHALL host optional sub-navigation (e.g. Settings:
  Языки/Ссылки/Темы/Сброс; Comms: Расписание/Подписчики/Журнал) as tabs with
  `aria-current`.

### R5 — Persistent sync/deploy status
- THE SYSTEM SHALL always show a sync-status affordance in the chrome reflecting
  the real git/deploy state machine (idle/queued/pushing/retrying/failed/
  deploying/deploy-failed/ok), using `cp-status`/`cp-banner` (not color alone).
- WHEN a background push/deploy changes state THE SYSTEM SHALL update the
  affordance live and, on failure, surface an actionable path (retry/details).

### R6 — Responsiveness & layout
- Base layout targets 360–390px; `@media(min-width:768px)` enhances (e.g. nav
  from a menu/drawer to a persistent rail). No horizontal overflow, no
  overlapping panels at any supported viewport.
- THE SYSTEM SHALL use only design-system spacing/layout primitives (NFR-1).

### R7 — Accessibility & motion
- Landmarks (`banner`/`nav`/`main`), skip-to-content link, focus management on
  route change, `prefers-reduced-motion` honored for route/theme transitions
  (design-system R3), AAA-leaning contrast (inherited tokens).

### R8 — Notifications surface
- THE SYSTEM SHALL provide a host for transient toasts and a notifications
  indicator/drawer (detailed behavior deferred to `../notifications/`), placed so
  it never overlaps the content or the sync-status affordance.

## Out of scope (this spec)
Per-screen behavior and the auth/RBAC and git-engine internals — separate specs.
This spec locks the **shell, navigation, routing, status surface, and gating
contract** that those screens plug into.

## Acceptance → tests
Each R maps to E2E/unit tests: header-fits-360, nav-current-and-route,
gating-hides-not-disables, route-history-and-focus, route-loading-progress,
sync-status-reflects-state, no-horizontal-overflow, a11y-landmarks-and-skip.
