<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useRoleStore } from '@/stores/role'
import { getNavForRole } from './ContentNav/nav-by-role'

const route = useRoute()
const roleStore = useRoleStore()
const items = computed(() => getNavForRole(roleStore.role))
</script>

<template>
  <RouterLink
    v-for="item in items"
    :key="item.path"
    :to="item.path"
    :class="{ active: route.path.startsWith(item.path) }"
  >
    {{ item.label }}
  </RouterLink>
</template>
