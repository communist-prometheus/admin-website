<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <RouterLink
    to="/content/blog"
    :class="{ active: route.path.startsWith('/content/blog') }"
  >
    Blog
  </RouterLink>
  <RouterLink
    to="/content/positions"
    :class="{ active: route.path.startsWith('/content/positions') }"
  >
    Positions
  </RouterLink>
  <RouterLink
    to="/content/pages"
    :class="{ active: route.path.startsWith('/content/pages') }"
  >
    Pages
  </RouterLink>
  <RouterLink
    to="/content/common"
    :class="{ active: route.path.startsWith('/content/common') }"
  >
    Common
  </RouterLink>
  <RouterLink
    to="/settings"
    :class="{ active: route.path.startsWith('/settings') }"
  >
    Settings
  </RouterLink>
</template>
