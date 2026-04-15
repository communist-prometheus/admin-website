<script setup lang="ts">
import { computed, inject, ref, useSlots } from 'vue'
import type { DeployInfo } from '@/composables/useDeployStatus'
import { DEPLOY_ENTRIES_KEY } from '@/composables/useDeployStatus/deploy-context'
import { jobsAreFinal } from '@/composables/useDeployStatus/workflow-constants'
import type { DeployBuild } from '@/composables/useDeployStatus/workflow-types'
import AppFooter from './AppFooter.vue'
import AppHeader from './AppHeader.vue'
import AppMain from './AppMain.vue'
import AuthButton from './AuthButton.vue'
import DeployStatusBar from './DeployStatus/DeployStatusBar.vue'
import MobileMenu from './MobileMenu/MobileMenu.vue'

const slots = useSlots()
const entries = inject(
  DEPLOY_ENTRIES_KEY,
  ref<ReadonlyArray<DeployBuild>>([])
)
const info = computed<DeployInfo>(() => {
  const active = entries.value.some(
    e => e.run.status !== 'completed' || !jobsAreFinal(e.jobs)
  )
  if (active) return { stage: 'building' }
  const latest = entries.value[0]
  if (latest && latest.run.status === 'completed')
    return {
      stage: latest.run.conclusion === 'success' ? 'success' : 'not-found',
      createdOn: latest.run.updated_at,
    }
  return { stage: 'idle' }
})
const hash = __COMMIT_HASH__
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
      © {{ new Date().getFullYear() }} Admin Panel · {{ hash }}
    </span>
  </AppFooter>

  <MobileMenu />
  <DeployStatusBar :info="info" />
</template>
