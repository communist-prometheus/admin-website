<script setup lang="ts">
import { provide, useSlots } from 'vue'
import { useDeployStatus } from '@/composables/useDeployStatus'
import {
  DEPLOY_INFO_KEY,
  DEPLOY_TRACK_KEY,
} from '@/composables/useDeployStatus/deploy-context'
import AppFooter from './AppFooter.vue'
import AppHeader from './AppHeader.vue'
import AppMain from './AppMain.vue'
import AuthButton from './AuthButton.vue'
import DeployStatusBar from './DeployStatus/DeployStatusBar.vue'
import MobileMenu from './MobileMenu/MobileMenu.vue'

const slots = useSlots()
const deploy = useDeployStatus()
provide(DEPLOY_TRACK_KEY, deploy.track)
provide(DEPLOY_INFO_KEY, deploy.info)
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

  <MobileMenu />
  <DeployStatusBar :info="deploy.info.value" />
</template>
