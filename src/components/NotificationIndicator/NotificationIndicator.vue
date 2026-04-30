<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationDrawer } from '@/composables/useNotificationDrawer'
import { useNotifications } from '@/composables/useNotifications'
import { formatCount } from './format-count'
import { INDICATOR_TEST_IDS } from './test-ids'

const drawer = useNotificationDrawer()
const { entries } = useNotifications()
const count = computed(() => entries.value.length)
const badge = computed(() => formatCount(count.value))
const ariaLabel = computed(() =>
  count.value === 0
    ? 'Notifications: none unread'
    : `Notifications: ${count.value} unread`
)
</script>

<template>
  <button
    type="button"
    class="indicator"
    :data-testid="INDICATOR_TEST_IDS.root"
    :aria-label="ariaLabel"
    @click="drawer.toggle"
  >
    <BellIcon />
    <span
      v-if="badge"
      :data-testid="INDICATOR_TEST_IDS.badge"
      class="indicator-badge"
    >{{ badge }}</span>
  </button>
</template>

<style scoped>
.indicator {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: 0;
  border-radius: 50%;
  cursor: pointer;
  color: inherit;
}

.indicator:focus-visible {
  outline: 2px solid var(--color-accent, #4fc3f7);
  outline-offset: 2px;
}

.indicator-icon {
  pointer-events: none;
}

.indicator-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  font-size: 11px;
  font-weight: 700;
  line-height: 18px;
  text-align: center;
  color: #fff;
  background: var(--color-error, #e53935);
  border-radius: 9px;
  border: 2px solid var(--color-background, #fff);
}
</style>
