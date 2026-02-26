<script setup lang="ts">
/**
 * AppLayout Web Component with Shadow DOM isolation
 * For SSR: full structure rendered by AppLayoutSSR.vue, wrapped in Declarative Shadow DOM
 * For client: this component hydrates existing DOM without re-rendering structure
 */
</script>

<template>
  <slot />
</template>
