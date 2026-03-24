<script setup lang="ts">
import { useSlots } from 'vue'
import AppFooter from './AppFooter.vue'
import AppHeader from './AppHeader.vue'
import AppMain from './AppMain.vue'
import AuthButton from './AuthButton.vue'

const slots = useSlots()
</script>

<template>
  <AppHeader>
    <AuthButton />
  </AppHeader>

  <AppMain>
    <slot />
  </AppMain>

  <AppFooter>
    <slot v-if="slots.footer" name="footer" />
    <span v-else>
      © {{ new Date().getFullYear() }} Admin Panel. All rights reserved.
    </span>
  </AppFooter>
</template>
