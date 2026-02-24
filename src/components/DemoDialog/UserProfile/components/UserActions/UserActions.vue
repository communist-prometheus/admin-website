<script setup lang="ts">
const emit = defineEmits<{
  logout: []
  close: []
}>()
</script>

<template>
  <button
    type="button"
    class="btn btn-danger"
    @click="emit('logout')"
  >
    Logout
  </button>
  <button
    type="button"
    class="btn btn-primary"
    @click="emit('close')"
  >
    Close
  </button>
</template>

<style scoped>
:host {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
}
</style>
