<template>
  <div class="content-card">
    <slot />
  </div>
</template>

<style scoped>
.content-card {
  display: block;
  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

.content-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
