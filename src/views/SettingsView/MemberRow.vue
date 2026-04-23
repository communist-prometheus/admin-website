<script setup lang="ts">
import type { Role } from '@/types/role'
import MemberRoleSelect from './MemberRoleSelect.vue'
import type { MemberRow } from './merge-members'

defineProps<{
  readonly row: MemberRow
  readonly disabled: boolean
}>()

const emit = defineEmits<{
  change: [username: string, role: Role | undefined]
}>()

const onChange = (login: string) => (role: Role | undefined) =>
  emit('change', login, role)
</script>

<template>
  <li class="member-row" :data-testid="`member-row-${row.login}`">
    <span class="login">@{{ row.login }}</span>
    <span
      class="org-badge"
      :class="{ 'is-admin': row.orgRole === 'admin' }"
      :title="
        row.orgRole === 'admin'
          ? 'GitHub organisation admin'
          : 'GitHub organisation member'
      "
    >
      {{ row.orgRole === 'admin' ? 'Org admin' : 'Org member' }}
    </span>
    <MemberRoleSelect
      :value="row.appRole"
      :disabled="disabled"
      :ariaLabel="`Role for ${row.login}`"
      :testid="`role-select-${row.login}`"
      @change="onChange(row.login)($event)"
    />
  </li>
</template>

<style scoped>
.member-row {
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.25rem;
  border-bottom: 1px solid var(--color-border);
}

.member-row:last-child {
  border-bottom: none;
}

.login {
  font-family: var(--font-mono, monospace);
  font-size: 0.9rem;
}

.org-badge {
  padding: 0.125rem 0.5rem;
  border-radius: var(--radius-sm);
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  white-space: nowrap;
}

.org-badge.is-admin {
  background: var(--color-accent-soft, #fff7e0);
  color: var(--color-accent-strong, #8a6d00);
}
</style>
