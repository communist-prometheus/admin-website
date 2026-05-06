<script setup lang="ts">
import type { TicketTemplateKind } from '../templates/types'

defineProps<{
  readonly value: TicketTemplateKind
  readonly label: string
  readonly checked: boolean
}>()
defineEmits<{ select: [k: TicketTemplateKind] }>()
</script>

<template>
  <label class="opt">
    <input
      type="radio"
      name="ticket-template"
      :value="value"
      :checked="checked"
      @change="$emit('select', value)"
    />
    {{ label }}
  </label>
</template>

<style scoped>
.opt {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}
</style>
