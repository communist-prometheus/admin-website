<script setup lang="ts">
import { ref } from 'vue'
import type { ContentType, Language } from '@/types/content'
import DialogForm from './DialogForm.vue'

defineProps<{
  readonly show: boolean
  readonly contentType: ContentType
}>()

const emit = defineEmits<{
  close: []
  create: [data: CreateContentData]
}>()

export interface CreateContentData {
  readonly slug: string
  readonly lang: Language
  readonly title: string
  readonly description?: string
  readonly category?: string
  readonly order?: number
}

const formRef = ref<InstanceType<typeof DialogForm>>()

const handleSubmit = (data: CreateContentData) => {
  emit('create', data)
}

const handleClose = () => {
  formRef.value?.reset()
  emit('close')
}
</script>

<template>
  <dialog
    v-if="show"
    open
    class="create-dialog"
    @click.self="handleClose"
  >
    <span class="dialog-title">Create New {{ contentType }}</span>
    <button
      type="button"
      class="close-btn"
      @click="handleClose"
    >
      ×
    </button>
    <DialogForm
      ref="formRef"
      :content-type="contentType"
      @submit="handleSubmit"
    />
    <button
      type="button"
      class="btn btn-secondary"
      @click="handleClose"
    >
      Cancel
    </button>
  </dialog>
</template>

<style scoped>
.create-dialog {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
  border: none;
  border-radius: var(--radius-lg);
  padding: clamp(1rem, 2vw, 1.5rem);
  max-width: clamp(400px, 90vw, 600px);
  width: 100%;
  box-shadow: 0 10px 40px rgb(0 0 0 / 20%);

  &::backdrop {
    background: rgb(0 0 0 / 50%);
  }
}

.field-label {
  display: block;
  margin-bottom: clamp(0.375rem, 1vw, 0.5rem);
  font-weight: 500;
  font-size: clamp(0.875rem, 2vw, 1rem);
}

.field-input {
  display: block;
  width: 100%;
  padding: clamp(0.5rem, 1.5vw, 0.75rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-family: inherit;
  background: var(--color-background);
}

.field-input[rows] {
  resize: vertical;
  min-height: 80px;
}

.field-input:focus {
  outline: none;
  border-color: var(--color-heading);
}

.radio-input {
  display: none;
}

.radio-label {
  display: block;
  padding: clamp(0.5rem, 1vw, 0.75rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: clamp(0.875rem, 2vw, 1rem);

  &:hover {
    background: var(--color-background-soft);
  }
}

.radio-input:checked + .radio-label {
  background: var(--color-heading);
  color: var(--color-background);
  border-color: var(--color-heading);
}

.btn {
  padding: clamp(0.5rem, 1.5vw, 0.75rem) clamp(1rem, 2vw, 1.5rem);
  border: none;
  border-radius: var(--radius-sm);
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--color-heading);
  color: var(--color-background);

  &:hover {
    opacity: 90%;
  }
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--color-border);

  &:hover {
    background: var(--color-background-soft);
  }
}

.dialog-title {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 600;
  text-transform: capitalize;
  border-bottom: 1px solid var(--color-border);
  margin: calc(-1 * clamp(1rem, 2vw, 1.5rem)) calc(-1 * clamp(1rem, 2vw, 1.5rem)) 0;
  padding: clamp(1rem, 2vw, 1.5rem);
}

.close-btn {
  position: absolute;
  top: clamp(1rem, 2vw, 1.5rem);
  right: clamp(1rem, 2vw, 1.5rem);
  padding: clamp(0.25rem, 0.5vw, 0.5rem);
  border: none;
  background: transparent;
  font-size: clamp(1.5rem, 3vw, 2rem);
  line-height: 1;
  cursor: pointer;
  color: var(--color-text-secondary);
  transition: color 0.2s ease;

  &:hover {
    color: var(--color-text);
  }
}
</style>
