<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'
import type { LabelEntry } from '@/stores/labels'
import type { ContentType, Language } from '@/types/content'
import { useCreateForm } from './form-state'
import {
  buildCreateData,
  type CreateContentData,
  isFormValid,
} from './helpers'
import { createSlugInputHandler } from './slug-input'

const props = defineProps<{
  readonly show: boolean
  readonly contentType: ContentType
  readonly lang: Language
  readonly labels?: readonly LabelEntry[]
  readonly submitting?: boolean
}>()

const emit = defineEmits<{
  close: []
  create: [data: CreateContentData]
}>()

const dialogRef = useTemplateRef<HTMLDialogElement>('dialogRef')
const { refs, snapshot } = useCreateForm(() => props.lang)
const { slug, title, description, category, reset } = refs
const onSlugInput = createSlugInputHandler(slug)

// Parent closes via `:show` once the request lands; on failure the
// dialog stays open with the user's input intact for retry.
const handleCreate = () => {
  if (!isFormValid(snapshot())) return
  emit('create', buildCreateData(props.contentType, snapshot()))
}

const handleClose = () => {
  dialogRef.value?.close()
  emit('close')
}

watch(() => props.show, visible => {
  if (visible) { reset(); dialogRef.value?.showModal() }
  else dialogRef.value?.close()
})
</script>

<template>
  <dialog
    ref="dialogRef"
    class="create-dialog"
    @close="handleClose"
    @cancel.prevent="handleClose"
  >
    <span class="dialog-title">Create New {{ contentType }}</span>
    <button
      type="button"
      class="close-btn"
      @click="handleClose"
    >
      ×
    </button>
    <fieldset :disabled="submitting" class="field-group">
      <label for="slug" class="field-label">Slug *</label>
      <input
        id="slug"
        :value="slug"
        type="text"
        required
        placeholder="my-article-slug"
        autocomplete="off"
        spellcheck="false"
        class="field-input"
        @input="onSlugInput"
      />
      <label for="title" class="field-label">Title *</label>
      <input id="title" v-model="title" type="text" required placeholder="Article Title" class="field-input" />
      <template v-if="contentType === 'blog' || contentType === 'positions' || contentType === 'newspaper'">
        <label for="description" class="field-label">Description *</label>
        <textarea id="description" v-model="description" required placeholder="Brief description..." rows="3" class="field-input" />
      </template>
      <template v-if="contentType === 'blog'">
        <label for="category" class="field-label">Category *</label>
        <select id="category" v-model="category" required class="field-input">
          <option value="" disabled>Select category</option>
          <option v-for="label in labels" :key="label.key" :value="label.key">
            {{ label.translations[lang] ?? label.key }}
          </option>
        </select>
      </template>
    </fieldset>
    <button type="button" class="btn btn-secondary" :disabled="submitting" @click="handleClose">Cancel</button>
    <button
      type="button"
      class="btn btn-primary"
      :class="{ 'is-submitting': submitting }"
      :disabled="submitting"
      data-testid="create-submit"
      @click="handleCreate"
    >
      <span v-if="submitting">Creating…</span>
      <span v-else>Create</span>
    </button>
  </dialog>
</template>

<style scoped>
.create-dialog[open] {
  display: flex;
  flex-direction: column;
  gap: clamp(1rem, 2vw, 1.5rem);
  border: none;
  border-radius: var(--radius-lg);
  padding: clamp(1rem, 2vw, 1.5rem);
  max-width: clamp(400px, 90vw, 600px);
  width: 100%;
  margin: auto;
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

.btn:disabled {
  opacity: 60%;
  cursor: not-allowed;
}

.btn-primary.is-submitting {
  position: relative;
  padding-left: calc(clamp(1rem, 2vw, 1.5rem) + 1.25rem);
}

.btn-primary.is-submitting::before {
  content: '';
  position: absolute;
  left: clamp(0.75rem, 1.5vw, 1rem);
  top: 50%;
  width: 0.9rem;
  height: 0.9rem;
  margin-top: -0.45rem;
  border: 2px solid var(--color-background);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: clamp(0.5rem, 1.5vw, 0.75rem);
  border: 0;
  padding: 0;
  margin: 0;
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
