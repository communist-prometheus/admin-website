<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { NavEntry } from '@/components/NavShared/nav-groups'
import DesktopNavDropdown from './DesktopNavDropdown.vue'

const props = defineProps<{
  readonly title: string
  readonly items: readonly NavEntry[]
}>()

const route = useRoute()
const router = useRouter()
const open = ref(false)
const rootEl = ref<HTMLElement | undefined>(undefined)

const isActiveGroup = computed(() =>
  props.items.some(item => route.path.startsWith(item.path))
)

const close = (): void => {
  open.value = false
}

const toggle = (): void => {
  open.value = !open.value
}

const isOutside = (target: Node): boolean => {
  const el = rootEl.value
  return Boolean(el && !el.contains(target))
}

const onPointerDown = (e: PointerEvent): void =>
  isOutside(e.target as Node) ? close() : undefined

onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onUnmounted(() => document.removeEventListener('pointerdown', onPointerDown))
router.afterEach(close)
</script>

<template>
  <div ref="rootEl" class="dropdown-group">
    <button
      type="button"
      class="dropdown-toggle"
      :class="{ active: isActiveGroup, open }"
      :aria-expanded="open"
      aria-haspopup="menu"
      :data-testid="`nav-group-${title.toLowerCase()}`"
      @click="toggle"
    >
      {{ title }} ▾
    </button>
    <DesktopNavDropdown v-if="open" :items="items" />
  </div>
</template>

<style scoped>
.dropdown-group {
  position: relative;
  display: inline-flex;
}

.dropdown-toggle {
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  color: var(--color-text);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  cursor: pointer;
  border-radius: var(--radius-sm);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.dropdown-toggle:hover,
.dropdown-toggle:focus-visible {
  background: var(--color-background-soft);
}

.dropdown-toggle.active {
  color: var(--color-accent);
}

/* Caret flips on open via a rotation on the ::after glyph. */
.dropdown-toggle::after {
  content: '';
}
</style>
