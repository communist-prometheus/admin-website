<script setup lang="ts">
/**
 * Login button / auth skeleton component.
 * When loading, renders same dimensions as UserMenuButton.
 */
defineProps<{ loading?: boolean }>()
const emit = defineEmits<{ click: [] }>()
</script>

<template>
  <button
    v-if="!loading"
    type="button"
    class="btn btn-primary"
    @click="emit('click')"
  >
    Login
  </button>
  <span
    v-else
    class="user-btn flex-center"
    aria-busy="true"
  >
    <span class="avatar-skeleton" />
    <span class="name-skeleton" />
  </span>
</template>

<style scoped>
.user-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--border-radius-sm);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background);
  font-size: var(--font-size-sm);
}

.avatar-skeleton,
.name-skeleton {
  display: block;
  border-radius: var(--radius-sm);
  background: var(--color-background-mute);
  animation: pulse 1.5s ease-in-out infinite;
}

.avatar-skeleton {
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.name-skeleton {
  width: 80px;
  height: 1em;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 100%;
  }

  50% {
    opacity: 40%;
  }
}
</style>
