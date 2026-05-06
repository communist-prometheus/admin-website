<script setup lang="ts">
import type { TicketTemplateKind } from '../templates/types'
import TemplateOption from './TemplateOption.vue'

defineProps<{ readonly modelValue: TicketTemplateKind }>()
defineEmits<{ 'update:modelValue': [k: TicketTemplateKind] }>()
</script>

<template>
  <fieldset class="template-selector">
    <legend>Template</legend>
    <TemplateOption
      value="bug" label="Bug"
      :checked="modelValue === 'bug'"
      @select="$emit('update:modelValue', $event)"
    />
    <TemplateOption
      value="user-story" label="User Story"
      :checked="modelValue === 'user-story'"
      @select="$emit('update:modelValue', $event)"
    />
  </fieldset>
</template>

<style scoped>
.template-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.375rem 0.75rem;
}

legend {
  padding: 0 0.25rem;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}
</style>
