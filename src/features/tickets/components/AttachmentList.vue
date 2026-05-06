<script setup lang="ts">
import type { TicketAttachment } from '../templates/attachment-types'
import AttachmentRow from './AttachmentRow.vue'

defineProps<{ readonly items: readonly TicketAttachment[] }>()
defineEmits<{ remove: [id: string] }>()
</script>

<template>
  <ul v-if="items.length > 0" class="att-list" data-testid="attachment-list">
    <AttachmentRow
      v-for="a in items" :key="a.id"
      :id="a.id" :name="a.name"
      @remove="$emit('remove', $event)"
    />
  </ul>
</template>

<style scoped>
.att-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
