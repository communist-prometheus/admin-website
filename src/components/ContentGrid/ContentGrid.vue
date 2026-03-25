<template>
  <section class="content-grid">
    <slot />
  </section>
</template>

<style scoped>
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
  gap: clamp(0.75rem, 2vw, 1rem);
  margin-top: clamp(1.5rem, 4vw, 2rem);
  width: 100%;
}
</style>
