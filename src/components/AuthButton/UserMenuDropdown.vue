<script setup lang="ts">
const emit = defineEmits<{ logout: []; differentAccount: [] }>()
</script>

<template>
  <nav class="dropdown">
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
.dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-xs);
  background: var(--color-background);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--border-radius-sm);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: var(--space-sm) var(--space-md);
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  font-size: var(--font-size-sm);
}

.dropdown-item:hover {
  background: var(--color-background-soft);
}

.dropdown-item-danger {
  color: var(--color-danger);
}
</style>
