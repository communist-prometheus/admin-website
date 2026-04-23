<script setup lang="ts">
import MemberRow from './MemberRow.vue'
import type { OrgMember } from './roles-api'

defineProps<{
  readonly rows: readonly OrgMember[]
  readonly disabled: boolean
}>()

defineEmits<{
  change: [
    username: string,
    role: 'admin' | 'chief-editor' | 'editor' | 'none',
  ]
}>()
</script>

<template>
  <ul class="member-list" data-testid="members-list">
    <MemberRow
      v-for="r in rows"
      :key="r.login"
      :row="r"
      :disabled="disabled"
      @change="(u, role) => $emit('change', u, role)"
    />
  </ul>
</template>

<style scoped>
.member-list {
  list-style: none;
  padding: 0;
  margin: 0;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
</style>
