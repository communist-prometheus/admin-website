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
/*
 * Members render as a responsive card grid: 1 column on phones,
 * 2 columns starting from tablet. Each row's own borders handle
 * the card frame so the parent doesn't need an outer border.
 */
.member-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

@media (width >= 720px) {
  .member-list {
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  }
}
</style>
