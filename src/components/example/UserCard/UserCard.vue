<script setup lang="ts">
import UserAvatar from './components/UserAvatar/UserAvatar.vue'
import UserInfo from './components/UserInfo/UserInfo.vue'
import type { User } from './userCard.types'

interface Props {
  user: User
}

defineProps<Props>()
</script>

<template>
  <article class="user-card">
    <UserAvatar :src="user.avatar" :alt="user.name" />
    <UserInfo :name="user.name" :email="user.email" />
  </article>
</template>

<style scoped>
:host {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}
</style>
