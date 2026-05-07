<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { uploadBatch } from './attachment-pipeline'
import CreateTicketForm from './CreateTicketForm.vue'
import { useCreateForm } from './use-create-form'
import { runTicketSubmit } from './use-ticket-submit'

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

const onSubmit = async (): Promise<void> => {
  if (!auth.user || f.titleTrimmed.value.length === 0) return
  await runTicketSubmit({
    token: auth.user.accessToken,
    form: f,
    missing,
    emitCreated: () => emit('created'),
    emitError: msg => emit('error', msg),
  })
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
    @update:title="(v: string) => (f.title.value = v)"
    @update:target="
      (v: 'public-website' | 'admin') => (f.target.value = v)
    "
    @update:template="(v: typeof f.template.value) => (f.template.value = v)"
    @change-kind="f.setKind"
    @upload="onUpload"
    @remove-attachment="f.removeAttachment"
    @submit="onSubmit"
  />
</template>
