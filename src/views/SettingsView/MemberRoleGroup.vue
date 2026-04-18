<script setup lang="ts">
import type { Role } from '@/types/role'

defineProps<{
  readonly role: Role
  readonly members: readonly string[]
  readonly saving: boolean
}>()

defineEmits<{ remove: [username: string] }>()

const label = (role: Role) =>
  ({ editor: 'Editors', 'chief-editor': 'Chief Editors', admin: 'Admins' })[role]
</script>

<template>
  <fieldset class="role-group" :disabled="saving">
    <legend>{{ label(role) }}</legend>
    <p v-if="members.length === 0" class="empty">No members</p>
    <MemberChip
      v-for="user in members"
      :key="user"
      :username="user"
      @remove="$emit('remove', user)"
    />
  </fieldset>
</template>

<style scoped>
.role-group {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  margin: 0 0 0.5rem;
}

legend {
  font-weight: 600;
  font-size: 0.875rem;
  padding: 0 0.25rem;
}

.empty {
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  margin: 0;
}
</style>
