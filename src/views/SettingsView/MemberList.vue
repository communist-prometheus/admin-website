<script setup lang="ts">
import type { Role } from '@/types/role'
import MemberRow from './MemberRow.vue'
import type { MemberRow as Row } from './merge-members'

defineProps<{
  readonly rows: readonly Row[]
  readonly disabled: boolean
}>()

defineEmits<{
  change: [username: string, role: Role | undefined]
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
