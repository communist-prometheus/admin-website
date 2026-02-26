<script setup lang="ts">
import { useSlots } from 'vue'
import AppFooter from './AppFooter.vue'
import AppHeader from './AppHeader.vue'
import AppMain from './AppMain.vue'

const slots = useSlots()
</script>

<template>
  <AppHeader v-slot:actions>
    <slot name="header-actions" />
  </AppHeader>

  <AppMain>
    <slot />
  </AppMain>

  <AppFooter>
    <slot v-if="slots.footer" name="footer" />
    <span v-else>© {{ new Date().getFullYear() }} Admin Panel. All rights reserved.</span>
  </AppFooter>
</template>
