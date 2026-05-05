<script setup lang="ts">
import { RouterLink } from 'vue-router'
import DeployToggleButton from './DeployToggleButton.vue'

defineProps<{
  readonly message: string
  readonly status: string
  readonly expanded: boolean
  readonly hasSteps: boolean
  readonly controls: string
  readonly detailHref: string
  readonly runId: number
}>()

defineEmits<{ toggle: [] }>()
</script>

<template>
  <header class="summary-row">
    <DeployToggleButton
      :message="message"
      :status="status"
      :expanded="expanded"
      :has-steps="hasSteps"
      :controls="controls"
      @toggle="$emit('toggle')"
    />
    <RouterLink
      :to="detailHref"
      class="detail-link"
      :data-testid="`deploy-item-link-${runId}`"
      title="Open detail page"
      aria-label="Open deploy detail page"
    >↗</RouterLink>
  </header>
</template>

<style scoped>
.summary-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.detail-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.875rem;
  line-height: 1;
}

.detail-link:hover,
.detail-link:focus-visible {
  background: var(--color-background-mute);
  color: var(--color-text);
  border-color: var(--color-text-secondary);
}
</style>
