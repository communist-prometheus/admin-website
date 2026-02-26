<script setup lang="ts">
import type { Component } from 'vue'
import WelcomeContent from './components/WelcomeContent/WelcomeContent.vue'
import WelcomeIcon from './components/WelcomeIcon/WelcomeIcon.vue'

defineProps<{
  icon: Component
  heading: string
  text: string
  linkHref: string
  linkText: string
  iconLabel?: string
}>()
</script>

<template>
  <div class="welcome-item">
    <WelcomeIcon
      :icon="icon"
      :aria-label="iconLabel || heading"
    />
    <WelcomeContent
      :heading="heading"
      :text="text"
      :link-href="linkHref"
      :link-text="linkText"
    />
  </div>
</template>

<style scoped>
.welcome-item {
  margin-top: var(--space-xl);
  display: flex;
  position: relative;
}
</style>
