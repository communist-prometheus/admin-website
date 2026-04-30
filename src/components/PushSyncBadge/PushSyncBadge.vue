<script setup lang="ts">
import { computed } from 'vue'
import { usePushState } from '@/composables/useSWBridge/use-push-state'
import { PUSH_SYNC_TEST_IDS } from './test-ids'

const { state } = usePushState()
const visible = computed(
  () => state.value.status !== 'idle' || state.value.pending > 0
)
const ariaLabel = computed(() =>
  state.value.status === 'error'
    ? `Push sync error, ${state.value.pending} pending`
    : `Push syncing, ${state.value.pending} pending`
)
</script>

<template>
  <aside
    v-if="visible"
    class="push-sync"
    :data-testid="PUSH_SYNC_TEST_IDS.root"
    :data-status="state.status"
    :aria-label="ariaLabel"
    aria-live="polite"
  >
    <span v-if="state.pending > 0" :data-testid="PUSH_SYNC_TEST_IDS.count">
      {{ state.pending }}
    </span>
    <span v-else aria-hidden="true">·</span>
  </aside>
</template>

<style scoped>
.push-sync {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 700;
  border-radius: 12px;
  color: #fff;
  background: var(--color-accent, #4fc3f7);
}

.push-sync[data-status='syncing'] {
  animation: push-sync-pulse 1.2s ease-in-out infinite;
}

.push-sync[data-status='error'] {
  background: var(--color-error, #e53935);
  animation: none;
}

@keyframes push-sync-pulse {
  0%, 100% { opacity: 100%; }
  50% { opacity: 55%; }
}
</style>
