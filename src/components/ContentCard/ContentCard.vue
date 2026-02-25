<template>
  <slot />
</template>

<style scoped>
:host {
  display: block;
  padding: clamp(1rem, 3vw, 1.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  transition:
    transform var(--transition-fast),
    box-shadow var(--transition-fast);
}

:host(:hover) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}
</style>
