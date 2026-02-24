<script setup lang="ts">
import type { User } from '@/types/user'

defineProps<{ user: User; show: boolean }>()
const emit = defineEmits<{ logout: []; differentAccount: []; toggle: [] }>()
</script>

<template>
  <button
    type="button"
    class="user-btn flex-center"
    @click.stop="emit('toggle')"
  >
    <img
      :src="user.avatar"
      :alt="user.username"
      class="avatar avatar-sm"
    />
    <span class="user-name">{{ user.name || user.username }}</span>
  </button>
  <nav
    v-if="show"
    class="dropdown"
  >
    <button
      type="button"
      class="dropdown-item"
      @click="emit('differentAccount')"
    >
      Login with different account
    </button>
    <button
      type="button"
      class="dropdown-item dropdown-item-danger"
      @click="emit('logout')"
    >
      Logout
    </button>
  </nav>
</template>

<style scoped>
:host {
  position: relative;
}

.user-btn {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius-sm);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.user-name {
  font-weight: var(--font-weight-medium);
}
</style>
