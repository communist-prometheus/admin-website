<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef } from 'vue'
import { RouterLink } from 'vue-router'
import { useScrollHeader } from '@/composables/useScrollHeader'
import AppNav from './AppNav.vue'

const el = useTemplateRef<HTMLElement>('header')
const height = ref(60)
onMounted(() => {
  if (el.value) {
    height.value = el.value.offsetHeight
    document.documentElement.style.setProperty(
      '--header-height',
      `${height.value}px`
    )
  }
})
const { offset } = useScrollHeader(height)
const headerStyle = computed(() => ({
  transform: `translateY(${offset.value}px)`,
}))
</script>

<template>
  <header
    ref="header"
    class="app-header"
    :style="headerStyle"
  >
    <RouterLink to="/" class="logo">Prometheus</RouterLink>
    <AppNav />
    <slot />
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-dropdown);
  will-change: transform;
  display: flex;
  align-items: center;
  padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 4vw, 2rem);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background);
  color: var(--color-heading);
  gap: clamp(0.75rem, 2vw, 1.5rem);
}

.logo {
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  color: var(--color-heading);
  text-decoration: none;
  white-space: nowrap;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.logo:hover {
  color: var(--color-accent);
}
</style>
