<script setup lang="ts">
/**
 * AppLayout Web Component with Shadow DOM isolation
 * Used for SSR with Declarative Shadow DOM to prevent CLS
 */
</script>

<template>
  <div class="app-layout">
    <header>
      <h1>Admin Panel</h1>
      <slot name="header-actions" />
    </header>

    <main>
      <slot />
    </main>

    <footer>
      <slot name="footer">
        © {{ new Date().getFullYear() }} Admin Panel. All rights reserved.
      </slot>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  display: grid;
  grid-template-rows: auto 1fr auto;
  min-height: 100vh;
  color: var(--color-text);
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-heading);
}

h1 {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 600;
  margin: 0;
}

main {
  padding: clamp(1rem, 4vw, 2rem);
  color: var(--color-text);
}

footer {
  padding: clamp(1rem, 3vw, 1.5rem) clamp(1rem, 4vw, 2rem);
  border-top: 1px solid var(--color-border);
  background: var(--color-background-mute);
  text-align: center;
  color: var(--color-text-muted);
  font-size: clamp(0.75rem, 2vw, 0.875rem);
}
</style>
