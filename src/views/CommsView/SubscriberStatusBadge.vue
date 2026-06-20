<script setup lang="ts">
import { computed } from 'vue'
import type { Subscriber } from '@/stores/comms'
import { STATUS_META } from './status-meta'

const props = defineProps<{ readonly status: Subscriber['status'] }>()

const icon = computed(() => STATUS_META[props.status].icon)
const label = computed(() => STATUS_META[props.status].description)
</script>

<template>
  <span
    class="status"
    :class="`status-${status}`"
    :data-testid="`subscriber-status-${status}`"
    :aria-label="label"
  >
    <span class="icon" aria-hidden="true">{{ icon }}</span>
    <span class="text">{{ status }}</span>
  </span>
</template>

<style scoped>
.status {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.15rem 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid currentcolor;
  text-transform: uppercase;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
}

.icon {
  font-size: 0.65rem;
  line-height: 1;
}

.status-active {
  color: var(--color-accent);
}

.status-unsubscribed {
  color: var(--color-muted);
}

.status-bounced,
.status-complained {
  color: var(--color-danger);
}
</style>
