<script setup lang="ts">
import { ref } from 'vue'
import { ACCEPT_ATTR } from '../api/attachment-accept'
import type { TicketAttachment } from '../templates/attachment-types'
import AttachmentList from './AttachmentList.vue'
import { filesFromDrop, filesFromPaste } from './attachment-pipeline'
import DropZone from './DropZone.vue'

defineProps<{
  readonly attachments: readonly TicketAttachment[]
  readonly uploading: boolean
}>()

const emit = defineEmits<{
  upload: [files: readonly File[]]
  remove: [id: string]
}>()

const fileInput = ref<HTMLInputElement>()
const dragActive = ref(false)

const onDrop = (e: DragEvent): void => {
  dragActive.value = false
  const files = filesFromDrop(e)
  if (files.length > 0) emit('upload', files)
}

const onPaste = (e: ClipboardEvent): void => {
  const files = filesFromPaste(e)
  if (files.length > 0) emit('upload', files)
}

const onPickerChange = (e: Event): void => {
  const input = e.target as HTMLInputElement
  const files = input.files === null ? [] : Array.from(input.files)
  if (files.length > 0) emit('upload', files)
  input.value = ''
}

const openPicker = (): void => {
  fileInput.value?.click()
}

const setDragActive = (next: boolean): void => {
  dragActive.value = next
}
</script>

<template>
  <section class="attachments" data-testid="ticket-attachments">
    <DropZone
      :active="dragActive"
      :uploading="uploading"
      @click="openPicker"
      @drag-over="setDragActive"
      @drop="onDrop"
      @paste="onPaste"
    />
    <input
      ref="fileInput"
      type="file"
      multiple
      :accept="ACCEPT_ATTR"
      class="hidden-input"
      data-testid="ticket-attachment-input"
      @change="onPickerChange"
    />
    <AttachmentList
      :items="attachments"
      @remove="emit('remove', $event)"
    />
  </section>
</template>

<style scoped>
.attachments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hidden-input {
  display: none;
}
</style>
