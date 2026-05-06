<script setup lang="ts">
import type { UserStoryTemplate } from '../templates/types'
import TemplateField from './TemplateField.vue'

defineProps<{ readonly modelValue: UserStoryTemplate }>()
const emit = defineEmits<{ 'update:modelValue': [t: UserStoryTemplate] }>()

const update = (
  patch: Partial<UserStoryTemplate>,
  current: UserStoryTemplate
): void => {
  emit('update:modelValue', { ...current, ...patch })
}
</script>

<template>
  <TemplateField
    label="I as" required
    placeholder="…an editor"
    :rows="2"
    :model-value="modelValue.iAs"
    @update:model-value="update({ iAs: $event }, modelValue)"
  />
  <TemplateField
    label="Want to" required
    placeholder="…upload images by drag-drop"
    :rows="2"
    :model-value="modelValue.wantTo"
    @update:model-value="update({ wantTo: $event }, modelValue)"
  />
  <TemplateField
    label="So that" required
    placeholder="…I don't have to leave the editor to attach a screenshot"
    :rows="2"
    :model-value="modelValue.soThat"
    @update:model-value="update({ soThat: $event }, modelValue)"
  />
  <TemplateField
    label="Description"
    placeholder="Optional context"
    :model-value="modelValue.description"
    @update:model-value="update({ description: $event }, modelValue)"
  />
</template>
