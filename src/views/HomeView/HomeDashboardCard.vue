<script setup lang="ts">
import ContentCard from '@/components/ContentCard/ContentCard.vue'
import ContentCardDescription from '@/components/ContentCard/ContentCardDescription.vue'
import ContentCardTitle from '@/components/ContentCard/ContentCardTitle.vue'

defineProps<{
  readonly title: string
  readonly description: string
}>()
</script>

<template>
  <ContentCard>
    <ContentCardTitle :title="title" />
    <ContentCardDescription :description="description" />
  </ContentCard>
</template>
