## Summary

<!-- What changed and why, in 1-3 sentences. Link the issue / user report. -->

## Test plan

<!-- How you verified. Prefer specific commands and file paths. -->

- [ ] `bun run validate` clean
- [ ] `bun run test:unit` green
- [ ] Relevant `bun run test:e2e <spec>` green

---

## UI-change checklist

<!-- Delete this whole section if the diff touches no user-visible surface. -->

Applies to any PR that changes `src/components/**/*.vue`, `src/views/**/*.vue`, or any global CSS.

- [ ] **Mobile-chromium E2E green** (`bun run test:e2e <affected-spec> --project=mobile-chromium`). The default `chromium` project runs at desktop viewport and misses drawer / bottom-sheet / touch-target regressions. #350 shipped a broken drawer because its E2E only ran chromium.
- [ ] **Screenshot attached** from a 375 vw MCP browser (or manual mobile viewport) of the affected surface — both idle AND interacted state. #350 shipped without one.
- [ ] **Scoped CSS hand-check** — every `:global(...)`, `:deep(...)`, and any un-scoped selector in a new `<style scoped>` block reviewed against the compiled output. Vue silently strips descendant selectors from `:global(parent) .child`, emitting the parent rule globally. Example: `:global(details[open]) .chevron { transform: rotate(90deg) }` in #350 shipped as `details[open] { transform: rotate(90deg) }` and rotated every open `<details>` on the page.
- [ ] **Copy reviewed** for i18n (labels rendered in RU / ES / IT / PL / UK / BE — not just EN). Long compound words break narrow drawers unless `overflow-wrap` is set.
- [ ] **Tap targets** ≥ 40 px block-size (WCAG 2.2 AA is 24 px, Apple HIG is 44 px, we aim between).
- [ ] **Both themes** — light + dark verified against the `--color-*` tokens.

---

## Data-change checklist

<!-- Delete if the diff touches no persistent data. -->

- [ ] Migration / KV-schema change documented in commit message
- [ ] No secret / token in the diff (`git diff main -- '**/wrangler*' '**/env*'`)
- [ ] Owner PAT rotation checklist referenced if the change requires new scopes

---

<!--
  When to skip these lists: pure refactor, docs-only, dependency bump.
  When NOT to skip: the diff touches ANY <template>, <style>, .css / .scss,
  or a route mount. That includes "just moving a component" — the parent
  layout can shift.
-->

🤖 Generated with [Claude Code](https://claude.com/claude-code)
