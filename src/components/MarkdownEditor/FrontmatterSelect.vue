<script setup lang="ts">
import { computed } from 'vue'
import { useLabelsStore } from '@/stores/labels'
import { useTopicsStore } from '@/stores/topics'
import type { Language } from '@/types/language'
import type { FieldDefinition } from './field-types'
import { buildLabelOptions, buildTopicOptions } from './select-options'

const props = defineProps<{
  readonly field: FieldDefinition
  readonly value: string
  readonly lang: Language
}>()

const emit = defineEmits<{ change: [v: string] }>()

const labelsStore = useLabelsStore()
const topicsStore = useTopicsStore()
void labelsStore.ensureLoaded()
void topicsStore.ensureLoaded()

const source = computed(() =>
  props.field.type === 'select' ? props.field.optionsSource : undefined
)

const options = computed(() => {
  if (source.value === 'labels')
    return buildLabelOptions(labelsStore.labels, props.lang, props.value)
  if (source.value === 'topics')
    return buildTopicOptions(topicsStore.topics, props.lang, props.value)
  return []
})

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
    <option value="" :disabled="field.required">
      {{ field.required ? `Select ${field.label.toLowerCase()}` : '— none —' }}
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
