<script setup lang="ts">
import type { User } from '@/types/user'
import UserMenuButton from './UserMenuButton.vue'
import UserMenuDropdown from './UserMenuDropdown.vue'

defineProps<{ user: User; show: boolean }>()
const emit = defineEmits<{ logout: []; differentAccount: []; toggle: [] }>()
</script>

<template>
  <nav class="auth-dropdown">
    <UserMenuButton
      :user="user"
      @click="emit('toggle')"
    />
    <UserMenuDropdown
      v-if="show"
      @logout="emit('logout')"
      @different-account="emit('differentAccount')"
    />
  </nav>
</template>

<style scoped>
.auth-dropdown {
  position: relative;
}
</style>
