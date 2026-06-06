<script setup lang="ts">
import { COMMON_TIMEZONES } from './tz-list'

const props = defineProps<{
  readonly modelValue: string
  readonly disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const onChange = (e: Event): void => {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <select
    :value="props.modelValue"
    class="tz"
    data-testid="schedule-timezone"
    aria-label="Timezone"
    :disabled="props.disabled"
    @change="onChange"
  >
    <option v-for="tz in COMMON_TIMEZONES" :key="tz" :value="tz">
      {{ tz }}
    </option>
  </select>
</template>

<style scoped>
.tz {
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
  font-family: var(--font-mono, monospace);
}
</style>
