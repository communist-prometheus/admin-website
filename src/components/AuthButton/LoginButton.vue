<script setup lang="ts">
/**
 * Login button component
 */
const props = defineProps<{
  loading?: boolean
}>()

const emit = defineEmits<{
  click: []
}>()
</script>

<template>
  <button
    type="button"
    class="btn btn-primary"
    :disabled="loading"
    @click="emit('click')"
  >
    {{ loading ? 'Loading...' : 'Login' }}
  </button>
</template>
