<script setup lang="ts">
import type { OrgInvitation } from './roles-api'

defineProps<{
  readonly invite: OrgInvitation
  readonly disabled: boolean
}>()

defineEmits<{ revoke: [id: number] }>()

const label = (i: OrgInvitation): string =>
  i.login ? `@${i.login}` : (i.email ?? `invite-${i.id}`)
</script>

<template>
  <li
    class="invite-row"
    :data-testid="`invite-row-${invite.id}`"
    :data-role="invite.role"
  >
    <span class="who">{{ label(invite) }}</span>
    <span class="role-badge">{{ invite.role }}</span>
    <span class="pending-badge">Pending</span>
    <button
      type="button"
      class="revoke"
      :disabled="disabled"
      :data-testid="`invite-revoke-${invite.id}`"
      @click="$emit('revoke', invite.id)"
    >
      Revoke
    </button>
  </li>
</template>

<style scoped>
.invite-row {
  display: grid;
  grid-template-columns: 1fr auto auto auto;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-sm);
  margin-bottom: 0.375rem;
  background: var(--color-background-soft);
}

.who {
  font-family: var(--font-mono, monospace);
  font-size: 0.9rem;
}

.role-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--color-background);
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  text-transform: capitalize;
}

.pending-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--color-accent-soft, #fff7e0);
  color: var(--color-accent-strong, #8a6d00);
  font-size: 0.7rem;
}

.revoke {
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
}

.revoke:disabled {
  opacity: 50%;
  cursor: not-allowed;
}

.revoke:hover:not(:disabled) {
  color: var(--color-error, #e53935);
  border-color: var(--color-error, #e53935);
}
</style>
