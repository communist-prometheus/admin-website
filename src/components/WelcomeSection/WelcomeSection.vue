<template>
  <section class="welcome-section">
    <slot />
  </section>
</template>

<style scoped>
.welcome-section {
  display: block;
  max-width: min(800px, 100% - 2rem);
  margin: 0 auto;
  padding: clamp(1rem, 4vw, 2rem) clamp(0.5rem, 2vw, 1rem);
}
</style>
