<script setup lang="ts">
import { computed } from 'vue'
import { useLabelsStore } from '@/stores/labels'
import type { Language } from '@/types/language'
import type { FieldDefinition } from './field-types'
import { buildLabelOptions } from './select-options'

const props = defineProps<{
  readonly field: FieldDefinition
  readonly value: string
  readonly lang: Language
}>()

const emit = defineEmits<{ change: [v: string] }>()

const labelsStore = useLabelsStore()
void labelsStore.ensureLoaded()

const options = computed(() =>
  props.field.type === 'select' && props.field.optionsSource === 'labels'
    ? buildLabelOptions(labelsStore.labels, props.lang, props.value)
    : []
)

const onChange = (e: Event): void => {
  emit('change', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <select
    :id="`fm-${field.key}`"
    :value="value"
    :required="field.required"
    class="field-input"
    @change="onChange"
  >
    <option value="" disabled>
      Select {{ field.label.toLowerCase() }}
    </option>
    <option
      v-for="opt in options"
      :key="opt.value"
      :value="opt.value"
      :disabled="opt.disabled"
    >
      {{ opt.label }}
    </option>
  </select>
</template>

<style scoped>
.field-input {
  width: 100%;
  box-sizing: border-box;
  padding: clamp(0.375rem, 1vw, 0.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-family: inherit;
  background: var(--color-background);
  color: var(--color-text);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-heading);
}
</style>
