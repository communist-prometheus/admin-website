<script setup lang="ts">
import { ref } from 'vue'
import type { Lang } from '@/stores/comms'
import { canSubmitNewSubscriber } from './draft-ops'
import LangTogglePills from './LangTogglePills.vue'

const props = defineProps<{ readonly saving?: boolean }>()
const emit = defineEmits<{
  add: [email: string, langs: readonly Lang[]]
}>()

const email = ref('')
const langs = ref<readonly Lang[]>([])
const error = ref<string | undefined>(undefined)

const setLangs = (next: readonly Lang[]): void => {
  langs.value = next
}

const submit = async (): Promise<void> => {
  if (!canSubmitNewSubscriber(email.value, langs.value)) return
  error.value = undefined
  try {
    emit('add', email.value.trim(), langs.value)
    email.value = ''
    langs.value = []
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'Failed to add'
  }
}
</script>

<template>
  <form class="add-form" data-testid="add-subscriber-form" @submit.prevent="submit">
    <input
      v-model="email"
      type="email"
      class="email"
      placeholder="recipient@example.org"
      data-testid="add-subscriber-email"
      :disabled="saving"
    />
    <LangTogglePills :langs="langs" :disabled="saving" @change="setLangs" />
    <button
      type="submit"
      class="submit"
      data-testid="add-subscriber-submit"
      :disabled="saving || !canSubmitNewSubscriber(email, langs)"
    >
      {{ saving ? 'Adding…' : 'Add subscriber' }}
    </button>
    <p v-if="error" class="error" data-testid="add-subscriber-error">{{ error }}</p>
  </form>
</template>

<style scoped>
.add-form {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.6rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border);
}

.email {
  padding: 0.4rem 0.55rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background);
  color: var(--color-text);
  font-size: 0.875rem;
}

.submit {
  padding: 0.4rem 0.85rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-accent);
  background: var(--color-accent);
  color: var(--color-background);
  font-weight: 600;
  cursor: pointer;
}

.submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  grid-column: 1 / -1;
  margin: 0;
  color: var(--color-danger, #c0392b);
  font-size: 0.8125rem;
}
</style>
