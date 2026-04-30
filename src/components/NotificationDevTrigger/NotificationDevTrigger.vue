<script setup lang="ts">
import { useNotifications } from '@/composables/useNotifications'
import type { NotificationKind } from '@/stores/notifications'
import { DEV_TRIGGER_KINDS } from './dev-kinds'

const enabled = import.meta.env.VITE_MOCK_AUTH === 'true'
const { notify } = useNotifications()

const fire = (kind: NotificationKind): void => {
  notify({
    kind,
    title: `${kind} sample`,
    message: `dev-triggered ${kind} notification`,
  })
}
</script>

<template>
  <aside
    v-if="enabled"
    class="dev-trigger"
    data-testid="notify-dev-trigger"
    aria-label="Dev notification triggers"
  >
    <button
      v-for="kind in DEV_TRIGGER_KINDS"
      :key="kind"
      type="button"
      :data-testid="`notify-trigger-${kind}`"
      @click="fire(kind)"
    >
      {{ kind }}
    </button>
  </aside>
</template>

<style scoped>
.dev-trigger {
  position: fixed;
  top: 80px;
  left: 12px;
  z-index: 100;
  display: flex;
  gap: 4px;
  padding: 6px;
  background: rgb(0 0 0 / 70%);
  border-radius: 6px;
  font-family: monospace;
}

.dev-trigger button {
  font-size: 11px;
  padding: 4px 8px;
  background: #222;
  color: #ddd;
  border: 1px solid #444;
  border-radius: 4px;
  cursor: pointer;
}

.dev-trigger button:hover {
  background: #333;
}
</style>
