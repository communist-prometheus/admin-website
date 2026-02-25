<script setup lang="ts">
/**
 * AppLayout SSR wrapper - renders app-layout custom element
 * The transformDeclarativeShadowDOM transformer will wrap content in <template shadowrootmode="open">
 */
import { useSlots } from 'vue'

const slots = useSlots()
</script>

<template>
  <app-layout>
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
  </app-layout>
</template>
