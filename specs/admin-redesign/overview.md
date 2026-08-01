# Admin Redesign — Program Overview

Full rebuild of the admin app: a new UI on **Astro + Lit + the project's FP
wrappers**, reusing and extending the **public-website component system**, with
unit + integration + automated E2E coverage, reproducing **all** current admin
functionality. Design-first: interactive HTML prototypes are approved before any
production code.

## Locked decisions

- **Scope:** full rewrite — including the client-side git/SW engine and
  OAuth/refresh, rebuilt from scratch (not merely re-skinned). _(user, 2026-08-01)_
- **Mockups:** interactive HTML prototypes (clickable, themed light/dark, built
  on the public-site design tokens/components). Penpot is not driven directly.
- **Stack:** Astro 5 + Lit 3 web components + the house FP style; shared design
  tokens/components with public-website.

## Key discovery (grounds the stack)

- Public-website = **Astro 5 + vanilla `<script>` islands + Lit 3** (Lit only for
  the file-viewer packages today). Hand-rolled **CSS custom-property design
  tokens** (`public-website/src/styles/theme.css`, `utilities.css`). No Vue/React.
- The "FP wrappers" are a **house style** (one pure fn/file, IO-injection for
  testability, closures over classes, `readonly`/`undefined`, no `any`/casts) —
  not a runtime lib. `effect` exists only in the current Vue admin.
- A standalone **`@communist-prometheus/cp-components`** Lit 3 design-system
  package already exists at `C:\Projects\Prometheus\components` (`cp-button`,
  `cp-card`, tokens-as-TS under `--cp-*`), versioned, **consumed by nobody yet**.
  It is purpose-built to become the shared admin+site component library — **adopt
  and extend it** as the admin's component base. Reconcile the accent divergence
  (cp violet vs site red) into token themes.
- **Not a monorepo:** `public-website`, `admin-website`, `components` are sibling
  repos (only `e2e-toolkit` is a shared submodule). **Open decision:** unify into
  one workspace (`apps/*` + `packages/cp-components`) so admin depends on shared
  components via `workspace:*`, vs. consuming `cp-components` as a versioned/
  submodule dep. Recommendation: unify — cleanest for shared evolution.
- **Admin-specific components to build new** (absent everywhere): data tables,
  full form-control set (input/select/checkbox/radio/textarea), tabs, toasts,
  markdown/rich editor, app-shell/side-nav, pagination, badges/chips, tooltips.

## Why (the problem being fixed)

The current admin's UX is broken: inconsistent/leaking paddings, overlapping
panels, poor buttons, bad/absent motion, and loading states with **no progress
indication**. It reads like a generic CMS rather than a coherent product.

## Non-functional requirements (the UX bar — every spec inherits these)

- **NFR-1 Spacing/layout:** one spacing scale (design tokens); no ad-hoc paddings;
  no overlapping panels at any supported viewport. Layout primitives only.
- **NFR-2 Progress:** every async operation (clone, commit, push, upload, deploy
  poll, navigation) shows determinate or indeterminate progress — never a frozen
  blank state.
- **NFR-3 Motion:** a defined motion system (durations/easings as tokens),
  reduced-motion honored; no janky or gratuitous animation.
- **NFR-4 Components:** a single component library extended from public-website;
  consistent buttons, inputs, dialogs, panels, toasts, tables, tabs — each with
  defined states (default/hover/focus/active/disabled/loading/error).
- **NFR-5 Accessibility:** AAA-leaning — keyboard operable, focus management,
  ARIA, contrast; validated in tests.
- **NFR-6 Theming:** light/dark via tokens, no per-component overrides.
- **NFR-7 Testing:** unit + integration + automated E2E; feature parity is proven
  by tests migrated/rewritten from the current suite.
- **NFR-8 Engine correctness:** the rebuilt git/SW/OAuth engine must preserve the
  behaviors just stabilized (8h token refresh lifecycle, single-flight, push
  queue error classification, honest re-login). See the current
  `src/composables/useAuth/*` and `src/sw/*` as the behavioral reference.

## Phased plan

0. **Discovery** (in progress): full feature inventory of the current admin +
   map of the public-website component system / FP wrappers.
1. **Design system + app shell spec** → interactive HTML prototypes of the key
   screens (dashboard/content list, editor, settings, auth) for review.
2. Per-capability specs (each small, reviewed before build), from the inventory:
   - `design-system` — tokens (adopt/extend cp-components), component library
     (buttons/inputs/select/checkbox/textarea/tabs/table/toast/dialog/panel/
     badge/tooltip/pagination/progress/skeleton), motion, theming. **First.**
   - `app-shell` — layout, side-nav (grouped Content/Community/Distribution/Admin
     with role+owner gating), header, settings & comms sub-layouts, routing.
   - `auth` — OAuth PKCE popup, session + 8h refresh lifecycle, RBAC roles.
   - `git-engine` — SW isomorphic-git (clone/pull/commit), push queue + error
     classification + retry, NFF/merge recovery, conflicts + visual merge.
   - `content-list` — per-type lists, create/rename/delete, bulk delete.
   - `content-editor` — markdown editor, frontmatter per type, multi-language,
     asset panel, docx import, magazine PDF/FB2, topics, publish flow.
   - `deploy-status` — Actions polling, deploy history/detail, progress.
   - `notifications` — toast stack, drawer, indicator, push-sync badge; action
     history (redacted audit).
   - `settings` — languages/links/topics editors, members/RBAC, reset.
   - `tickets` — list/detail, create (bug/user-story), attachments.
   - `comms` — newsletter schedule/cutoff/subscribers/runs (owner), feature flags.
   **Reuse note:** the framework-agnostic engines (SW `src/sw/*`, CF `src/api/*`,
   `src/validation/*`, auth/token core, magazine/import/tickets `.ts`) are the bulk
   of the domain complexity and are portable behind the SW `fetch`/`postMessage`/
   BroadcastChannel contracts — even under "full rewrite" they are the behavioral
   reference and much can be lifted rather than re-derived.
3. Implement task-by-task per spec, TDD, green between tasks; migrate E2E.

## Status

- [x] Branch `feat/admin-redesign` created.
- [x] Discovery reports (feature inventory; public component system).
- [x] Direction chosen: **"Документ"** (user, 2026-08-01).
- [x] Design language **locked + approved** — reference prototype
  `prototypes/document-direction.html` (browser-verified light/dark + mobile;
  designer/QA/PO reviewed). Captured in `design-system/requirements.md`.
- [ ] `design-system` design.md (component API on cp-components) → build.
- [x] Hard-screen prototypes: push/deploy status + visual 3-way merge
  (`prototypes/status-and-merge.html`) — designer/QA/PO reviewed, fixed,
  browser-verified.
- [ ] Deferred from that review → fold into the `git-engine` spec (not the
  prototype): word-level diff inside a hunk; manual/free-text hunk edit;
  binary/asset & whole-file add-delete conflict patterns; merged-document
  preview before push; role-based escalation ("ask a reviewer") + branch-
  protection-aware finish (PR vs push); retry-exhaustion & offline states;
  safe, explicit "Отменить" semantics (never discard local work).
- [ ] Simpler-screen prototypes: magazine PDF/FB2 upload, newsletter, settings.
- [ ] Per-capability specs + implementation (TDD).
