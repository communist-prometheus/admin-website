<script setup lang="ts">
defineProps<{
  avatar: string
  username: string
}>()
</script>

<template>
  <img
    :src="avatar"
    :alt="username"
    class="avatar"
  />
</template>

<style scoped>
.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}
</style>
