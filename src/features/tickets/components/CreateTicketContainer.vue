<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { uploadBatch } from './attachment-pipeline'
import CreateTicketForm from './CreateTicketForm.vue'
import { submitTicket } from './submit-ticket'
import { useCreateForm } from './use-create-form'

const emit = defineEmits<{ created: []; error: [msg: string] }>()
const auth = useAuthStore()
const f = useCreateForm()
const missing = ref<readonly string[]>([])

const onUpload = async (files: readonly File[]): Promise<void> => {
  if (!auth.user) return
  f.uploading.value = true
  const added = await uploadBatch({
    token: auth.user.accessToken,
    files,
    onError: msg => emit('error', msg),
  })
  f.attachments.value = [...f.attachments.value, ...added]
  f.uploading.value = false
}

const setTitle = (v: string): void => {
  f.title.value = v
}
const setTarget = (v: 'public-website' | 'admin'): void => {
  f.target.value = v
}
const setTemplate = (v: typeof f.template.value): void => {
  f.template.value = v
}

const onSubmit = async (): Promise<void> => {
  if (!auth.user || f.titleTrimmed.value.length === 0) return
  const result = await submitTicket({
    token: auth.user.accessToken,
    title: f.titleTrimmed.value,
    template: f.template.value,
    labels: f.labels.value,
    attachments: f.attachments.value,
  })
  if (result.kind === 'invalid') missing.value = result.missing
  else if (result.kind === 'error') emit('error', result.message)
  else {
    f.reset()
    missing.value = []
    emit('created')
  }
}
</script>

<template>
  <CreateTicketForm
    :title="f.title.value"
    :target="f.target.value"
    :template="f.template.value"
    :attachments="f.attachments.value"
    :uploading="f.uploading.value"
    :missing="missing"
    @update:title="setTitle"
    @update:target="setTarget"
    @update:template="setTemplate"
    @change-kind="f.setKind"
    @upload="onUpload"
    @remove-attachment="f.removeAttachment"
    @submit="onSubmit"
  />
</template>
