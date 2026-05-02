<script setup lang="ts"></script>

<template>
  <main class="app-main">
    <slot />
  </main>
</template>

<style scoped>
.app-main {
  display: flex;
  flex-direction: column;
  min-width: 0;

  /*
   * Cap the wide-screen content width so cards, lists and forms
   * stop running the full width of a 27" or ultrawide monitor.
   * Per-view inner containers still impose tighter caps where
   * single-column reading or narrow forms are appropriate
   * (Settings 800px, conflicts 720px, etc).
   */
  max-width: var(--content-wide);
  width: 100%;
  margin-inline: auto;
  color: var(--color-text);
}
</style>
