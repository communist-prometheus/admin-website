<script setup lang="ts">
defineProps<{
  readonly title: string
}>()
</script>

<template>
  <summary class="mobile-nav-summary">
    <span
      class="mobile-nav-heading"
      role="heading"
      aria-level="3"
    >{{ title }}</span>
    <span class="mobile-nav-chevron" aria-hidden="true">▸</span>
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

.mobile-nav-chevron {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  transition: transform 0.15s ease;
}

/*
 * The chevron rotates when the parent <details> is [open]. Scoped
 * styles get a hashed class attribute, but the parent's [open]
 * attribute is unhashed, so this selector reaches it via :global-
 * equivalent — the `:deep()` marker on chevron under [open] parent.
 */
:global(details[open]) .mobile-nav-chevron {
  transform: rotate(90deg);
}
</style>
