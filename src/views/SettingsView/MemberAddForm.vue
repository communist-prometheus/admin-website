<script setup lang="ts">
import { ref } from 'vue'
import type { Role } from '@/types/role'

defineProps<{ readonly disabled: boolean }>()
const emit = defineEmits<{ add: [username: string, role: Role] }>()

const username = ref('')
const selectedRole = ref<Role>('editor')

const handleAdd = () => {
  const trimmed = username.value.trim()
  if (!trimmed) return
  emit('add', trimmed, selectedRole.value)
  username.value = ''
}
</script>

<template>
  <input
    v-model="username" type="text" :disabled="disabled"
    placeholder="GitHub username" class="input"
    @keydown.enter="handleAdd"
  />
  <select v-model="selectedRole" :disabled="disabled" class="input">
    <option value="editor">Editor</option>
    <option value="chief-editor">Chief Editor</option>
    <option value="admin">Admin</option>
  </select>
  <button type="button" class="btn-add" :disabled="disabled" @click="handleAdd">
    Add
  </button>
</template>

<style scoped>
.input {
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
}

.btn-add {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: var(--radius-sm);
  background: var(--color-accent);
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
}
</style>
