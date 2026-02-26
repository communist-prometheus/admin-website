<script setup lang="ts">
import ContentCard from '@/components/ContentCard/ContentCard.vue'
import ContentCardDescription from '@/components/ContentCard/ContentCardDescription.vue'
import ContentCardTitle from '@/components/ContentCard/ContentCardTitle.vue'
import ContentGrid from '@/components/ContentGrid/ContentGrid.vue'
import DashboardDescription from '@/components/DashboardDescription/DashboardDescription.vue'
import DashboardHeading from '@/components/DashboardHeading/DashboardHeading.vue'
import DashboardSection from '@/components/DashboardSection/DashboardSection.vue'
import WelcomeDescription from '@/components/WelcomeDescription/WelcomeDescription.vue'
import WelcomeHeading from '@/components/WelcomeHeading/WelcomeHeading.vue'
import WelcomeSection from '@/components/WelcomeSection/WelcomeSection.vue'
import { useAuth } from '@/composables/useAuth'

const { user } = useAuth()
</script>

<template>
  <AppLayout>
    <template #header-actions>
      <AuthButton />
    </template>

    <WelcomeSection v-if="!user">
      <WelcomeHeading />
      <WelcomeDescription />
    </WelcomeSection>

    <DashboardSection v-else>
      <DashboardHeading />
      <DashboardDescription />
      <ContentGrid>
        <ContentCard>
          <ContentCardTitle title="Blog Posts" />
          <ContentCardDescription description="Create and edit blog articles" />
        </ContentCard>
        <ContentCard>
          <ContentCardTitle title="Pages" />
          <ContentCardDescription description="Manage static pages" />
        </ContentCard>
        <ContentCard>
          <ContentCardTitle title="Positions" />
          <ContentCardDescription description="Update job openings" />
        </ContentCard>
      </ContentGrid>
    </DashboardSection>
  </AppLayout>
</template>
