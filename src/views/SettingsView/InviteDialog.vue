<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  usernameGuess as guessFor,
  isEmailLookupMiss as isMiss,
} from './invite-error'
import {
  type InvitePayload,
  type InviteRole,
  inviteHandlers,
} from './invite-handlers'

const props = defineProps<{
  readonly open: boolean
  readonly busy: boolean
  readonly error?: string
}>()
const emit = defineEmits<{
  submit: [payload: InvitePayload]
  cancel: []
}>()

const identifier = ref('')
const role = ref<InviteRole>('editor')
const localError = ref<string | undefined>(undefined)
const shownError = computed(() => localError.value ?? props.error)
const isEmailLookupMiss = computed(() => isMiss(shownError.value))
const usernameGuess = computed(() => guessFor(identifier.value))

const { onSubmit, onTryAsUsername, onCancel } = inviteHandlers(
  { identifier, role, localError },
  (event, payload) =>
    event === 'submit' && payload ? emit('submit', payload) : emit('cancel'),
)
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
      <p
        v-if="shownError"
        class="error-hint"
        data-testid="invite-error"
      >
        {{ shownError }}
      </p>
      <p
        v-if="isEmailLookupMiss && usernameGuess !== ''"
        class="hint"
      >
        If
        <code>{{ usernameGuess }}</code>
        is their GitHub username:
        <button
          type="button"
          class="link-btn"
          :disabled="busy"
          data-testid="invite-try-username"
          @click="onTryAsUsername(usernameGuess)"
        >
          send invite as @{{ usernameGuess }}
        </button>
      </p>
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

.hint {
  margin: 0;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.hint code {
  background: var(--color-background-soft);
  padding: 0 0.25em;
  border-radius: 0.2em;
  font-family: var(--font-mono, monospace);
}

.link-btn {
  background: none;
  border: none;
  padding: 0;
  color: var(--color-accent);
  cursor: pointer;
  font-size: inherit;
  text-decoration: underline;
}

.link-btn:disabled {
  opacity: 50%;
  cursor: not-allowed;
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
