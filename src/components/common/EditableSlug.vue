<script setup lang="ts">
import { ref } from 'vue'
import { createSlugInputHandler } from '@/components/CreateContentDialog/slug-input'
import { validateSlug } from '@/utils/validate-slug'

const props = defineProps<{
  readonly slug: string
}>()

const emit = defineEmits<{
  rename: [newSlug: string]
}>()

const editing = ref(false)
const draft = ref('')
const error = ref<string | undefined>()
const submitted = ref(false)

const startEdit = () => {
  draft.value = props.slug
  error.value = undefined
  submitted.value = false
  editing.value = true
}

const cancel = () => {
  editing.value = false
  error.value = undefined
}

const confirm = () => {
  if (!editing.value) return
  const trimmed = draft.value.trim()
  if (trimmed === props.slug) { cancel(); return }
  const err = validateSlug(trimmed)
  if (err) { error.value = err; return }
  editing.value = false
  emit('rename', trimmed)
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') confirm()
  if (e.key === 'Escape') cancel()
}

const onSlugInput = createSlugInputHandler(draft)
</script>

<template>
  <h1
    v-if="!editing"
    data-testid="edit-title"
    class="slug-display"
    @click="startEdit"
  >
    {{ slug }}
  </h1>
  <span v-else class="slug-editor">
    <input
      :value="draft"
      data-testid="slug-input"
      class="slug-input"
      autocomplete="off"
      spellcheck="false"
      @input="onSlugInput"
      @keydown="onKeydown"
      @blur="confirm"
    />
    <span
      v-if="error"
      class="slug-error"
      data-testid="slug-error"
    >
      {{ error }}
    </span>
  </span>
</template>

<style scoped>
.slug-display {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  cursor: pointer;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
    text-decoration-style: dashed;
  }
}

.slug-editor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.slug-input {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: clamp(1.25rem, 3vw, 1.5rem);
  font-weight: 700;
  width: 16ch;
  max-width: 100%;
  box-sizing: border-box;
}

.slug-error {
  color: var(--color-error, #e53935);
  font-size: clamp(0.75rem, 1.5vw, 0.875rem);
}
</style>
