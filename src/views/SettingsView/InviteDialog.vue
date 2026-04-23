<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ readonly open: boolean; readonly busy: boolean }>()
const emit = defineEmits<{
  submit: [payload: {
    readonly email?: string
    readonly login?: string
    readonly role: 'admin' | 'chief-editor' | 'editor'
  }]
  cancel: []
}>()

const identifier = ref('')
const role = ref<'admin' | 'chief-editor' | 'editor'>('editor')
const error = ref<string | undefined>(undefined)

const reset = () => {
  identifier.value = ''
  role.value = 'editor'
  error.value = undefined
}

const onSubmit = () => {
  const v = identifier.value.trim()
  if (v === '') {
    error.value = 'Enter a GitHub login or email'
    return
  }
  const looksLikeEmail = v.includes('@')
  emit('submit', looksLikeEmail ? { email: v, role: role.value } : { login: v, role: role.value })
}

const onCancel = () => {
  reset()
  emit('cancel')
}

void props
</script>

<template>
  <section
    v-if="open"
    class="dialog-overlay"
    data-testid="invite-dialog"
    role="alertdialog"
    aria-labelledby="invite-dialog-title"
  >
    <form class="dialog-card" @submit.prevent="onSubmit">
      <h3 id="invite-dialog-title">Invite to organisation</h3>
      <label class="field">
        <span>GitHub login or email</span>
        <input
          v-model="identifier"
          type="text"
          class="input"
          autocomplete="off"
          data-testid="invite-identifier"
          :disabled="busy"
        />
      </label>
      <label class="field">
        <span>Role</span>
        <select
          v-model="role"
          class="input"
          data-testid="invite-role"
          :disabled="busy"
        >
          <option value="editor">Editor</option>
          <option value="chief-editor">Chief Editor</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <p v-if="error" class="error-hint">{{ error }}</p>
      <div class="actions">
        <button
          type="button"
          class="btn-cancel"
          :disabled="busy"
          data-testid="invite-cancel"
          @click="onCancel"
        >
          Cancel
        </button>
        <button
          type="submit"
          class="btn-submit"
          :disabled="busy"
          data-testid="invite-submit"
        >
          {{ busy ? 'Sending…' : 'Send invite' }}
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 50%);
  z-index: 1000;
  padding: 2rem;
}

.dialog-card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 1.25rem;
  min-width: 300px;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

h3 {
  font-size: 1rem;
  margin: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
}

.input {
  padding: 0.4rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
}

.error-hint {
  color: var(--color-error, #e53935);
  font-size: 0.8rem;
  margin: 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  cursor: pointer;
}

.btn-cancel {
  border: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-secondary);
}

.btn-submit {
  border: none;
  background: var(--color-accent);
  color: #fff;
}

.btn-submit:disabled,
.btn-cancel:disabled {
  opacity: 50%;
  cursor: not-allowed;
}
</style>
