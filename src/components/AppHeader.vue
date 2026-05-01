<script setup lang="ts">
import { computed, onMounted, ref, useTemplateRef, watchEffect } from 'vue'
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
watchEffect(() => {
  document.documentElement.style.setProperty(
    '--header-offset',
    `${offset.value}px`
  )
})
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
    <RouterLink to="/" class="logo" aria-label="Communist Prometheus">
      <img src="/logo.svg" alt="" class="logo-img">
    </RouterLink>
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
  text-decoration: none;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  transition: opacity var(--transition-fast);
}

.logo:hover {
  opacity: 80%;
}

.logo-img {
  height: clamp(28px, 4.5vw, 36px);
  width: auto;
  display: block;
}
</style>
