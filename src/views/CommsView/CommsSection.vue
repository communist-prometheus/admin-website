<script setup lang="ts">
defineProps<{
  readonly title: string
  readonly lead: string
}>()
</script>

<template>
  <section class="section">
    <header class="head">
      <h2 class="title">{{ title }}</h2>
      <p class="lead">{{ lead }}</p>
    </header>
    <div class="body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.section {
  display: grid;
  gap: var(--spacing-sm);
  min-height: 6rem;

  /* Allow the section (and its grid descendants) to shrink below
     content min-size so a wide child never forces page overflow. */
  min-width: 0;
}

.head {
  display: grid;
  gap: 0.25rem;
  min-width: 0;
}

.title {
  margin: 0;
  font-weight: 700;
  font-size: 1.15rem;
  color: var(--color-text-primary);
}

.lead {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.body {
  display: grid;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  min-width: 0;
}

.body > * {
  min-width: 0;
}
</style>
