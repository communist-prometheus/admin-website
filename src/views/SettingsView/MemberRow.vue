<script setup lang="ts">
import MemberRoleSelect from './MemberRoleSelect.vue'
import type { OrgMember } from './roles-api'

defineProps<{
  readonly row: OrgMember
  readonly disabled: boolean
}>()

const emit = defineEmits<{
  change: [
    username: string,
    role: 'admin' | 'chief-editor' | 'editor' | 'none',
  ]
}>()

const onChange =
  (login: string) =>
  (role: 'admin' | 'chief-editor' | 'editor' | undefined) =>
    emit('change', login, role ?? 'none')
</script>

<template>
  <li class="member-row" :data-testid="`member-row-${row.login}`">
    <img
      class="avatar"
      alt=""
      :src="row.avatarUrl ?? `https://github.com/${row.login}.png?size=40`"
      :aria-label="`@${row.login}`"
      loading="lazy"
      width="32"
      height="32"
    />
    <div class="ident">
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
    </div>
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
  grid-template-columns: 32px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.member-row:last-child {
  border-bottom: none;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid var(--color-border);
}

.ident {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.login {
  font-family: var(--font-mono, monospace);
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.org-badge {
  align-self: start;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  background: var(--color-background-soft);
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  white-space: nowrap;
}

.org-badge.is-admin {
  background: var(--color-accent-soft, #fff7e0);
  color: var(--color-accent-strong, #8a6d00);
}
</style>
