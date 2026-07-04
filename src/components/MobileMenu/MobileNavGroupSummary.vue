<script setup lang="ts">
defineProps<{
  readonly title: string
  readonly open: boolean
}>()
</script>

<template>
  <summary class="mobile-nav-summary">
    <span
      class="mobile-nav-heading"
      role="heading"
      aria-level="3"
    >{{ title }}</span>
    <span class="mobile-nav-chevron" aria-hidden="true">{{ open ? '▾' : '▸' }}</span>
  </summary>
</template>

<style scoped>
.mobile-nav-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.5rem var(--spacing-sm);
  cursor: pointer;
  border-radius: var(--radius-sm);
  list-style: none;
}

.mobile-nav-summary::-webkit-details-marker {
  display: none;
}

.mobile-nav-summary:hover,
.mobile-nav-summary:focus-visible {
  background: var(--color-surface);
}

.mobile-nav-heading {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}

/*
 * Chevron rotation is a two-glyph swap, NOT a CSS transform. The
 * previous attempt scoped a `:global(details[open]) .chevron` rule
 * expecting Vue's `:global()` to leave the descendant scoped — but
 * the compiler stripped the descendant part and emitted the global
 * rule `details[open] { transform: rotate(90deg); }`. That rotated
 * every open <details> on the page 90°, so nested links measured
 * 40 × 270 px and their labels wrapped one glyph per line.
 */
.mobile-nav-chevron {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
}
</style>
