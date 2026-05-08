<script setup lang="ts">
import { Match } from 'effect'
import { computed } from 'vue'
import { useTheme } from '@/composables/useTheme'
import MoonIcon from './ThemeToggle/MoonIcon.vue'
import SunIcon from './ThemeToggle/SunIcon.vue'
import SystemIcon from './ThemeToggle/SystemIcon.vue'

const { mode, next } = useTheme()

const label = computed(() =>
  Match.value(mode.value).pipe(
    Match.when('system', () => 'Theme: system (click for light)'),
    Match.when('light', () => 'Theme: light (click for dark)'),
    Match.orElse(() => 'Theme: dark (click for system)')
  )
)

const icon = computed(() =>
  Match.value(mode.value).pipe(
    Match.when('light', () => SunIcon),
    Match.when('dark', () => MoonIcon),
    Match.orElse(() => SystemIcon)
  )
)
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="label"
    :title="label"
    :data-mode="mode"
    @click="next"
  >
    <component :is="icon" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-height: 44px;
  min-width: 44px;
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text-primary);
  cursor: pointer;
  transition: background var(--transition-fast),
    border-color var(--transition-fast);
}

.theme-toggle:hover {
  background: var(--color-surface-elevated);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.theme-toggle:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
</style>
