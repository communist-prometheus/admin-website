<script setup lang="ts">
defineProps<{ loading: boolean }>()
const emit = defineEmits<{ login: [] }>()
</script>

<template>
  <button
    type="button"
    :disabled="loading"
    class="btn btn-full"
    @click="emit('login')"
  >
    {{ loading ? 'Loading...' : 'Sign in with GitHub' }}
  </button>
</template>

<style scoped>
.btn-full {
  width: 100%;
}
</style>
