<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppNavAuth from './AppNavAuth.vue'

const route = useRoute()
const auth = useAuthStore()
</script>

<template>
  <nav class="app-nav">
    <RouterLink
      to="/"
      :class="{ active: route.path === '/' }"
    >
      Home
    </RouterLink>
    <AppNavAuth v-if="auth.user || auth.loading" />
    <RouterLink
      to="/about"
      :class="{ active: route.path === '/about' }"
    >
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

.app-nav :deep(a) {
  color: var(--color-text);
  text-decoration: none;
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  padding: 0.5rem 0.25rem;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.app-nav :deep(a):hover {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

.app-nav :deep(.active) {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}

@media (width < 768px) {
  .app-nav {
    display: none;
  }
}
</style>
