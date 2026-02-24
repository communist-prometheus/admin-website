<script setup lang="ts">
import type { User } from '@/types/user'
import UserActions from './components/UserActions/UserActions.vue'
import UserCard from './components/UserCard/UserCard.vue'

defineProps<{ user: User }>()
const emit = defineEmits<{ logout: []; close: [] }>()
</script>

<template>
  <UserCard :user="user" />
  <p>You are logged in. You can now access all features.</p>
  <UserActions
    @logout="emit('logout')"
    @close="emit('close')"
  />
</template>

<style scoped>
:host {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
</style>
