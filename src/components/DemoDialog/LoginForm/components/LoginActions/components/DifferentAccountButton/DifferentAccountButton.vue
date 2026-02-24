<script setup lang="ts">
defineProps<{ loading: boolean }>()
const emit = defineEmits<{ differentAccount: [] }>()
</script>

<template>
  <button
    type="button"
    :disabled="loading"
    class="btn btn-full"
    @click="emit('differentAccount')"
  >
    Login with different account
  </button>
</template>

<style scoped>
.btn-full {
  width: 100%;
}
</style>
