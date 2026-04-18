<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  create: [title: string, body: string, labels: readonly string[]]
}>()

const title = ref('')
const body = ref('')
const target = ref('public-website')
const type = ref('bug')

const handleSubmit = () => {
  if (!title.value.trim()) return
  emit('create', title.value.trim(), body.value, [target.value, type.value])
  title.value = ''
  body.value = ''
}
</script>

<template>
  <input
    v-model="title" type="text"
    placeholder="Title" class="field"
  />
  <select v-model="target" class="field">
    <option value="public-website">Public Website</option>
    <option value="admin">Admin Panel</option>
  </select>
  <select v-model="type" class="field">
    <option value="bug">Bug</option>
    <option value="enhancement">Feature Request</option>
  </select>
  <textarea
    v-model="body"
    placeholder="Description (Markdown supported)"
    rows="4"
    class="field"
  />
  <button type="button" class="submit-btn" @click="handleSubmit">
    Create Ticket
  </button>
</template>

<style scoped>
.field {
  display: block;
  width: 100%;
  padding: 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
  font-family: inherit;
  box-sizing: border-box;
}

.field[rows] {
  resize: vertical;
}

.submit-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
}
</style>
