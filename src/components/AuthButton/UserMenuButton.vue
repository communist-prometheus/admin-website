<script setup lang="ts">
import type { User } from '@/types/user'

defineProps<{ user: User }>()
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    type="button"
    class="user-btn flex-center"
    @click.stop="emit('click')"
  >
    <img
      :src="user.avatar"
      alt=""
      aria-hidden="true"
      class="avatar avatar-sm"
      width="32"
      height="32"
    />
    <span class="user-name">{{ user.name || user.username }}</span>
  </button>
</template>

<style scoped>
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

.avatar {
  border-radius: 50%;
}
</style>
