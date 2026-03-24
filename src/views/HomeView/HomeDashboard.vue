<script setup lang="ts">
import DashboardDescription from '@/components/DashboardDescription/DashboardDescription.vue'
import DashboardHeading from '@/components/DashboardHeading/DashboardHeading.vue'
import DashboardSection from '@/components/DashboardSection/DashboardSection.vue'
import HomeDashboardGrid from './HomeDashboardGrid.vue'

defineProps<{
  readonly showGrid: boolean
}>()
</script>

<template>
  <DashboardSection>
    <DashboardHeading />
    <DashboardDescription />
    <HomeDashboardGrid v-if="showGrid" />
  </DashboardSection>
</template>
