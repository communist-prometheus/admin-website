<script setup lang="ts">
import { computed } from 'vue'
import { visibleGroups } from '@/components/NavShared/visible-groups'
import { useAuthStore } from '@/stores/auth'
import { useRoleStore } from '@/stores/role'
import DesktopNavGroup from './DesktopNavGroup.vue'

const roleStore = useRoleStore()
const auth = useAuthStore()

const groups = computed(() => visibleGroups(roleStore.role, auth.ssoRoles))
</script>

<template>
  <DesktopNavGroup
    v-for="group in groups"
    :key="group.title"
    :title="group.title"
    :items="group.items"
  />
</template>
