<script setup lang="ts">
import type { TicketAttachment } from '../templates/attachment-types'
import type { TicketTemplate } from '../templates/types'
import AttachmentField from './AttachmentField.vue'
import TemplateFieldsSwitch from './TemplateFieldsSwitch.vue'
import TemplateSelector from './TemplateSelector.vue'
import TitleAndTargetFields from './TitleAndTargetFields.vue'

defineProps<{
  readonly title: string
  readonly target: 'public-website' | 'admin'
  readonly template: TicketTemplate
  readonly attachments: readonly TicketAttachment[]
  readonly uploading: boolean
  readonly missing: readonly string[]
}>()

defineEmits<{
  'update:title': [v: string]
  'update:target': [v: 'public-website' | 'admin']
  'update:template': [t: TicketTemplate]
  'change-kind': [k: TicketTemplate['kind']]
  upload: [files: readonly File[]]
  'remove-attachment': [id: string]
  submit: []
}>()
</script>

<template>
  <form class="create-form" @submit.prevent="$emit('submit')">
    <TitleAndTargetFields
      :title="title"
      :target="target"
      @update:title="$emit('update:title', $event)"
      @update:target="$emit('update:target', $event)"
    />
    <TemplateSelector
      :model-value="template.kind"
      @update:model-value="$emit('change-kind', $event)"
    />
    <TemplateFieldsSwitch
      :model-value="template"
      @update:model-value="$emit('update:template', $event)"
    />
    <AttachmentField
      :attachments="attachments"
      :uploading="uploading"
      @upload="$emit('upload', $event)"
      @remove="$emit('remove-attachment', $event)"
    />
    <p v-if="missing.length > 0" class="errors" data-testid="ticket-errors">
      Required: {{ missing.join(', ') }}
    </p>
    <button type="submit" class="submit-btn" data-testid="ticket-submit">
      Create Ticket
    </button>
  </form>
</template>

<style scoped>
.create-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.submit-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  align-self: flex-start;
}

.errors {
  color: var(--color-danger, #d73a4a);
  font-size: 0.8125rem;
  margin: 0;
}
</style>
