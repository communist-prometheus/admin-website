<script setup lang="ts">
import ContentGrid from '@/components/ContentGrid/ContentGrid.vue'
import HomeDashboardCard from './HomeDashboardCard.vue'
</script>

<template>
  <ContentGrid>
    <HomeDashboardCard title="Blog Posts" description="Create and edit blog articles" />
    <HomeDashboardCard title="Pages" description="Manage static pages" />
    <HomeDashboardCard title="Positions" description="Update job openings" />
    <HomeDashboardCard title="Common" description="Shared labels and navigation translations" />
  </ContentGrid>
</template>
