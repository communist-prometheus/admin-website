<script setup lang="ts">
import { computed } from 'vue'
import type { HardResetProgress } from '@/composables/useHardReset'

const props = defineProps<{
  readonly progress: HardResetProgress
}>()

const percent = computed(() =>
  Math.round((props.progress.step / props.progress.total) * 100)
)
const summary = computed(
  () =>
    `${props.progress.label} · ${props.progress.step} / ${props.progress.total}`
)
const fillStyle = computed(() => ({ '--fill': `${percent.value}%` }))
</script>

<template>
  <output
    class="progress"
    aria-live="polite"
    data-testid="hard-reset-progress"
  >
    <span
      class="progress-bar"
      role="progressbar"
      :aria-valuenow="percent"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="fillStyle"
      data-testid="hard-reset-fill"
    />
    <span class="progress-label" data-testid="hard-reset-label">
      {{ summary }}
    </span>
  </output>
</template>

<style scoped>
.progress {
  display: grid;
  gap: 0.4rem;
}

.progress-bar {
  block-size: 8px;
  inline-size: 100%;
  background: linear-gradient(
    to right,
    var(--color-accent) var(--fill, 0%),
    transparent var(--fill, 0%)
  );
  border: 1px solid var(--color-border);
  border-radius: 999px;
  overflow: hidden;
  transition: --fill 0.2s ease;
}

.progress-label {
  font-size: 0.85rem;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

@property --fill {
  syntax: '<percentage>';
  inherits: false;
  initial-value: 0%;
}
</style>
