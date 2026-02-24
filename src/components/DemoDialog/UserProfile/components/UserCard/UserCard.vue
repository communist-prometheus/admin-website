<script setup lang="ts">
import type { User } from '@/types/user'
import UserAvatar from './components/UserAvatar/UserAvatar.vue'
import UserInfo from './components/UserInfo/UserInfo.vue'

defineProps<{ user: User }>()
</script>

<template>
  <UserAvatar
    :avatar="user.avatar"
    :username="user.username"
  />
  <UserInfo
    :name="user.name"
    :username="user.username"
  />
</template>

<style scoped>
:host {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--color-background-soft);
  border-radius: var(--border-radius-sm);
}
</style>
