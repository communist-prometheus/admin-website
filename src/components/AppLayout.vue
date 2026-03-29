<script setup lang="ts">
import { inject, ref, useSlots } from 'vue'
import type { DeployInfo } from '@/composables/useDeployStatus'
import { DEPLOY_INFO_KEY } from '@/composables/useDeployStatus/deploy-context'
import AppFooter from './AppFooter.vue'
import AppHeader from './AppHeader.vue'
import AppMain from './AppMain.vue'
import AuthButton from './AuthButton.vue'
import DeployStatusBar from './DeployStatus/DeployStatusBar.vue'
import MobileMenu from './MobileMenu/MobileMenu.vue'

const slots = useSlots()
const idle: DeployInfo = { stage: 'idle' }
const info = inject(DEPLOY_INFO_KEY, ref(idle))
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
  <DeployStatusBar :info="info" />
</template>
