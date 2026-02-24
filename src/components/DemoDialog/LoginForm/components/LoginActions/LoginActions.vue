<script setup lang="ts">
import CancelButton from './components/CancelButton/CancelButton.vue'
import DifferentAccountButton from './components/DifferentAccountButton/DifferentAccountButton.vue'
import LoginButton from './components/LoginButton/LoginButton.vue'

defineProps<{ loading: boolean }>()
const emit = defineEmits<{
  login: []
  differentAccount: []
  close: []
}>()
</script>

<template>
  <CancelButton @close="emit('close')" />
  <LoginButton
    :loading="loading"
    @login="emit('login')"
  />
  <DifferentAccountButton
    :loading="loading"
    @different-account="emit('differentAccount')"
  />
</template>

<style scoped>
:host {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}
</style>
