<script setup lang="ts">
import DeployItemHeader from './DeployItemHeader.vue'

defineProps<{
  readonly message: string
  readonly status: string
  readonly expanded: boolean
  readonly hasSteps: boolean
  readonly controls: string
}>()

defineEmits<{ toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="summary"
    :disabled="!hasSteps"
    :aria-expanded="expanded"
    :aria-controls="controls"
    data-testid="deploy-item-toggle"
    @click="$emit('toggle')"
  >
    <span
      :class="hasSteps ? 'chevron' : 'chevron placeholder'"
      aria-hidden="true"
    >
      {{ hasSteps ? (expanded ? '▾' : '▸') : '' }}
    </span>
    <DeployItemHeader :message="message" :status="status" />
  </button>
</template>

<style scoped>
.summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.summary:disabled {
  cursor: default;
}

.chevron {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  flex-shrink: 0;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  line-height: 1;
}

.chevron.placeholder {
  visibility: hidden;
}

.summary:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: var(--radius-sm);
}

.summary > :deep(.deploy-header) {
  flex: 1;
}
</style>
