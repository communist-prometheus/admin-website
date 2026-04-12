<script setup lang="ts">
import { useDeployBuilds } from '@/composables/useDeployStatus/use-deploy-builds'
import DeployList from './DeployHistory/DeployList.vue'

const { entries, loading } = useDeployBuilds()
</script>

<template>
  <DeployList :deploys="entries" :loading="loading" />
</template>
