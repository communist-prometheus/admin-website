<script setup lang="ts">
import LoginActions from './components/LoginActions/LoginActions.vue'
import LoginHeader from './components/LoginHeader/LoginHeader.vue'

defineProps<{ loading: boolean }>()
const emit = defineEmits<{ login: []; differentAccount: []; close: [] }>()
</script>

<template>
  <LoginHeader />
  <LoginActions
    :loading="loading"
    @login="emit('login')"
    @different-account="emit('differentAccount')"
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
