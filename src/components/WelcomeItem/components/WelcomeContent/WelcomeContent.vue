<script setup lang="ts">
defineProps<{
  heading: string
  text: string
  linkHref: string
  linkText: string
}>()
</script>

<template>
  <div class="welcome-content">
    <h3>{{ heading }}</h3>
    <p>{{ text }}</p>
    <a
      :href="linkHref"
      target="_blank"
      rel="noopener"
      class="link"
    >
      {{ linkText }}
    </a>
  </div>
</template>

<style scoped>
.welcome-content {
  flex: 1;
  margin-left: var(--space-md);
}

h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
  color: var(--color-heading);
}

p {
  color: var(--color-text);
  margin-bottom: var(--space-sm);
}

.link {
  color: var(--color-link);
  text-decoration: none;
}
</style>
