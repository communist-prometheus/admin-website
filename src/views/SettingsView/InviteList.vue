<script setup lang="ts">
import InviteRow from './InviteRow.vue'
import type { OrgInvitation } from './roles-api'

defineProps<{
  readonly invitations: readonly OrgInvitation[]
  readonly disabled: boolean
}>()

defineEmits<{ revoke: [id: number] }>()
</script>

<template>
  <ul class="invite-list" data-testid="invites-list">
    <InviteRow
      v-for="i in invitations"
      :key="i.id"
      :invite="i"
      :disabled="disabled"
      @revoke="(id) => $emit('revoke', id)"
    />
  </ul>
</template>

<style scoped>
.invite-list {
  list-style: none;
  padding: 0;
  margin: 0 0 0.5rem;
}
</style>
