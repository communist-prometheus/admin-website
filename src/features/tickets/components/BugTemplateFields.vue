<script setup lang="ts">
import type { BugTemplate } from '../templates/types'
import TemplateField from './TemplateField.vue'

defineProps<{ readonly modelValue: BugTemplate }>()
const emit = defineEmits<{ 'update:modelValue': [t: BugTemplate] }>()

const update = (
  patch: Partial<BugTemplate>,
  current: BugTemplate
): void => {
  emit('update:modelValue', { ...current, ...patch })
}
</script>

<template>
  <TemplateField
    label="Reproduction Steps" required
    placeholder="1. Open …  2. Click …  3. See error"
    :model-value="modelValue.reproductionSteps"
    @update:model-value="update({ reproductionSteps: $event }, modelValue)"
  />
  <TemplateField
    label="Actual Behavior" required
    placeholder="What actually happens"
    :model-value="modelValue.actualBehavior"
    @update:model-value="update({ actualBehavior: $event }, modelValue)"
  />
  <TemplateField
    label="Expected Behavior" required
    placeholder="What should happen"
    :model-value="modelValue.expectedBehavior"
    @update:model-value="update({ expectedBehavior: $event }, modelValue)"
  />
  <TemplateField
    label="Description"
    placeholder="Optional context"
    :model-value="modelValue.description"
    @update:model-value="update({ description: $event }, modelValue)"
  />
</template>
