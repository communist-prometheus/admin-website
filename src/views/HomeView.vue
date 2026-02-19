<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import AppLayout from '../components/AppLayout.vue'
import AuthButton from '../components/AuthButton.vue'
</script>

<template>
  <AppLayout>
    <template #header-actions>
      <AuthButton />
    </template>

    <TheWelcome />
  </AppLayout>
</template>
