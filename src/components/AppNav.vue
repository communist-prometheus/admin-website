<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <nav class="app-nav">
    <RouterLink to="/" :class="{ active: route.path === '/' }">
      Home
    </RouterLink>
    <RouterLink to="/content/blog" :class="{ active: route.path.startsWith('/content/blog') }">
      Blog
    </RouterLink>
    <RouterLink to="/content/positions" :class="{ active: route.path.startsWith('/content/positions') }">
      Positions
    </RouterLink>
    <RouterLink to="/content/pages" :class="{ active: route.path.startsWith('/content/pages') }">
      Pages
    </RouterLink>
    <RouterLink to="/about" :class="{ active: route.path === '/about' }">
      About
    </RouterLink>
  </nav>
</template>

<style scoped>
.app-nav {
  display: flex;
  gap: clamp(1rem, 3vw, 2rem);
  align-items: center;
}

.app-nav a {
  color: var(--color-text);
  text-decoration: none;
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.app-nav a:hover {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.app-nav a.active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
</style>
