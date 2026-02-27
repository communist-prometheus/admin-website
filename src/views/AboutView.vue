<script setup lang="ts">
import AppLayout from '@/components/AppLayout.vue'
import AuthButton from '@/components/AuthButton.vue'
</script>

<template>
  <AppLayout>
    <template #header-actions>
      <AuthButton />
    </template>
    
    <div class="about">
      <h1>This is an about page</h1>
    </div>
  </AppLayout>
</template>

<style scoped>
.about {
  padding: clamp(2rem, 5vw, 4rem);
}

.about h1 {
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--color-heading);
}
</style>
