<script setup lang="ts">
defineProps<{ readonly admins: readonly string[] }>()
</script>

<template>
  <ul class="org-admins-list">
    <li v-for="login in admins" :key="login">
      @{{ login }}
    </li>
  </ul>
</template>

<style scoped>
.org-admins-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

li {
  padding: 0.25rem 0.5rem;
  background: var(--color-background-soft);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono, monospace);
}
</style>
