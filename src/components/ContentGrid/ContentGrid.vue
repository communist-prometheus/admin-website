<template>
  <slot />
</template>

<style scoped>
:host {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
}
</style>
