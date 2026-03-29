<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { DeployEntry } from '@/api/deploys/types'
import DeployList from './DeployHistory/DeployList.vue'
import { fetchDeploys } from './DeployHistory/fetch-deploys'

const deploys = ref<readonly DeployEntry[]>([])
const loading = ref(true)

onMounted(async () => {
  deploys.value = await fetchDeploys()
  loading.value = false
})
</script>

<template>
  <DeployList :deploys="deploys" :loading="loading" />
</template>
