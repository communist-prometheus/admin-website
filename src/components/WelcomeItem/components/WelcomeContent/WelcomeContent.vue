<script setup lang="ts">
defineProps<{
  heading: string
  text: string
  linkHref: string
  linkText: string
}>()
</script>

<template>
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
</template>

<style scoped>
:host {
  flex: 1;
  margin-left: var(--space-md);
}

h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
  color: var(--color-heading);
}

.link {
  color: var(--color-link);
  text-decoration: none;
}
</style>
