<script setup lang="ts">
import type { Subscriber } from '@/stores/comms'

const props = defineProps<{ readonly status: Subscriber['status'] }>()

const label = (): string =>
  props.status === 'active'
    ? 'active'
    : props.status === 'unsubscribed'
      ? 'unsubscribed'
      : props.status === 'bounced'
        ? 'bounced'
        : 'complained'
</script>

<template>
  <span
    class="status"
    :class="`status--${status}`"
    :data-testid="`subscriber-status-${status}`"
  >
    {{ label() }}
  </span>
</template>

<style scoped>
.status {
  display: inline-block;
  font-size: 0.6875rem;
  letter-spacing: 0.05em;
  font-weight: 700;
  padding: 0.1rem 0.45rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  text-transform: uppercase;
}

.status--active {
  color: var(--color-accent);
  border-color: var(--color-accent);
}

.status--bounced,
.status--complained {
  color: var(--color-danger, #c0392b);
  border-color: var(--color-danger, #c0392b);
}
</style>
