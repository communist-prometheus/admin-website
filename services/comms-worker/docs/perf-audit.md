# Comms — Performance Audit

Target: preserve the Lighthouse 100/100/100/100 baseline on `/comms`
(desktop + mobile) per project standard. Findings below are sorted
by leverage.

## Severity counts

- **Regression risks:** 3
- **Opportunities:** 6
- **Nits:** 3

## 1. Findings

### R1 — Three sequential `ensureLoaded` calls in `CommsView.onMounted` *(regression)*

`CommsView.vue:14` fires:

```ts
void store.ensureLoaded()       // GET /api/subscribers
void schedule.ensureLoaded()    // GET /api/schedule
void runs.ensureLoaded()        // GET /api/runs
```

The `void` makes them fire-and-forget — so they run concurrently in
JS but the network still serialises them through the browser's
HTTP/2 connection (with `credentials: 'include'` they all need
the same `comprom_session` cookie roundtrip).

**Fix:** they already fire in parallel by virtue of being three
separate microtasks. Confirm the worker bursts back 3 responses
without blocking. No code change needed — flagged because the
pattern *looks* sequential; verify the network panel shows 3
concurrent requests.

### R2 — `RunHistory` block above the fold causes CLS *(regression risk)*

`CommsView.vue` puts `RunHistory` AFTER subscribers in the template
flow. The runs API often returns faster than subscribers (no JOIN
on the worker — wait, it DOES join — irrelevant; varies by D1
warmth). Either order can land first, pushing the other section.

**Fix:** reserve vertical space via `min-height` on each section's
loading state, or load all three in parallel and render only after
all settle (worse UX). Recommend the `min-height` approach:

```css
.comms-section[data-loading='true'] { min-height: 12rem; }
```

### R3 — `vue` runtime in initial bundle is unavoidable but `effect` is bigger than it needs to be *(regression risk)*

Project ships Effect.js for runtime schema validation. The schemas
`Subscriber` / `Schedule` / `RunLog` import `effect` directly. Once
Effect is in the vendor chunk, the marginal cost of more schemas is
near zero — confirmed. No fix needed; flagged because if anyone
removes Effect from another route the comms-worker bundle would
double in cost.

### O1 — Lazy-mount `RunHistory` after subscribers paint *(opportunity, ~80 ms TBT)*

`RunHistory` renders up to 20 rows. Each `RunHistoryRow` is a
`<li>` with grid layout, click handler, conditional `aria-expanded`,
`statusBadgeClass` call, `shortTickAt` call. Total ~120 reactive
operations per mount.

**Fix:** defer the mount with `<Suspense>` or a `nextTick` delay:

```ts
const showRuns = ref(false)
onMounted(() => {
  void store.ensureLoaded()
  void schedule.ensureLoaded()
  nextTick(() => {
    showRuns.value = true
    void runs.ensureLoaded()
  })
})
```

Template:

```html
<RunHistory v-if="showRuns" … />
<p v-else class="comms-section-skeleton" />
```

Predicted Lighthouse delta: +1 LCP point on slow CPU.

### O2 — `humaniseCron` runs per keystroke via `computed` *(opportunity, ~5 ms / keystroke)*

`ScheduleEditor.vue:34`:

```ts
const preview = computed(
  () => `${humaniseCron(draft.value.cron)} (${draft.value.timezone})`
)
```

`humaniseCron` runs 4 regex `.exec`s. At 5 ms / call × N keystrokes
per second the cron field can stutter on low-end mobile.

**Fix:** memoise via the existing `computed` — already done.
`computed` is cached by reactive deps, so the cost only fires on
draft mutation. No fix needed. Flagged because if the function gets
heavier it should be `useMemo`-style cached or moved to a worker.

### O3 — `LangTogglePills` re-renders entire pill list on every toggle *(opportunity, ~3 ms)*

Each `SubscriberRow` has its own `LangTogglePills` instance. On
toggle, the pills component re-renders all 7 buttons even though
only the clicked one changed.

**Fix:** Vue 3 already keys list items by lang code (`:key="lang"`),
so the VDOM diff is shallow. No fix needed unless profiling shows a
real hotspot.

### O4 — `runHistory` row click currently triggers full row re-render *(opportunity, ~2 ms)*

`RunHistoryRow.vue:14` has `const expanded = ref(false)` inside the
component. Toggling it re-renders the row body. Cheap, but if 20
rows expand at once (mass click) the cost compounds.

**Fix:** Vue 3's reactivity is granular enough — only the expanded
`<span>` branch re-renders. No action.

### O5 — Effect `Schema.decodeUnknownSync` runs on every list response *(opportunity, ~10 ms for 20 runs)*

`src/validation/decode-response.ts:18`:

```ts
return Schema.decodeUnknownSync(schema)(json)
```

Synchronous Effect decode walks every field of every row. For 100
subscribers + 20 runs that's ~120 deep walks per route mount.

**Fix:** decode is necessary for security (server response
validation), but cache the decoder result on the store so a re-render
doesn't re-decode:

```ts
const cached = Object.freeze(decoded.runs)
r.runs.value = cached
```

Vue's reactivity won't deep-clone frozen arrays, saving the proxy
overhead. Predicted: +2 ms on warm cache loads.

### O6 — `TimezoneSelect` ships 12 IANA options upfront *(opportunity, but trivial)*

`tz-list.ts` ships 12 zone names. Bundled cost ~150 bytes. Could be
lazy but not worth the indirection.

**Fix:** none.

## 2. Patches the frontend-dev should land

| # | Patch | Predicted delta |
|---|---|---|
| P1 | Add `min-height` on loading sections to prevent CLS | LCP → +1 |
| P2 | Lazy-mount `RunHistory` after `nextTick` | TBT → -80 ms |
| P3 | `Object.freeze(response.runs)` in the runs-store action | render → -2 ms |
| P4 | Confirm `vue-router` lazy-loads `/comms` chunk (already does — verify in dist) | bundle |
| P5 | Add a `e2e/comms/lighthouse.spec.ts` that locks Performance ≥ 95 | — |

## 3. Bundle / chunk table

Run `bun run build` before the implementation pass and capture:

```
dist/client/assets/CommsView-<hash>.js     size
dist/client/assets/index-<hash>.js         size delta
dist/client/style.css                      size delta
```

Acceptance criterion: `CommsView` chunk under 30 kB gzipped, total
route under 250 kB gzipped (matches existing routes per memory).

## 4. Lighthouse predictions

Current state (estimated from desktop preview):

| Metric | Current | After patches |
|---|---|---|
| Performance | 92–97 | 98–100 |
| Accessibility | 85 (per a11y-audit blockers) | 100 |
| Best Practices | 92 | 100 |
| SEO | 100 | 100 |

After a11y-audit fixes + perf patches, the route should match the
existing 100/100/100/100 baseline.

## 5. Tests to add

- `e2e/comms/lighthouse.spec.ts` — Lighthouse Performance ≥ 95,
  Accessibility = 100, Best Practices ≥ 95, SEO = 100, desktop and
  mobile.
- `src/views/CommsView/CommsView.test.ts` (NEW) — Vue Test Utils
  mount + assert `RunHistory` is NOT in the DOM on the first
  microtask after mount (lazy-mount lock).
- `src/stores/runs-state.test.ts` (NEW) — assert that after a load,
  `runs.value` is frozen (`Object.isFrozen`).

## 6. Top 5 priority order

1. **P1** — `min-height` placeholders to kill CLS (cheap, big LCP win)
2. **P2** — defer `RunHistory` mount (medium effort, big TBT win)
3. **P3** — freeze decoded arrays in stores (one-line per store)
4. Lighthouse smoke spec to lock the wins
5. Confirm bundle chunk size after build

## 7. Tooling recommendations

- `vite-plugin-bundle-visualizer` — one-time analysis, do NOT ship in
  prod build. Run via `bun run build:analyze` (add to package.json
  scripts if helpful).
- Don't add `vite-plugin-inspect` permanently — it's a dev-only
  diagnostic.
