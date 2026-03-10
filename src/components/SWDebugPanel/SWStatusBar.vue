<script setup lang="ts">
import { computed } from 'vue'
import type { SWStatusResponse } from '@/sw/protocol'

const props = defineProps<{
  readonly status: SWStatusResponse | undefined
  readonly error: string | undefined
}>()

const stateText = computed(
  () => props.status?.state ?? props.error ?? 'not connected'
)
const stateClass = computed(
  () => props.status?.state ?? (props.error ? 'error' : 'idle')
)
const version = computed(
  () => props.status && `v${props.status.version}`
)
</script>

<template>
  <header class="sw-status-bar" data-testid="sw-status-bar">
    <span class="sw-label">SW</span>
    <span class="sw-state" :class="stateClass">
      {{ stateText }}
    </span>
    <span v-if="version" class="sw-version">
      {{ version }}
    </span>
  </header>
</template>

<style scoped>
.sw-status-bar {
  display: flex;
  align-items: center;
  gap: 0.75em;
  padding: 0.5em 1em;
  background: #1a1a2e;
  border-bottom: 1px solid #333;
  font-family: monospace;
  font-size: 0.8rem;
}

.sw-label {
  font-weight: 700;
  color: #4fc3f7;
}

.sw-state {
  padding: 0.1em 0.5em;
  border-radius: 3px;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.sw-state.ready {
  background: #1b5e20;
  color: #a5d6a7;
}

.sw-state.cloning,
.sw-state.syncing {
  background: #e65100;
  color: #ffcc80;
}

.sw-state.error {
  background: #b71c1c;
  color: #ef9a9a;
}

.sw-state.idle {
  background: #333;
  color: #999;
}

.sw-version {
  color: #666;
  font-size: 0.7rem;
}
</style>
