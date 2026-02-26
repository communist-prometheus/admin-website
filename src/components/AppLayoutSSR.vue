<script setup lang="ts">
/**
 * AppLayout SSR component - renders layout structure
 * app-layout custom element is in index.html as static wrapper for Declarative Shadow DOM
 */
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<template>
  <div class="app-layout">
    <header>
      <h1>Admin Panel</h1>
      <slot name="header-actions" />
    </header>

    <main>
      <slot />
    </main>

    <footer>
      <slot v-if="slots.footer" name="footer" />
      <template v-else>
        © {{ new Date().getFullYear() }} Admin Panel. All rights reserved.
      </template>
    </footer>
  </div>
</template>
